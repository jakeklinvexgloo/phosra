const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('Chrome UI not found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function evaluate(expr) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error('Timeout')), 15000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) { clearTimeout(timeout); ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
    });
  }

  ws.on('open', async () => {
    try {
      console.log('Navigating to Netflix...');
      await evaluate(`window.electronAPI.navigate('https://www.netflix.com/viewingactivity').then(() => 'ok')`);
      console.log('Done. Wait a few seconds for it to load, then run fetch-all-profiles.cjs');
    } catch (e) {
      console.error('Error:', e.message);
    }
    ws.close();
  });
}

run();
