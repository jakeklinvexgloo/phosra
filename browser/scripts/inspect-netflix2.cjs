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
      // First go back to profiles/manage
      await send('Page.navigate', { url: 'https://www.netflix.com/profiles/manage' });
      await new Promise(r => setTimeout(r, 4000));

      // Find all links and buttons on the page to understand navigation
      const linksRes = await send('Runtime.evaluate', {
        expression: `(function(){
          var r = {};

          // All anchor hrefs
          r.links = Array.from(document.querySelectorAll("a[href]")).map(function(a){
            return { href: a.getAttribute("href"), text: (a.textContent || "").trim().substring(0, 40) };
          });

          // Profile card structure (get the full HTML of first profile card)
          var cards = document.querySelectorAll("[data-profile-guid]");
          if (cards.length > 0) {
            r.firstCardHTML = cards[0].outerHTML.substring(0, 500);
            r.firstCardParentHTML = cards[0].parentElement.outerHTML.substring(0, 300);
          }

          // Check for edit pencil icons or overlay buttons
          r.svgs = document.querySelectorAll("svg").length;
          r.editButtons = Array.from(document.querySelectorAll("[class*=edit], [class*=Edit], [aria-label*=edit], [aria-label*=Edit]")).map(function(el){
            return { tag: el.tagName, cls: (el.className || "").substring(0, 80), aria: el.getAttribute("aria-label") || "", text: (el.textContent || "").trim().substring(0, 40) };
          });

          // All clickable things on profile cards
          var firstCard = cards[0];
          if (firstCard) {
            r.cardClickables = Array.from(firstCard.querySelectorAll("a, button, [role=button]")).map(function(el){
              return { tag: el.tagName, href: el.getAttribute("href") || "", text: (el.textContent || "").trim().substring(0, 40), cls: (el.className || "").substring(0, 60) };
            });
          }

          // Check what happens when we look for account page profile links
          r.accountLinks = Array.from(document.querySelectorAll("a[href*=account], a[href*=profile]")).map(function(a){
            return { href: a.getAttribute("href"), text: (a.textContent || "").trim().substring(0, 40) };
          });

          return JSON.stringify(r, null, 2);
        })()`,
        returnByValue: true
      });
      console.log('Manage page structure:\n' + linksRes.result.value);

      // Now navigate to account page and look for profile settings there
      console.log('\n--- Checking /account page ---');
      await send('Page.navigate', { url: 'https://www.netflix.com/account' });
      await new Promise(r => setTimeout(r, 5000));

      const accountRes = await send('Runtime.evaluate', {
        expression: `(function(){
          var r = {};
          r.url = window.location.href;

          // Find profile-related links
          r.profileLinks = Array.from(document.querySelectorAll("a[href*=profile]")).map(function(a){
            return { href: a.getAttribute("href"), text: (a.textContent || "").trim().substring(0, 60) };
          });

          // Find maturity/viewing restriction links
          r.maturityLinks = Array.from(document.querySelectorAll("a")).filter(function(a){
            var t = (a.textContent || "").toLowerCase();
            return t.includes("maturity") || t.includes("viewing") || t.includes("restrict") || t.includes("parental");
          }).map(function(a){
            return { href: a.getAttribute("href") || "", text: (a.textContent || "").trim().substring(0, 60) };
          });

          // Find all section headers/labels
          r.sections = Array.from(document.querySelectorAll("h2, h3, h4, [data-uia]")).filter(function(el){
            var t = (el.textContent || "").toLowerCase();
            return t.includes("profile") || t.includes("maturity") || t.includes("lock") || t.includes("pin") || t.includes("autoplay") || t.includes("parental") || t.includes("restrict");
          }).map(function(el){
            return { tag: el.tagName, uia: el.getAttribute("data-uia") || "", text: (el.textContent || "").trim().substring(0, 80) };
          });

          // data-uia elements
          r.dataUia = Array.from(document.querySelectorAll("[data-uia]")).map(function(el){
            return { uia: el.getAttribute("data-uia"), tag: el.tagName, text: (el.textContent || "").trim().substring(0, 60) };
          }).filter(function(x){ return x.uia && x.uia.length > 0; });

          return JSON.stringify(r, null, 2);
        })()`,
        returnByValue: true
      });
      console.log(accountRes.result.value);
    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
});
