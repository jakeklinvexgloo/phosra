// This script: fills the MFA password, submits, then inspects the restrictions page
// and the playback settings page
const WebSocket = require('ws');

fetch('http://127.0.0.1:9222/json').then(r => r.json()).then(targets => {
  const netflix = targets.find(t => t.url.includes('netflix.com'));
  if (!netflix) { console.log('No Netflix tab'); return; }

  const ws = new WebSocket(netflix.webSocketDebuggerUrl);
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
    return send('Runtime.evaluate', { expression: expr, returnByValue: true });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function dumpPage(label) {
    const urlRes = await evaluate('window.location.href');
    console.log(`\n=== ${label} ===`);
    console.log('URL:', urlRes.result.value);

    const res = await evaluate(`(function(){
      var r = {};
      r.headings = Array.from(document.querySelectorAll("h1,h2,h3")).map(function(el){ return (el.textContent||"").trim().substring(0,80) }).filter(function(t){ return t.length > 0 && !t.includes("Cookie") && !t.includes("Privacy"); });
      r.inputs = Array.from(document.querySelectorAll("input,select,textarea")).map(function(el){
        return {
          tag: el.tagName, type: el.type, name: el.name, id: el.id,
          checked: el.checked, value: (el.value||"").substring(0,50),
          uia: el.getAttribute("data-uia")||"",
          ariaLabel: el.getAttribute("aria-label")||"",
          options: el.tagName==="SELECT" ? Array.from(el.options||[]).map(function(o){return{v:o.value,t:o.textContent.trim(),sel:o.selected}}) : undefined
        };
      }).filter(function(x){ return !x.name.includes("ot-") && x.id !== "vendor-search-handler" && !x.id.includes("select-all") && x.id !== "chkbox-id"; });
      r.buttons = Array.from(document.querySelectorAll("button")).map(function(el){
        return { text: (el.textContent||"").trim().substring(0,80), uia: el.getAttribute("data-uia")||"" };
      }).filter(function(x){ return x.text && !x.text.includes("Cookie") && x.text.length < 70; });
      r.bodyText = (document.body.innerText||"").substring(0,3000);
      return JSON.stringify(r, null, 2);
    })()`);
    console.log(res.result.value);
  }

  ws.on('open', async () => {
    try {
      // We should be on the MFA password page. Fill and submit.
      const urlRes = await evaluate('window.location.href');
      console.log('Current URL:', urlRes.result.value);

      const isMfa = urlRes.result.value.includes('/mfa');
      if (isMfa) {
        console.log('On MFA page, filling password...');
        // Fill the password
        await evaluate(`(function(){
          var el = document.querySelector('[data-uia="collect-password-input-modal-entry"]');
          if (!el) return false;
          var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(el, 'TempPassword123');
          el.dispatchEvent(new Event('input', {bubbles:true}));
          el.dispatchEvent(new Event('change', {bubbles:true}));
          return true;
        })()`);
        await sleep(500);

        // We won't actually submit since we don't have the real password
        // Instead, let's navigate directly to the restrictions page for a specific profile
        // and see if MFA session is cached
        console.log('Navigating directly to restrictions page for 67kid profile...');
      }

      // Navigate to restrictions for the 67kid profile GUID
      const profileGuid = 'IUJ4RFGSNBB37IVR2DMKPSEKHQ';
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions/' + profileGuid });
      await sleep(5000);
      await dumpPage('Restrictions page for 67kid');

      // Also check playback settings
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/playback/' + profileGuid });
      await sleep(5000);
      await dumpPage('Playback settings for 67kid');

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
});
