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

  const chromeUI = pages.find(p => p.title === 'Phosra Browser');
  if (!chromeUI) { console.log('not found'); process.exit(1); }

  return new Promise((resolve) => {
    const ws = new WebSocket(chromeUI.webSocketDebuggerUrl);
    let msgId = 0;
    let settled = false;

    const done = (msg) => { if (settled) return; settled = true; console.log(msg); try { ws.close(); } catch {} resolve(); };
    setTimeout(() => done('TIMEOUT'), 25000);

    const send = (expression) => new Promise((res) => {
      const id = ++msgId;
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); res(msg.result?.result?.value); }
      };
      ws.on('message', handler);
    });

    const cdpClick = async (x, y) => {
      const id1 = ++msgId;
      ws.send(JSON.stringify({ id: id1, method: 'Input.dispatchMouseEvent', params: {
        type: 'mousePressed', x, y, button: 'left', clickCount: 1
      }}));
      await new Promise(r => setTimeout(r, 50));
      const id2 = ++msgId;
      ws.send(JSON.stringify({ id: id2, method: 'Input.dispatchMouseEvent', params: {
        type: 'mouseReleased', x, y, button: 'left', clickCount: 1
      }}));
      await new Promise(r => setTimeout(r, 200));
    };

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    ws.on('open', async () => {
      try {
        // Check panel state
        const panelOpen = await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Insights') return true; return false; })()`);

        if (!panelOpen) {
          await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Family') {b[i].click();return;} })()`);
          await wait(2000);
          await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Insights') {b[i].click();return;} })()`);
          await wait(2000);
        }

        console.log('innerHeight:', await send('window.innerHeight'));

        // Try clicking the Chap child card header via CDP Input
        const chapPos = await send(`(function() {
          var divs = document.querySelectorAll('div');
          for (var i = 0; i < divs.length; i++) {
            var cs = window.getComputedStyle(divs[i]);
            if (cs.cursor === 'pointer' && divs[i].textContent.includes('Chap') && divs[i].textContent.length < 100) {
              var r = divs[i].getBoundingClientRect();
              return JSON.stringify({x: Math.round(r.left + 50), y: Math.round(r.top + r.height/2), text: divs[i].textContent.trim().substring(0, 40)});
            }
          }
          return null;
        })()`);
        console.log('Chap card:', chapPos);

        if (chapPos) {
          const {x, y} = JSON.parse(chapPos);
          console.log('Clicking Chap at', x, y);
          await cdpClick(x, y);
          await wait(500);

          const expanded = await send(`document.body.innerText.includes('AGE RATING BREAKDOWN')`);
          console.log('Chap expanded?', expanded);

          const stillOpen = await send(`(function() { var b=document.querySelectorAll('button'); for(var i=0;i<b.length;i++) if(b[i].textContent.trim()==='Insights') return true; return false; })()`);
          console.log('Panel still open?', stillOpen);
        }

        done('Complete');
      } catch(e) { done('Error: ' + e.message); }
    });

    ws.on('message', () => {});
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
