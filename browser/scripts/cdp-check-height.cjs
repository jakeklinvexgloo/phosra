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
        // Check window height before
        let h1 = await send(`window.innerHeight`);
        console.log('Before expansion, innerHeight:', h1);

        // Manually trigger chrome expansion
        await send(`window.electronAPI?.setChromeExpanded(true)`);
        await wait(500);

        let h2 = await send(`window.innerHeight`);
        console.log('After setChromeExpanded(true), innerHeight:', h2);

        // Now open Family panel
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return 'clicked'; }
          }
          return 'not found';
        })()`);
        await wait(1000);

        let h3 = await send(`window.innerHeight`);
        console.log('After Family panel open, innerHeight:', h3);

        // Set chrome height explicitly
        await send(`window.electronAPI?.setChromeHeight(800)`);
        await wait(500);

        let h4 = await send(`window.innerHeight`);
        console.log('After setChromeHeight(800), innerHeight:', h4);

        // Click Insights
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Insights') { btns[i].click(); return 'clicked'; }
          }
          return 'not found';
        })()`);
        await wait(1500);

        let h5 = await send(`window.innerHeight`);
        console.log('After Insights tab, innerHeight:', h5);

        // Check the PanelShell scrollHeight
        const shellInfo = await send(`(function() {
          // Find the PanelShell div (the one with border-t and backdrop-blur)
          var divs = document.querySelectorAll('div');
          for (var i = 0; i < divs.length; i++) {
            if (divs[i].className.includes('backdrop-blur')) {
              return JSON.stringify({
                scrollHeight: divs[i].scrollHeight,
                clientHeight: divs[i].clientHeight,
                offsetHeight: divs[i].offsetHeight,
                className: divs[i].className.substring(0, 80),
              });
            }
          }
          return 'PanelShell not found';
        })()`);
        console.log('PanelShell:', shellInfo);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
