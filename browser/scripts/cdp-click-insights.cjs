const http = require('http');
const WebSocket = require('ws');

async function main() {
  const pages = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const chromeUI = pages.find(p => p.title === 'Phosra Browser');
  if (!chromeUI) { console.log('Chrome UI target not found'); process.exit(1); }

  return new Promise((resolve) => {
    const ws = new WebSocket(chromeUI.webSocketDebuggerUrl);
    let msgId = 0;
    let settled = false;

    const done = (msg) => {
      if (settled) return;
      settled = true;
      console.log(msg);
      try { ws.close(); } catch {}
      resolve();
    };

    setTimeout(() => done('TIMEOUT'), 6000);
    ws.on('error', (err) => done('WS error: ' + err.message));

    ws.on('open', () => {
      const id = ++msgId;
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: `(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Insights') {
                btns[i].click();
                return 'Clicked Insights tab';
              }
            }
            return 'Insights tab not found';
          })()`,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id) {
        done(msg.result?.result?.value || JSON.stringify(msg));
      }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
