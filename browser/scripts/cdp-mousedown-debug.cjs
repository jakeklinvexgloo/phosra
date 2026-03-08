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

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    ws.on('open', async () => {
      try {
        // Ensure panel closed
        const hasTabs = await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Overview') return true; return false; })()`);
        if (hasTabs) {
          await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Family') {b[i].click();return;} })()`);
          await wait(1000);
        }

        // Open Family
        await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Family') {b[i].click();return;} })()`);
        await wait(2000);

        // Click Insights
        await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Insights') {b[i].click();return;} })()`);
        await wait(2000);

        // Install a debug interceptor for the mousedown handler
        const installed = await send(`(function() {
          if (window.__mousedownDebugInstalled) return 'already installed';
          window.__mousedownDebugInstalled = true;
          window.__mousedownLog = [];

          document.addEventListener('mousedown', function(e) {
            var target = e.target;
            var tagName = target.tagName;
            var text = (target.textContent || '').substring(0, 30);
            var classes = (target.className || '').toString().substring(0, 50);

            // Check if target is inside gridRef
            // gridRef is the wrapper div that contains both chips and panel
            // Walk up to find it
            var el = target;
            var inGrid = false;
            while (el) {
              // The gridRef div is the one that directly contains the chips row and the FamilyPanel
              if (el.children && el.children.length >= 1) {
                var firstChild = el.children[0];
                if (firstChild && firstChild.className && firstChild.className.toString().includes('h-[32px] flex items-center gap-1.5 px-3')) {
                  inGrid = true;
                  break;
                }
              }
              el = el.parentElement;
            }

            window.__mousedownLog.push({
              x: e.clientX,
              y: e.clientY,
              target: tagName + '.' + classes.substring(0, 30),
              text: text,
              inGrid: inGrid,
              timestamp: Date.now(),
            });

            if (window.__mousedownLog.length > 20) window.__mousedownLog.shift();
          }, true); // capture phase

          return 'installed';
        })()`);
        console.log('Debug interceptor:', installed);

        // Now dispatch a real mouse event at the Refresh button position
        const refreshPos = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i=0;i<btns.length;i++) {
            if (btns[i].textContent.trim()==='Refresh') {
              var r = btns[i].getBoundingClientRect();
              return JSON.stringify({x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)});
            }
          }
          return null;
        })()`);
        console.log('Refresh position:', refreshPos);

        if (refreshPos) {
          const {x, y} = JSON.parse(refreshPos);

          // Dispatch mousePressed via CDP Input
          const id1 = ++msgId;
          ws.send(JSON.stringify({ id: id1, method: 'Input.dispatchMouseEvent', params: {
            type: 'mousePressed', x, y, button: 'left', clickCount: 1
          }}));
          await wait(200);

          const id2 = ++msgId;
          ws.send(JSON.stringify({ id: id2, method: 'Input.dispatchMouseEvent', params: {
            type: 'mouseReleased', x, y, button: 'left', clickCount: 1
          }}));
          await wait(500);

          // Check the debug log
          const log = await send(`JSON.stringify(window.__mousedownLog)`);
          console.log('Mousedown log:', log);

          // Check if panel is still open
          const stillOpen = await send(`(function() {
            var btns = document.querySelectorAll('button');
            for (var i=0;i<btns.length;i++) if (btns[i].textContent.trim()==='Insights') return true;
            return false;
          })()`);
          console.log('Panel still open?', stillOpen);
        }

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });

    ws.on('message', () => {});
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
