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
        // Ensure panel is open with Insights
        let hasInsights = await send(`document.body.innerText.includes('above-age')`);
        if (!hasInsights) {
          await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Family') {b[i].click(); return;} })()`);
          await wait(1500);
          await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Insights') {b[i].click(); return;} })()`);
          await wait(2000);
        }

        // Monkey-patch the handleClickOutside to log
        await send(`(function() {
          // Find the gridRef wrapper and log its bounds
          // The gridRef is the outermost div in StreamingServicesBar
          // It should contain the category chips AND the FamilyPanel
          var allDivs = document.querySelectorAll('div');
          var candidates = [];
          for (var i = 0; i < allDivs.length; i++) {
            var d = allDivs[i];
            var text = d.textContent;
            // The gridRef div should contain both "Family" chip AND the panel content
            if (text.includes('Streaming') && text.includes('Family') && text.includes('Insights') && text.includes('above-age')) {
              var r = d.getBoundingClientRect();
              candidates.push({
                tag: d.tagName,
                top: Math.round(r.top),
                bottom: Math.round(r.bottom),
                left: Math.round(r.left),
                right: Math.round(r.right),
                height: Math.round(r.height),
                width: Math.round(r.width),
                children: d.children.length,
                overflow: window.getComputedStyle(d).overflow,
                maxHeight: window.getComputedStyle(d).maxHeight,
              });
            }
          }
          return JSON.stringify(candidates.slice(0, 5), null, 2);
        })()`);

        const result = await send(`(function() {
          var allDivs = document.querySelectorAll('div');
          var candidates = [];
          for (var i = 0; i < allDivs.length; i++) {
            var d = allDivs[i];
            var text = d.textContent;
            if (text.includes('Streaming') && text.includes('Family') && text.includes('Insights') && text.includes('above-age')) {
              var r = d.getBoundingClientRect();
              candidates.push({
                top: Math.round(r.top),
                bottom: Math.round(r.bottom),
                height: Math.round(r.height),
                overflow: window.getComputedStyle(d).overflow,
                maxHeight: window.getComputedStyle(d).maxHeight,
                childCount: d.children.length,
              });
            }
          }
          // Also get Refresh button and child card positions
          var refresh = null;
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Refresh') {
              var r = btns[i].getBoundingClientRect();
              refresh = { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
            }
          }
          return JSON.stringify({ gridRefCandidates: candidates, refreshBtn: refresh }, null, 2);
        })()`);
        console.log(result);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
