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
    setTimeout(() => done('TIMEOUT'), 8000);

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
        // Get the full visible text and all interactive elements
        const r = await send(`(function() {
          // Get all text
          var text = document.body.innerText;
          // Get all buttons and clickable elements
          var clickables = document.querySelectorAll('button, [role=tab], [role=button], a');
          var info = [];
          for (var i = 0; i < clickables.length; i++) {
            var el = clickables[i];
            info.push({
              tag: el.tagName,
              text: el.textContent.trim().substring(0, 50),
              role: el.getAttribute('role'),
              class: el.className.substring(0, 80),
              visible: el.offsetParent !== null
            });
          }
          return JSON.stringify({ visibleText: text.substring(0, 500), clickables: info }, null, 2);
        })()`);
        console.log(r);
        done('Done');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
