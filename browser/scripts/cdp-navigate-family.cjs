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
  if (!chromeUI) { console.log('Chrome UI not found'); process.exit(1); }

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
        // Click the Family chip in the chrome bar
        console.log('Clicking Family chip...');
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim().startsWith('Family')) {
              btns[i].click();
              return 'clicked';
            }
          }
          return 'not found';
        })()`);

        await wait(3000);

        // Check what pages exist now
        const pagesAfter = await new Promise((resolve) => {
          http.get('http://localhost:9222/json', (r) => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => resolve(JSON.parse(d)));
          });
        });

        console.log('Pages after click:');
        for (const p of pagesAfter) {
          console.log(`  ${p.title}: ${p.url}`);
        }

        // Find the family page
        const familyPage = pagesAfter.find(p => p.url.includes('phosra://family'));
        if (familyPage) {
          console.log('\nFamily page found! Connecting...');
          const ws2 = new WebSocket(familyPage.webSocketDebuggerUrl);
          await new Promise(r => ws2.on('open', r));

          const send2 = (expression) => new Promise((res) => {
            const id = ++msgId;
            ws2.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
            const handler = (data) => {
              const msg = JSON.parse(data.toString());
              if (msg.id === id) { ws2.off('message', handler); res(msg.result?.result?.value); }
            };
            ws2.on('message', handler);
          });

          await wait(2000);
          const text = await send2('document.body.innerText.substring(0, 800)');
          console.log('\nFamily page text:\n' + text);

          try { ws2.close(); } catch {}
        } else {
          console.log('Family page NOT found in targets');
        }

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });

    ws.on('message', () => {});
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
