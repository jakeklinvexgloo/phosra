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

    setTimeout(() => done('TIMEOUT'), 10000);
    ws.on('error', (err) => done('WS error: ' + err.message));

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true }
      }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          ws.off('message', handler);
          res(msg.result?.result?.value);
        }
      };
      ws.on('message', handler);
    });

    ws.on('open', async () => {
      try {
        // Step 1: Click Family button to open the panel
        const r1 = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            var t = btns[i].textContent.trim();
            if (t.indexOf('Family') >= 0 && t.indexOf('Kids') < 0) {
              btns[i].click();
              return 'Clicked Family';
            }
          }
          return 'Family not found';
        })()`);
        console.log('Step 1:', r1);

        // Wait a moment for panel to render
        await new Promise(r => setTimeout(r, 1000));

        // Step 2: Check what's visible now
        const r2 = await send(`(function() {
          var btns = document.querySelectorAll('button');
          var texts = [];
          for (var i = 0; i < btns.length; i++) {
            texts.push(btns[i].textContent.trim().substring(0, 40));
          }
          return JSON.stringify(texts);
        })()`);
        console.log('Step 2 - All buttons:', r2);

        // Step 3: Click Insights tab
        const r3 = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Insights') {
              btns[i].click();
              return 'Clicked Insights';
            }
          }
          return 'Insights not found';
        })()`);
        console.log('Step 3:', r3);

        // Wait for insights to load
        await new Promise(r => setTimeout(r, 2000));

        // Step 4: Check what's rendered
        const r4 = await send(`(function() {
          var el = document.querySelector('[class*="insight"], [class*="Insight"]');
          var content = document.body.innerHTML.substring(0, 500);
          var hasInsights = content.indexOf('Age') >= 0 || content.indexOf('insight') >= 0;
          return JSON.stringify({
            hasInsightsContent: hasInsights,
            bodyLength: document.body.innerHTML.length,
            visibleText: document.body.innerText.substring(0, 300)
          });
        })()`);
        console.log('Step 4:', r4);

        done('Complete');
      } catch(e) {
        done('Error: ' + e.message);
      }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
