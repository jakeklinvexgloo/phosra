const http = require('http');
const WebSocket = require('ws');

http.get('http://localhost:9222/json', (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const pages = JSON.parse(d);
    const ui = pages.find(p => p.title === 'Phosra Browser');
    if (!ui) { console.log('Chrome UI not found'); process.exit(1); }
    const ws = new WebSocket(ui.webSocketDebuggerUrl);
    let id = 0;
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: ++id, method: 'Runtime.evaluate', params: {
        expression: `JSON.stringify({
          buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean),
          activePanel: document.querySelector('[data-active-panel]')?.dataset?.activePanel || 'none',
          panelVisible: !!document.querySelector('.settings-panel, .family-panel, [class*="Panel"]'),
          bodyChildren: document.body ? document.body.children.length : 0,
        })`,
        returnByValue: true
      }}));
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id) {
        try {
          const val = JSON.parse(msg.result.result.value);
          console.log(JSON.stringify(val, null, 2));
        } catch(e) {
          console.log(JSON.stringify(msg, null, 2));
        }
        ws.close();
        process.exit(0);
      }
    });
    setTimeout(() => { console.log('timeout'); process.exit(1); }, 5000);
  });
});
