// Debug: see what CSM search page actually looks like
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const tab = targets.find(t => !t.url.includes('renderer'));
  if (!tab) { console.log('No tab'); return; }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
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
  function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true }); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  ws.on('open', async () => {
    try {
      // Search for "The Thundermans"
      await send('Page.navigate', { url: 'https://www.commonsensemedia.org/search?query=The+Thundermans&type=reviews' });
      await sleep(5000);

      let res = await evaluate('window.location.href');
      console.log('URL:', res.result.value);

      res = await evaluate(`(function(){
        var r = {};
        r.bodyText = (document.body.innerText || '').substring(0, 2000);
        r.allLinks = Array.from(document.querySelectorAll('a[href]')).filter(function(a) {
          var h = (a.getAttribute('href') || '');
          return h.includes('/tv-review') || h.includes('/movie/') || h.includes('/show/') || h.includes('/game-review');
        }).map(function(a) {
          return { href: a.getAttribute('href'), text: (a.textContent || '').trim().substring(0, 80) };
        }).slice(0, 10);
        r.searchResults = Array.from(document.querySelectorAll('[class*="result"], [class*="Result"], [class*="card"], [class*="Card"], article')).map(function(el) {
          return {
            tag: el.tagName,
            cls: (el.className || '').substring(0, 100),
            text: (el.textContent || '').trim().substring(0, 150),
            links: Array.from(el.querySelectorAll('a[href]')).map(function(a) { return a.getAttribute('href'); }).slice(0, 3)
          };
        }).slice(0, 5);
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
