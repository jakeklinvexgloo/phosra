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

    ws.on('open', async () => {
      try {
        // Click the Family Dashboard tab
        await send(`(function() {
          var spans = document.querySelectorAll('span');
          for (var i = 0; i < spans.length; i++) {
            if (spans[i].textContent.includes('Family Dashboard')) {
              spans[i].closest('button') ? spans[i].closest('button').click() : spans[i].click();
              return 'clicked tab';
            }
          }
          return 'tab not found';
        })()`);
        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
    ws.on('message', () => {});
  });
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
