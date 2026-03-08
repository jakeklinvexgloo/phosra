// Trigger the Netflix config agent via the chrome renderer's preload API
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());

  // Find the chrome renderer view (Phosra Browser)
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('No chrome view found. Targets:', targets.map(t => t.title)); return; }

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
      // Check if preload API is available
      console.log('Checking preload API...');
      const hasApi = await evaluate('typeof window.electronAPI?.configAgentStart');
      console.log('configAgentStart type:', hasApi.result.value);

      if (hasApi.result.value !== 'function') {
        console.log('Config agent API not available on chrome view');
        ws.close();
        return;
      }

      // Start the agent — this will navigate the active tab to Netflix and discover profiles
      console.log('\nStarting config agent (discovering profiles)...');
      const result = await evaluate('window.electronAPI.configAgentStart().then(r => JSON.stringify(r, null, 2))');
      console.log('Agent start result:', result.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
