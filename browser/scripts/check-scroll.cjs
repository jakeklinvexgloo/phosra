// Check what's blocking scrolling on the current Netflix page
const WebSocket = require('ws');

async function run() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const netflix = targets.find(t => t.url.includes('netflix.com'));
  if (!netflix) { console.log('No Netflix tab. Targets:', targets.map(t => t.title + ' | ' + t.url)); return; }

  console.log('Page:', netflix.title, netflix.url);

  const ws = new WebSocket(netflix.webSocketDebuggerUrl);
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

  ws.on('open', async () => {
    try {
      const res = await evaluate(`(function(){
        var r = {};
        r.url = window.location.href;
        r.title = document.title;

        // Check scrollability
        r.documentHeight = document.documentElement.scrollHeight;
        r.documentClientHeight = document.documentElement.clientHeight;
        r.bodyHeight = document.body.scrollHeight;
        r.bodyClientHeight = document.body.clientHeight;
        r.windowInnerHeight = window.innerHeight;
        r.currentScrollY = window.scrollY;
        r.canScroll = document.documentElement.scrollHeight > window.innerHeight;

        // Check overflow styles
        var html = window.getComputedStyle(document.documentElement);
        var body = window.getComputedStyle(document.body);
        r.htmlOverflow = html.overflow;
        r.htmlOverflowY = html.overflowY;
        r.bodyOverflow = body.overflow;
        r.bodyOverflowY = body.overflowY;
        r.htmlPosition = html.position;
        r.bodyPosition = body.position;
        r.htmlHeight = html.height;
        r.bodyHeightStyle = body.height;

        // Check for fixed/absolute overlays that might intercept scroll
        var overlays = [];
        var allEls = document.querySelectorAll('*');
        for (var i = 0; i < allEls.length; i++) {
          var cs = window.getComputedStyle(allEls[i]);
          if ((cs.position === 'fixed' || cs.position === 'absolute') &&
              parseInt(cs.zIndex) > 100 &&
              allEls[i].offsetWidth > 200 && allEls[i].offsetHeight > 200) {
            overlays.push({
              tag: allEls[i].tagName,
              id: allEls[i].id,
              cls: (allEls[i].className || '').substring(0, 80),
              position: cs.position,
              zIndex: cs.zIndex,
              width: allEls[i].offsetWidth,
              height: allEls[i].offsetHeight,
              overflow: cs.overflow,
              overflowY: cs.overflowY,
              pointerEvents: cs.pointerEvents
            });
          }
        }
        r.overlays = overlays;

        // Check for event listeners that might prevent scroll
        r.touchAction = body.touchAction;
        r.htmlTouchAction = html.touchAction;

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
