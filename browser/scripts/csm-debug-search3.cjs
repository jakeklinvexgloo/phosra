// Try different search approaches on CSM
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
      function handler(data) { const msg = JSON.parse(data.toString()); if (msg.id === msgId) { ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); } }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }
  function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  ws.on('open', async () => {
    try {
      // Approach 1: Direct URL slug (CSM titles map to slugs)
      console.log('=== Approach 1: Direct URL slug ===');
      await send('Page.navigate', { url: 'https://www.commonsensemedia.org/tv-reviews/the-thundermans' });
      await sleep(4000);
      let res = await evaluate(`JSON.stringify({ url: location.href, title: document.title, status: document.body.innerText.substring(0, 200) })`);
      console.log(JSON.parse(res.result.value));

      // Approach 2: Google site search
      console.log('\n=== Approach 2: Google site search ===');
      await send('Page.navigate', { url: 'https://www.google.com/search?q=site:commonsensemedia.org+The+Thundermans+review' });
      await sleep(3000);
      res = await evaluate(`(function(){
        var links = [];
        document.querySelectorAll('a[href]').forEach(function(a) {
          var href = a.href || '';
          if (href.includes('commonsensemedia.org') && (href.includes('review') || href.includes('movie'))) {
            links.push({ href: href, text: (a.textContent || '').trim().substring(0, 80) });
          }
        });
        return JSON.stringify(links.slice(0, 5));
      })()`);
      console.log('Google results:', res.result.value);

      // Approach 3: CSM search with just the keyword
      console.log('\n=== Approach 3: CSM /search with keyword ===');
      await send('Page.navigate', { url: 'https://www.commonsensemedia.org/search/Thundermans' });
      await sleep(5000);
      res = await evaluate(`(function(){
        var seeReview = [];
        document.querySelectorAll('a[href]').forEach(function(a) {
          var href = a.getAttribute('href') || '';
          if (href.includes('-reviews/') || href.includes('-review/')) {
            seeReview.push({ href: href, text: (a.textContent || '').trim().substring(0, 80) });
          }
        });
        // Also check body text for Thundermans
        var hasThundermans = document.body.innerText.includes('Thundermans');
        return JSON.stringify({ reviewLinks: seeReview.slice(0, 10), hasThundermans: hasThundermans, url: location.href });
      })()`);
      console.log(JSON.parse(res.result.value));

      // Approach 4: CSM search with sort by relevance
      console.log('\n=== Approach 4: CSM search with type filter ===');
      await send('Page.navigate', { url: 'https://www.commonsensemedia.org/search?query=thundermans&type=reviews' });
      await sleep(5000);
      res = await evaluate(`(function(){
        var reviewLinks = [];
        document.querySelectorAll('a[href]').forEach(function(a) {
          var href = a.getAttribute('href') || '';
          if (href.match(/\\/(movie|tv|app|game|book|website|youtube|podcast)-reviews?\\//)) {
            reviewLinks.push({ href: href, text: (a.textContent || '').trim().substring(0, 80) });
          }
        });
        var hasThundermans = document.body.innerText.includes('hundermans');
        var bodySnippet = document.body.innerText.substring(0, 500);
        return JSON.stringify({ reviewLinks: reviewLinks.slice(0, 10), hasThundermans: hasThundermans, bodySnippet: bodySnippet }, null, 2);
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
