// Focused test on the two bugs found
const WebSocket = require('ws');

async function connectChrome() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) throw new Error('No chrome view');
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(chrome.webSocketDebuggerUrl);
    let id = 1;
    function send(method, params) {
      return new Promise((res, rej) => {
        const msgId = id++;
        function handler(data) {
          const msg = JSON.parse(data.toString());
          if (msg.id === msgId) { ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); }
        }
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
      });
    }
    function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); }
    async function call(method, ...args) {
      const argsStr = args.map(a => JSON.stringify(a)).join(', ');
      const res = await evaluate(`window.electronAPI.${method}(${argsStr}).then(r => JSON.stringify(r))`);
      return JSON.parse(res.result.value);
    }
    ws.on('open', () => resolve({ ws, call }));
    ws.on('error', reject);
  });
}

async function run() {
  console.log('========== BUG INVESTIGATION ==========\n');

  const { ws, call } = await connectChrome();

  // First cancel to start clean
  await call('configAgentCancel');

  // Wait for remote delete to propagate
  await new Promise(r => setTimeout(r, 2000));

  // Check saved — should be empty
  let res = await call('configAgentCheckSaved');
  console.log('After cancel + 2s wait:');
  console.log('  check-saved data:', res.data ? JSON.stringify({ step: res.data.step, mappingsCount: res.data.mappings?.length }).substring(0, 100) : 'null');

  // Start fresh
  res = await call('configAgentStart');
  console.log('\nStarted fresh. Step:', res.data?.step);

  // Custom mappings
  const mappings = res.data.profiles.map(p => ({
    netflixProfile: p,
    familyMemberId: 'bug-test-' + p.guid.substring(0, 4),
    familyMemberName: 'BugTest_' + p.name,
    familyMemberType: p.isKids ? 'child' : 'adult',
    childAge: p.isKids ? 10 : undefined,
    childStrictness: p.isKids ? 'recommended' : undefined,
    recommendedMaturity: p.isKids ? 'older-kids' : undefined,
  }));

  // Confirm mappings
  res = await call('configAgentConfirmMappings', mappings);
  console.log('After confirmMappings. Step:', res.data?.step);

  // Wait for persistence to flush
  await new Promise(r => setTimeout(r, 1000));

  // Close and reconnect to simulate exit
  ws.close();
  await new Promise(r => setTimeout(r, 500));

  const { ws: ws2, call: call2 } = await connectChrome();

  // Check saved
  res = await call2('configAgentCheckSaved');
  console.log('\nAfter reconnect - check-saved:');
  console.log('  step:', res.data?.step);
  console.log('  mappings count:', res.data?.mappings?.length);
  if (res.data?.mappings) {
    for (const m of res.data.mappings) {
      console.log('    ', m.netflixProfile?.name, '→', m.familyMemberName, `(${m.familyMemberType})`);
    }
  }

  // The key question: does check-saved return the LOCAL or REMOTE state?
  // And after cancel, does the remote state actually get deleted?

  // Cancel
  await call2('configAgentCancel');
  console.log('\nCancelled.');

  // Wait 3s for remote delete
  await new Promise(r => setTimeout(r, 3000));

  // Check saved again
  res = await call2('configAgentCheckSaved');
  console.log('After cancel + 3s:');
  console.log('  check-saved data:', res.data ? 'STILL EXISTS (step: ' + res.data.step + ')' : 'null (GOOD)');

  ws2.close();
  console.log('\n========== DONE ==========');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
