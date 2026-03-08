/**
 * Sync all persisted Netflix activity to backend using the profile-child map.
 * Doesn't re-fetch from Netflix — just re-syncs what we already have.
 */
const WebSocket = require('ws');

const PROFILE_CHILD_MAP = [
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

function parseNetflixDate(dateStr) {
  if (!dateStr) return null;
  // Netflix dates look like "3/7/25" or "12/25/24"
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  let [m, d, y] = parts.map(Number);
  if (y < 100) y += 2000;
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('Chrome UI not found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function evaluate(expr) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error('Timeout')), 30000);
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
      // Load persisted activity
      console.log('Loading persisted activity...');
      const res = await evaluate(`
        window.electronAPI.loadNetflixActivity().then(r => JSON.stringify(r))
      `);
      const result = JSON.parse(res.result.value);
      if (!result.success || !result.data) {
        console.log('No persisted activity found');
        ws.close();
        return;
      }

      const activities = result.data;
      let totalSynced = 0;
      let totalBatches = 0;

      for (const act of activities) {
        const mapEntry = PROFILE_CHILD_MAP.find(m => m.profileGuid === act.profileGuid);
        const targets = mapEntry ? mapEntry.children : [{ childId: act.childId, childName: act.childName }];

        for (const target of targets) {
          const entries = act.entries.map(e => ({
            child_id: target.childId,
            child_name: target.childName,
            platform: 'netflix',
            title: e.title,
            series_title: e.seriesTitle || null,
            watched_date: parseNetflixDate(e.date),
            netflix_profile: act.profileGuid,
          }));

          console.log(`\nSyncing ${act.profileName} → ${target.childName} (${entries.length} entries)...`);

          // Batch at 500
          const BATCH_SIZE = 500;
          for (let i = 0; i < entries.length; i += BATCH_SIZE) {
            const batch = entries.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatchCount = Math.ceil(entries.length / BATCH_SIZE);

            // Use the Phosra API via the browser's authenticated client
            const syncRes = await evaluate(`
              (async function() {
                const token = await window.electronAPI.getAuthStatus();
                if (!token.isLoggedIn) return JSON.stringify({ error: 'not logged in' });

                const res = await fetch('https://phosra-api.fly.dev/api/v1/viewing-history/sync', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ entries: ${JSON.stringify(batch)} })
                });
                return JSON.stringify({ status: res.status, body: await res.text() });
              })()
            `);

            // Actually, let's use the electronAPI which has the auth token
            // The fetch above won't have the token. Let me use a different approach.
            // Let me just call the sync via the main process API client
            break; // bail out of this approach
          }
          break;
        }
        break;
      }

      console.log('\nDirect API approach is complex from renderer. Let me use a different method.');
      console.log('Will use the main process API client instead.');

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
