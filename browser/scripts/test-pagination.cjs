/**
 * Test: Navigate to Netflix viewing activity and check pagination
 * Uses CDP directly on the Netflix tab to debug Show More behavior
 */
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());

  // Find the Netflix tab or any page tab
  let tab = targets.find(t => t.url.includes('netflix.com'));
  if (!tab) tab = targets.find(t => t.title === 'Phosra — Home');
  if (!tab) tab = targets.find(t => t.type === 'page' && !t.url.includes('renderer'));
  if (!tab) { console.log('No tab found'); return; }

  console.log(`Using tab: ${tab.title} (${tab.url})`);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 60000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) { clearTimeout(timeout); ws.off('message', handler); if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }
  function evaluate(expr) { return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  ws.on('open', async () => {
    try {
      // Navigate to viewing activity (main account, not a child profile)
      console.log('\nNavigating to Netflix viewing activity...');
      await send('Page.navigate', { url: 'https://www.netflix.com/viewingactivity' });
      await sleep(5000);

      // Check current URL
      let res = await evaluate('location.href');
      console.log(`URL: ${res.result.value}`);

      // Count initial rows
      res = await evaluate(`document.querySelectorAll('.retableRow, .viewing-activity-row, li.retableRow').length`);
      console.log(`\nInitial rows: ${res.result.value}`);

      // Look for Show More button
      res = await evaluate(`(function() {
        var btns = [];
        document.querySelectorAll('button, .btn-showMore, [class*="showMore"]').forEach(function(el) {
          var text = (el.textContent || '').trim();
          var cls = (el.className || '').toString();
          if (text.toLowerCase().includes('show more') || cls.includes('showMore') || cls.includes('show-more')) {
            btns.push({ tag: el.tagName, text: text.substring(0, 50), cls: cls.substring(0, 80), visible: el.offsetParent !== null });
          }
        });
        // Also check for any "Show More" text on the page
        var bodyHasShowMore = document.body.innerText.toLowerCase().includes('show more');
        return JSON.stringify({ buttons: btns, bodyHasShowMore: bodyHasShowMore });
      })()`);
      const btnInfo = JSON.parse(res.result.value);
      console.log(`\nShow More buttons found: ${btnInfo.buttons.length}`);
      console.log(`Body contains "show more": ${btnInfo.bodyHasShowMore}`);
      for (const b of btnInfo.buttons) {
        console.log(`  - ${b.tag} "${b.text}" visible=${b.visible} class="${b.cls}"`);
      }

      // Try clicking Show More and count new rows
      if (btnInfo.buttons.length > 0 || btnInfo.bodyHasShowMore) {
        console.log('\nAttempting to click Show More...');

        for (let page = 0; page < 5; page++) {
          res = await evaluate(`(function() {
            // Try multiple selectors for Show More
            var btn = document.querySelector('.btn-showMore');
            if (!btn) btn = document.querySelector('button[data-uia="viewing-activity-show-more"]');
            if (!btn) btn = document.querySelector('[class*="showMore"] button');
            if (!btn) btn = document.querySelector('[class*="show-more"] button');
            if (!btn) {
              // Fallback: find any button with "Show More" text
              var all = document.querySelectorAll('button');
              for (var i = 0; i < all.length; i++) {
                if ((all[i].textContent || '').toLowerCase().includes('show more')) {
                  btn = all[i];
                  break;
                }
              }
            }
            if (btn) {
              btn.click();
              return JSON.stringify({ clicked: true, btnText: btn.textContent.trim().substring(0, 50) });
            }
            return JSON.stringify({ clicked: false });
          })()`);

          const clickResult = JSON.parse(res.result.value);
          if (!clickResult.clicked) {
            console.log(`  Page ${page}: No Show More button found — reached end of history`);
            break;
          }

          console.log(`  Page ${page}: Clicked "${clickResult.btnText}", waiting...`);
          await sleep(2500);

          res = await evaluate(`document.querySelectorAll('.retableRow, .viewing-activity-row, li.retableRow').length`);
          console.log(`  Rows now: ${res.result.value}`);
        }
      }

      // Final count
      res = await evaluate(`document.querySelectorAll('.retableRow, .viewing-activity-row, li.retableRow').length`);
      console.log(`\nFinal row count: ${res.result.value}`);

      // Get first and last dates
      res = await evaluate(`(function() {
        var rows = document.querySelectorAll('.retableRow, .viewing-activity-row, li.retableRow');
        if (rows.length === 0) return JSON.stringify({ first: null, last: null });
        var firstDate = rows[0].querySelector('.col.date, .date');
        var lastDate = rows[rows.length - 1].querySelector('.col.date, .date');
        return JSON.stringify({
          first: firstDate ? firstDate.textContent.trim() : null,
          last: lastDate ? lastDate.textContent.trim() : null,
          total: rows.length
        });
      })()`);
      const dateRange = JSON.parse(res.result.value);
      console.log(`Date range: ${dateRange.first} to ${dateRange.last} (${dateRange.total} rows)`);

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
