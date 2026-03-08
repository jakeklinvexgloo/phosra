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
        // Step 1: Open Family panel if not open
        let hasOverview = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Overview') return true;
          }
          return false;
        })()`);

        if (!hasOverview) {
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return; }
            }
          })()`);
          await wait(1500);
        }

        // Step 2: Click Insights tab
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Insights') { btns[i].click(); return; }
          }
        })()`);
        await wait(2000);

        // Step 3: Expand Samson's card (more interesting data than Chap with only 2 above-age)
        // Find all child card headers and click "Samson"
        const expandResult = await send(`(function() {
          // The child cards have a header div with onClick that toggles expanded
          // Look for elements containing child name in the insights area
          var allDivs = document.querySelectorAll('div');
          for (var i = 0; i < allDivs.length; i++) {
            var d = allDivs[i];
            var t = d.textContent.trim();
            // Look for the header row that contains "Samson" and has an onClick
            if (t.startsWith('Samson') && d.style.cursor === 'pointer') {
              d.click();
              return 'Clicked Samson card with cursor:pointer';
            }
          }
          // Try finding by cursor style on any element with Samson
          for (var i = 0; i < allDivs.length; i++) {
            var cs = window.getComputedStyle(allDivs[i]);
            if (cs.cursor === 'pointer' && allDivs[i].textContent.includes('Samson') && allDivs[i].textContent.length < 100) {
              allDivs[i].click();
              return 'Clicked Samson element (computed cursor): ' + allDivs[i].textContent.trim().substring(0, 60);
            }
          }
          return 'Samson card not found';
        })()`);
        console.log('Expand:', expandResult);
        await wait(1000);

        // Step 4: Get visible content to verify expansion
        const content = await send(`(function() {
          return document.body.innerText.substring(0, 1500);
        })()`);
        console.log('Content:\n' + content);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
