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

  ws.on('open', async () => {
    try {
      // 1. Check /settings/restrictions (parental controls)
      console.log('=== /settings/restrictions (Parental Controls) ===');
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions' });
      await new Promise(r => setTimeout(r, 5000));

      let urlRes = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
      console.log('URL:', urlRes.result.value);

      let res = await send('Runtime.evaluate', {
        expression: `(function(){
          var r = {};
          r.inputs = Array.from(document.querySelectorAll("input, select, textarea")).map(function(el){
            return {
              tag: el.tagName, type: el.type, name: el.name, id: el.id,
              checked: el.checked, value: (el.value || "").substring(0, 50),
              uia: el.getAttribute("data-uia") || "",
              cls: (el.className || "").substring(0, 120),
              options: el.tagName === "SELECT" ? Array.from(el.options || []).map(function(o){ return {v:o.value,t:o.textContent.trim()}; }) : undefined
            };
          });
          r.buttons = Array.from(document.querySelectorAll("button")).map(function(el){
            return { text: (el.textContent || "").trim().substring(0, 60), uia: el.getAttribute("data-uia") || "", type: el.type };
          });
          r.dataUia = Array.from(document.querySelectorAll("[data-uia]")).map(function(el){
            return { uia: el.getAttribute("data-uia"), tag: el.tagName, text: (el.textContent || "").trim().substring(0, 100) };
          }).filter(function(x){ return x.text.length > 0 && x.text.length < 100; });
          r.headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,label")).map(function(el){
            return { tag: el.tagName, text: (el.textContent || "").trim().substring(0, 80), forAttr: el.getAttribute("for") || "" };
          });
          r.bodyTextSnippet = (document.body.innerText || "").substring(0, 2000);
          return JSON.stringify(r, null, 2);
        })()`,
        returnByValue: true
      });
      console.log(res.result.value);

      // 2. Check /account/profiles
      console.log('\n=== /account/profiles ===');
      await send('Page.navigate', { url: 'https://www.netflix.com/account/profiles' });
      await new Promise(r => setTimeout(r, 5000));

      urlRes = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
      console.log('URL:', urlRes.result.value);

      res = await send('Runtime.evaluate', {
        expression: `(function(){
          var r = {};
          r.dataUia = Array.from(document.querySelectorAll("[data-uia]")).map(function(el){
            return { uia: el.getAttribute("data-uia"), tag: el.tagName, text: (el.textContent || "").trim().substring(0, 100) };
          }).filter(function(x){ return x.text.length > 0 && x.text.length < 100; });
          r.links = Array.from(document.querySelectorAll("a[href]")).filter(function(a){
            var h = a.getAttribute("href") || "";
            return h.includes("profile") || h.includes("settings") || h.includes("restrict");
          }).map(function(a){
            return { href: a.getAttribute("href"), text: (a.textContent || "").trim().substring(0, 60) };
          });
          r.buttons = Array.from(document.querySelectorAll("button")).map(function(el){
            return { text: (el.textContent || "").trim().substring(0, 60), uia: el.getAttribute("data-uia") || "" };
          });
          r.bodyTextSnippet = (document.body.innerText || "").substring(0, 1500);
          return JSON.stringify(r, null, 2);
        })()`,
        returnByValue: true
      });
      console.log(res.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
});
