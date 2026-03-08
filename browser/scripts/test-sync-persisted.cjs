/**
 * Test: Load persisted activity + trigger a re-fetch to sync to backend.
 * The re-fetch will use persisted local cache and sync batches to the API.
 */
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  let target = targets.find(t => t.title === 'Phosra Browser');
  if (!target) target = targets.find(t => !t.url.includes('netflix'));
  if (!target) { console.log('No tab found'); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 600000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) { clearTimeout(timeout); ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }
  function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); }

  ws.on('open', async () => {
    try {
      // Load mappings to get child profiles
      console.log('1. Loading profile mappings...');
      let res = await evaluate(`
        window.electronAPI.loadNetflixMappings().then(r => {
          if (!r.success || !r.data) return JSON.stringify({ inputs: [] });
          var inputs = r.data.filter(m => m.familyMemberType === 'child').map(m => ({
            childName: m.familyMemberName || '',
            childId: m.familyMemberId || '',
            profileGuid: m.netflixProfile.guid,
            profileName: m.netflixProfile.name,
            avatarUrl: m.netflixProfile.avatarUrl || ''
          }));
          return JSON.stringify({ inputs: inputs });
        })
      `);
      const mappings = JSON.parse(res.result.value);
      console.log(`   Child profiles: ${mappings.inputs.length}`);
      for (const m of mappings.inputs) {
        console.log(`   - ${m.childName} (${m.childId})`);
      }

      if (mappings.inputs.length === 0) {
        console.log('   No child profiles mapped.');
        return;
      }

      // Trigger a full fetch (this will scrape Netflix + sync to backend)
      console.log('\n2. Triggering Netflix activity fetch + backend sync...');
      console.log('   (This scrapes Netflix and syncs to backend in batches of 500)');
      const start = Date.now();

      res = await evaluate(`
        window.electronAPI.fetchNetflixActivity(${JSON.stringify(mappings.inputs)}).then(r => JSON.stringify({
          success: r.success,
          error: r.error,
          children: r.data ? r.data.map(a => ({ name: a.childName, entries: a.entries.length })) : []
        }))
      `);
      const result = JSON.parse(res.result.value);
      const elapsed = Math.round((Date.now() - start) / 1000);

      if (!result.success) {
        console.log(`   ERROR: ${result.error}`);
        return;
      }

      let total = 0;
      for (const c of result.children) {
        console.log(`   - ${c.name}: ${c.entries} entries`);
        total += c.entries;
      }
      console.log(`   Total: ${total} entries in ${elapsed}s`);
      console.log('   Backend sync batches fired (check DB in ~10s for results)');

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
