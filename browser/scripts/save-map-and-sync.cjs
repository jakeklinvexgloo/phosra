/**
 * Save the profile → child mapping and re-sync all persisted activity to backend.
 */
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
      const timeout = setTimeout(() => rej(new Error('Timeout')), 60000);
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
      // Step 1: Save the profile → child mapping
      console.log('1. Saving profile-child map...');
      const map = [
        {
          profileGuid: 'IUJ4RFGSNBB37IVR2DMKPSEKHQ',
          profileName: '67kid',
          children: [{ childId: '4423d320-6d3a-4aa2-b2dd-0f19693d1460', childName: 'Samson' }]
        },
        {
          profileGuid: 'FTVLJUZKORCHFF4PHAFU5ZVDPQ',
          profileName: 'Chap',
          children: [{ childId: '81570c86-1286-40ed-b4fe-4a27762580bb', childName: 'Chap' }]
        },
        {
          profileGuid: '63N6R2CUCBCONFXN3YQXV3JGRI',
          profileName: 'Elmo',
          children: [{ childId: 'c98e62bc-8bb1-4d5e-9a9b-d8d2a014684e', childName: 'Mona' }]
        },
        {
          profileGuid: '2CLVMNZPRFEOBK32A26RG4FNJQ',
          profileName: 'Ramsay!',
          children: [
            { childId: '8c948f22-017c-491c-bdea-f934c4acf0b5', childName: 'Ramsay' },
            { childId: '15ba1108-dab3-4d5a-9e32-8984bab9f485', childName: 'Coldy' }
          ]
        }
      ];

      let res = await evaluate(`
        window.electronAPI.saveProfileChildMap(${JSON.stringify(map)}).then(r => JSON.stringify(r))
      `);
      console.log('   Result:', res.result.value);

      // Step 2: Verify the map was saved
      res = await evaluate(`
        window.electronAPI.loadProfileChildMap().then(r => JSON.stringify(r))
      `);
      const loaded = JSON.parse(res.result.value);
      console.log('   Saved', loaded.data ? loaded.data.length : 0, 'mappings');

      // Step 3: Load persisted activity to check what we have
      res = await evaluate(`
        window.electronAPI.loadNetflixActivity().then(r => {
          if (!r.success || !r.data) return JSON.stringify({ profiles: 0 });
          return JSON.stringify({
            profiles: r.data.length,
            data: r.data.map(a => ({
              childName: a.childName,
              profileGuid: a.profileGuid,
              profileName: a.profileName,
              entries: a.entries.length
            }))
          });
        })
      `);
      const activity = JSON.parse(res.result.value);
      console.log('\n2. Persisted activity:');
      for (const p of activity.data) {
        const mapEntry = map.find(m => m.profileGuid === p.profileGuid);
        const targetNames = mapEntry ? mapEntry.children.map(c => c.childName).join(', ') : 'unmapped';
        console.log(`   ${p.profileName} (${p.entries} entries) → ${targetNames}`);
      }

      // Step 4: Re-fetch activity (this triggers the sync with the new mappings)
      // We need the child mappings from the UI, but we can construct them
      const childMappings = map.filter(m => m.children.length > 0).map(m => ({
        childName: m.children[0].childName,
        childId: m.children[0].childId,
        profileGuid: m.profileGuid,
        profileName: m.profileName,
        avatarUrl: ''
      }));

      console.log('\n3. Triggering activity fetch + backend sync...');
      console.log('   (This will scrape Netflix and sync all profiles to backend)');
      res = await evaluate(`
        window.electronAPI.fetchNetflixActivity(${JSON.stringify(childMappings)}).then(r => JSON.stringify({
          success: r.success,
          error: r.error,
          profiles: r.data ? r.data.length : 0,
          entries: r.data ? r.data.reduce((sum, a) => sum + a.entries.length, 0) : 0
        }))
      `);
      const fetchResult = JSON.parse(res.result.value);
      console.log('   Fetch result:', fetchResult);

      if (fetchResult.success) {
        console.log(`\n   Fetched ${fetchResult.entries} entries across ${fetchResult.profiles} profiles.`);
        console.log('   Backend sync running in background with profile-child mappings.');
        console.log('   Ramsay! profile entries will be duplicated for both Ramsay and Coldy.');
      }

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
