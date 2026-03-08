// Manually test: navigate to restrictions, click radio, click save
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
      // Navigate to restrictions for Ramsay!
      console.log('Navigating to restrictions...');
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions/2CLVMNZPRFEOBK32A26RG4FNJQ' });
      await sleep(5000);

      // Check current state
      let res = await evaluate(`(function(){
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        var result = [];
        for (var i = 0; i < radios.length; i++) {
          result.push({ value: radios[i].value, checked: radios[i].checked });
        }
        return JSON.stringify(result);
      })()`);
      console.log('Before click:', res.result.value);

      // Click the value=50 (TV-G/G = little-kids) radio
      console.log('\nClicking maturity-50 radio...');
      res = await evaluate(`(function(){
        var radio = document.querySelector('[data-uia="maturity-50-radio"]');
        if (!radio) return 'not found';
        radio.click();
        return 'clicked, checked=' + radio.checked;
      })()`);
      console.log('Click result:', res.result.value);
      await sleep(1000);

      // Verify it's now checked
      res = await evaluate(`(function(){
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        var result = [];
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) result.push({ value: radios[i].value, checked: true });
        }
        return JSON.stringify(result);
      })()`);
      console.log('After click:', res.result.value);

      // Now click Save
      console.log('\nLooking for Save button...');
      res = await evaluate(`(function(){
        // Look at all buttons
        var btns = document.querySelectorAll('button');
        var found = [];
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').trim();
          var uia = btns[i].getAttribute('data-uia') || '';
          if (text === 'Save' || uia.includes('submit') || uia.includes('save')) {
            found.push({ text: text, uia: uia, type: btns[i].type, disabled: btns[i].disabled, cls: (btns[i].className || '').substring(0, 80) });
          }
        }
        return JSON.stringify(found, null, 2);
      })()`);
      console.log('Save buttons found:', res.result.value);

      // Click it
      console.log('\nClicking Save...');
      res = await evaluate(`(function(){
        var btn = document.querySelector('[data-uia="btn-account-pin-submit"]');
        if (!btn) return 'save button not found';
        btn.click();
        return 'clicked save';
      })()`);
      console.log('Save result:', res.result.value);
      await sleep(5000);

      // Check final URL and state
      res = await evaluate('window.location.href');
      console.log('\nFinal URL:', res.result.value);

      // Re-navigate to check if it stuck
      console.log('\nRe-navigating to verify...');
      await send('Page.navigate', { url: 'https://www.netflix.com/settings/restrictions/2CLVMNZPRFEOBK32A26RG4FNJQ' });
      await sleep(5000);

      res = await evaluate(`(function(){
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        var result = [];
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) result.push({ value: radios[i].value, checked: true });
        }
        return JSON.stringify(result);
      })()`);
      console.log('Verified state:', res.result.value);

    } catch(e) {
      console.error('Error:', e.message);
    } finally {
      ws.close();
    }
  });
}

run();
