/**
 * Test: CSM Enrichment via the Phosra Browser
 *
 * 1. Connect to the chrome UI view via CDP
 * 2. Call window.electronAPI.enrichCSMTitles() with test titles
 * 3. Listen for csm:enrichment-update events
 * 4. Print results
 */
const WebSocket = require('ws');

const TEST_TITLES = [
  'The Thundermans',
  'Bluey',
  'Stranger Things',
];

async function connectChromeView() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  // Find the chrome UI view (has title "Phosra Browser")
  let target = targets.find(t => t.title === 'Phosra Browser' || t.url.includes('chrome-ui'));
  if (!target) target = targets.find(t => !t.url.includes('netflix') && !t.url.includes('commonsense'));
  if (!target) throw new Error('No chrome UI view found');

  console.log(`Connecting to: ${target.title} (${target.url})`);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const eventHandlers = new Map();

    function send(method, params) {
      return new Promise((res, rej) => {
        const msgId = id++;
        const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 30000);
        function handler(data) {
          const msg = JSON.parse(data.toString());
          if (msg.id === msgId) {
            clearTimeout(timeout);
            ws.off('message', handler);
            if (msg.error) rej(new Error(msg.error.message));
            else res(msg.result);
          }
        }
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
      });
    }

    function evaluate(expr) {
      return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    }

    ws.on('open', () => resolve({ ws, send, evaluate }));
    ws.on('error', reject);
  });
}

async function run() {
  console.log('=== CSM Enrichment Test ===\n');

  const ctx = await connectChromeView();

  try {
    // Step 1: Check if electronAPI is available
    console.log('1. Checking electronAPI availability...');
    let res = await ctx.evaluate('typeof window.electronAPI');
    console.log(`   electronAPI type: ${res.result.value}`);

    if (res.result.value === 'undefined') {
      console.error('   ERROR: electronAPI not available. Is this the chrome UI view?');
      return;
    }

    // Step 2: Check if enrichCSMTitles exists
    res = await ctx.evaluate('typeof window.electronAPI.enrichCSMTitles');
    console.log(`   enrichCSMTitles: ${res.result.value}`);

    if (res.result.value === 'undefined') {
      console.error('   ERROR: enrichCSMTitles not found. The browser needs to be restarted with new build.');
      return;
    }

    // Step 3: Check if getCSMCachedReviews exists
    res = await ctx.evaluate('typeof window.electronAPI.getCSMCachedReviews');
    console.log(`   getCSMCachedReviews: ${res.result.value}`);

    // Step 4: Check cache stats before enrichment
    console.log('\n2. Checking cache stats before enrichment...');
    res = await ctx.evaluate(`
      window.electronAPI.getCSMCacheStats().then(r => JSON.stringify(r))
    `);
    console.log(`   Cache stats: ${res.result.value}`);

    // Step 5: Set up event listener for enrichment updates
    console.log('\n3. Setting up enrichment update listener...');
    await ctx.evaluate(`
      window.__csmTestResults = [];
      window.__csmTestComplete = false;
      window.__csmTestCleanup1 = window.electronAPI.onCSMEnrichmentUpdate(function(data) {
        window.__csmTestResults.push(data);
        console.log('[CSM Update]', JSON.stringify(data));
      });
      window.__csmTestCleanup2 = window.electronAPI.onCSMEnrichmentComplete(function() {
        window.__csmTestComplete = true;
        console.log('[CSM Complete] All titles processed');
      });
      'listeners registered'
    `);
    console.log('   Listeners registered');

    // Step 6: Trigger enrichment
    console.log(`\n4. Triggering enrichment for ${TEST_TITLES.length} titles: ${TEST_TITLES.join(', ')}...`);
    res = await ctx.evaluate(`
      window.electronAPI.enrichCSMTitles(${JSON.stringify(TEST_TITLES)}).then(r => JSON.stringify(r))
    `);
    console.log(`   Enrich response: ${res.result.value}`);

    // Step 7: Poll for results (CSM scraping takes time)
    console.log('\n5. Waiting for results (this may take 30-60 seconds for uncached titles)...');
    const startTime = Date.now();
    const maxWait = 120000; // 2 minutes max

    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, 3000)); // Check every 3 seconds

      res = await ctx.evaluate(`JSON.stringify({
        results: window.__csmTestResults,
        complete: window.__csmTestComplete,
        count: window.__csmTestResults.length
      })`);

      const state = JSON.parse(res.result.value);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      if (state.count > 0) {
        console.log(`   [${elapsed}s] ${state.count}/${TEST_TITLES.length} titles resolved...`);
      }

      if (state.complete) {
        console.log(`   Enrichment complete in ${elapsed}s!`);
        break;
      }
    }

    // Step 8: Print results
    res = await ctx.evaluate('JSON.stringify(window.__csmTestResults, null, 2)');
    const results = JSON.parse(res.result.value);

    console.log('\n' + '='.repeat(80));
    console.log('  CSM ENRICHMENT RESULTS');
    console.log('='.repeat(80));

    for (const r of results) {
      console.log(`\n  "${r.title}" — ${r.status}`);
      if (r.review) {
        console.log(`    Age: ${r.review.ageRating || 'N/A'}`);
        console.log(`    Quality: ${r.review.qualityStars || '?'}/5`);
        console.log(`    Type: ${r.review.csmMediaType || 'N/A'}`);
        console.log(`    Family Friendly: ${r.review.isFamilyFriendly ?? 'N/A'}`);
        if (r.review.parentSummary) {
          console.log(`    Parents: ${r.review.parentSummary.substring(0, 120)}...`);
        }
        if (r.review.descriptors && r.review.descriptors.length > 0) {
          const desc = r.review.descriptors
            .filter(d => d.level && d.level !== 'Not present')
            .map(d => `${d.category}: ${d.level}`)
            .join(' | ');
          if (desc) console.log(`    Content: ${desc}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    const matched = results.filter(r => r.status === 'cached' || r.status === 'scraped');
    console.log(`\nMatched: ${matched.length}/${results.length} titles`);

    // Step 9: Check cache stats after enrichment
    res = await ctx.evaluate(`
      window.electronAPI.getCSMCacheStats().then(r => JSON.stringify(r))
    `);
    console.log(`Cache stats after: ${res.result.value}`);

    // Step 10: Cleanup event listeners
    await ctx.evaluate(`
      if (window.__csmTestCleanup1) window.__csmTestCleanup1();
      if (window.__csmTestCleanup2) window.__csmTestCleanup2();
      delete window.__csmTestResults;
      delete window.__csmTestComplete;
      delete window.__csmTestCleanup1;
      delete window.__csmTestCleanup2;
      'cleaned up'
    `);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    ctx.ws.close();
  }
}

run();
