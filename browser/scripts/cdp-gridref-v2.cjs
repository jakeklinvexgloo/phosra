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
        // Check if panel is open
        const hasTabs = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i=0;i<btns.length;i++) if (btns[i].textContent.trim()==='Overview') return true;
          return false;
        })()`);
        console.log('Panel open?', hasTabs);

        if (!hasTabs) {
          // Open Family
          await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Family') {b[i].click(); return 'clicked';} })()`);
          await wait(2000);
          const checkTabs = await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Overview') return true; return false; })()`);
          console.log('Panel open after click?', checkTabs);
        }

        // Click Insights
        await send(`(function() { var b = document.querySelectorAll('button'); for (var i=0;i<b.length;i++) if (b[i].textContent.trim()==='Insights') {b[i].click(); return 'clicked';} return 'not found'; })()`);
        await wait(3000);

        // Now check if Refresh is visible
        const hasRefresh = await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i=0;i<btns.length;i++) if (btns[i].textContent.trim()==='Refresh') return true;
          return false;
        })()`);
        console.log('Has Refresh button?', hasRefresh);

        if (!hasRefresh) {
          console.log('Refresh not found, panel may have closed');
          done('Panel not open');
          return;
        }

        // Walk the DOM tree from Refresh button to root
        const debug = await send(`(function() {
          var btn = null;
          var btns = document.querySelectorAll('button');
          for (var i=0;i<btns.length;i++) {
            if (btns[i].textContent.trim()==='Refresh') { btn = btns[i]; break; }
          }
          if (!btn) return 'Refresh not found';

          var refreshRect = btn.getBoundingClientRect();
          var ancestors = [];
          var el = btn;
          while (el && el !== document.documentElement) {
            var r = el.getBoundingClientRect();
            var style = window.getComputedStyle(el);
            ancestors.push({
              tag: el.tagName,
              cls: (el.className || '').toString().substring(0, 80),
              rect: { t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height) },
              overflow: style.overflow !== 'visible' ? style.overflow : undefined,
              maxH: style.maxHeight !== 'none' ? style.maxHeight : undefined,
            });
            el = el.parentElement;
          }

          return JSON.stringify({
            refreshRect: { t: Math.round(refreshRect.top), b: Math.round(refreshRect.bottom), l: Math.round(refreshRect.left), r: Math.round(refreshRect.right) },
            innerHeight: window.innerHeight,
            ancestors: ancestors,
          }, null, 2);
        })()`);
        console.log(debug);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
