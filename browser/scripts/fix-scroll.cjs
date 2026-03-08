// Force-collapse the chrome view to fix scrolling
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
      // Check current expansion count
      console.log('Before fix:');
      let res = await evaluate('window.innerHeight');
      console.log('  Chrome view innerHeight:', res.result.value);

      // Force collapse via IPC
      res = await evaluate('window.electronAPI.setChromeExpanded(false).then(r => JSON.stringify(r))');
      console.log('  setChromeExpanded(false):', res.result.value);

      // Wait a moment
      await new Promise(r => setTimeout(r, 500));

      // Check again
      res = await evaluate('window.innerHeight');
      console.log('\nAfter fix:');
      console.log('  Chrome view innerHeight:', res.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
