// Check the chrome view state and z-order
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('No chrome view'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }

  function evaluate(expr) {
    return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  }

  ws.on('open', async () => {
    try {
      // Check chrome view dimensions and state
      const res = await evaluate(`(function(){
        var r = {};
        r.innerWidth = window.innerWidth;
        r.innerHeight = window.innerHeight;
        r.documentHeight = document.documentElement.scrollHeight;
        r.url = window.location.href;

        // Check if any overlay/panel is open that might block the tab
        var panels = document.querySelectorAll('[class*="panel"], [class*="drawer"], [class*="overlay"], [class*="dropdown"]');
        r.visiblePanels = [];
        panels.forEach(function(el) {
          var cs = window.getComputedStyle(el);
          if (cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetHeight > 0) {
            r.visiblePanels.push({
              cls: (el.className || '').substring(0, 100),
              width: el.offsetWidth,
              height: el.offsetHeight,
              position: cs.position,
              pointerEvents: cs.pointerEvents
            });
          }
        });

        return JSON.stringify(r, null, 2);
      })()`);
      console.log('Chrome view state:', res.result.value);

      // Also check expanded state via IPC
      const expandedRes = await evaluate(`
        typeof window.electronAPI?.setChromeExpanded
      `);
      console.log('setChromeExpanded API:', expandedRes.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
