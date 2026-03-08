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
    setTimeout(() => done('TIMEOUT'), 25000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    // Use CDP Input.dispatchMouseEvent to simulate a real mouse click at specific coordinates
    const cdpClick = async (x, y) => {
      const id1 = ++msgId;
      ws.send(JSON.stringify({ id: id1, method: 'Input.dispatchMouseEvent', params: {
        type: 'mousePressed', x, y, button: 'left', clickCount: 1
      }}));
      await new Promise(r => setTimeout(r, 50));
      const id2 = ++msgId;
      ws.send(JSON.stringify({ id: id2, method: 'Input.dispatchMouseEvent', params: {
        type: 'mouseReleased', x, y, button: 'left', clickCount: 1
      }}));
      await new Promise(r => setTimeout(r, 100));
    };

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    ws.on('open', async () => {
      try {
        // Open Family > Insights
        let hasInsights = await send(`(function() {
          return document.body.innerText.includes('above-age');
        })()`);

        if (!hasInsights) {
          // Open Family
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Family') { btns[i].click(); return; }
            }
          })()`);
          await wait(1500);
          // Click Insights
          await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (btns[i].textContent.trim() === 'Insights') { btns[i].click(); return; }
            }
          })()`);
          await wait(2000);
        }

        // Get the Refresh button position
        const pos = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim() === 'Refresh') {
              var r = btns[i].getBoundingClientRect();
              return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
            }
          }
          return null;
        })()`);
        console.log('Refresh button position:', pos);

        if (pos) {
          const { x, y } = JSON.parse(pos);
          console.log(`Dispatching CDP mouse click at (${x}, ${y})...`);

          // Use CDP Input.dispatchMouseEvent for a real input event
          await cdpClick(x, y);
          await wait(1000);

          // Check if the click worked (enrichment should have started, or panel should still be open)
          const after = await send(`(function() {
            var text = document.body.innerText;
            var panelOpen = text.includes('Insights');
            var enriching = text.includes('Rating titles');
            return JSON.stringify({ panelStillOpen: panelOpen, enriching: enriching });
          })()`);
          console.log('After CDP click on Refresh:', after);
        }

        // Now try clicking a child card header with CDP Input
        const childPos = await send(`(function() {
          var divs = document.querySelectorAll('div');
          for (var i = 0; i < divs.length; i++) {
            var cs = window.getComputedStyle(divs[i]);
            if (cs.cursor === 'pointer' && divs[i].textContent.includes('Chap') && divs[i].textContent.length < 100) {
              var r = divs[i].getBoundingClientRect();
              return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
            }
          }
          return null;
        })()`);
        console.log('Chap card position:', childPos);

        if (childPos) {
          const { x, y } = JSON.parse(childPos);
          console.log(`Dispatching CDP mouse click at (${x}, ${y})...`);
          await cdpClick(x, y);
          await wait(1000);

          const expanded = await send(`(function() {
            return document.body.innerText.includes('AGE RATING BREAKDOWN');
          })()`);
          console.log('Chap expanded after CDP click:', expanded);
        }

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });

    // Consume all CDP responses
    ws.on('message', () => {});
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
