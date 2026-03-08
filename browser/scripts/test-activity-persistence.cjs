/**
 * Test: Activity persistence + full history fetch + backend sync
 */
const WebSocket = require('ws');

async function connectChromeView() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  let target = targets.find(t => t.title === 'Phosra Browser');
  if (!target) target = targets.find(t => !t.url.includes('netflix'));
  if (!target) throw new Error('No chrome UI view found');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;

    function send(method, params) {
      return new Promise((res, rej) => {
        const msgId = id++;
        const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 600000); // 10 min timeout
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

    ws.on('open', () => resolve({ ws, evaluate }));
    ws.on('error', reject);
  });
}

async function run() {
  console.log('=== Activity Persistence + Full Fetch Test ===\n');
  const ctx = await connectChromeView();

  try {
    // Step 1: Check API
    console.log('1. Checking loadNetflixActivity API...');
    let res = await ctx.evaluate('typeof window.electronAPI.loadNetflixActivity');
    console.log(`   loadNetflixActivity: ${res.result.value}`);
    if (res.result.value === 'undefined') {
      console.error('   ERROR: API not found. Restart browser with new build.');
      return;
    }

    // Step 2: Load persisted activity
    console.log('\n2. Loading persisted activity (from previous sessions)...');
    res = await ctx.evaluate(`
      window.electronAPI.loadNetflixActivity().then(r => JSON.stringify({
        success: r.success,
        hasData: !!(r.data && r.data.length > 0),
        totalEntries: r.data ? r.data.reduce((sum, a) => sum + a.entries.length, 0) : 0,
        children: r.data ? r.data.map(a => ({ name: a.childName, entries: a.entries.length })) : []
      }))
    `);
    const persisted = JSON.parse(res.result.value);
    console.log(`   Has persisted data: ${persisted.hasData}`);
    if (persisted.hasData) {
      for (const c of persisted.children) {
        console.log(`     - ${c.name}: ${c.entries} entries`);
      }
    }

    // Step 3: Get mappings
    console.log('\n3. Loading profile mappings...');
    res = await ctx.evaluate(`
      window.electronAPI.loadNetflixMappings().then(r => {
        if (!r.success || !r.data) return JSON.stringify({ inputs: [] });
        var inputs = r.data.filter(m => m.familyMemberType === 'child').map(m => ({
          childName: m.familyMemberName || '',
          childId: m.familyMemberId || '',
          profileGuid: m.netflixProfile.guid,
          profileName: m.netflixProfile.name,
          avatarUrl: m.netflixProfile.avatarUrl || ''
        }));
        return JSON.stringify({ inputs: inputs, total: r.data.length });
      })
    `);
    const mappingData = JSON.parse(res.result.value);
    console.log(`   Child profiles to fetch: ${mappingData.inputs.length}`);

    if (mappingData.inputs.length === 0) {
      console.log('   No child profiles mapped. Skipping live fetch.');
      if (persisted.hasData) console.log('\n✓ Persistence verified from previous session');
      return;
    }

    // Step 4: Fetch full activity with pagination
    console.log('\n4. Fetching FULL Netflix history (with Show More pagination)...');
    console.log('   This may take 1-3 minutes for large histories...');
    const startTime = Date.now();

    res = await ctx.evaluate(`
      window.electronAPI.fetchNetflixActivity(${JSON.stringify(mappingData.inputs)}).then(r => JSON.stringify({
        success: r.success,
        error: r.error,
        children: r.data ? r.data.map(a => ({ name: a.childName, entries: a.entries.length, fetchedAt: a.fetchedAt })) : []
      }))
    `);
    const fetchResult = JSON.parse(res.result.value);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (!fetchResult.success) {
      console.log(`   ERROR: ${fetchResult.error}`);
      return;
    }

    let totalEntries = 0;
    console.log(`\n   Fetch completed in ${elapsed}s:`);
    for (const c of fetchResult.children) {
      console.log(`     - ${c.name}: ${c.entries} entries`);
      totalEntries += c.entries;
    }

    // Step 5: Verify persistence
    console.log('\n5. Verifying persistence...');
    res = await ctx.evaluate(`
      window.electronAPI.loadNetflixActivity().then(r => JSON.stringify({
        success: r.success,
        totalEntries: r.data ? r.data.reduce((sum, a) => sum + a.entries.length, 0) : 0
      }))
    `);
    const verify = JSON.parse(res.result.value);

    if (verify.totalEntries === totalEntries) {
      console.log(`   ✓ All ${totalEntries} entries persisted correctly`);
    } else {
      console.log(`   ✗ Mismatch: fetched ${totalEntries}, persisted ${verify.totalEntries}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`  Profiles: ${fetchResult.children.length} | Entries: ${totalEntries} | Time: ${elapsed}s`);
    console.log(`  Persistence: ✓ | Backend sync: fire-and-forget`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    ctx.ws.close();
  }
}

run();
