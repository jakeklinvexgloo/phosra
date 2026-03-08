const WebSocket = require('ws');
const fs = require('fs');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('Chrome UI not found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error('Timeout')), 10000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) { clearTimeout(timeout); ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); }
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
      // Check how many insight cards rendered
      const res = await evaluate(`
        (function() {
          var cards = document.querySelectorAll('[class*="rounded-xl"]');
          var insights = [];
          cards.forEach(function(c) {
            var nameEl = c.querySelector('[class*="font-medium"]');
            if (nameEl) insights.push(nameEl.textContent.trim());
          });
          return JSON.stringify(insights);
        })()
      `);
      console.log('Insight cards found:', res.result.value);

      // Take a tall screenshot to capture scrolling content
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1280, height: 2000, scale: 1 }
      });

      const path = '/Users/jakeklinvex/phosra/browser/insights-full.png';
      fs.writeFileSync(path, Buffer.from(screenshot.data, 'base64'));
      console.log('Saved to:', path);

    } catch (e) {
      console.error('Error:', e.message);
    }
    ws.close();
  });
}

run();
