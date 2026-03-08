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
    setTimeout(() => done('TIMEOUT'), 10000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    ws.on('open', async () => {
      try {
        // Scroll the main content area to the bottom
        await send(`(function() {
          var main = document.querySelector('main');
          if (main) { main.scrollTo(0, main.scrollHeight); return 'scrolled to ' + main.scrollHeight; }
          return 'no main element';
        })()`);

        // Check for Most Watched content
        const text = await send(`(function() {
          var text = document.body.innerText;
          var idx = text.indexOf('VIEWING LOG');
          if (idx >= 0) return text.substring(idx, idx + 600);
          idx = text.indexOf('Viewing Log');
          if (idx >= 0) return text.substring(idx, idx + 600);
          return 'Viewing Log section not found. Last 300 chars: ' + text.substring(text.length - 300);
        })()`);
        console.log(text);

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });
    ws.on('message', () => {});
  });
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
