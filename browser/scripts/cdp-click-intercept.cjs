const http = require('http');
const WebSocket = require('ws');

async function main() {
  const pages = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const chromeUI = pages.find(p => p.title === 'Phosra Browser');
  if (!chromeUI) { console.log('not found'); process.exit(1); }

  return new Promise((resolve) => {
    const ws = new WebSocket(chromeUI.webSocketDebuggerUrl);
    let msgId = 0;
    let settled = false;

    const done = (msg) => { if (settled) return; settled = true; console.log(msg); try { ws.close(); } catch {} resolve(); };
    setTimeout(() => done('TIMEOUT'), 30000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    ws.on('open', async () => {
      try {
        // Open Family panel
        let hasOverview = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Overview') return true;
          }
          return false;
        })()`);

        if (!hasOverview) {
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return; }
            }
          })()`);
          await wait(1000);
        }

        // Click Insights
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Insights') { btns[i].click(); return; }
          }
        })()`);
        await wait(2000);

        // Now programmatically click the Refresh button
        const refreshResult = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Refresh') {
              // Simulate a real click
              btns[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              return 'Dispatched click on Refresh';
            }
          }
          return 'Refresh not found';
        })()`);
        console.log('Refresh click:', refreshResult);
        await wait(500);

        // Now try clicking a child card header
        const childResult = await send(`(function() {
          var divs = document.querySelectorAll('div');
          for (var i = 0; i < divs.length; i++) {
            var cs = window.getComputedStyle(divs[i]);
            if (cs.cursor === 'pointer' && divs[i].textContent.includes('Samson') && divs[i].textContent.length < 100) {
              divs[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              return 'Dispatched click on Samson header';
            }
          }
          return 'Samson header not found';
        })()`);
        console.log('Child click:', childResult);
        await wait(1000);

        // Check if Samson expanded (look for age breakdown content)
        const expanded = await send(`(function() {
          var text = document.body.innerText;
          var hasSamsonExpanded = text.includes('AGE RATING BREAKDOWN');
          var innerHeight = window.innerHeight;
          return JSON.stringify({ samsonExpanded: hasSamsonExpanded, innerHeight: innerHeight });
        })()`);
        console.log('After clicks:', expanded);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
