/**
 * Re-scrape CSM reviews that are missing deep fields (ageExplanation,
 * positiveContent, descriptor descriptions).
 *
 * Connects to the Phosra Browser via CDP WebSocket and triggers
 * re-enrichment for shallow reviews.
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
      // Step 1: Get shallow reviews via IPC
      console.log('Checking for shallow reviews (missing deep fields)...\n');

      const res = await evaluate(`
        window.electronAPI.getCSMShallowReviews().then(r => JSON.stringify(r))
      `, 15000);

      const result = JSON.parse(res.result.value);
      if (!result.success) {
        console.log('Failed to get shallow reviews:', result.error);
        ws.close();
        return;
      }

      const { count, titles } = result.data;
      console.log(`Found ${count} shallow reviews that need deep data.\n`);

      if (count === 0) {
        console.log('All reviews already have deep data. Nothing to do.');
        ws.close();
        return;
      }

      // Show first 20 titles as preview
      const preview = titles.slice(0, 20);
      console.log('Sample titles to re-scrape:');
      for (const t of preview) {
        console.log(`  - ${t}`);
      }
      if (titles.length > 20) {
        console.log(`  ... and ${titles.length - 20} more\n`);
      }

      // Step 2: Trigger re-enrichment
      console.log(`\nTriggering re-enrichment of ${count} titles...`);
      console.log('(This will take a while — each title requires a page load)\n');

      const startTime = Date.now();

      const enrichRes = await evaluate(`
        window.electronAPI.enrichCSMTitles(${JSON.stringify(titles)}).then(r => JSON.stringify(r))
      `, 10000);

      const enrichResult = JSON.parse(enrichRes.result.value);
      if (!enrichResult.success) {
        console.log('Failed to start enrichment:', enrichResult.error);
        ws.close();
        return;
      }

      console.log('Enrichment started. Listening for progress...\n');

      // Step 3: Poll for completion by checking cache stats periodically
      let lastCount = 0;
      const pollInterval = setInterval(async () => {
        try {
          const statsRes = await evaluate(`
            window.electronAPI.getCSMCacheStats().then(r => JSON.stringify(r))
          `, 5000);
          const stats = JSON.parse(statsRes.result.value);
          if (stats.success && stats.data) {
            const { total, fresh } = stats.data;
            if (total !== lastCount) {
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              console.log(`  [${elapsed}s] Cache: ${total} total, ${fresh} fresh`);
              lastCount = total;
            }
          }
        } catch {
          // ignore poll errors
        }
      }, 10000);

      // Wait for enrichment-complete (poll-based since we can't easily listen to IPC events via CDP)
      // Check every 10s if enrichment is still running by comparing shallow count
      const checkDone = setInterval(async () => {
        try {
          const checkRes = await evaluate(`
            window.electronAPI.getCSMShallowReviews().then(r => JSON.stringify(r))
          `, 10000);
          const checkResult = JSON.parse(checkRes.result.value);
          if (checkResult.success && checkResult.data.count === 0) {
            clearInterval(pollInterval);
            clearInterval(checkDone);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`\nRe-scraping complete in ${elapsed}s. All reviews now have deep data.`);
            ws.close();
          }
        } catch {
          // ignore
        }
      }, 30000);

      // Safety timeout: close after 30 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        clearInterval(checkDone);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`\nTimed out after ${elapsed}s. Some reviews may still be processing.`);
        console.log('Run this script again to continue re-scraping remaining shallow reviews.');
        ws.close();
      }, 30 * 60 * 1000);

    } catch (e) {
      console.error('Error:', e.message);
      ws.close();
    }
  });
}

run();
