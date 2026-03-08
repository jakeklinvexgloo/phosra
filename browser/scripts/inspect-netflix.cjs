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
      // Get profile GUIDs from manage page
      const guidsRes = await send('Runtime.evaluate', {
        expression: `JSON.stringify(Array.from(document.querySelectorAll("[data-profile-guid]")).map(function(el){return{guid:el.getAttribute("data-profile-guid"),name:(el.querySelector(".profile-name")||el).textContent.trim().substring(0,30)}}))`,
        returnByValue: true
      });
      const guids = JSON.parse(guidsRes.result.value);
      console.log('Profiles:', JSON.stringify(guids, null, 2));

      const kid = guids.find(g => g.name.includes('Chap') || g.name.includes('kid') || g.name.includes('Elmo')) || guids[0];
      if (!kid) { console.log('No profiles'); ws.close(); return; }

      console.log('\nEditing:', kid.name, kid.guid);
      await send('Page.navigate', { url: 'https://www.netflix.com/profiles/manage/' + kid.guid });
      await new Promise(r => setTimeout(r, 5000));

      const urlRes = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
      console.log('URL:', urlRes.result.value);

      // Inspect all form elements on the edit page
      const inspectScript = `
        (function(){
          var r = {};

          // data-uia elements
          var uia = document.querySelectorAll("[data-uia]");
          r.dataUia = Array.from(uia).map(function(el){
            return {
              uia: el.getAttribute("data-uia"),
              tag: el.tagName,
              type: el.type || "",
              name: el.name || "",
              text: (el.textContent || "").trim().substring(0, 80)
            };
          });

          // inputs
          r.inputs = Array.from(document.querySelectorAll("input")).map(function(el){
            return {
              type: el.type, name: el.name, id: el.id,
              checked: el.checked,
              value: (el.value || "").substring(0, 30),
              uia: el.getAttribute("data-uia") || "",
              cls: (el.className || "").substring(0, 120)
            };
          });

          // selects
          r.selects = Array.from(document.querySelectorAll("select")).map(function(el){
            return {
              name: el.name, id: el.id,
              uia: el.getAttribute("data-uia") || "",
              value: el.value,
              options: Array.from(el.options || []).map(function(o){
                return { v: o.value, t: o.textContent.trim() };
              })
            };
          });

          // buttons
          r.buttons = Array.from(document.querySelectorAll("button")).map(function(el){
            return {
              text: (el.textContent || "").trim().substring(0, 50),
              uia: el.getAttribute("data-uia") || "",
              type: el.type
            };
          });

          // Check body text for maturity/autoplay keywords
          var bodyText = document.body.innerText || "";
          r.hasMaturityText = bodyText.includes("Maturity") || bodyText.includes("maturity");
          r.hasAutoplayText = bodyText.includes("Autoplay") || bodyText.includes("autoplay");
          r.hasLockText = bodyText.includes("Lock") || bodyText.includes("lock");

          return JSON.stringify(r, null, 2);
        })()
      `;

      const res = await send('Runtime.evaluate', { expression: inspectScript, returnByValue: true });
      console.log('\n' + res.result.value);
    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
});
