/**
 * Opens the Family panel, clicks Insights tab, and takes a screenshot.
 */
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const chrome = targets.find(t => t.title === 'Phosra Browser');
  if (!chrome) { console.log('Chrome UI not found'); return; }

  const ws = new WebSocket(chrome.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params) {
    return new Promise((res, rej) => {
      const msgId = id++;
      const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 30000);
      function handler(data) {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          clearTimeout(timeout);
          ws.off('message', handler);
          if (msg.error) rej(new Error(msg.error.message));
          else res(msg.result);
        }
      }
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });
  }

  function evaluate(expr) {
    return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  }

  ws.on('open', async () => {
    try {
      // Click the Family chip to open the panel
      console.log('1. Clicking Family chip...');
      let clickRes = await evaluate(`
        (function() {
          var buttons = document.querySelectorAll('button');
          for (var i = 0; i < buttons.length; i++) {
            var text = buttons[i].textContent.trim();
            if (text === 'Family' || text.startsWith('Family')) {
              buttons[i].click();
              return 'clicked: ' + text;
            }
          }
          return 'not found';
        })()
      `);
      console.log('   Result:', clickRes.result.value);

      await new Promise(r => setTimeout(r, 3000));

      // Click the Insights tab — retry a few times as the panel loads
      console.log('2. Clicking Insights tab...');
      let found = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        let res = await evaluate(`
          (function() {
            var buttons = document.querySelectorAll('button');
            for (var i = 0; i < buttons.length; i++) {
              if (buttons[i].textContent.trim() === 'Insights') {
                buttons[i].click();
                return 'clicked';
              }
            }
            return 'not found';
          })()
        `);
        if (res.result.value === 'clicked') {
          console.log('   Clicked on attempt', attempt + 1);
          found = true;
          break;
        }
        console.log('   Attempt', attempt + 1, ': not found yet, waiting...');
        await new Promise(r => setTimeout(r, 2000));
      }
      if (!found) {
        // Log available buttons for debugging
        let res = await evaluate(`
          Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t).join(', ')
        `);
        console.log('   Available buttons:', res.result.value);
      }

      await new Promise(r => setTimeout(r, 2000));

      // Take screenshot
      console.log('3. Taking screenshot...');
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1280, height: 900, scale: 1 }
      });

      const path = '/Users/jakeklinvex/phosra/browser/insights-screenshot.png';
      fs.writeFileSync(path, Buffer.from(screenshot.data, 'base64'));
      console.log('   Saved to:', path);

    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
