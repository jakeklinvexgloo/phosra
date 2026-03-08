// Scrape an actual CSM review page
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
  function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true }); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  ws.on('open', async () => {
    try {
      await send('Page.navigate', { url: 'https://www.commonsensemedia.org/tv-reviews/the-thundermans' });
      await sleep(4000);

      const res = await evaluate(`(function(){
        var r = {};
        r.url = location.href;
        r.title = document.title;

        // Get all text content in structured sections
        var bodyText = document.body.innerText || '';

        // Age rating - look for the prominent age number
        // CSM shows "age X+" in a badge
        var ageMatch = bodyText.match(/age\\s*(\\d+)\\+/i);
        r.ageFromText = ageMatch ? ageMatch[0] : null;

        // Look for all elements with specific CSM classes
        // CSM uses data attributes and specific class patterns
        var allEls = document.querySelectorAll('[class]');
        var ageElements = [];
        allEls.forEach(function(el) {
          var cls = el.className || '';
          if (typeof cls === 'string' && (cls.includes('age') || cls.includes('rating') || cls.includes('badge'))) {
            var text = (el.textContent || '').trim();
            if (text.length < 30 && text.length > 0) {
              ageElements.push({ cls: cls.substring(0, 80), text: text });
            }
          }
        });
        r.ageElements = ageElements.slice(0, 10);

        // JSON-LD structured data (often has rating info)
        var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
        r.jsonLd = [];
        ldScripts.forEach(function(s) {
          try {
            var data = JSON.parse(s.textContent);
            r.jsonLd.push(data);
          } catch(e) {}
        });

        // Meta tags
        r.metaTags = {};
        document.querySelectorAll('meta[property], meta[name]').forEach(function(m) {
          var key = m.getAttribute('property') || m.getAttribute('name');
          var val = m.getAttribute('content');
          if (key && val && (key.includes('rating') || key.includes('age') || key.includes('description'))) {
            r.metaTags[key] = val;
          }
        });

        // Content sections - look for parent guide categories
        var sections = [];
        var headings = document.querySelectorAll('h2, h3, h4');
        headings.forEach(function(h) {
          var text = h.textContent.trim();
          if (text.includes('Violence') || text.includes('Sex') || text.includes('Language') ||
              text.includes('Consumerism') || text.includes('Drinking') || text.includes('Positive') ||
              text.includes('parents need') || text.includes('Parents Need') ||
              text.includes('Message') || text.includes('Role Model')) {
            var next = h.nextElementSibling;
            sections.push({
              heading: text.substring(0, 60),
              content: next ? next.textContent.trim().substring(0, 200) : ''
            });
          }
        });
        r.contentSections = sections;

        // Body text excerpt around the rating area
        var ratingIdx = bodyText.indexOf('age ');
        if (ratingIdx > -1) {
          r.ratingContext = bodyText.substring(Math.max(0, ratingIdx - 100), ratingIdx + 200);
        }

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
