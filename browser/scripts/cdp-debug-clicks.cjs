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
        // Step 1: Open Family panel
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

        // Step 3: Debug — get all interactive element positions
        const debug = await send(`(function() {
          // Find the Refresh button
          var btns = document.querySelectorAll('button');
          var results = [];
          for (var i = 0; i < btns.length; i++) {
            var t = btns[i].textContent.trim();
            if (t === 'Refresh' || t.startsWith('Chap') || t.startsWith('Samson')) {
              var rect = btns[i].getBoundingClientRect();
              results.push({
                text: t.substring(0, 30),
                rect: { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right) },
                visible: rect.width > 0 && rect.height > 0,
                pointerEvents: window.getComputedStyle(btns[i]).pointerEvents,
                zIndex: window.getComputedStyle(btns[i]).zIndex,
              });
            }
          }

          // Also find the clickable child card headers (divs with cursor:pointer)
          var divs = document.querySelectorAll('div[class*="cursor-pointer"]');
          for (var i = 0; i < divs.length; i++) {
            var d = divs[i];
            var t = d.textContent.trim().substring(0, 30);
            if (t.includes('Chap') || t.includes('Samson') || t.includes('Mona')) {
              var rect = d.getBoundingClientRect();
              results.push({
                text: 'DIV: ' + t,
                rect: { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right) },
                visible: rect.width > 0 && rect.height > 0,
                pointerEvents: window.getComputedStyle(d).pointerEvents,
              });
            }
          }

          // Check document/body dimensions and chrome view info
          var bodyRect = document.body.getBoundingClientRect();
          var docHeight = document.documentElement.scrollHeight;

          return JSON.stringify({
            elements: results,
            bodyHeight: Math.round(bodyRect.height),
            docHeight: docHeight,
            windowInnerHeight: window.innerHeight,
            windowInnerWidth: window.innerWidth,
          }, null, 2);
        })()`);
        console.log(debug);

        // Step 4: Try adding a temporary click listener to see if clicks reach the document
        await send(`(function() {
          if (!window.__clickDebugSet) {
            window.__clickDebugSet = true;
            document.addEventListener('click', function(e) {
              console.log('[CLICK DEBUG] Click at', e.clientX, e.clientY, 'target:', e.target.tagName, e.target.textContent?.substring(0, 30));
            }, true);
            document.addEventListener('mousedown', function(e) {
              console.log('[MOUSEDOWN DEBUG] at', e.clientX, e.clientY, 'target:', e.target.tagName, e.target.textContent?.substring(0, 30));
            }, true);
          }
          return 'Click debug listeners installed';
        })()`);
        console.log('Debug listeners installed — try clicking in the browser now');

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
