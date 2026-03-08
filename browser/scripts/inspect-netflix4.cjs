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

  async function inspectPage(label) {
    const urlRes = await evaluate('window.location.href');
    console.log(`\n=== ${label} ===`);
    console.log('URL:', urlRes.result.value);

    const res = await evaluate(`(function(){
      var r = {};
      r.title = document.title;
      r.h1 = Array.from(document.querySelectorAll("h1,h2,h3")).map(function(el){ return { tag: el.tagName, text: (el.textContent||"").trim().substring(0,80) }; });
      r.inputs = Array.from(document.querySelectorAll("input,select,textarea")).map(function(el){
        return {
          tag: el.tagName, type: el.type, name: el.name, id: el.id,
          checked: el.checked, value: (el.value||"").substring(0,50),
          uia: el.getAttribute("data-uia")||"",
          label: el.getAttribute("aria-label")||"",
          cls: (el.className||"").substring(0,120),
          options: el.tagName==="SELECT" ? Array.from(el.options||[]).map(function(o){return{v:o.value,t:o.textContent.trim()}}) : undefined
        };
      }).filter(function(x){ return !x.cls.includes("cookie") && !x.cls.includes("ot-"); });
      r.buttons = Array.from(document.querySelectorAll("button")).map(function(el){
        return { text: (el.textContent||"").trim().substring(0,80), uia: el.getAttribute("data-uia")||"", type: el.type };
      }).filter(function(x){ return x.text && !x.text.includes("Cookie") && x.text !== "Back Button" && x.text !== "Filter Button" && x.text !== "Clear" && x.text !== "Apply" && x.text !== "Cancel" && x.text !== "Save settings"; });
      r.links = Array.from(document.querySelectorAll("a[href]")).filter(function(a){
        var h = a.getAttribute("href")||"";
        return h.includes("settings") || h.includes("profile") || h.includes("restrict") || h.includes("parental");
      }).map(function(a){ return { href: a.getAttribute("href"), text: (a.textContent||"").trim().substring(0,60) }; });
      r.dataUiaFiltered = Array.from(document.querySelectorAll("[data-uia]")).map(function(el){
        return { uia: el.getAttribute("data-uia"), tag: el.tagName, text: (el.textContent||"").trim().substring(0,80) };
      }).filter(function(x){
        return x.uia && (x.uia.includes("profile") || x.uia.includes("maturity") || x.uia.includes("restrict") || x.uia.includes("autoplay") || x.uia.includes("lock") || x.uia.includes("pin") || x.uia.includes("parental") || x.uia.includes("setting") || x.uia.includes("save") || x.uia.includes("mfa"));
      });
      r.bodyText = (document.body.innerText||"").substring(0,3000);
      return JSON.stringify(r, null, 2);
    })()`);
    console.log(res.result.value);
  }

  ws.on('open', async () => {
    try {
      // 1. Go to /account/profiles and click on a profile (e.g., "67kid")
      await send('Page.navigate', { url: 'https://www.netflix.com/account/profiles' });
      await sleep(4000);

      // Click on "67kid" profile button
      console.log('Clicking on 67kid profile...');
      await evaluate(`(function(){
        var btns = document.querySelectorAll("button");
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].textContent.trim() === "67kid") { btns[i].click(); return true; }
        }
        return false;
      })()`);
      await sleep(4000);
      await inspectPage('After clicking 67kid profile');

      // 2. Now go to /settings/restrictions and handle MFA with password
      console.log('\n\nNavigating to parental controls...');
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions' });
      await sleep(4000);

      // Check if we're on MFA page
      const mfaRes = await evaluate("document.body.innerText.includes(\"make sure\")");

      if (mfaRes.result.value) {
        console.log('MFA gate detected, clicking "Confirm password"...');
        await evaluate(`(function(){
          var btns = document.querySelectorAll("button");
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.includes("Confirm password")) { btns[i].click(); return true; }
          }
          return false;
        })()`);
        await sleep(3000);
        await inspectPage('After clicking Confirm password');
      } else {
        await inspectPage('Parental controls (no MFA)');
      }

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
});
