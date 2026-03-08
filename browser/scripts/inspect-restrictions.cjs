// Navigate to the restrictions page for Ramsay! and inspect what's there
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const tab = targets.find(t => t.url.includes('netflix.com'));
  if (!tab) { console.log('No Netflix tab. Targets:', targets.map(t => t.title + ' ' + t.url)); return; }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
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

  ws.on('open', async () => {
    try {
      // First check the current page (should be playback from autoplay change)
      let urlRes = await evaluate('window.location.href');
      console.log('Current URL:', urlRes.result.value);

      // Navigate to restrictions for Ramsay! profile
      console.log('\nNavigating to restrictions page for Ramsay!...');
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions/2CLVMNZPRFEOBK32A26RG4FNJQ' });
      await sleep(5000);

      urlRes = await evaluate('window.location.href');
      console.log('URL after navigation:', urlRes.result.value);

      // Dump the page structure
      const res = await evaluate(`(function(){
        var r = {};
        r.url = window.location.href;
        r.title = document.title;
        r.bodyText = (document.body.innerText || '').substring(0, 4000);
        r.inputs = Array.from(document.querySelectorAll('input,select,textarea')).map(function(el){
          return {
            tag: el.tagName, type: el.type, name: el.name, id: el.id,
            checked: el.checked, value: (el.value||'').substring(0,50),
            uia: el.getAttribute('data-uia')||'',
            ariaLabel: el.getAttribute('aria-label')||'',
            role: el.getAttribute('role')||''
          };
        }).filter(function(x){ return !x.name.includes('ot-') && !x.id.includes('ot-'); });
        r.buttons = Array.from(document.querySelectorAll('button,[role="button"],[role="radio"],[role="option"],[role="switch"]')).map(function(el){
          return {
            tag: el.tagName, text: (el.textContent||'').trim().substring(0,80),
            uia: el.getAttribute('data-uia')||'',
            role: el.getAttribute('role')||'',
            ariaChecked: el.getAttribute('aria-checked')||'',
            cls: (el.className||'').substring(0,100)
          };
        }).filter(function(x){ return x.text && !x.text.includes('Cookie') && x.text.length < 80; });
        r.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,label')).map(function(el){
          return { tag: el.tagName, text: (el.textContent||'').trim().substring(0,80) };
        }).filter(function(x){ return x.text && !x.text.includes('Cookie') && !x.text.includes('Privacy'); });
        return JSON.stringify(r, null, 2);
      })()`);
      console.log(res.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
