// Walk the config agent through the full flow and apply a test change:
// - Disable autoplay on "67kid" profile
// - Set maturity on "Ramsay!" from older-kids → little-kids (the recommended setting)
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('No chrome view found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }

  function evaluate(expr) {
    return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  }

  ws.on('open', async () => {
    try {
      // Start the agent first
      console.log('Starting agent (discovering profiles)...');
      let startRes = await evaluate('window.electronAPI.configAgentStart().then(r => JSON.stringify(r))');
      let startData = JSON.parse(startRes.result.value);
      console.log('Agent started. Step:', startData.data?.step, 'Profiles:', startData.data?.profiles?.length);

      // Use the pre-loaded mappings from the start result
      const mappingsJson = `[
        {"netflixProfile":{"guid":"2CLVMNZPRFEOBK32A26RG4FNJQ","name":"Ramsay!","avatarUrl":"","isKids":false,"maturityLevel":"older-kids","hasPIN":false,"isLocked":false,"autoplayEnabled":true},"familyMemberId":"8c948f22-017c-491c-bdea-f934c4acf0b5","familyMemberName":"Ramsay","familyMemberType":"child","childAge":6,"childStrictness":"recommended","recommendedMaturity":"little-kids"},
        {"netflixProfile":{"guid":"4GSBFXDY4FGBDJLJMCAVJDROXA","name":"Mom and dad","avatarUrl":"","isKids":false,"maturityLevel":"all","hasPIN":false,"isLocked":false,"autoplayEnabled":true},"familyMemberId":"f7effa5e-553e-4bc4-a561-a2e4b1682896","familyMemberName":"Mom","familyMemberType":"adult"},
        {"netflixProfile":{"guid":"IUJ4RFGSNBB37IVR2DMKPSEKHQ","name":"67kid","avatarUrl":"","isKids":true,"maturityLevel":"older-kids","hasPIN":false,"isLocked":false,"autoplayEnabled":true},"familyMemberId":"4423d320-6d3a-4aa2-b2dd-0f19693d1460","familyMemberName":"Samson","familyMemberType":"child","childAge":9,"childStrictness":"recommended","recommendedMaturity":"older-kids"},
        {"netflixProfile":{"guid":"FTVLJUZKORCHFF4PHAFU5ZVDPQ","name":"Chap","avatarUrl":"","isKids":true,"maturityLevel":"older-kids","hasPIN":false,"isLocked":false,"autoplayEnabled":true},"familyMemberId":"81570c86-1286-40ed-b4fe-4a27762580bb","familyMemberName":"Chap","familyMemberType":"child","childAge":11,"childStrictness":"recommended","recommendedMaturity":"older-kids"},
        {"netflixProfile":{"guid":"63N6R2CUCBCONFXN3YQXV3JGRI","name":"Elmo","avatarUrl":"","isKids":true,"maturityLevel":"older-kids","hasPIN":false,"isLocked":false,"autoplayEnabled":true},"familyMemberId":"c98e62bc-8bb1-4d5e-9a9b-d8d2a014684e","familyMemberName":"Mona","familyMemberType":"child","childAge":9,"childStrictness":"recommended","recommendedMaturity":"older-kids"}
      ]`;

      // Step 1: Confirm mappings
      console.log('Step 1: Confirming mappings...');
      let res = await evaluate(`window.electronAPI.configAgentConfirmMappings(${mappingsJson}).then(r => JSON.stringify(r))`);
      let data = JSON.parse(res.result.value);
      console.log('Step:', data.data?.step);

      // Step 2: Confirm maturity (pass same mappings — Ramsay has recommendedMaturity=little-kids != current older-kids)
      console.log('Step 2: Confirming maturity...');
      res = await evaluate(`window.electronAPI.configAgentConfirmMaturity(${mappingsJson}).then(r => JSON.stringify(r))`);
      data = JSON.parse(res.result.value);
      console.log('Step:', data.data?.step);

      // Step 3: Confirm PINs — skip (empty array, no pin)
      console.log('Step 3: Confirming PINs (none)...');
      res = await evaluate(`window.electronAPI.configAgentConfirmPins([], "").then(r => JSON.stringify(r))`);
      data = JSON.parse(res.result.value);
      console.log('Step:', data.data?.step);

      // Step 4: Confirm locks — skip (empty array)
      console.log('Step 4: Confirming locks (none)...');
      res = await evaluate(`window.electronAPI.configAgentConfirmLocks([]).then(r => JSON.stringify(r))`);
      data = JSON.parse(res.result.value);
      console.log('Step:', data.data?.step);

      // Step 5: Confirm autoplay — disable on 67kid only
      console.log('Step 5: Confirming autoplay (disable on 67kid)...');
      const autoplaySettings = JSON.stringify([
        { profileGuid: "IUJ4RFGSNBB37IVR2DMKPSEKHQ", disable: true }
      ]);
      res = await evaluate(`window.electronAPI.configAgentConfirmAutoplay(${autoplaySettings}).then(r => JSON.stringify(r))`);
      data = JSON.parse(res.result.value);
      console.log('Step:', data.data?.step);
      console.log('Changes to apply:', JSON.stringify(data.data?.changes, null, 2));

      // Step 6: Apply!
      console.log('\nStep 6: APPLYING changes...');
      res = await evaluate(`window.electronAPI.configAgentApply().then(r => JSON.stringify(r))`);
      data = JSON.parse(res.result.value);
      console.log('\nFinal step:', data.data?.step);
      console.log('Apply progress:', JSON.stringify(data.data?.applyProgress, null, 2));
      if (data.data?.error) console.log('Error:', data.data.error);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
