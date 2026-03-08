const http = require('http');
const WebSocket = require('ws');

async function main() {
  const pages = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const familyPage = pages.find(p => p.url.includes('phosra://family'));
  if (!familyPage) { console.log('Family page not found'); process.exit(1); }

  return new Promise((resolve) => {
    const ws = new WebSocket(familyPage.webSocketDebuggerUrl);
    let msgId = 0;
    let settled = false;
    const done = (msg) => { if (settled) return; settled = true; console.log(msg); try { ws.close(); } catch {} resolve(); };
    setTimeout(() => done('TIMEOUT'), 20000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    ws.on('open', async () => {
      try {
        // Click on Samson in sidebar
        console.log('--- Clicking Samson ---');
        await send(`(function() {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.includes('Samson') && btns[i].textContent.includes('Age')) {
              btns[i].click();
              return 'clicked Samson';
            }
          }
          return 'Samson not found';
        })()`);
        await wait(1000);

        // Check what's shown
        const headerText = await send(`(function() {
          var h2s = document.querySelectorAll('h2');
          for (var i = 0; i < h2s.length; i++) {
            if (h2s[i].textContent !== 'Family Overview') return h2s[i].textContent;
          }
          return 'no h2 found';
        })()`);
        console.log('Header:', headerText);

        const statsText = await send(`document.body.innerText.substring(0, 500)`);
        console.log('Content preview:\n' + statsText);

        // Now click the Awake above-age item to test expand
        console.log('\n--- Clicking above-age expand ---');
        const clickResult = await send(`(function() {
          var spans = document.querySelectorAll('span');
          for (var i = 0; i < spans.length; i++) {
            if (spans[i].textContent.includes('Awake')) {
              var row = spans[i].closest('div');
              if (row) { row.click(); return 'clicked Awake row'; }
            }
          }
          return 'Awake not found';
        })()`);
        console.log(clickResult);
        await wait(500);

        const expandedText = await send(`(function() {
          // Look for expanded content (Why XX+? or Parents Need to Know)
          var text = document.body.innerText;
          if (text.includes('Why') && text.includes('?')) return 'expanded detail found';
          if (text.includes('Parents Need to Know')) return 'parents section found';
          return 'no expanded content';
        })()`);
        console.log('Expand result:', expandedText);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
    ws.on('message', () => {});
  });
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
