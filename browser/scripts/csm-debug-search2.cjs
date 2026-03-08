// Debug: find the actual search result elements and their links
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const tab = targets.find(t => t.url.includes('commonsensemedia'));
  if (!tab) { console.log('No CSM tab'); return; }

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

  ws.on('open', async () => {
    try {
      // The page is already loaded with search results. Let's find the actual result items.
      // The body text showed "MOVIE\nRe/Member..." so results are rendered
      const res = await evaluate(`(function(){
        // Get ALL links with their full href
        var allAnchors = document.querySelectorAll('a[href]');
        var reviewLinks = [];
        for (var i = 0; i < allAnchors.length; i++) {
          var href = allAnchors[i].getAttribute('href') || '';
          var fullHref = allAnchors[i].href || '';
          // CSM review URLs typically look like: /movie/title-name, /tv-review/title-name
          if (href.match(/^\\/(movie|tv-review|app-review|game-review|book-review|website-review|youtube-review|podcast-review)\\/[a-z0-9-]+/)) {
            reviewLinks.push({
              href: href,
              text: (allAnchors[i].textContent || '').trim().substring(0, 80),
              parent: (allAnchors[i].parentElement?.className || '').substring(0, 80)
            });
          }
        }

        // Also look for "See full review" links
        var seeFullReview = [];
        allAnchors.forEach(function(a) {
          if ((a.textContent || '').includes('See full review')) {
            seeFullReview.push({
              href: a.getAttribute('href'),
              text: a.textContent.trim()
            });
          }
        });

        // Look for elements containing "Thundermans"
        var thundermansEls = [];
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          if (walker.currentNode.textContent.toLowerCase().includes('thundermans')) {
            var parent = walker.currentNode.parentElement;
            thundermansEls.push({
              tag: parent.tagName,
              cls: (parent.className || '').substring(0, 80),
              text: parent.textContent.trim().substring(0, 100),
              href: parent.tagName === 'A' ? parent.getAttribute('href') : ''
            });
          }
        }

        return JSON.stringify({
          reviewLinks: reviewLinks.slice(0, 15),
          seeFullReview: seeFullReview.slice(0, 5),
          thundermansMatches: thundermansEls
        }, null, 2);
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
