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
        // Force open Family panel
        await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Family') {b[i].click(); return;} })()`);
        await wait(1500);
        // Click Insights
        await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Insights') {b[i].click(); return;} })()`);
        await wait(2000);

        // Install a mousedown interceptor to debug what handleClickOutside sees
        const debug = await send(`(function() {
          // Get the Refresh button rect
          var refreshBtn = null;
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Refresh') {
              var r = btns[i].getBoundingClientRect();
              refreshBtn = { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
              break;
            }
          }

          // Walk up from Refresh button and find the closest ancestor that could be gridRef
          var el = null;
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Refresh') {
              el = btns[i];
              break;
            }
          }

          var ancestors = [];
          while (el) {
            var r = el.getBoundingClientRect();
            ancestors.push({
              tag: el.tagName,
              classSnippet: (el.className || '').substring(0, 60),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              height: Math.round(r.height),
              overflow: window.getComputedStyle(el).overflow,
            });
            el = el.parentElement;
          }

          return JSON.stringify({ refreshBtn, ancestors }, null, 2);
        })()`);
        console.log(debug);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
