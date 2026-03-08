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
    setTimeout(() => done('TIMEOUT'), 20000);

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
        // Make sure panel is closed first
        let hasOverview = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Overview') return true;
          }
          return false;
        })()`);

        if (hasOverview) {
          // Close by clicking Family again
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return; }
            }
          })()`);
          await wait(1000);
        }

        console.log('Step 0: Panel closed. Height:', await send('window.innerHeight'));

        // Step 1: Click Family to open
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return; }
          }
        })()`);

        // Check height at intervals
        for (let i = 0; i < 10; i++) {
          await wait(200);
          const h = await send('window.innerHeight');
          console.log(`Step 1 +${(i + 1) * 200}ms: innerHeight=${h}`);
          if (h > 200) break;
        }

        // Step 2: Click Insights
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Insights') { btns[i].click(); return; }
          }
        })()`);

        for (let i = 0; i < 10; i++) {
          await wait(200);
          const h = await send('window.innerHeight');
          console.log(`Step 2 +${(i + 1) * 200}ms: innerHeight=${h}`);
        }

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
