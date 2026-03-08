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
    setTimeout(() => done('TIMEOUT'), 10000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    ws.on('open', async () => {
      try {
        // Click on the first child card (Chap) to expand it
        const result = await send(`(function() {
          // Find the expand button/clickable area for the first child
          // The child cards have an expand arrow (▶)
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            var t = btns[i].textContent.trim();
            // Look for the child card header that contains "Chap"
            if (t.indexOf('Chap') >= 0 || t.indexOf('▶') >= 0) {
              btns[i].click();
              return 'Clicked: ' + t.substring(0, 50);
            }
          }
          // Try clicking any element with Chap text
          var els = document.querySelectorAll('*');
          for (var i = 0; i < els.length; i++) {
            if (els[i].textContent.trim().startsWith('Chap') && els[i].children.length < 5) {
              els[i].click();
              return 'Clicked element with Chap: ' + els[i].tagName;
            }
          }
          return 'Not found';
        })()`);
        console.log('Click result:', result);

        done('Done');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
