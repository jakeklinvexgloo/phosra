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
    
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = ++id;
      ws.send(JSON.stringify({ id: msgId, method, params }));
      const handler = (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
    });
    
    ws.on('open', async () => {
      try {
        // First check what's in the UI
        const check = await send('Runtime.evaluate', {
          expression: `(function() {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btnInfo = buttons.map(b => ({
              text: b.textContent.trim().substring(0, 50),
              classes: b.className.substring(0, 80),
              ariaLabel: b.getAttribute('aria-label') || ''
            }));
            return JSON.stringify(btnInfo);
          })()`,
          returnByValue: true
        });
        console.log('Buttons:', check.result.value);
        
        // Click the family button (has a people/family icon or text)
        const click = await send('Runtime.evaluate', {
          expression: `(function() {
            const buttons = Array.from(document.querySelectorAll('button'));
            // Look for the family/settings button - it usually has an SVG icon
            const familyBtn = buttons.find(b => 
              b.textContent.includes('Family') || 
              b.getAttribute('aria-label')?.includes('family') ||
              b.getAttribute('aria-label')?.includes('Family') ||
              b.getAttribute('title')?.includes('Family') ||
              b.className.includes('family')
            );
            if (familyBtn) {
              familyBtn.click();
              return 'Clicked family button';
            }
            return 'Family button not found. Buttons: ' + buttons.map(b => b.textContent.trim().substring(0,30)).join(' | ');
          })()`,
          returnByValue: true
        });
        console.log('Result:', click.result.value);
        
      } catch(e) {
        console.error('Error:', e.message);
      }
      ws.close();
      process.exit(0);
    });
    
    setTimeout(() => { console.log('timeout'); process.exit(1); }, 8000);
  });
});
