// Revert Ramsay! maturity back to 70 (TV-PG/PG = older-kids)
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const tab = targets.find(t => t.url.includes('netflix.com'));
  if (!tab) { console.log('No Netflix tab'); return; }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
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
    return send('Runtime.evaluate', { expression: expr, returnByValue: true });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  ws.on('open', async () => {
    try {
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions/2CLVMNZPRFEOBK32A26RG4FNJQ' });
      await sleep(5000);

      await evaluate(`document.querySelector('[data-uia="maturity-70-radio"]').click()`);
      await sleep(500);
      await evaluate(`document.querySelector('[data-uia="btn-account-pin-submit"]').click()`);
      await sleep(3000);

      console.log('Reverted Ramsay! maturity back to 70 (TV-PG/PG)');
    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
