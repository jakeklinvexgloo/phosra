// Test config agent persistence across steps and restarts
const WebSocket = require('ws');

async function connectChrome() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) throw new Error('No chrome view found. Targets: ' + targets.map(t => t.title).join(', '));

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(chrome.webSocketDebuggerUrl);
    let id = 1;

    function send(method, params) {
      return new Promise((res, rej) => {
        const msgId = id++;
        function handler(data) {
          const msg = JSON.parse(data.toString());
          if (msg.id === msgId) {
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

    async function call(method, ...args) {
      const argsStr = args.map(a => JSON.stringify(a)).join(', ');
      const res = await evaluate(`window.electronAPI.${method}(${argsStr}).then(r => JSON.stringify(r))`);
      return JSON.parse(res.result.value);
    }

    ws.on('open', () => resolve({ ws, call }));
    ws.on('error', reject);
  });
}

function printMappings(mappings) {
  if (!mappings || mappings.length === 0) { console.log('  (no mappings)'); return; }
  for (const m of mappings) {
    const profile = m.netflixProfile?.name || '?';
    const member = m.familyMemberName || 'unassigned';
    const type = m.familyMemberType || '?';
    console.log(`  ${profile} → ${member} (${type})`);
  }
}

async function run() {
  const testName = process.argv[2] || 'all';

  // =====================================================
  // TEST 1: Start → assign mappings → check persistence
  // =====================================================
  if (testName === 'all' || testName === '1') {
    console.log('\n========== TEST 1: Start agent, assign custom mappings ==========');
    const { ws, call } = await connectChrome();

    // Start agent
    let res = await call('configAgentStart');
    console.log('Started. Step:', res.data?.step, 'Profiles:', res.data?.profiles?.length);
    printMappings(res.data?.mappings);

    // Create custom mappings — swap some assignments around
    const profiles = res.data.profiles;
    const customMappings = profiles.map(p => {
      if (p.name === 'Ramsay!') {
        return {
          netflixProfile: p,
          familyMemberId: 'test-child-1',
          familyMemberName: 'TestChild_Alpha',
          familyMemberType: 'child',
          childAge: 8,
          childStrictness: 'strict',
          recommendedMaturity: 'little-kids'
        };
      }
      if (p.name === '67kid') {
        return {
          netflixProfile: p,
          familyMemberId: 'test-child-2',
          familyMemberName: 'TestChild_Beta',
          familyMemberType: 'child',
          childAge: 14,
          childStrictness: 'relaxed',
          recommendedMaturity: 'all'
        };
      }
      if (p.name === 'Mom and dad') {
        return {
          netflixProfile: p,
          familyMemberId: 'test-adult-1',
          familyMemberName: 'TestParent_One',
          familyMemberType: 'adult'
        };
      }
      return {
        netflixProfile: p,
        familyMemberType: 'unassigned'
      };
    });

    // Confirm mappings
    res = await call('configAgentConfirmMappings', customMappings);
    console.log('\nAfter confirmMappings. Step:', res.data?.step);
    printMappings(res.data?.mappings);

    // Move to maturity step
    res = await call('configAgentConfirmMaturity', customMappings);
    console.log('\nAfter confirmMaturity. Step:', res.data?.step);

    ws.close();
    console.log('\n--- Closed connection (simulating exit) ---');
  }

  // =====================================================
  // TEST 2: Check saved state + resume
  // =====================================================
  if (testName === 'all' || testName === '2') {
    console.log('\n========== TEST 2: Check saved state and resume ==========');
    const { ws, call } = await connectChrome();

    // Check if saved state exists
    let res = await call('configAgentCheckSaved');
    console.log('check-saved result:', res.success);
    if (res.data) {
      console.log('Saved step:', res.data.step);
      console.log('Saved mappings:');
      printMappings(res.data.mappings);
      console.log('Saved changes:', res.data.changes?.length || 0);
    } else {
      console.log('NO SAVED STATE FOUND — persistence is broken!');
    }

    // Resume
    res = await call('configAgentResume');
    console.log('\nAfter resume. Step:', res.data?.step);
    console.log('Resumed mappings:');
    printMappings(res.data?.mappings);

    ws.close();
    console.log('\n--- Closed connection ---');
  }

  // =====================================================
  // TEST 3: Start fresh → verify mappings pre-populate
  // =====================================================
  if (testName === 'all' || testName === '3') {
    console.log('\n========== TEST 3: Start fresh, verify mappings pre-populate ==========');
    const { ws, call } = await connectChrome();

    // Start fresh (this should re-discover profiles and pre-populate saved mappings)
    let res = await call('configAgentStart');
    console.log('Started fresh. Step:', res.data?.step);
    console.log('Pre-populated mappings:');
    printMappings(res.data?.mappings);

    // Check if our custom test names survived
    const mappings = res.data?.mappings || [];
    const alpha = mappings.find(m => m.familyMemberName === 'TestChild_Alpha');
    const beta = mappings.find(m => m.familyMemberName === 'TestChild_Beta');
    const parent = mappings.find(m => m.familyMemberName === 'TestParent_One');

    console.log('\nPersistence check:');
    console.log('  TestChild_Alpha preserved:', !!alpha, alpha ? `(profile: ${alpha.netflixProfile?.name})` : '');
    console.log('  TestChild_Beta preserved:', !!beta, beta ? `(profile: ${beta.netflixProfile?.name})` : '');
    console.log('  TestParent_One preserved:', !!parent, parent ? `(profile: ${parent.netflixProfile?.name})` : '');

    ws.close();
    console.log('\n--- Closed connection ---');
  }

  // =====================================================
  // TEST 4: Cancel → verify state is cleared
  // =====================================================
  if (testName === 'all' || testName === '4') {
    console.log('\n========== TEST 4: Cancel and verify state cleared ==========');
    const { ws, call } = await connectChrome();

    // Cancel
    let res = await call('configAgentCancel');
    console.log('Cancelled:', res.success);

    // Check saved — should be cleared
    res = await call('configAgentCheckSaved');
    console.log('check-saved after cancel:', res.success, 'data:', res.data ? 'EXISTS (bug!)' : 'null (correct)');

    ws.close();
    console.log('\n--- Closed connection ---');
  }

  // =====================================================
  // TEST 5: Start → go through ALL steps → check each persists
  // =====================================================
  if (testName === 'all' || testName === '5') {
    console.log('\n========== TEST 5: Walk all steps and verify persistence ==========');
    const { ws, call } = await connectChrome();

    // Start
    let res = await call('configAgentStart');
    const profiles = res.data.profiles;
    console.log('Step 1 (discovering→awaiting-mapping):', res.data?.step);

    // Confirm mappings
    const mappings = profiles.map(p => ({
      netflixProfile: p,
      familyMemberId: 'fam-' + p.guid.substring(0, 6),
      familyMemberName: 'Persist_' + p.name,
      familyMemberType: p.isKids ? 'child' : 'adult',
      childAge: p.isKids ? 10 : undefined,
      childStrictness: p.isKids ? 'recommended' : undefined,
      recommendedMaturity: p.isKids ? 'older-kids' : undefined,
    }));
    res = await call('configAgentConfirmMappings', mappings);
    console.log('Step 2 (awaiting-maturity):', res.data?.step);

    // Check persistence after step 2
    ws.close();
    const { ws: ws2, call: call2 } = await connectChrome();
    res = await call2('configAgentCheckSaved');
    console.log('  → Persisted at step:', res.data?.step, 'mappings:', res.data?.mappings?.length);

    // Resume and continue
    res = await call2('configAgentResume');
    console.log('  → Resumed at step:', res.data?.step);

    // Confirm maturity
    res = await call2('configAgentConfirmMaturity', res.data?.mappings || mappings);
    console.log('Step 3 (awaiting-pins):', res.data?.step);

    // Confirm pins
    res = await call2('configAgentConfirmPins', [], '');
    console.log('Step 4 (awaiting-locks):', res.data?.step);

    // Confirm locks
    res = await call2('configAgentConfirmLocks', []);
    console.log('Step 5 (awaiting-autoplay):', res.data?.step);

    // Check persistence at step 5
    ws2.close();
    const { ws: ws3, call: call3 } = await connectChrome();
    res = await call3('configAgentCheckSaved');
    console.log('  → Persisted at step:', res.data?.step, 'mappings:', res.data?.mappings?.length);

    // Resume
    res = await call3('configAgentResume');
    console.log('  → Resumed at step:', res.data?.step);

    // Confirm autoplay (no changes)
    res = await call3('configAgentConfirmAutoplay', []);
    console.log('Step 6 (reviewing):', res.data?.step, 'changes:', res.data?.changes?.length);

    // Check persistence at review
    ws3.close();
    const { ws: ws4, call: call4 } = await connectChrome();
    res = await call4('configAgentCheckSaved');
    console.log('  → Persisted at step:', res.data?.step, 'changes:', res.data?.changes?.length);

    // Clean up — cancel
    res = await call4('configAgentResume');
    res = await call4('configAgentCancel');
    console.log('\nCleaned up (cancelled).');

    ws4.close();
  }

  console.log('\n========== ALL TESTS COMPLETE ==========');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
