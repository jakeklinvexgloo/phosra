// Re-enable autoplay on 67kid
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const tab = targets.find(t => t.url.includes('netflix.com'));
  if (!tab) { console.log('No Netflix tab'); return; }

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
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/playback/IUJ4RFGSNBB37IVR2DMKPSEKHQ' });
      await sleep(5000);

      // Re-enable any unchecked autoplay toggles
      const res = await evaluate(`(function(){
        var toggles = document.querySelectorAll('input[type="checkbox"]');
        var results = [];
        for (var i = 0; i < toggles.length; i++) {
          var parent = toggles[i].parentElement;
          var context = (parent ? parent.textContent : '').toLowerCase();
          if (context.includes('autoplay') && !toggles[i].checked) {
            toggles[i].click();
            results.push('enabled: ' + context.substring(0, 40));
          }
        }
        return JSON.stringify(results);
      })()`);
      console.log('Autoplay toggles:', res.result.value);

      await sleep(500);
      // Click save if present
      await evaluate(`(function(){
        var btn = document.querySelector('[data-uia*="submit"], [data-uia*="save"], button[type="submit"]');
        if (btn) btn.click();
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].textContent.trim() === 'Save') { btns[i].click(); return; }
        }
      })()`);
      await sleep(3000);
      console.log('Reverted autoplay on 67kid');
    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
