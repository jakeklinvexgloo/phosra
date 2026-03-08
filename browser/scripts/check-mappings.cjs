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
      const timeout = setTimeout(() => rej(new Error('Timeout')), 10000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) { clearTimeout(timeout); ws.off('message', handler); res(msg.result); }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
    });
  }

  ws.on('open', async () => {
    try {
      // Check Netflix profile mappings
      const res = await evaluate(`
        window.electronAPI.loadNetflixMappings().then(r => JSON.stringify(r, null, 2))
      `);
      console.log('Netflix mappings:', res.result.value);

      // Check persisted activity profiles
      const res2 = await evaluate(`
        window.electronAPI.loadNetflixActivity().then(r => {
          if (!r.success || !r.data) return 'no data';
          return JSON.stringify(r.data.map(a => ({
            childName: a.childName,
            childId: a.childId,
            profileName: a.profileName,
            profileGuid: a.profileGuid,
            entries: a.entries.length
          })), null, 2);
        })
      `);
      console.log('\nActivity profiles:', res2.result.value);
    } catch (e) {
      console.error('Error:', e.message);
    }
    ws.close();
  });
}

run();
