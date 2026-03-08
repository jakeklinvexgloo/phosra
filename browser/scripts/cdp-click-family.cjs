const http = require('http');
const WebSocket = require('ws');

async function main() {
  const pages = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
      r.on('error', reject);
    });
  });

  const chromeUI = pages.find(p => p.title === 'Phosra Browser');
  if (!chromeUI) { console.log('Chrome UI target not found'); process.exit(1); }
  console.log('Connecting to chrome UI:', chromeUI.id);

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

    setTimeout(() => done('TIMEOUT after 6s'), 6000);

    ws.on('error', (err) => done('WS error: ' + err.message));

    ws.on('open', () => {
      console.log('WebSocket connected');
      const id = ++msgId;
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: `(function() {
            var btns = document.querySelectorAll('button');
            var info = [];
            for (var i = 0; i < btns.length; i++) {
              var b = btns[i];
              info.push(b.textContent.trim().substring(0, 40));
            }
            // Also try to find and click the Family button
            for (var i = 0; i < btns.length; i++) {
              var t = btns[i].textContent.trim();
              if (t.indexOf('Family') >= 0 || t.indexOf('family') >= 0) {
                btns[i].click();
                return JSON.stringify({ clicked: 'Family', allButtons: info });
              }
            }
            // Try spans/divs too
            var els = document.querySelectorAll('span, div, a');
            for (var i = 0; i < els.length; i++) {
              if (els[i].textContent.trim() === 'Family') {
                els[i].click();
                return JSON.stringify({ clicked: 'Family (span/div)', allButtons: info });
              }
            }
            return JSON.stringify({ clicked: null, allButtons: info, totalElements: document.querySelectorAll('*').length });
          })()`,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id) {
        if (msg.error) {
          done('CDP error: ' + JSON.stringify(msg.error));
        } else if (msg.result && msg.result.result) {
          done('Result: ' + msg.result.result.value);
        } else {
          done('Unexpected: ' + JSON.stringify(msg));
        }
      }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
