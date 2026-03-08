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
    setTimeout(() => done('TIMEOUT'), 15000);

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
        // Check if Family panel is open by looking for Overview/Activity/Insights buttons
        let panelOpen = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Overview') return true;
          }
          return false;
        })()`);
        console.log('Panel open:', panelOpen);

        if (!panelOpen) {
          // Click Family to open
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return 'clicked'; }
            }
            return 'not found';
          })()`);
          console.log('Clicked Family to open panel');
          await wait(1500);

          // Check again
          panelOpen = await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Overview') return true;
            }
            return false;
          })()`);
          console.log('Panel open after click:', panelOpen);
        }

        if (!panelOpen) {
          // Try one more click
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return 'clicked'; }
            }
          })()`);
          await wait(1500);
        }

        // Now click Insights
        const clickResult = await send(`(function() {
          var btns = document.querySelectorAll('button');
          var found = [];
          for (var i = 0; i < btns.length; i++) {
            var t = btns[i].textContent.trim();
            found.push(t);
            if (t === 'Insights') {
              btns[i].click();
              return JSON.stringify({ clicked: true, allButtons: found });
            }
          }
          return JSON.stringify({ clicked: false, allButtons: found });
        })()`);
        console.log('Click Insights result:', clickResult);

        await wait(2000);

        // Get the visible content
        const content = await send(`(function() {
          return document.body.innerText.substring(0, 800);
        })()`);
        console.log('Visible content:', content);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
