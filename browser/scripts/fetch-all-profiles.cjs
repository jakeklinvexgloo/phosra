/**
 * Trigger Netflix activity fetch for all profiles including Ramsay!
 * Uses a long timeout since Netflix pagination takes time.
 */
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('Chrome UI not found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function evaluate(expr, timeoutMs) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error('Timeout')), timeoutMs || 30000);
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
      // First check the current tab — need to be on Netflix
      let res = await evaluate(`document.title`, 5000);
      console.log('Note: Netflix must be open in the active tab for the fetch to work.');
      console.log('If this fails, navigate to netflix.com/viewingactivity first.\n');

      // Build the child mappings for all profiles
      const childMappings = [
        { childName: 'Samson', childId: '4423d320-6d3a-4aa2-b2dd-0f19693d1460', profileGuid: 'IUJ4RFGSNBB37IVR2DMKPSEKHQ', profileName: '67kid', avatarUrl: '' },
        { childName: 'Chap', childId: '81570c86-1286-40ed-b4fe-4a27762580bb', profileGuid: 'FTVLJUZKORCHFF4PHAFU5ZVDPQ', profileName: 'Chap', avatarUrl: '' },
        { childName: 'Mona', childId: 'c98e62bc-8bb1-4d5e-9a9b-d8d2a014684e', profileGuid: '63N6R2CUCBCONFXN3YQXV3JGRI', profileName: 'Elmo', avatarUrl: '' },
        { childName: 'Ramsay', childId: '8c948f22-017c-491c-bdea-f934c4acf0b5', profileGuid: '2CLVMNZPRFEOBK32A26RG4FNJQ', profileName: 'Ramsay!', avatarUrl: '' },
      ];

      console.log('Fetching Netflix activity for all profiles...');
      console.log('Profiles:', childMappings.map(m => m.profileName).join(', '));
      console.log('(This will take several minutes for pagination)\n');

      const startTime = Date.now();

      res = await evaluate(`
        window.electronAPI.fetchNetflixActivity(${JSON.stringify(childMappings)}).then(r => JSON.stringify({
          success: r.success,
          error: r.error,
          profiles: r.data ? r.data.map(a => ({ name: a.profileName, childName: a.childName, entries: a.entries.length })) : []
        }))
      `, 600000); // 10 minute timeout

      const result = JSON.parse(res.result.value);
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      if (result.success) {
        console.log(`Fetch complete in ${elapsed}s:`);
        let total = 0;
        for (const p of result.profiles) {
          console.log(`  ${p.name} (${p.childName}): ${p.entries} entries`);
          total += p.entries;
        }
        console.log(`  Total: ${total} entries`);
        console.log('\nBackend sync running in background with profile-child mappings.');
        console.log('Ramsay! entries will be stored for both Ramsay and Coldy.');

        // Wait a bit then trigger resync to make sure everything is in the DB
        console.log('\nWaiting 15s for backend sync to complete...');
        await new Promise(r => setTimeout(r, 15000));

        // Trigger explicit resync
        console.log('Triggering explicit resync...');
        res = await evaluate(`
          window.electronAPI.resyncNetflixBackend().then(r => JSON.stringify(r))
        `, 120000);
        console.log('Resync result:', res.result.value);

      } else {
        console.log('Fetch failed:', result.error);
        console.log('Make sure Netflix is open in the active tab.');
      }

    } catch (e) {
      console.error('Error:', e.message);
      if (e.message === 'Timeout') {
        console.log('The fetch is still running in the background.');
        console.log('Run resync-all.cjs later to sync to backend.');
      }
    } finally {
      ws.close();
    }
  });
}

run();
