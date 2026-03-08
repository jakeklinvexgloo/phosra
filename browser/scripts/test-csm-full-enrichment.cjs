/**
 * Test: Trigger CSM enrichment on all unique titles from persisted viewing history.
 * Monitors progress and reports results.
 */
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  let target = targets.find(t => t.title === 'Phosra Browser') || targets[0];
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
      // Step 1: Load persisted activity and extract unique series titles
      console.log('1. Loading persisted activity...');
      let res = await evaluate(`
        window.electronAPI.loadNetflixActivity().then(r => {
          if (!r.success || !r.data) return JSON.stringify({ titles: [], total: 0 });
          var titles = new Set();
          var totalEntries = 0;
          for (var act of r.data) {
            totalEntries += act.entries.length;
            for (var e of act.entries) {
              titles.add(e.seriesTitle || e.title);
            }
          }
          return JSON.stringify({ titles: Array.from(titles), total: totalEntries, profiles: r.data.length });
        })
      `);
      const data = JSON.parse(res.result.value);
      console.log(`   ${data.profiles} profiles, ${data.total} entries, ${data.titles.length} unique titles`);
      console.log(`   Sample titles: ${data.titles.slice(0, 5).join(', ')}`);

      if (data.titles.length === 0) {
        console.log('   No titles to enrich.');
        ws.close();
        return;
      }

      // Step 2: Trigger CSM enrichment
      console.log(`\n2. Triggering CSM enrichment on ${data.titles.length} unique titles...`);
      console.log('   (Rate limited to ~15 req/min, this will take a while for many titles)');
      const startTime = Date.now();

      res = await evaluate(`
        window.electronAPI.enrichCSMTitles(${JSON.stringify(data.titles)}).then(r => JSON.stringify(r))
      `);
      console.log(`   enrichCSMTitles response: ${res.result.value}`);

      // Step 3: Wait for some enrichment to happen, then check cache stats
      console.log('\n3. Waiting 30s for initial enrichment results...');
      await new Promise(r => setTimeout(r, 30000));

      res = await evaluate(`
        window.electronAPI.getCSMCacheStats().then(r => JSON.stringify(r))
      `);
      const stats = JSON.parse(res.result.value);
      console.log(`   Cache stats: ${JSON.stringify(stats.data)}`);

      // Step 4: Check a few cached reviews
      res = await evaluate(`
        window.electronAPI.getCSMCachedReviews().then(r => JSON.stringify({
          total: r.data ? r.data.length : 0,
          samples: r.data ? r.data.slice(0, 5).map(rv => rv.title + ' (age ' + rv.ageRangeMin + '+, ' + rv.qualityStars + ' stars)') : []
        }))
      `);
      const reviews = JSON.parse(res.result.value);
      console.log(`   Cached reviews: ${reviews.total}`);
      for (const s of reviews.samples) {
        console.log(`     - ${s}`);
      }

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n   Enrichment running in background (${elapsed}s so far)`);
      console.log('   CSM scraping continues in the background at ~15 req/min.');
      console.log('   Reviews are synced to backend DB as they complete.');
      console.log('   Run this script again later to check progress.');

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
