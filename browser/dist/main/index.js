"use strict";var _e=Object.defineProperty;var Ie=(a,e,t)=>e in a?_e(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var h=(a,e,t)=>Ie(a,typeof e!="symbol"?e+"":e,t);const l=require("electron"),$e=require("path"),De=require("fs"),me=require("ws");function we(a){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(a){for(const t in a)if(t!=="default"){const i=Object.getOwnPropertyDescriptor(a,t);Object.defineProperty(e,t,i.get?i:{enumerable:!0,get:()=>a[t]})}}return e.default=a,Object.freeze(e)}const T=we($e),v=we(De),Fe=process.env.NODE_ENV!=="production";function Re(){const a=["disable-blink-features=AutomationControlled","disable-features=IsolateOrigins,site-per-process","disable-site-isolation-trials","lang=en-US,en","disable-infobars","no-first-run","no-default-browser-check","disable-background-networking","disable-breakpad","disable-component-update","disable-default-apps","disable-extensions","disable-hang-monitor","disable-popup-blocking","disable-prompt-on-repost","disable-sync","disable-translate","metrics-recording-only","safebrowsing-disable-auto-update"];return Fe&&a.push("disable-web-security"),a}const W="default";class Ue{constructor(){h(this,"profilesDir");const e=l.app.getPath("userData");this.profilesDir=T.join(e,"profiles"),v.existsSync(this.profilesDir)||v.mkdirSync(this.profilesDir,{recursive:!0}),this.ensureProfile(W)}getProfilePath(e){return T.join(this.profilesDir,this.sanitizeName(e))}listProfiles(){try{return v.readdirSync(this.profilesDir,{withFileTypes:!0}).filter(e=>e.isDirectory()).map(e=>e.name).sort()}catch{return[]}}createProfile(e){const t=this.getProfilePath(e);return this.ensureProfile(e),t}deleteProfile(e){if(this.sanitizeName(e)===W)throw new Error("Cannot delete the default profile");const i=this.getProfilePath(e);v.existsSync(i)&&v.rmSync(i,{recursive:!0,force:!0})}getDefaultProfilePath(){return this.getProfilePath(W)}sanitizeName(e){return e.replace(/[^a-zA-Z0-9_-]/g,"_")||W}ensureProfile(e){const t=this.getProfilePath(e);v.existsSync(t)||v.mkdirSync(t,{recursive:!0})}}class Oe{constructor(e,t,i,s,n,c=80){h(this,"tabs",new Map);h(this,"activeTabId",null);h(this,"nextId",1);h(this,"parentWindow");h(this,"chromeHeight");h(this,"stealthPreloadPath");h(this,"homePreloadPath");h(this,"familyPreloadPath");h(this,"profilePath");h(this,"profilePartition");h(this,"chromeView",null);h(this,"credentialManager",null);h(this,"authManager",null);h(this,"rightInset",0);this.parentWindow=e,this.stealthPreloadPath=t,this.homePreloadPath=i,this.familyPreloadPath=s,this.profilePath=n,this.chromeHeight=c;const p=T.basename(n);this.profilePartition=`persist:${p}`}setChromeView(e){this.chromeView=e}setCredentialManager(e){this.credentialManager=e}setAuthManager(e){this.authManager=e}setRightInset(e){this.rightInset=Math.max(0,e)}createTab(e){const t=this.nextId++,i=e||"phosra://home",s=i.startsWith("phosra://"),n=i.startsWith("phosra://family");let c;n?c=this.familyPreloadPath:s?c=this.homePreloadPath:c=this.stealthPreloadPath;const p=l.session.fromPartition(this.profilePartition,{cache:!0});p.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");const g=new l.WebContentsView({webPreferences:{preload:c,sandbox:!!s,contextIsolation:!0,plugins:!s,session:p,nodeIntegration:!1}}),P={id:t,view:g,title:"New Tab",url:i,favicon:"",isLoading:!0,canGoBack:!1,canGoForward:!1};this.attachListeners(P),this.parentWindow.contentView.addChildView(g);const x=P;return this.tabs.set(t,x),this.activeTabId===null&&(this.activeTabId=t),this.updateLayout(this.getWindowBounds()),g.webContents.loadURL(i).catch(S=>{console.error(`[TabManager] Failed to load ${i}:`,S.message)}),this.pushStateUpdate(),x}closeTab(e){const t=this.tabs.get(e);if(t){this.parentWindow.contentView.removeChildView(t.view);try{t.view.webContents.close()}catch{}if(this.tabs.delete(e),this.activeTabId===e){const i=Array.from(this.tabs.keys());this.activeTabId=i.length>0?i[i.length-1]:null,this.updateLayout(this.getWindowBounds())}this.pushStateUpdate()}}switchTab(e){this.tabs.has(e)&&(this.activeTabId=e,this.updateLayout(this.getWindowBounds()),this.pushStateUpdate())}getTab(e){return this.tabs.get(e)}getActiveTab(){if(this.activeTabId!==null)return this.tabs.get(this.activeTabId)}getAllTabs(){return Array.from(this.tabs.values())}getActiveTabId(){return this.activeTabId}updateLayout(e){const t=Math.max(e.width-this.rightInset,0),i=e.height-this.chromeHeight;for(const[s,n]of this.tabs)s===this.activeTabId?(n.view.setBounds({x:0,y:this.chromeHeight,width:Math.max(t,0),height:Math.max(i,0)}),n.view.setVisible(!0)):n.view.setVisible(!1)}toTabInfoList(){return this.getAllTabs().map(e=>this.toTabInfo(e))}toTabInfo(e){return{id:e.id,title:e.title,url:e.url,favicon:e.favicon,isLoading:e.isLoading,canGoBack:e.canGoBack,canGoForward:e.canGoForward}}attachListeners(e){const t=e.view.webContents;t.on("did-navigate",(i,s)=>{e.url=s,e.canGoBack=t.navigationHistory.canGoBack(),e.canGoForward=t.navigationHistory.canGoForward(),this.pushStateUpdate(),this.attemptAutoFill(e,s),this.attemptTokenCapture(s)}),t.on("did-navigate-in-page",(i,s)=>{e.url=s,e.canGoBack=t.navigationHistory.canGoBack(),e.canGoForward=t.navigationHistory.canGoForward(),this.pushStateUpdate(),this.attemptTokenCapture(s),this.attemptAutoFill(e,s)}),t.on("page-title-updated",(i,s)=>{e.title=s,this.pushStateUpdate()}),t.on("page-favicon-updated",(i,s)=>{s&&s.length>0&&(e.favicon=s[0],this.pushStateUpdate())}),t.on("did-start-loading",()=>{e.isLoading=!0,this.pushStateUpdate()}),t.on("did-stop-loading",()=>{e.isLoading=!1,e.canGoBack=t.navigationHistory.canGoBack(),e.canGoForward=t.navigationHistory.canGoForward(),this.pushStateUpdate()}),t.on("did-fail-load",(i,s,n,c)=>{e.isLoading=!1,e.url=c,e.title=`Failed: ${n}`,this.pushStateUpdate()}),t.setWindowOpenHandler(({url:i})=>(this.createTab(i),{action:"deny"}))}pushStateUpdate(){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed()))try{this.chromeView.webContents.send("tab:state-update",{tabs:this.toTabInfoList(),activeTabId:this.activeTabId})}catch{}}getWindowBounds(){const e=this.parentWindow.getBounds();return{width:e.width,height:e.height}}attemptTokenCapture(e){if(this.authManager)try{const t=new URL(e);(t.hostname==="www.phosra.com"||t.hostname==="phosra.com")&&t.pathname.startsWith("/dashboard")&&this.authManager.captureTokenFromSession().then(s=>{s&&this.pushAuthStatusChanged()}).catch(s=>{console.error("[TabManager] Token capture failed:",s)})}catch{}}pushAuthStatusChanged(){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed())&&this.authManager)try{this.chromeView.webContents.send("auth:status-changed",this.authManager.getInfo())}catch{}}attemptAutoFill(e,t){if(!this.credentialManager)return;const i=this.credentialManager.hasCredentialForUrl(t);if(this.pushAutoFillNotification(e.id,i),!i)return;const s=this.credentialManager.getAutoFillData(t);if(!s)return;const{service:n,username:c,password:p}=s,{selectors:y}=n,g=y.submit??null,P=`
      (function() {
        function fill(selector, value) {
          var el = document.querySelector(selector);
          if (!el || el.offsetParent === null) return false;
          var nativeSet = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          );
          if (nativeSet && nativeSet.set) {
            nativeSet.set.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
        var filledUser = fill(${JSON.stringify(y.username)}, ${JSON.stringify(c)});
        var filledPass = fill(${JSON.stringify(y.password)}, ${JSON.stringify(p)});
        return { filledUser: filledUser, filledPass: filledPass };
      })();
    `,x=`
      (function() {
        var submitSelector = ${JSON.stringify(g)};
        var btn = submitSelector ? document.querySelector(submitSelector) : null;
        if (!btn) {
          btn = document.querySelector('button[type="submit"]')
            || document.querySelector('input[type="submit"]')
            || document.querySelector('form button:not([type="button"])');
        }
        if (btn) { btn.click(); return true; }
        return false;
      })();
    `;setTimeout(()=>{try{if(!e.view.webContents.isDestroyed()){e.view.webContents.executeJavaScript(P).then(r=>{!r.filledUser&&!r.filledPass||setTimeout(()=>{e.view.webContents.isDestroyed()||e.view.webContents.executeJavaScript(x).catch(()=>{})},500)}).catch(()=>{});const S=n.displayName??n.id??"This service";setTimeout(()=>{this.detectMfaChallenge(e,S)},5e3)}}catch{}},1500)}detectMfaChallenge(e,t){if(e.view.webContents.isDestroyed())return;const i=e.url.toLowerCase(),s=(e.title||"").toLowerCase();["verify","two-factor","2fa","mfa","otp","code","challenge","authentication","confirm"].some(p=>i.includes(p)||s.includes(p))&&this.pushMfaNotification(e.id,t)}pushMfaNotification(e,t){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed()))try{this.chromeView.webContents.send("mfa:challenge-detected",{tabId:e,serviceName:t})}catch{}}pushAutoFillNotification(e,t){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed()))try{this.chromeView.webContents.send("credentials:autofill-available",{tabId:e,service:t})}catch{}}}const R=130,Y=1280,Ve=900;class ye{constructor(e,t,i,s,n){h(this,"window");h(this,"chromeView");h(this,"tabManager");h(this,"currentChromeHeight",R);h(this,"isExpanded",!1);h(this,"chromePreloadPath");h(this,"stealthPreloadPath");h(this,"homePreloadPath");h(this,"familyPreloadPath");h(this,"profilePath");this.chromePreloadPath=e,this.stealthPreloadPath=t,this.homePreloadPath=i,this.familyPreloadPath=s,this.profilePath=n}createWindow(){this.window=new l.BaseWindow({width:Y,height:Ve,minWidth:480,minHeight:360,titleBarStyle:"hiddenInset",show:!1}),this.chromeView=new l.WebContentsView({webPreferences:{preload:this.chromePreloadPath,contextIsolation:!0,nodeIntegration:!1}}),this.window.contentView.addChildView(this.chromeView),this.chromeView.setBounds({x:0,y:0,width:Y,height:R}),this.loadChromeUI(),this.tabManager=new Oe(this.window,this.stealthPreloadPath,this.homePreloadPath,this.familyPreloadPath,this.profilePath,R),this.tabManager.setChromeView(this.chromeView),this.window.on("resize",()=>{this.relayout()}),this.chromeView.webContents.on("did-finish-load",()=>{this.window.isDestroyed()||this.window.show()})}getWindow(){return this.window}getTabManager(){return this.tabManager}getChromeView(){return this.chromeView}setChromeExpanded(e){if(this.window.isDestroyed())return;this.isExpanded=e;const t=this.window.getBounds();e?(this.currentChromeHeight=t.height,this.window.contentView.addChildView(this.chromeView)):(this.currentChromeHeight=R,this.window.contentView.removeChildView(this.chromeView),this.window.contentView.addChildView(this.chromeView,0)),this.chromeView.setBounds({x:0,y:0,width:t.width,height:e?t.height:R})}setChromeHeight(e){if(this.window.isDestroyed())return;const t=this.window.getBounds(),i=Math.max(R,Math.min(e,t.height));this.currentChromeHeight=i,this.isExpanded&&this.chromeView.setBounds({x:0,y:0,width:t.width,height:i})}setTabInset(e){this.window.isDestroyed()||(this.tabManager.setRightInset(e.right),this.tabManager.updateLayout(this.getWindowBounds()))}getWindowBounds(){const e=this.window.getBounds();return{width:e.width,height:e.height}}loadChromeUI(){if((process.env.NODE_ENV!=="production"||!!process.env.VITE_DEV_SERVER_URL)&&process.env.VITE_DEV_SERVER_URL){const t=process.env.VITE_DEV_SERVER_URL.replace(/\/$/,"")+"/renderer/index.html";this.chromeView.webContents.loadURL(t).catch(i=>{console.error("[WindowManager] Failed to load Vite dev server:",i.message)})}else{const t=T.join(__dirname,"..","renderer","index.html");this.chromeView.webContents.loadFile(t).catch(i=>{console.error("[WindowManager] Failed to load renderer HTML:",i.message)})}}relayout(){if(this.window.isDestroyed())return;const e=this.window.getBounds(),t=this.isExpanded?Math.min(this.currentChromeHeight,e.height):R;this.chromeView.setBounds({x:0,y:0,width:e.width,height:t}),this.tabManager.updateLayout({width:e.width,height:e.height})}}const F={profileManage:"https://www.netflix.com/profiles/manage",profileSettings:a=>`https://www.netflix.com/settings/${a}`,restrictions:a=>`https://www.netflix.com/settings/restrictions/${a}`,playback:a=>`https://www.netflix.com/settings/playback/${a}`,accountProfiles:"https://www.netflix.com/account/profiles",account:"https://www.netflix.com/account",login:"https://www.netflix.com/login",switchProfile:a=>`https://www.netflix.com/SwitchProfile?tkn=${a}`,viewingActivity:"https://www.netflix.com/viewingactivity"},N={profileCards:"[data-profile-guid], .profile-icon, .profile-button",profileName:'.profile-name, [class*="profileName"]',kidsIndicator:'.kids-marker, [data-uia="kids-profile-marker"], .kidsCharacter',mfaPasswordButton:'[data-uia="account-mfa-button-PASSWORD+PressableListItem"]',mfaPasswordInput:'[data-uia="collect-password-input-modal-entry"], input[name="challengePassword"]',mfaSubmitButton:'[data-uia="collect-input-submit-cta"]',profileLockButton:'[data-uia="menu-card+profile-lock"]',passwordInput:'input[type="password"], input[name="password"], input[name="challengePassword"]',loginForm:'[data-uia="login-page-container"], .login-form, form[data-uia="login-form"]',viewingActivityRow:".retableRow, .viewing-activity-row, li.retableRow",viewingActivityDate:".col.date, .date",viewingActivityTitle:".col.title a, .title a"},Be=[{value:"little-kids",label:"Little Kids",maxAge:6},{value:"older-kids",label:"Older Kids",maxAge:11},{value:"teens",label:"Teens",maxAge:16},{value:"all",label:"All Maturity Ratings",maxAge:99}],K="[AgentDebug]",O=new Set;let J=null;const I={reset:"\x1B[0m",dim:"\x1B[2m",cyan:"\x1B[36m",green:"\x1B[32m",yellow:"\x1B[33m",red:"\x1B[31m",bold:"\x1B[1m"};function Je(a){switch(a){case"info":return I.cyan;case"warn":return I.yellow;case"error":return I.red;case"debug":return I.dim;case"event":return I.green;default:return I.reset}}function qe(a){const e=a.ts.slice(11,23),t=a.level.toUpperCase().padEnd(5),i=Je(a.level);let s=`${I.dim}${e}${I.reset} ${i}${t}${I.reset} ${I.bold}[${a.source}]${I.reset} ${a.message}`;return a.data&&Object.keys(a.data).length>0&&(s+=` ${I.dim}${JSON.stringify(a.data)}${I.reset}`),s}function q(a,e,t,i,s){const n={ts:new Date().toISOString(),level:a,source:e,event:t,message:i,data:s};if(console.log(qe(n)),O.size>0){const c=JSON.stringify(n);for(const p of O)p.readyState===me.WebSocket.OPEN&&p.send(c)}}const U=(a,e,t,i)=>q("debug",a,e,t,i),M=(a,e,t,i)=>q("info",a,e,t,i),j=(a,e,t,i)=>q("warn",a,e,t,i),ee=(a,e,t,i)=>q("error",a,e,t,i),D=(a,e,t,i)=>q("event",a,e,t,i);function We(a=9333){if(!J)try{J=new me.WebSocketServer({port:a,host:"127.0.0.1"}),J.on("connection",e=>{O.add(e),M("debug-server","client-connected",`CLI client connected (${O.size} total)`),e.send(JSON.stringify({ts:new Date().toISOString(),level:"info",source:"debug-server",event:"welcome",message:"Connected to Phosra Browser agent debug stream",data:{port:a,pid:process.pid}})),e.on("close",()=>{O.delete(e)}),e.on("error",()=>{O.delete(e)})}),J.on("error",e=>{console.error(`${K} Failed to start debug server:`,e.message),J=null}),console.log(`${K} Debug WebSocket server listening on ws://127.0.0.1:${a}`)}catch(e){console.error(`${K} Failed to start debug server:`,e)}}const w="netflix-agent";class je{constructor(e){h(this,"step","idle");h(this,"profiles",[]);h(this,"mappings",[]);h(this,"changes",[]);h(this,"applyProgress",[]);h(this,"error");h(this,"discoveryPhase");h(this,"discoveryProfilesRead",0);h(this,"discoveryProfilesTotal",0);h(this,"chromeView");h(this,"getActiveTab");h(this,"credentialManager");this.chromeView=e.chromeView,this.getActiveTab=e.getActiveTab,this.credentialManager=e.credentialManager}restore(e){return D(w,"restore",`Restoring agent at step: ${e.step}`),this.step=e.step,this.profiles=e.profiles,this.mappings=e.mappings,this.changes=e.changes,this.applyProgress=e.applyProgress,this.error=e.error,this.discoveryPhase=e.discoveryPhase,this.discoveryProfilesRead=e.discoveryProfilesRead??0,this.discoveryProfilesTotal=e.discoveryProfilesTotal??0,this.pushStatus(),this.getStatus()}async start(){D(w,"start","Starting Netflix configuration agent"),this.step="discovering",this.profiles=[],this.mappings=[],this.changes=[],this.applyProgress=[],this.error=void 0,this.discoveryPhase="navigating",this.discoveryProfilesRead=0,this.discoveryProfilesTotal=0,this.pushStatus();try{const e=this.getActiveTab();if(!e)throw new Error("No active tab");this.discoveryPhase="navigating",this.pushStatus(),M(w,"phase",`Navigating to ${F.profileManage}`),await e.view.webContents.loadURL(F.profileManage),await this.waitForNavigation(e.view),U(w,"nav-done",`Navigation complete, URL: ${e.view.webContents.getURL()}`),this.discoveryPhase="checking-login",this.pushStatus(),M(w,"phase","Checking login status");const t=await this.isLoginPage(e.view);return U(w,"login-check",`Login page detected: ${t}`),t&&(this.discoveryPhase="logging-in",this.pushStatus(),M(w,"phase","Auto-filling Netflix credentials"),await this.handleLogin(e.view),M(w,"login-done","Login submitted, reloading profile page"),await e.view.webContents.loadURL(F.profileManage),await this.waitForNavigation(e.view)),this.discoveryPhase="loading-profiles",this.pushStatus(),M(w,"phase","Waiting for profile page to render"),await this.delay(1e3),this.profiles=await this.discoverProfiles(e.view),D(w,"profiles-discovered",`Discovered ${this.profiles.length} profiles`,{profiles:this.profiles.map(i=>({name:i.name,isKids:i.isKids,maturity:i.maturityLevel}))}),this.discoveryPhase="done",this.step="awaiting-mapping",this.pushStatus(),D(w,"step-change","Discovery complete, awaiting profile mapping"),this.getStatus()}catch(e){const t=e instanceof Error?e.message:String(e);return ee(w,"start-error",`Agent failed: ${t}`),this.step="error",this.error=t,this.discoveryPhase=void 0,this.pushStatus(),this.getStatus()}}confirmMappingsPreload(e){this.mappings=e,this.pushStatus()}confirmMappings(e){return D(w,"step-change",`Mappings confirmed (${e.length} profiles mapped)`,{mappings:e.map(t=>({profile:t.netflixProfile.name,member:t.familyMemberName,type:t.familyMemberType}))}),this.mappings=e,this.step="awaiting-maturity",this.pushStatus(),this.getStatus()}confirmMaturity(e){return D(w,"step-change","Maturity settings confirmed"),this.mappings=e,this.step="awaiting-pins",this.pushStatus(),this.getStatus()}confirmPins(e,t){for(const i of e){const s=this.profiles.find(n=>n.guid===i);s&&this.changes.push({id:`pin-${i}`,type:"pin",profileGuid:i,profileName:s.name,description:`Set 4-digit PIN on "${s.name}"`,enabled:!0,pin:t})}return this.step="awaiting-locks",this.pushStatus(),this.getStatus()}confirmLocks(e){for(const t of e){const i=this.profiles.find(s=>s.guid===t);i&&this.changes.push({id:`lock-${t}`,type:"lock",profileGuid:t,profileName:i.name,description:`Lock profile "${i.name}"`,enabled:!0})}return this.step="awaiting-autoplay",this.pushStatus(),this.getStatus()}confirmAutoplay(e){for(const t of e){if(!t.disable)continue;const i=this.profiles.find(s=>s.guid===t.profileGuid);i&&this.changes.push({id:`autoplay-${t.profileGuid}`,type:"autoplay",profileGuid:t.profileGuid,profileName:i.name,description:`Disable autoplay on "${i.name}"`,enabled:!0})}for(const t of this.mappings)t.familyMemberType==="child"&&t.recommendedMaturity&&t.recommendedMaturity!==t.netflixProfile.maturityLevel&&this.changes.push({id:`maturity-${t.netflixProfile.guid}`,type:"maturity",profileGuid:t.netflixProfile.guid,profileName:t.netflixProfile.name,description:`Set maturity to "${this.maturityLabel(t.recommendedMaturity)}" on "${t.netflixProfile.name}"`,enabled:!0,fromLevel:t.netflixProfile.maturityLevel,toLevel:t.recommendedMaturity});return this.step="reviewing",this.pushStatus(),this.getStatus()}updateChanges(e){return this.changes=e,this.pushStatus(),this.getStatus()}async applyChanges(){const e=this.changes.filter(i=>i.enabled);D(w,"apply-start",`Applying ${e.length} changes`,{changes:e.map(i=>({id:i.id,type:i.type,profile:i.profileName}))}),this.step="applying",this.applyProgress=e.map(i=>({changeId:i.id,status:"pending"})),this.pushStatus();for(const i of e){const s=this.applyProgress.find(n=>n.changeId===i.id);if(s){s.status="applying",this.pushStatus(),M(w,"apply-change",`Applying: ${i.description}`,{changeId:i.id,type:i.type});try{await this.applyChange(i),s.status="success",D(w,"apply-success",`Success: ${i.description}`)}catch(n){const c=n instanceof Error?n.message:String(n);s.status="failed",s.error=c,ee(w,"apply-failed",`Failed: ${i.description} — ${c}`)}this.pushStatus()}}const t=this.applyProgress.some(i=>i.status==="failed");return this.step=t?"error":"complete",t?(this.error="Some changes failed to apply. See details above.",j(w,"apply-partial","Some changes failed to apply")):D(w,"apply-complete","All changes applied successfully"),this.pushStatus(),this.getStatus()}cancel(){this.step="idle",this.profiles=[],this.mappings=[],this.changes=[],this.applyProgress=[],this.error=void 0,this.pushStatus()}getStatus(){return{step:this.step,profiles:this.profiles,mappings:this.mappings,changes:this.changes,applyProgress:this.applyProgress,error:this.error,discoveryPhase:this.discoveryPhase,discoveryProfilesRead:this.discoveryProfilesRead,discoveryProfilesTotal:this.discoveryProfilesTotal}}async discoverProfiles(e){this.discoveryPhase="extracting-cache",this.pushStatus(),M(w,"phase","Attempting Falcor cache extraction");try{const i=await this.extractFromFalcorCache(e);if(i.length>0)return D(w,"falcor-success",`Falcor cache: found ${i.length} profiles`),this.discoveryProfilesTotal=i.length,this.discoveryProfilesRead=i.length,this.pushStatus(),i;U(w,"falcor-empty","Falcor cache returned 0 profiles, falling back to DOM")}catch(i){j(w,"falcor-failed",`Falcor extraction failed: ${i instanceof Error?i.message:i}`)}this.discoveryPhase="scraping-dom",this.pushStatus(),M(w,"phase","Falling back to DOM scraping");const t=await this.scrapeProfilesFromDOM(e);return D(w,"dom-scrape-done",`DOM scraping: found ${t.length} profiles`),this.discoveryProfilesTotal=t.length,this.discoveryProfilesRead=t.length,this.pushStatus(),t}async extractFromFalcorCache(e){const i=await e.webContents.executeJavaScript(`
      (async function() {
        try {
          const cache = window.netflix?.falcorCache;
          if (!cache || !cache.profiles) return JSON.stringify([]);

          // Helper: convert an image URL to a data URI via canvas
          function toDataUri(url) {
            if (!url) return Promise.resolve('');
            return new Promise(resolve => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const c = document.createElement('canvas');
                  c.width = img.naturalWidth;
                  c.height = img.naturalHeight;
                  c.getContext('2d').drawImage(img, 0, 0);
                  resolve(c.toDataURL('image/png'));
                } catch (e) { resolve(url); }
              };
              img.onerror = () => resolve(url);
              setTimeout(() => resolve(url), 3000);
              img.src = url;
            });
          }

          const profiles = [];
          const profileKeys = Object.keys(cache.profiles);
          for (const key of profileKeys) {
            if (key === '$size' || key === 'length') continue;
            const p = cache.profiles[key];
            if (!p || !p.summary || !p.summary.value) continue;
            const s = p.summary.value;

            // Try multiple paths for avatar URL
            let avatarUrl = s.avatarUrl || '';
            if (!avatarUrl && p.avatar?.value?.url) {
              avatarUrl = p.avatar.value.url;
            }
            if (!avatarUrl && p.avatar?.value?.images?.byWidth) {
              const widths = Object.keys(p.avatar.value.images.byWidth);
              const best = widths.sort((a, b) => Number(b) - Number(a))[0];
              if (best) avatarUrl = p.avatar.value.images.byWidth[best]?.value || '';
            }
            if (!avatarUrl && s.avatarName) {
              // Netflix CDN pattern for known avatar names
              avatarUrl = 'https://occ-0-2794-3646.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxga/AAAABW-' + s.avatarName + '.png';
            }

            // Extract maturity — handle object, string, or numeric
            let maturityRaw = 'all';
            if (s.maturityLevel?.value !== undefined) {
              maturityRaw = String(s.maturityLevel.value);
            } else if (s.maturity?.value?.level !== undefined) {
              maturityRaw = String(s.maturity.value.level);
            } else if (typeof s.maturityLevel === 'string') {
              maturityRaw = s.maturityLevel;
            }

            // Detect kids profile from multiple Falcor fields
            const isKids = !!(
              s.isKids ||
              s.isKid ||
              s.kidsModeEnabled ||
              s.experience === 'kids' ||
              s.experience === 'jfk' ||
              s.type === 'kids' ||
              s.profileType === 'kids'
            );

            // Detect PIN from multiple Falcor fields
            const hasPIN = !!(
              s.hasPIN ||
              s.hasPin ||
              s.pinProtected ||
              s.isPinProtected ||
              s.profileLock?.hasPin ||
              s.profileLock?.value?.hasPin ||
              p.profileLock?.value?.hasPin ||
              p.pin?.value
            );

            // Detect lock from multiple fields
            const isLocked = !!(
              s.isLocked ||
              s.locked ||
              s.profileLock?.isLocked ||
              s.profileLock?.value?.isLocked ||
              p.profileLock?.value?.isLocked
            );

            profiles.push({
              guid: s.guid || key,
              name: s.profileName || 'Unknown',
              avatarUrl: avatarUrl,
              isKids: isKids,
              maturityLevel: maturityRaw,
              hasPIN: hasPIN,
              isLocked: isLocked,
              autoplayEnabled: s.autoplayEnabled !== false,
            });
          }

          // Also try to grab avatar URLs from DOM profile cards if Falcor missed them
          const domCards = document.querySelectorAll('[data-profile-guid], .profile-icon, .profile-button');
          for (const card of domCards) {
            const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
            const img = card.querySelector('img');
            if (guid && img?.src) {
              const profile = profiles.find(p => p.guid === guid);
              if (profile && !profile.avatarUrl) {
                profile.avatarUrl = img.src;
              }
            }
          }

          // Convert avatar URLs to data URIs so they work outside Netflix context
          await Promise.all(profiles.map(async (p) => {
            if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
              p.avatarUrl = await toDataUri(p.avatarUrl);
            }
          }));

          return JSON.stringify(profiles);
        } catch (e) {
          return JSON.stringify([]);
        }
      })()
    `);return JSON.parse(i).map(n=>({...n,maturityLevel:this.normaliseMaturityLevel(n.maturityLevel)}))}async scrapeProfilesFromDOM(e){const t=`
      (async function() {
        function toDataUri(url) {
          if (!url) return Promise.resolve('');
          return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext('2d').drawImage(img, 0, 0);
                resolve(c.toDataURL('image/png'));
              } catch (e) { resolve(url); }
            };
            img.onerror = () => resolve(url);
            setTimeout(() => resolve(url), 3000);
            img.src = url;
          });
        }

        const profiles = [];
        const cards = document.querySelectorAll('${N.profileCards}');
        cards.forEach(card => {
          const nameEl = card.querySelector('${N.profileName}') || card.closest('[class*="profile"]')?.querySelector('[class*="name"]');
          const isKids = !!card.querySelector('${N.kidsIndicator}');
          const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
          const avatarImg = card.querySelector('img');

          profiles.push({
            guid: guid,
            name: nameEl?.textContent?.trim() || 'Unknown',
            avatarUrl: avatarImg?.src || '',
            isKids: isKids,
            maturityLevel: isKids ? 'older-kids' : 'all',
            hasPIN: false,
            isLocked: false,
            autoplayEnabled: true,
          });
        });

        // Convert avatar URLs to data URIs
        await Promise.all(profiles.map(async (p) => {
          if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
            p.avatarUrl = await toDataUri(p.avatarUrl);
          }
        }));

        return JSON.stringify(profiles);
      })()
    `,i=await e.webContents.executeJavaScript(t);return JSON.parse(i)}async applyChange(e){const t=this.getActiveTab();if(!t)throw new Error("No active tab");switch(e.type){case"maturity":await this.applyMaturityChange(t.view,e);break;case"pin":await this.applyPinChange(t.view,e);break;case"lock":await this.applyLockChange(t.view,e);break;case"autoplay":await this.applyAutoplayChange(t.view,e);break}}async applyMaturityChange(e,t){M(w,"maturity",`Navigating to restrictions page for ${t.profileName}`),await e.webContents.loadURL(F.restrictions(t.profileGuid)),await this.waitForNavigation(e),await this.delay(2e3),await this.handleMfaGate(e),await this.delay(2e3),M(w,"maturity",`Setting maturity to ${t.toLevel}`);const i=await e.webContents.executeJavaScript(`
      (function() {
        var targetMap = {
          'little-kids': '50',
          'older-kids': '70',
          'teens': '90',
          'all': '1000000'
        };
        var target = ${JSON.stringify(t.toLevel)};
        var targetValue = targetMap[target];
        if (!targetValue) return null;

        // Find the radio button by data-uia or value
        var radio = document.querySelector('[data-uia="maturity-' + targetValue + '-radio"]');
        if (!radio) {
          radio = document.querySelector('input[name="maturity-rating"][value="' + targetValue + '"]');
        }
        if (radio) {
          radio.click();
          return 'radio:' + targetValue;
        }

        // Fallback: try all maturity radios and match by value
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].value === targetValue) {
            radios[i].click();
            return 'fallback-radio:' + targetValue;
          }
        }

        return null;
      })()
    `);if(!i)throw j(w,"maturity","Could not find maturity control on page"),new Error("Could not find maturity rating control on Netflix restrictions page");M(w,"maturity",`Maturity set via: ${i}`),await this.delay(1e3),await this.clickSaveButton(e),await this.delay(2e3)}async applyPinChange(e,t){if(!t.pin)return;M(w,"pin",`Navigating to profile settings for ${t.profileName}`),await e.webContents.loadURL(F.profileSettings(t.profileGuid)),await this.waitForNavigation(e),await this.delay(2e3),M(w,"pin","Clicking Profile Lock button"),await this.clickButton(e,N.profileLockButton),await this.delay(2e3),await this.handleMfaGate(e),await this.delay(2e3),M(w,"pin","Filling PIN");const i=await e.webContents.executeJavaScript(`
      (function() {
        // Look for PIN input fields (often 4 separate inputs or one input)
        var pinInputs = document.querySelectorAll('input[type="tel"], input[type="number"], input[inputmode="numeric"], input[maxlength="4"], input[maxlength="1"]');
        if (pinInputs.length === 0) {
          pinInputs = document.querySelectorAll('input[type="text"]');
        }

        var pin = ${JSON.stringify(t.pin)};
        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

        if (pinInputs.length === 4) {
          // 4 separate digit inputs
          for (var i = 0; i < 4; i++) {
            setter.call(pinInputs[i], pin[i]);
            pinInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
            pinInputs[i].dispatchEvent(new Event('change', { bubbles: true }));
          }
          return 'filled-4-inputs';
        } else if (pinInputs.length >= 1) {
          // Single PIN input
          setter.call(pinInputs[0], pin);
          pinInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          pinInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          return 'filled-single-input';
        }
        return null;
      })()
    `);if(!i)throw new Error("Could not find PIN input fields on Netflix Profile Lock page");M(w,"pin",`PIN filled: ${i}`),await this.delay(500),await this.clickSaveButton(e),await this.delay(2e3)}async applyLockChange(e,t){if(M(w,"lock",`Navigating to profile settings for ${t.profileName}`),await e.webContents.loadURL(F.profileSettings(t.profileGuid)),await this.waitForNavigation(e),await this.delay(2e3),M(w,"lock","Clicking Profile Lock button"),await this.clickButton(e,N.profileLockButton),await this.delay(2e3),await this.handleMfaGate(e),await this.delay(2e3),!await e.webContents.executeJavaScript(`
      (function() {
        // Look for toggle/checkbox for profile lock
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].closest('[class*="lock"], [class*="Lock"], [data-uia*="lock"]');
          if (label || parent) {
            if (!toggles[i].checked) toggles[i].click();
            return true;
          }
        }

        // Try clicking a button that enables the lock
        var btns = document.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          var text = (btns[j].textContent || '').toLowerCase();
          if (text.includes('enable') || text.includes('lock') || text.includes('turn on')) {
            btns[j].click();
            return true;
          }
        }
        return false;
      })()
    `))throw new Error("Could not find profile lock toggle on Netflix settings page");await this.delay(500),await this.clickSaveButton(e),await this.delay(2e3)}async applyAutoplayChange(e,t){M(w,"autoplay",`Navigating to playback settings for ${t.profileName}`),await e.webContents.loadURL(F.playback(t.profileGuid)),await this.waitForNavigation(e),await this.delay(2e3);const i=await e.webContents.executeJavaScript(`
      (function() {
        var results = [];

        // Find all checkboxes/toggles on the page
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        var pageText = document.body.innerText.toLowerCase();

        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].parentElement;
          var context = '';
          if (label) context = label.textContent.toLowerCase();
          else if (parent) context = parent.textContent.toLowerCase();

          // Check if this toggle is related to autoplay
          var isAutoplay = context.includes('autoplay') ||
            toggles[i].getAttribute('data-uia')?.includes('autoplay') ||
            toggles[i].name?.includes('autoplay');

          if (isAutoplay && toggles[i].checked) {
            toggles[i].click();
            results.push('toggled: ' + context.substring(0, 40));
          }
        }

        // Also check for "Autoplay next episode" and "Autoplay previews" text
        // Netflix renders these as toggle rows
        var rows = document.querySelectorAll('[class*="toggle"], [class*="Toggle"], [class*="switch"], [class*="Switch"]');
        for (var j = 0; j < rows.length; j++) {
          var rowText = (rows[j].textContent || '').toLowerCase();
          if (rowText.includes('autoplay')) {
            var toggle = rows[j].querySelector('input[type="checkbox"], [role="switch"]');
            if (toggle && toggle.checked) {
              toggle.click();
              results.push('row-toggled: ' + rowText.substring(0, 40));
            }
          }
        }

        return results.length > 0 ? JSON.stringify(results) : null;
      })()
    `);i?M(w,"autoplay",`Autoplay disabled: ${i}`):j(w,"autoplay","No autoplay toggles found or already disabled"),await this.delay(1e3),await this.clickSaveButton(e),await this.delay(2e3)}async isLoginPage(e){return e.webContents.getURL().toLowerCase().includes("netflix.com/login")?!0:!!await e.webContents.executeJavaScript(`
      !!document.querySelector('${N.loginForm}')
    `)}async handleLogin(e){if(!this.credentialManager)throw new Error("Not logged in to Netflix. Please sign in first.");const t=this.credentialManager.getAutoFillData("https://www.netflix.com/login");if(!t)throw new Error("No Netflix credentials stored. Please sign in to Netflix first.");const{username:i,password:s,service:n}=t,c=`
      (function() {
        function fill(selector, value) {
          const el = document.querySelector(selector);
          if (!el) return false;
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (nativeSetter) {
            nativeSetter.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        fill(${JSON.stringify(n.selectors.username)}, ${JSON.stringify(i)});
        fill(${JSON.stringify(n.selectors.password)}, ${JSON.stringify(s)});
      })()
    `;await this.delay(1500),await e.webContents.executeJavaScript(c),await this.delay(500);const p=n.selectors.submit??'button[type="submit"]';await this.clickButton(e,p),await this.delay(5e3)}async handleMfaGate(e){const i=e.webContents.getURL().includes("/mfa"),s=await e.webContents.executeJavaScript(`
      (function() {
        var text = (document.body.innerText || '').toLowerCase();
        return text.includes('make sure') || text.includes('confirm password') || text.includes('verify your identity');
      })()
    `);if(!i&&!s){U(w,"mfa","No MFA gate detected, continuing");return}M(w,"mfa","MFA gate detected, handling password confirmation");const n=await e.webContents.executeJavaScript(`
      (function() {
        // Try the specific data-uia selector first
        var btn = document.querySelector('${N.mfaPasswordButton}');
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback: find button with "password" or "Confirm password" text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('confirm password') || text.includes('password')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);if(n&&(U(w,"mfa",`Clicked password option: ${n}`),await this.delay(2e3)),!this.credentialManager)throw new Error("MFA gate requires Netflix password but no credential manager available");const c=this.credentialManager.getAutoFillData("https://www.netflix.com/login");if(!c)throw new Error("MFA gate requires Netflix password but no credentials stored");if(!await e.webContents.executeJavaScript(`
      (function() {
        var el = document.querySelector(${JSON.stringify(N.mfaPasswordInput)});
        if (!el) {
          // Broader fallback
          el = document.querySelector(${JSON.stringify(N.passwordInput)});
        }
        if (!el) return false;

        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, ${JSON.stringify(c.password)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `))throw new Error("Could not find password input on MFA page");M(w,"mfa","Password filled"),await this.delay(500);const y=await e.webContents.executeJavaScript(`
      (function() {
        // Try specific MFA submit button
        var btn = document.querySelector(${JSON.stringify(N.mfaSubmitButton)});
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback to any submit button
        btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit-btn'; }

        // Fallback to button with submit-like text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('continue') || text.includes('submit') || text.includes('confirm') || text.includes('verify')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);if(!y)throw new Error("Could not find submit button on MFA page");M(w,"mfa",`MFA submitted via: ${y}`),await this.delay(4e3),await this.waitForNavigation(e)}async clickSaveButton(e){const t=await e.webContents.executeJavaScript(`
      (function() {
        // Try submit button first
        var btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit'; }

        // Try data-uia save button
        btn = document.querySelector('[data-uia*="save"], [data-uia*="submit"]');
        if (btn) { btn.click(); return 'data-uia'; }

        // Try button text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase().trim();
          if (text === 'save' || text === 'save changes' || text === 'submit' || text === 'done' || text === 'apply') {
            btns[i].click();
            return 'text:' + text;
          }
        }
        return null;
      })()
    `);t?M(w,"save",`Clicked save button: ${t}`):U(w,"save","No save button found (page may auto-save)")}async clickButton(e,t){await e.webContents.executeJavaScript(`
      (function() {
        const btn = document.querySelector(${JSON.stringify(t)});
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `)}async waitForNavigation(e){return new Promise(t=>{const i=setTimeout(()=>t(),1e4),s=()=>{clearTimeout(i),t()};e.webContents.once("did-stop-loading",s)})}delay(e){return new Promise(t=>setTimeout(t,e))}normaliseMaturityLevel(e){const t=(e||"").toLowerCase().replace(/[\s_]/g,"-"),i=Number(e);return!isNaN(i)&&i>0?i<=50?"little-kids":i<=70?"older-kids":i<=90?"teens":"all":t.includes("little")?"little-kids":t.includes("older")?"older-kids":t.includes("teen")?"teens":"all"}maturityLabel(e){const t=Be.find(i=>i.value===e);return(t==null?void 0:t.label)??e}pushStatus(){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed()))try{this.chromeView.webContents.send("config-agent:status-update",this.getStatus())}catch{}}}const He="config-agent-state.json",Ge="netflix-profile-mappings.json",te=["awaiting-mapping","awaiting-maturity","awaiting-pins","awaiting-locks","awaiting-autoplay","reviewing"];class ze{constructor(e){h(this,"filePath");this.filePath=T.join(e,He)}save(e){if(!te.includes(e.step))return;const i={status:{...e,changes:e.changes.map(s=>s.pin?{...s,pin:void 0}:s)},savedAt:new Date().toISOString()};try{v.writeFileSync(this.filePath,JSON.stringify(i,null,2),{encoding:"utf-8",mode:384})}catch{}}load(){const e=this.loadWithTimestamp();return(e==null?void 0:e.state)??null}loadWithTimestamp(){try{if(!v.existsSync(this.filePath))return null;const e=v.readFileSync(this.filePath,"utf-8"),t=JSON.parse(e);if(!te.includes(t.status.step))return this.clear(),null;const i=new Date(t.savedAt).getTime();return Date.now()-i>10080*60*1e3?(this.clear(),null):{state:t.status,savedAt:t.savedAt}}catch{return this.clear(),null}}clear(){try{v.existsSync(this.filePath)&&v.unlinkSync(this.filePath)}catch{}}get mappingsPath(){return T.join(T.dirname(this.filePath),Ge)}saveMappings(e){const t=e.filter(i=>i.familyMemberType!=="unassigned"&&i.familyMemberId);if(t.length!==0)try{v.writeFileSync(this.mappingsPath,JSON.stringify({mappings:t,savedAt:new Date().toISOString()},null,2),{encoding:"utf-8",mode:384})}catch{}}loadMappings(){try{if(!v.existsSync(this.mappingsPath))return null;const e=v.readFileSync(this.mappingsPath,"utf-8");return JSON.parse(e).mappings??null}catch{return null}}savePinStatus(e){try{const t=this.loadMappingsRaw();t.pinnedGuids=e,v.writeFileSync(this.mappingsPath,JSON.stringify(t,null,2),{encoding:"utf-8",mode:384})}catch{}}loadPinStatus(){try{return this.loadMappingsRaw().pinnedGuids??[]}catch{return[]}}loadMappingsRaw(){try{return v.existsSync(this.mappingsPath)?JSON.parse(v.readFileSync(this.mappingsPath,"utf-8")):{}}catch{return{}}}get profileChildMapPath(){return T.join(T.dirname(this.filePath),"profile-child-map.json")}saveProfileChildMap(e){try{v.writeFileSync(this.profileChildMapPath,JSON.stringify({map:e,savedAt:new Date().toISOString()},null,2),{encoding:"utf-8",mode:384})}catch{}}loadProfileChildMap(){try{if(!v.existsSync(this.profileChildMapPath))return null;const e=v.readFileSync(this.profileChildMapPath,"utf-8");return JSON.parse(e).map??null}catch{return null}}}const Ke="netflix-activity-cache.json";class Ze{constructor(e){h(this,"filePath");this.filePath=T.join(e,Ke)}save(e){const t={version:1,activities:e,savedAt:new Date().toISOString()};try{v.writeFileSync(this.filePath,JSON.stringify(t,null,2),{encoding:"utf-8",mode:384})}catch{}}load(){try{if(!v.existsSync(this.filePath))return null;const e=v.readFileSync(this.filePath,"utf-8"),t=JSON.parse(e);return t.version!==1?null:t.activities}catch{return null}}}const Qe=50;async function Xe(a,e){const t=[],i=a.webContents;for(const s of e)try{const n=F.switchProfile(s.profileGuid);await i.loadURL(n),await ie(i,5e3),await i.loadURL(F.viewingActivity),await ie(i,8e3);let c=0,p=-1;for(;c<Qe;){const g=await i.executeJavaScript(`document.querySelectorAll('${N.viewingActivityRow}').length`);if(g===p||(p=g,!await i.executeJavaScript(`
          (function() {
            var btn = document.querySelector('button[data-uia="viewing-activity-show-more"]');
            if (!btn) {
              var all = document.querySelectorAll('button');
              for (var i = 0; i < all.length; i++) {
                if ((all[i].textContent || '').trim().toLowerCase() === 'show more') {
                  btn = all[i]; break;
                }
              }
            }
            if (btn) { btn.click(); return true; }
            return false;
          })()
        `)))break;await Ye(2e3),c++}const y=await i.executeJavaScript(`
        (function() {
          var rows = document.querySelectorAll('${N.viewingActivityRow}');
          var results = [];
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var dateEl = row.querySelector('${N.viewingActivityDate}');
            var titleEl = row.querySelector('${N.viewingActivityTitle}');
            if (!dateEl || !titleEl) continue;
            var title = titleEl.textContent.trim();
            var date = dateEl.textContent.trim();
            var titleUrl = titleEl.getAttribute('href') || undefined;
            var seriesTitle = undefined;
            if (title.indexOf(':') !== -1) {
              seriesTitle = title.split(':')[0].trim();
            }
            results.push({ title: title, date: date, titleUrl: titleUrl, seriesTitle: seriesTitle });
          }
          return results;
        })()
      `);console.log(`[netflix-activity] ${s.childName}: ${y.length} entries (${c} pages loaded)`),t.push({childName:s.childName,childId:s.childId,profileName:s.profileName,profileGuid:s.profileGuid,avatarUrl:s.avatarUrl,entries:y||[],fetchedAt:new Date().toISOString()})}catch(n){console.error(`[netflix-activity] Failed to fetch activity for ${s.childName}:`,n),t.push({childName:s.childName,childId:s.childId,profileName:s.profileName,profileGuid:s.profileGuid,avatarUrl:s.avatarUrl,entries:[],fetchedAt:new Date().toISOString()})}return t}function Ye(a){return new Promise(e=>setTimeout(e,a))}function ie(a,e){return new Promise(t=>{let i=!1;const s=setTimeout(()=>{i||(i=!0,t())},e),n=()=>{i||(i=!0,clearTimeout(s),setTimeout(t,1e3))};a.once("did-finish-load",n),a.once("did-fail-load",()=>{i||(i=!0,clearTimeout(s),t())})})}const et="csm-cache.json",tt=720*60*60*1e3;class Q{constructor(e){h(this,"filePath");this.filePath=T.join(e,et)}get(e){const i=this.load().reviews[e];return!i||this.isStale(i.scrapedAt)?null:i}set(e){const t=this.load();t.reviews[e.csmSlug]=e,this.save(t)}getAll(){const e=this.load();return Object.values(e.reviews)}getStats(){const e=this.load(),t=Object.values(e.reviews);let i=0;for(const s of t)this.isStale(s.scrapedAt)&&i++;return{total:t.length,fresh:t.length-i,stale:i}}isStale(e){const t=new Date(e).getTime();return Date.now()-t>tt}load(){try{if(!v.existsSync(this.filePath))return{version:1,reviews:{}};const e=v.readFileSync(this.filePath,"utf-8"),t=JSON.parse(e);return t.version!==1?{version:1,reviews:{}}:t}catch{return{version:1,reviews:{}}}}save(e){try{v.writeFileSync(this.filePath,JSON.stringify(e,null,2),{encoding:"utf-8",mode:384})}catch{}}}const it=Object.freeze(Object.defineProperty({__proto__:null,CSMCache:Q},Symbol.toStringTag,{value:"Module"})),Z=4e3,se=3;class st{constructor(){h(this,"tokens");h(this,"lastRefill");h(this,"waitQueue",[]);h(this,"refillTimerId",null);this.tokens=se,this.lastRefill=Date.now()}acquire(){return this.refill(),this.tokens>=1?(this.tokens-=1,Promise.resolve()):new Promise(e=>{this.waitQueue.push(e),this.scheduleRefill()})}refill(){const t=Date.now()-this.lastRefill,i=Math.floor(t/Z);i>0&&(this.tokens=Math.min(se,this.tokens+i),this.lastRefill+=i*Z)}scheduleRefill(){this.refillTimerId===null&&(this.refillTimerId=setTimeout(()=>{for(this.refillTimerId=null,this.refill();this.tokens>=1&&this.waitQueue.length>0;)this.tokens-=1,this.waitQueue.shift()();this.waitQueue.length>0&&this.scheduleRefill()},Z))}destroy(){this.refillTimerId!==null&&(clearTimeout(this.refillTimerId),this.refillTimerId=null),this.waitQueue=[]}}const at=/^(the|a|an)\s+/i;function ae(a){return a.toLowerCase().replace(at,"").replace(/[^a-z0-9\s']/g,"").replace(/\s+/g," ").trim()}function re(a){const e=new Set;for(let t=0;t<a.length-1;t++)e.add(a.substring(t,t+2));return e}function rt(a,e){if(a===e)return 1;if(a.length<2||e.length<2)return 0;const t=re(a),i=re(e);let s=0;for(const n of t)i.has(n)&&s++;return 2*s/(t.size+i.size)}function nt(a,e){if(e.length===0)return null;const t=ae(a);let i=null,s=0;for(const n of e){const c=ae(n.text);if(t===c)return{href:n.href,confidence:1};if(t.includes(c)||c.includes(t)){.9>s&&(s=.9,i={href:n.href,confidence:.9});continue}const p=rt(t,c);p>s&&(s=p,i={href:n.href,confidence:p})}return i&&i.confidence>=.6?i:null}const ot=`(function(){
  var links = [];
  document.querySelectorAll('a[href]').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href.match(/^\\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\\/[a-z0-9-]+/) &&
        !links.some(function(l) { return l.href === href; })) {
      var text = (a.textContent || '').trim();
      if (text && text !== 'See full review' && text.length > 1) {
        links.push({ href: href, text: text.substring(0, 80) });
      }
    }
  });
  return links.slice(0, 5);
})()`,ct=`(function(){
  var r = { url: location.href };

  // --- LD+JSON structured data ---
  var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
  ldScripts.forEach(function(s) {
    try {
      var data = JSON.parse(s.textContent);
      var graph = data['@graph'] || [data];
      graph.forEach(function(item) {
        if (item['@type'] === 'Review') {
          r.csmTitle = item.name || '';
          r.ageRange = item.typicalAgeRange || '';
          r.isFamilyFriendly = item.isFamilyFriendly || '';
          r.qualityRating = item.reviewRating ? item.reviewRating.ratingValue : '';
          r.reviewSummary = item.description || '';
          r.reviewBody = item.reviewBody || '';
          r.mediaType = item.itemReviewed ? item.itemReviewed['@type'] : '';
          r.datePublished = item.datePublished || '';
        }
      });
    } catch(e) {}
  });

  // --- Age badge ---
  var ageBadge = document.querySelector('.rating__age');
  if (ageBadge) r.ageBadge = ageBadge.textContent.trim();

  // --- Parents Need to Know (full text) ---
  var headings = document.querySelectorAll('h2, h3, h4');
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('parents need to know')) {
      var next = headings[i].nextElementSibling;
      if (next) r.parentSummary = next.textContent.trim();
      break;
    }
  }

  // --- "Why Age X+?" explanation ---
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('why age') || hText.includes('what age')) {
      var next = headings[i].nextElementSibling;
      if (next) r.ageExplanation = next.textContent.trim();
      break;
    }
  }

  // --- Content descriptors with descriptions and numeric levels ---
  r.descriptors = [];
  // Try the content-grid based layout first (newer CSM pages)
  var gridItems = document.querySelectorAll('[class*="content-grid"] [class*="content-grid-item"], [class*="review-content"] [class*="descriptor"]');
  if (gridItems.length === 0) {
    // Fallback: rating-based selectors
    gridItems = document.querySelectorAll('[class*="rating__"] .rating__label, .csm-green-btn + ul li, [class*="ContentGrid"] > div');
  }

  // Primary approach: find labeled sections with dot indicators
  document.querySelectorAll('.rating__label').forEach(function(label) {
    var container = label.closest('[class*="rating"]') || label.parentElement;
    var score = container ? container.querySelector('.rating__score, .rating__teaser-short') : null;
    var levelText = score ? score.textContent.trim() : '';

    // Count filled dots/circles for numeric level (0-5)
    var numericLevel = 0;
    if (container) {
      var dots = container.querySelectorAll('[class*="dot"], [class*="circle"], [class*="fill"], svg circle');
      var filledDots = container.querySelectorAll('[class*="dot--filled"], [class*="dot--active"], [class*="circle--filled"], [class*="filled"]');
      if (filledDots.length > 0) {
        numericLevel = filledDots.length;
      } else if (dots.length > 0) {
        // Try aria or style-based detection
        dots.forEach(function(d) {
          var cl = d.getAttribute('class') || '';
          var style = d.getAttribute('style') || '';
          if (cl.indexOf('active') >= 0 || cl.indexOf('filled') >= 0 || style.indexOf('opacity: 1') >= 0 || style.indexOf('fill:') >= 0) {
            numericLevel++;
          }
        });
      }
      // Fallback: parse level text
      if (numericLevel === 0 && levelText) {
        var lv = levelText.toLowerCase();
        if (lv === 'not present' || lv === 'none') numericLevel = 0;
        else if (lv === 'a little' || lv === 'some') numericLevel = 1;
        else if (lv === 'a lot') numericLevel = 3;
        else if (lv === 'iffy') numericLevel = 2;
        else if (lv === 'pause') numericLevel = 2;
      }
    }

    // Get the description text (usually in a sibling or nested element)
    var description = '';
    if (container) {
      var descEl = container.querySelector('.rating__teaser, [class*="teaser"], [class*="description"], p');
      if (descEl && descEl !== score && descEl !== label) {
        description = descEl.textContent.trim();
      }
      // If no explicit description element, check for text after the label/score
      if (!description) {
        var allText = container.textContent.trim();
        var catText = label.textContent.trim();
        var scoreText = levelText;
        // Remove category and score from full text to get description
        var remainder = allText;
        if (catText) remainder = remainder.replace(catText, '').trim();
        if (scoreText) remainder = remainder.replace(scoreText, '').trim();
        if (remainder.length > 10) description = remainder;
      }
    }

    r.descriptors.push({
      category: label.textContent.trim(),
      level: levelText,
      numericLevel: numericLevel,
      description: description
    });
  });

  // --- Positive Content section ---
  r.positiveContent = [];
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('positive') || hText.includes('any good')) {
      // Look for sub-sections after this heading
      var sibling = headings[i].nextElementSibling;
      while (sibling) {
        var tag = sibling.tagName.toLowerCase();
        if (tag === 'h2' || tag === 'h3') break; // next major section

        // Check for labeled items (e.g. "Educational Value", "Positive Messages")
        var subLabels = sibling.querySelectorAll('[class*="label"], [class*="rating__label"], strong, b, dt, h4, h5');
        if (subLabels.length > 0) {
          subLabels.forEach(function(sl) {
            var cat = sl.textContent.trim();
            var desc = '';
            // Get description from next sibling or parent text
            var descSibling = sl.nextElementSibling;
            if (descSibling) {
              desc = descSibling.textContent.trim();
            } else if (sl.parentElement) {
              var parentText = sl.parentElement.textContent.trim();
              desc = parentText.replace(cat, '').trim();
            }
            if (cat && (desc || cat.length > 5)) {
              r.positiveContent.push({ category: cat, description: desc });
            }
          });
        } else if (sibling.textContent.trim().length > 10) {
          // Plain text paragraph describing positive content
          r.positiveContent.push({ category: 'General', description: sibling.textContent.trim() });
        }
        sibling = sibling.nextElementSibling;
      }
      break;
    }
  }

  return r;
})()`,ne="https://www.commonsensemedia.org",oe=3e3,ce=15e3;function le(a){return new Promise(e=>setTimeout(e,a))}function ue(a,e){return new Promise(t=>{let i=!1;const s=setTimeout(()=>{i||(i=!0,t())},e),n=()=>{i||(i=!0,clearTimeout(s),t())};a.once("did-finish-load",n),a.once("did-fail-load",()=>{i||(i=!0,clearTimeout(s),t())})})}function lt(a){const e=a.split("/");return e[e.length-1]||a}function ut(a){const e=a.match(/^\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\//);return e?e[1]:""}function dt(a){const e=a.match(/(\d+)/);return e?parseInt(e[1],10):0}class ht{constructor(e,t,i){h(this,"parentWindow");h(this,"view");h(this,"cache");h(this,"limiter");h(this,"destroyed",!1);h(this,"queue",[]);h(this,"processing",!1);this.parentWindow=e,this.cache=new Q(i),this.limiter=new st;const s=l.session.fromPartition("csm-scraper",{cache:!0});s.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"),this.view=new l.WebContentsView({webPreferences:{preload:t,sandbox:!1,contextIsolation:!0,session:s,nodeIntegration:!1}}),this.parentWindow.contentView.addChildView(this.view),this.view.setBounds({x:0,y:0,width:0,height:0}),this.view.setVisible(!1)}enqueue(e,t){for(const i of e)this.queue.push({title:i,callback:t});this.processQueue()}destroy(){if(!this.destroyed){this.destroyed=!0,this.limiter.destroy(),this.queue=[];try{this.parentWindow.contentView.removeChildView(this.view)}catch{}try{this.view.webContents.close()}catch{}}}async processQueue(){if(!(this.processing||this.destroyed)){for(this.processing=!0;this.queue.length>0&&!this.destroyed;){const e=this.queue.shift(),t=await this.scrapeTitle(e.title);try{e.callback(t)}catch{}}this.processing=!1}}async scrapeTitle(e){const t=this.view.webContents;try{if(await this.limiter.acquire(),this.destroyed||t.isDestroyed())return{title:e,found:!1,error:"Scraper destroyed"};const i=`${ne}/search/${encodeURIComponent(e)}`,s=ue(t,ce);if(await t.loadURL(i),await s,await le(oe),this.destroyed||t.isDestroyed())return{title:e,found:!1,error:"Scraper destroyed"};const n=await t.executeJavaScript(ot);if(!n||n.length===0)return{title:e,found:!1};const c=nt(e,n);if(!c)return{title:e,found:!1};if(await this.limiter.acquire(),this.destroyed||t.isDestroyed())return{title:e,found:!1,error:"Scraper destroyed"};const p=`${ne}${c.href}`,y=ue(t,ce);if(await t.loadURL(p),await y,await le(oe),this.destroyed||t.isDestroyed())return{title:e,found:!1,error:"Scraper destroyed"};const g=await t.executeJavaScript(ct),P=g.ageRange||g.ageBadge||"",S={csmSlug:lt(c.href),csmUrl:g.url||p,csmMediaType:g.mediaType||ut(c.href),title:g.csmTitle||e,ageRating:P,ageRangeMin:dt(P),qualityStars:g.qualityRating?Number(g.qualityRating):0,isFamilyFriendly:g.isFamilyFriendly===!0||g.isFamilyFriendly==="true",reviewSummary:g.reviewSummary||"",reviewBody:g.reviewBody||"",parentSummary:g.parentSummary||"",ageExplanation:g.ageExplanation||"",descriptors:(g.descriptors||[]).map(r=>({category:String(r.category||""),level:String(r.level||""),numericLevel:Number(r.numericLevel||0),description:String(r.description||"")})),positiveContent:(g.positiveContent||[]).map(r=>({category:String(r.category||""),description:String(r.description||"")})),scrapedAt:new Date().toISOString()};return this.cache.set(S),{title:e,found:!0,confidence:c.confidence,review:S}}catch(i){const s=i instanceof Error?i.message:String(i);return console.error(`[csm-scraper] Error scraping "${e}":`,s),{title:e,found:!1,error:s}}}}class pt{constructor(e,t,i,s,n){h(this,"cache");h(this,"scraper",null);h(this,"parentWindow");h(this,"stealthPreloadPath");h(this,"profilePath");h(this,"apiClient");h(this,"chromeView");this.parentWindow=e,this.stealthPreloadPath=t,this.profilePath=i,this.apiClient=s,this.chromeView=n,this.cache=new Q(i)}enrichTitles(e,t=!1){const i=[...new Set(e)],s=[],n=[],c=[];let p=i.length;const y=25;for(const g of i){const P=this.findCachedByTitle(g);P&&!t?(n.push(P),this.sendToChrome("csm:enrichment-update",{title:g,status:"cached",review:P}),p--):s.push(g)}if(n.length>0&&this.syncToBackend(n),s.length===0){this.sendToChrome("csm:enrichment-complete",{});return}this.scraper||(this.scraper=new ht(this.parentWindow,this.stealthPreloadPath,this.profilePath)),this.scraper.enqueue(s,g=>{let P;g.found&&g.review?(P={title:g.title,status:"scraped",review:g.review},c.push(g.review),c.length>=y&&(this.syncToBackend([...c]),c.length=0)):g.error?P={title:g.title,status:"error"}:P={title:g.title,status:"not-found"},this.sendToChrome("csm:enrichment-update",P),p--,p<=0&&(this.sendToChrome("csm:enrichment-complete",{}),c.length>0&&(this.syncToBackend([...c]),c.length=0))})}getCachedReviews(){return this.cache.getAll()}getCacheStats(){return this.cache.getStats()}getShallowReviews(){const e=this.cache.getAll(),t=[];for(const i of e)"positiveContent"in i&&"reviewBody"in i&&i.descriptors.some(n=>"numericLevel"in n)||t.push(i.title);return{count:t.length,titles:t}}destroy(){this.scraper&&(this.scraper.destroy(),this.scraper=null)}findCachedByTitle(e){const t=e.toLowerCase().trim(),i=this.cache.getAll();for(const s of i)if(s.title.toLowerCase().trim()===t){const n=new Date(s.scrapedAt).getTime();if(Date.now()-n<=720*60*60*1e3)return s}return null}syncToBackend(e){if(!this.apiClient||e.length===0)return;const t=25,i=e.map(n=>({csm_slug:n.csmSlug,csm_url:n.csmUrl,csm_media_type:n.csmMediaType,title:n.title,age_rating:n.ageRating,age_range_min:n.ageRangeMin,quality_stars:n.qualityStars,is_family_friendly:n.isFamilyFriendly,review_summary:n.reviewSummary,review_body:n.reviewBody||"",parent_summary:n.parentSummary,age_explanation:n.ageExplanation||"",descriptors_json:n.descriptors,positive_content:n.positiveContent||[]}));console.log(`[csm-enrichment] Syncing ${i.length} reviews to backend in batches of ${t}...`),(async()=>{let n=0;for(let c=0;c<i.length;c+=t){const p=i.slice(c,c+t);try{const y=await this.apiClient.syncCSMReviews(p);n+=y.upserted,console.log(`[csm-enrichment] Batch ${Math.floor(c/t)+1}: synced ${y.upserted} reviews`)}catch(y){console.error(`[csm-enrichment] Batch ${Math.floor(c/t)+1} failed:`,(y==null?void 0:y.message)||y),p.length>0&&console.error("[csm-enrichment] Sample payload:",JSON.stringify(p[0]).substring(0,200))}}console.log(`[csm-enrichment] Total synced: ${n} reviews`);try{const c=await this.apiClient.linkViewingHistoryCSM();console.log(`[csm-enrichment] Linked ${c.linked} viewing history entries to CSM reviews`)}catch(c){console.error("[csm-enrichment] Link CSM failed:",(c==null?void 0:c.message)||c)}})()}sendToChrome(e,t){if(!(!this.chromeView||this.chromeView.webContents.isDestroyed()))try{this.chromeView.webContents.send(e,t)}catch{}}}const ft=["tab:create","tab:close","tab:switch","tab:list","tab:navigate","tab:go-back","tab:go-forward","tab:reload","chrome:set-expanded","chrome:set-height","profile:list","profile:switch","credentials:check","credentials:list","credentials:save","credentials:save-custom","credentials:delete","auth:status","auth:logout","auth:login-navigate","family:quick-setup","family:list","family:children","family:child-policies","family:add-child","family:members","family:add-member","family:remove-member","family:update-child","family:update-member","config-agent:start","config-agent:resume","config-agent:check-saved","config-agent:confirm-mappings","config-agent:confirm-maturity","config-agent:confirm-pins","config-agent:confirm-locks","config-agent:confirm-autoplay","config-agent:update-changes","config-agent:apply","config-agent:cancel","config-agent:set-tab-inset","netflix:fetch-activity","netflix:load-activity","netflix:load-mappings","netflix:resync-backend","csm:enrich-titles","csm:get-cached","csm:get-cache-stats","csm:get-shallow-reviews","csm:rescrape-shallow","profile-child-map:save","profile-child-map:load"],gt=["chrome:focus-address-bar"];function ve(a,e,t,i,s){for(const r of ft)l.ipcMain.removeHandler(r);for(const r of gt)l.ipcMain.removeAllListeners(r);const n=a.getTabManager();l.ipcMain.handle("tab:create",(r,o)=>{const u=n.createTab(o);return{id:u.id,title:u.title,url:u.url,isLoading:u.isLoading,canGoBack:u.canGoBack,canGoForward:u.canGoForward}}),l.ipcMain.handle("tab:close",(r,o)=>(n.closeTab(o),{success:!0})),l.ipcMain.handle("tab:switch",(r,o)=>(n.switchTab(o),{success:!0})),l.ipcMain.handle("tab:list",()=>({tabs:n.toTabInfoList(),activeTabId:n.getActiveTabId()})),l.ipcMain.handle("tab:navigate",(r,o)=>{const u=n.getActiveTab();if(!u)return{success:!1,error:"No active tab"};const d=wt(o);return u.view.webContents.loadURL(d).catch(f=>{console.error("[IPC] tab:navigate failed:",f.message)}),{success:!0}}),l.ipcMain.handle("tab:go-back",()=>{const r=n.getActiveTab();return r?(r.view.webContents.navigationHistory.canGoBack()&&r.view.webContents.navigationHistory.goBack(),{success:!0}):{success:!1,error:"No active tab"}}),l.ipcMain.handle("tab:go-forward",()=>{const r=n.getActiveTab();return r?(r.view.webContents.navigationHistory.canGoForward()&&r.view.webContents.navigationHistory.goForward(),{success:!0}):{success:!1,error:"No active tab"}}),l.ipcMain.handle("tab:reload",()=>{const r=n.getActiveTab();return r?(r.view.webContents.reload(),{success:!0}):{success:!1,error:"No active tab"}}),l.ipcMain.handle("chrome:set-expanded",(r,o)=>(a.setChromeExpanded(o),{success:!0})),l.ipcMain.handle("chrome:set-height",(r,o)=>(a.setChromeHeight(o),{success:!0})),l.ipcMain.on("chrome:focus-address-bar",()=>{const r=a.getChromeView();r&&!r.webContents.isDestroyed()&&r.webContents.send("chrome:focus-address-bar")}),l.ipcMain.handle("profile:list",()=>e.listProfiles()),l.ipcMain.handle("profile:switch",(r,o)=>{try{return{success:!0,profilePath:e.createProfile(o)}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),t&&(l.ipcMain.handle("credentials:check",()=>t.isAvailable()),l.ipcMain.handle("credentials:list",()=>t.list()),l.ipcMain.handle("credentials:save",(r,o,u,d)=>{try{return{success:!0,credential:t.save(o,u,d)}}catch(f){return{success:!1,error:f instanceof Error?f.message:String(f)}}}),l.ipcMain.handle("credentials:save-custom",(r,o,u,d,f,m)=>{try{return{success:!0,credential:t.saveCustom(o,u,d,f,m)}}catch(k){return{success:!1,error:k instanceof Error?k.message:String(k)}}}),l.ipcMain.handle("credentials:delete",(r,o)=>({success:t.delete(o)}))),i&&(l.ipcMain.handle("auth:status",()=>i.getInfo()),l.ipcMain.handle("auth:logout",()=>(i.logout(),{success:!0})),l.ipcMain.handle("auth:login-navigate",async()=>{try{return await l.shell.openExternal("https://www.phosra.com/login?from=phosra-browser"),{success:!0}}catch(r){return console.error("[Auth] Failed to open login URL:",r),{success:!1,error:"Failed to open browser"}}})),s&&(l.ipcMain.handle("family:quick-setup",async(r,o)=>{try{return{success:!0,data:await s.quickSetup(o)}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),l.ipcMain.handle("family:list",async()=>{try{return{success:!0,data:await s.listFamilies()}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}),l.ipcMain.handle("family:children",async(r,o)=>{try{return{success:!0,data:await s.listChildren(o)}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),l.ipcMain.handle("family:child-policies",async(r,o)=>{try{return{success:!0,data:await s.listPolicies(o)}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),l.ipcMain.handle("family:add-child",async(r,o,u,d)=>{try{return{success:!0,data:await s.addChild(o,u,d)}}catch(f){return{success:!1,error:f instanceof Error?f.message:String(f)}}}),l.ipcMain.handle("family:members",async(r,o)=>{try{return{success:!0,data:await s.listMembers(o)}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),l.ipcMain.handle("family:add-member",async(r,o,u,d,f)=>{try{return{success:!0,data:await s.addMember(o,u,d,f)}}catch(m){return{success:!1,error:m instanceof Error?m.message:String(m)}}}),l.ipcMain.handle("family:remove-member",async(r,o,u)=>{try{return await s.removeMember(o,u),{success:!0}}catch(d){return{success:!1,error:d instanceof Error?d.message:String(d)}}}),l.ipcMain.handle("family:update-child",async(r,o,u,d)=>{try{return{success:!0,data:await s.updateChild(o,{name:u,birth_date:d})}}catch(f){return{success:!1,error:f instanceof Error?f.message:String(f)}}}),l.ipcMain.handle("family:update-member",async(r,o,u,d,f)=>{try{return{success:!0,data:await s.updateMember(o,u,{display_name:d,role:f})}}catch(m){return{success:!1,error:m instanceof Error?m.message:String(m)}}}));let c=null;const p=new ze(e.getDefaultProfilePath());function y(){const r=a.getTabManager();return new je({chromeView:a.getChromeView(),getActiveTab:()=>r.getActiveTab(),credentialManager:t??null})}function g(r){const o=r.getStatus();p.save(o),s==null||s.saveConfigState("netflix",o).catch(()=>{})}l.ipcMain.handle("config-agent:check-saved",async()=>{const r=p.loadWithTimestamp();let o=null;try{const d=await(s==null?void 0:s.getConfigState("netflix"));d!=null&&d.state&&(d!=null&&d.savedAt)?o={state:d.state,savedAt:d.savedAt}:d!=null&&d.state&&(o={state:d.state,savedAt:""})}catch{}if(o&&r){const u=o.savedAt?new Date(o.savedAt).getTime():0;return{success:!0,data:(r.savedAt?new Date(r.savedAt).getTime():0)>=u?r.state:o.state}}return o?{success:!0,data:o.state}:r?{success:!0,data:r.state}:{success:!0,data:null}}),l.ipcMain.handle("config-agent:start",async()=>{try{c=y();const r=await c.start(),o=new Set(p.loadPinStatus());if(o.size>0)for(const d of r.profiles)o.has(d.guid)&&(d.hasPIN=!0);const u=p.loadMappings();if(u&&u.length>0&&r.profiles.length>0){const d=r.profiles.map(f=>{const m=u.find(k=>k.netflixProfile.guid===f.guid);return m?{...m,netflixProfile:f}:{netflixProfile:f,familyMemberType:"unassigned"}});c.confirmMappingsPreload(d)}return g(c),{success:!0,data:c.getStatus()}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}),l.ipcMain.handle("config-agent:resume",async()=>{const r=p.loadWithTimestamp();let o=null;try{const m=await(s==null?void 0:s.getConfigState("netflix"));m!=null&&m.state&&(m!=null&&m.savedAt)?o={state:m.state,savedAt:m.savedAt}:m!=null&&m.state&&(o={state:m.state,savedAt:""})}catch{}let u=null;if(o&&r){const f=o.savedAt?new Date(o.savedAt).getTime():0;u=(r.savedAt?new Date(r.savedAt).getTime():0)>=f?r.state:o.state}else o?u=o.state:r&&(u=r.state);return u?(c=y(),{success:!0,data:c.restore(u)}):{success:!1,error:"No saved state"}}),l.ipcMain.handle("config-agent:confirm-mappings",(r,o)=>{if(!c)return{success:!1,error:"Agent not started"};const u=c.confirmMappings(o);return g(c),p.saveMappings(o),{success:!0,data:u}}),l.ipcMain.handle("config-agent:confirm-maturity",(r,o)=>{if(!c)return{success:!1,error:"Agent not started"};const u=c.confirmMaturity(o);return g(c),{success:!0,data:u}}),l.ipcMain.handle("config-agent:confirm-pins",(r,o,u)=>{if(!c)return{success:!1,error:"Agent not started"};const d=c.confirmPins(o,u);if(g(c),o.length>0){const f=new Set(p.loadPinStatus());for(const m of o)f.add(m);p.savePinStatus(Array.from(f))}return{success:!0,data:d}}),l.ipcMain.handle("config-agent:confirm-locks",(r,o)=>{if(!c)return{success:!1,error:"Agent not started"};const u=c.confirmLocks(o);return g(c),{success:!0,data:u}}),l.ipcMain.handle("config-agent:confirm-autoplay",(r,o)=>{if(!c)return{success:!1,error:"Agent not started"};const u=c.confirmAutoplay(o);return g(c),{success:!0,data:u}}),l.ipcMain.handle("config-agent:update-changes",(r,o)=>{if(!c)return{success:!1,error:"Agent not started"};const u=c.updateChanges(o);return g(c),{success:!0,data:u}}),l.ipcMain.handle("config-agent:apply",async()=>{if(!c)return{success:!1,error:"Agent not started"};try{const r=await c.applyChanges();return r.step==="complete"&&(p.saveMappings(r.mappings),p.clear(),s==null||s.deleteConfigState("netflix").catch(()=>{})),{success:!0,data:r}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}),l.ipcMain.handle("config-agent:cancel",()=>(c&&(c.cancel(),c=null),p.clear(),s==null||s.deleteConfigState("netflix").catch(()=>{}),{success:!0})),l.ipcMain.handle("config-agent:set-tab-inset",(r,o)=>(a.setTabInset({right:o}),{success:!0})),l.ipcMain.handle("netflix:load-mappings",()=>({success:!0,data:p.loadMappings()})),l.ipcMain.handle("profile-child-map:save",(r,o)=>(p.saveProfileChildMap(o),{success:!0})),l.ipcMain.handle("profile-child-map:load",()=>({success:!0,data:p.loadProfileChildMap()}));const P=new Ze(e.getDefaultProfilePath());l.ipcMain.handle("netflix:fetch-activity",async(r,o)=>{const u=n.getActiveTab();if(!u)return{success:!1,error:"No active tab — open Netflix first"};try{const d=await Xe(u.view,o);if(P.save(d),s){const f=p.loadProfileChildMap(),m=500;for(const k of d){const L=f==null?void 0:f.find(A=>A.profileGuid===k.profileGuid),b=(L==null?void 0:L.children)??[{childId:k.childId,childName:k.childName}];for(const A of b){const _=k.entries.map(E=>({child_id:A.childId,child_name:A.childName,platform:"netflix",title:E.title,series_title:E.seriesTitle||null,watched_date:de(E.date),netflix_profile:k.profileGuid}));for(let E=0;E<_.length;E+=m){const z=_.slice(E,E+m);s.syncViewingHistory(z).catch(Le=>{console.error(`[netflix-activity] Backend sync batch failed (${A.childName}):`,Le)})}}}}return{success:!0,data:d}}catch(d){return{success:!1,error:d instanceof Error?d.message:String(d)}}}),l.ipcMain.handle("netflix:load-activity",async()=>{try{const r=P.load();if(r&&r.length>0)return{success:!0,data:r};if(!s)return{success:!0,data:r};console.log("[netflix:load-activity] Local cache empty, fetching from server...");const o=await s.listFamilies();if(!o||o.length===0)return{success:!0,data:null};const u=o[0].id,d=await s.listChildren(u);if(!d||d.length===0)return{success:!0,data:null};const f=[];for(const m of d)try{const k=await s.getChildViewingHistory(m.id);if(!k||k.length===0)continue;const L=new Map;for(const b of k){const A=b.netflix_profile||"unknown";L.has(A)||L.set(A,[]),L.get(A).push(b)}for(const[b,A]of L){const _=A.map(E=>({title:E.title||"",date:mt(E.watched_date),seriesTitle:E.series_title||void 0}));f.push({childName:m.name,childId:m.id,profileName:b,profileGuid:b,avatarUrl:"",entries:_,fetchedAt:new Date().toISOString()})}}catch(k){console.error(`[netflix:load-activity] Failed to fetch history for child ${m.name}:`,k)}return f.length>0&&(P.save(f),console.log(`[netflix:load-activity] Fetched ${f.length} profiles from server, saved locally`)),{success:!0,data:f.length>0?f:null}}catch(r){return console.error("[netflix:load-activity] Server fallback failed:",r),{success:!0,data:null}}}),l.ipcMain.handle("netflix:resync-backend",async()=>{if(!s)return{success:!1,error:"Not authenticated"};const r=P.load();if(!r||r.length===0)return{success:!1,error:"No persisted activity"};const o=p.loadProfileChildMap(),u=500;let d=0,f=0;for(const m of r){const k=o==null?void 0:o.find(b=>b.profileGuid===m.profileGuid),L=(k==null?void 0:k.children)??[{childId:m.childId,childName:m.childName}];for(const b of L){const A=m.entries.map(_=>({child_id:b.childId,child_name:b.childName,platform:"netflix",title:_.title,series_title:_.seriesTitle||null,watched_date:de(_.date),netflix_profile:m.profileGuid}));console.log(`[resync] ${m.profileName} → ${b.childName}: ${A.length} entries`);for(let _=0;_<A.length;_+=u){const E=A.slice(_,_+u);try{await s.syncViewingHistory(E),d+=E.length}catch(z){console.error(`[resync] Batch failed (${b.childName}):`,z),f+=E.length}}}}return console.log(`[resync] Done: ${d} synced, ${f} skipped`),{success:!0,synced:d,skipped:f}});let x=null;function S(){if(!x){const r=a.getWindow(),o=T.join(__dirname,"..","preload","stealth-preload.js"),u=e.getDefaultProfilePath();x=new pt(r,o,u,s??null,a.getChromeView())}return x}l.ipcMain.handle("csm:enrich-titles",async(r,o)=>{try{return S().enrichTitles(o),{success:!0}}catch(u){return{success:!1,error:u instanceof Error?u.message:String(u)}}}),l.ipcMain.handle("csm:get-cached",async()=>{try{const o=S().getCachedReviews();if(o&&o.length>0)return{success:!0,data:o};if(!s)return{success:!0,data:o};console.log("[csm:get-cached] Local cache empty, fetching from server...");const u=await s.listFamilies();if(!u||u.length===0)return{success:!0,data:[]};const d=u[0].id,f=await s.getCSMReviewsByFamily(d);if(!f||f.length===0)return{success:!0,data:[]};const m=f.map(b=>({csmSlug:b.csm_slug||"",csmUrl:b.csm_url||"",csmMediaType:b.csm_media_type||"",title:b.title||"",ageRating:b.age_rating||"",ageRangeMin:b.age_range_min??0,qualityStars:b.quality_stars??0,isFamilyFriendly:b.is_family_friendly??!1,reviewSummary:b.review_summary||"",reviewBody:b.review_body||"",parentSummary:b.parent_summary||"",ageExplanation:b.age_explanation||"",descriptors:Array.isArray(b.descriptors_json)?b.descriptors_json.map(A=>({category:A.category||"",level:A.level||"",numericLevel:A.numericLevel??A.numeric_level??0,description:A.description||""})):[],positiveContent:Array.isArray(b.positive_content)?b.positive_content.map(A=>({category:A.category||"",description:A.description||""})):[],scrapedAt:b.created_at||new Date().toISOString()})),{CSMCache:k}=await Promise.resolve().then(()=>it),L=new k(e.getDefaultProfilePath());for(const b of m)L.set(b);return console.log(`[csm:get-cached] Fetched ${m.length} reviews from server, saved locally`),{success:!0,data:m}}catch(r){return console.error("[csm:get-cached] Server fallback failed:",r),{success:!0,data:[]}}}),l.ipcMain.handle("csm:get-cache-stats",()=>{try{return{success:!0,data:S().getCacheStats()}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}),l.ipcMain.handle("csm:get-shallow-reviews",()=>{try{return{success:!0,data:S().getShallowReviews()}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}),l.ipcMain.handle("csm:rescrape-shallow",()=>{try{const r=S(),{count:o,titles:u}=r.getShallowReviews();return o===0?{success:!0,count:0}:(r.enrichTitles(u,!0),{success:!0,count:o})}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}})}function mt(a){if(!a)return"";const e=a.split("-");if(e.length!==3)return a;const t=parseInt(e[0],10),i=parseInt(e[1],10),s=parseInt(e[2],10);if(isNaN(t)||isNaN(i)||isNaN(s))return a;const n=t%100;return`${i}/${s}/${n}`}function de(a){if(!a)return null;const e=a.split("/");if(e.length!==3)return null;const t=parseInt(e[0],10),i=parseInt(e[1],10);let s=parseInt(e[2],10);if(isNaN(t)||isNaN(i)||isNaN(s))return null;s<100&&(s+=2e3);const n=String(t).padStart(2,"0"),c=String(i).padStart(2,"0");return`${s}-${n}-${c}`}function wt(a){const e=a.trim();return/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(e)||/^(about|file|data|javascript):/.test(e)?e:/^[^\s]+\.[^\s]+$/.test(e)?`https://${e}`:`https://www.google.com/search?q=${encodeURIComponent(e)}`}function be(a){const e=l.app.name||"Phosra Browser",t=[{label:e,submenu:[{role:"about",label:`About ${e}`},{type:"separator"},{role:"services"},{type:"separator"},{role:"hide",label:`Hide ${e}`},{role:"hideOthers"},{role:"unhide"},{type:"separator"},{role:"quit",label:`Quit ${e}`}]},{label:"File",submenu:[{label:"New Tab",accelerator:"CmdOrCtrl+T",click:()=>{a.getTabManager().createTab()}},{label:"Close Tab",accelerator:"CmdOrCtrl+W",click:()=>{const i=a.getTabManager(),s=i.getActiveTab();s&&i.closeTab(s.id),i.getAllTabs().length===0&&a.getWindow().close()}},{label:"Close Window",accelerator:"CmdOrCtrl+Shift+W",click:()=>{a.getWindow().close()}}]},{label:"Edit",submenu:[{role:"undo"},{role:"redo"},{type:"separator"},{role:"cut"},{role:"copy"},{role:"paste"},{role:"selectAll"}]},{label:"View",submenu:[{label:"Reload",accelerator:"CmdOrCtrl+R",click:()=>{const i=a.getTabManager().getActiveTab();i&&i.view.webContents.reload()}},{label:"Force Reload",accelerator:"CmdOrCtrl+Shift+R",click:()=>{const i=a.getTabManager().getActiveTab();i&&i.view.webContents.reloadIgnoringCache()}},{label:"Toggle Developer Tools",accelerator:"CmdOrCtrl+Alt+I",click:()=>{const i=a.getTabManager().getActiveTab();i&&i.view.webContents.toggleDevTools()}},{type:"separator"},{label:"Zoom In",accelerator:"CmdOrCtrl+Plus",click:()=>{const i=a.getTabManager().getActiveTab();if(i){const s=i.view.webContents;s.setZoomLevel(s.getZoomLevel()+.5)}}},{label:"Zoom Out",accelerator:"CmdOrCtrl+-",click:()=>{const i=a.getTabManager().getActiveTab();if(i){const s=i.view.webContents;s.setZoomLevel(s.getZoomLevel()-.5)}}},{label:"Reset Zoom",accelerator:"CmdOrCtrl+0",click:()=>{const i=a.getTabManager().getActiveTab();i&&i.view.webContents.setZoomLevel(0)}},{type:"separator"},{role:"togglefullscreen"}]},{label:"Window",submenu:[{role:"minimize"},{role:"close"}]},{label:"Help",submenu:[{label:`${e} Help`,click:()=>{a.getTabManager().createTab("https://www.phosra.com")}}]}];return l.Menu.buildFromTemplate(t)}const yt=9222;function vt(){const a=l.app.commandLine.getSwitchValue("remote-debugging-port");if(a){const e=parseInt(a,10);if(!isNaN(e)&&e>0&&e<=65535)return e}return yt}const X=[{id:"netflix",displayName:"Netflix",loginUrls:["netflix.com/login"],selectors:{username:'input[name="userLoginId"], input[data-uia="login-field"]',password:'input[name="password"], input[data-uia="password-field"]',submit:'button[data-uia="login-submit-button"], button[type="submit"]'}},{id:"disneyplus",displayName:"Disney+",loginUrls:["disneyplus.com/login","disneyplus.com/identity"],selectors:{username:'input[type="email"], input[data-testid="email-input"]',password:'input[type="password"], input[data-testid="password-input"]'}},{id:"hulu",displayName:"Hulu",loginUrls:["auth.hulu.com","hulu.com/login"],selectors:{username:'input[type="email"], input[name="email"]',password:'input[type="password"], input[name="password"]'}},{id:"max",displayName:"Max",loginUrls:["max.com/login","max.com/sign-in"],selectors:{username:'input[type="email"], input[name="email"]',password:'input[type="password"], input[name="password"]'}},{id:"paramountplus",displayName:"Paramount+",loginUrls:["paramountplus.com/account/signin","paramountplus.com/login"],selectors:{username:'input[type="email"], input[name="email"]',password:'input[type="password"], input[name="password"]'}},{id:"youtube",displayName:"YouTube",loginUrls:["accounts.google.com/v3/signin","accounts.google.com/signin"],selectors:{username:'input[type="email"], input[name="identifier"]',password:'input[type="password"], input[name="Passwd"]'}},{id:"appletv",displayName:"Apple TV+",loginUrls:["idmsa.apple.com/appleauth","tv.apple.com/login"],selectors:{username:'input[type="text"]#account_name_text_field, input[id="appleId"]',password:'input[type="password"]#password_text_field, input[id="password"]'}},{id:"primevideo",displayName:"Amazon Prime Video",loginUrls:["amazon.com/ap/signin","amazon.com/ap/mfa","amazon.com/gp/video/profiles","primevideo.com/auth/signin"],selectors:{username:'input[name="email"], input[type="email"], input#ap_email',password:'input[name="password"], input[type="password"], input#ap_password',submit:'input#signInSubmit, input#continue, button#signInSubmit, button[type="submit"]'}}],Se=new Map(X.map(a=>[a.id,a])),bt={username:'input[type="email"], input[name="email"], input[name="username"], input[type="text"][autocomplete="username"]',password:'input[type="password"], input[name="password"]'};function he(a,e){const t=a.toLowerCase(),i=X.find(s=>s.loginUrls.some(n=>t.includes(n)));if(i)return i;if(e)return e.find(s=>s.loginUrls.some(n=>t.includes(n)))}function St(a){return Se.get(a)}function pe(a){return Se.has(a)}class Pe{constructor(e){h(this,"filePath");h(this,"credentials",new Map);this.filePath=T.join(e,"credentials.json"),this.load()}isAvailable(){return l.safeStorage.isEncryptionAvailable()}list(){const e=X.map(i=>{const s=this.credentials.get(i.id);return{serviceId:i.id,displayName:i.displayName,username:(s==null?void 0:s.username)??"",hasPassword:!!(s!=null&&s.encryptedPassword),updatedAt:(s==null?void 0:s.updatedAt)??"",isCustom:!1}}),t=[];for(const i of this.credentials.values())!pe(i.serviceId)&&i.customName&&t.push({serviceId:i.serviceId,displayName:i.customName,username:i.username,hasPassword:!!i.encryptedPassword,updatedAt:i.updatedAt,isCustom:!0,loginUrl:i.customLoginUrl});return[...e,...t]}save(e,t,i){if(!this.isAvailable())throw new Error("OS keychain encryption is not available");const s=St(e);if(!s)throw new Error(`Unknown service: ${e}`);const n=l.safeStorage.encryptString(i),c=new Date().toISOString(),p=this.credentials.get(e),y={serviceId:e,username:t,encryptedPassword:n.toString("base64"),createdAt:(p==null?void 0:p.createdAt)??c,updatedAt:c};return this.credentials.set(e,y),this.persist(),{serviceId:e,displayName:s.displayName,username:t,hasPassword:!0,updatedAt:c,isCustom:!1}}saveCustom(e,t,i,s,n){if(!this.isAvailable())throw new Error("OS keychain encryption is not available");const c=n??`custom-${Date.now()}`,p=l.safeStorage.encryptString(s),y=new Date().toISOString(),g=this.credentials.get(c),P={serviceId:c,username:i,encryptedPassword:p.toString("base64"),createdAt:(g==null?void 0:g.createdAt)??y,updatedAt:y,customName:e,customLoginUrl:t};return this.credentials.set(c,P),this.persist(),{serviceId:c,displayName:e,username:i,hasPassword:!0,updatedAt:y,isCustom:!0,loginUrl:t}}delete(e){const t=this.credentials.delete(e);return t&&this.persist(),t}getAutoFillData(e){const t=this.getCustomAsStreamingServices(),i=he(e,t);if(!i)return null;const s=this.credentials.get(i.id);if(!s||!s.encryptedPassword)return null;try{const n=Buffer.from(s.encryptedPassword,"base64"),c=l.safeStorage.decryptString(n);return{service:i,username:s.username,password:c}}catch{return console.error(`[CredentialManager] Failed to decrypt password for ${i.id}`),null}}hasCredentialForUrl(e){const t=this.getCustomAsStreamingServices(),i=he(e,t);if(!i)return null;const s=this.credentials.get(i.id);return!s||!s.encryptedPassword?null:{serviceId:i.id,displayName:i.displayName}}getCustomAsStreamingServices(){const e=[];for(const t of this.credentials.values())!pe(t.serviceId)&&t.customLoginUrl&&e.push({id:t.serviceId,displayName:t.customName??"Custom",loginUrls:[t.customLoginUrl],selectors:bt});return e}load(){try{if(!v.existsSync(this.filePath))return;const e=v.readFileSync(this.filePath,"utf-8"),t=JSON.parse(e);for(const i of t)this.credentials.set(i.serviceId,i)}catch{console.error("[CredentialManager] Failed to load credentials file")}}persist(){try{const e=T.dirname(this.filePath);v.existsSync(e)||v.mkdirSync(e,{recursive:!0});const t=JSON.stringify(Array.from(this.credentials.values()),null,2);v.writeFileSync(this.filePath,t,{encoding:"utf-8",mode:384})}catch(e){console.error("[CredentialManager] Failed to persist credentials:",e)}}}const Pt="project-live-2ba56535-d746-4f35-9d26-acfadd5e8c99",xt="secret-live-BVWsDsGndQ7Vefiellq3tOO2pBRdFdgLGE8=",Tt="https://api.stytch.com/v1/sessions/authenticate";class xe{constructor(e,t){h(this,"filePath");h(this,"session");h(this,"stored",null);h(this,"cachedJwt",null);h(this,"cachedJwtExpiry",0);this.filePath=T.join(e,"auth-token.json"),this.session=t,this.load()}isLoggedIn(){return this.stored?new Date(this.stored.expiresAt)>new Date:!1}getInfo(){return!this.stored||!this.isLoggedIn()?{email:"",isLoggedIn:!1,expiresAt:""}:{email:this.stored.email,isLoggedIn:!0,expiresAt:this.stored.expiresAt}}async getToken(){return!this.stored||!this.isLoggedIn()?null:this.cachedJwt&&Date.now()<this.cachedJwtExpiry-6e4?this.cachedJwt:this.refreshJwt()}storeSessionToken(e,t){if(!l.safeStorage.isEncryptionAvailable())return console.error("[AuthManager] safeStorage encryption not available"),!1;const i=l.safeStorage.encryptString(e);return this.stored={encryptedSessionToken:i.toString("base64"),email:t||"",expiresAt:new Date(Date.now()+10080*60*1e3).toISOString(),savedAt:new Date().toISOString()},this.cachedJwt=null,this.cachedJwtExpiry=0,this.persist(),console.log(`[AuthManager] Session token stored for ${t||"unknown user"}`),!0}storeToken(e){if(!l.safeStorage.isEncryptionAvailable())return console.error("[AuthManager] safeStorage encryption not available"),!1;const t=this.extractEmailFromJwt(e),i=l.safeStorage.encryptString(e);return this.stored={encryptedSessionToken:i.toString("base64"),email:t,expiresAt:new Date(Date.now()+300*1e3).toISOString(),savedAt:new Date().toISOString()},this.cachedJwt=e,this.cachedJwtExpiry=Date.now()+240*1e3,this.persist(),console.log(`[AuthManager] JWT stored for ${t||"unknown user"}`),!0}async captureTokenFromSession(){try{const e=await this.session.cookies.get({name:"stytch_session",domain:".phosra.com"});if(e.length>0)return this.storeSessionToken(e[0].value);const t=await this.session.cookies.get({name:"stytch_session",domain:"phosra.com"});if(t.length>0)return this.storeSessionToken(t[0].value);const i=await this.session.cookies.get({name:"stytch_session_jwt",domain:".phosra.com"});return i.length>0?this.storeToken(i[0].value):(console.log("[AuthManager] No Stytch cookies found"),!1)}catch(e){return console.error("[AuthManager] Failed to capture token:",e),!1}}logout(){this.stored=null,this.cachedJwt=null,this.cachedJwtExpiry=0;try{v.existsSync(this.filePath)&&v.unlinkSync(this.filePath)}catch(e){console.error("[AuthManager] Failed to delete auth file:",e)}}async refreshJwt(){var t,i,s,n,c,p,y,g;const e=this.getSessionToken();if(!e)return null;try{const P=Buffer.from(`${Pt}:${xt}`).toString("base64"),x=await l.net.fetch(Tt,{method:"POST",headers:{Authorization:`Basic ${P}`,"Content-Type":"application/json"},body:JSON.stringify({session_token:e})});if(!x.ok){const r=await x.text().catch(()=>"");return console.error(`[AuthManager] Stytch refresh failed: ${x.status} ${r}`),(x.status===401||x.status===404)&&this.logout(),null}const S=await x.json();if(this.cachedJwt=S.session_jwt,this.cachedJwtExpiry=Date.now()+240*1e3,S.session_token&&S.session_token!==e){const r=((s=(i=(t=S.user)==null?void 0:t.emails)==null?void 0:i[0])==null?void 0:s.email)||((n=this.stored)==null?void 0:n.email)||"";this.storeSessionToken(S.session_token,r)}return(y=(p=(c=S.user)==null?void 0:c.emails)==null?void 0:p[0])!=null&&y.email&&this.stored&&(this.stored.email=S.user.emails[0].email,this.persist()),(g=S.session)!=null&&g.expires_at&&this.stored&&(this.stored.expiresAt=S.session.expires_at,this.persist()),console.log("[AuthManager] JWT refreshed successfully"),this.cachedJwt}catch(P){return console.error("[AuthManager] Failed to refresh JWT:",P),null}}getSessionToken(){if(!this.stored)return null;try{const e=Buffer.from(this.stored.encryptedSessionToken,"base64");return l.safeStorage.decryptString(e)}catch{return console.error("[AuthManager] Failed to decrypt session token"),null}}extractEmailFromJwt(e){var t,i,s,n;try{const c=e.split(".");if(c.length<2)return"";const p=c[1].replace(/-/g,"+").replace(/_/g,"/"),y=JSON.parse(Buffer.from(p,"base64").toString("utf-8"));return y.email||y.sub||((n=(s=(i=(t=y["https://stytch.com/session"])==null?void 0:t.authentication_factors)==null?void 0:i[0])==null?void 0:s.email_factor)==null?void 0:n.email_address)||""}catch{return""}}load(){try{if(!v.existsSync(this.filePath))return;const e=v.readFileSync(this.filePath,"utf-8"),t=JSON.parse(e);if(t.encryptedToken&&!t.encryptedSessionToken){console.log("[AuthManager] Clearing stale v1 auth token — re-login required"),v.unlinkSync(this.filePath);return}this.stored=t}catch{console.error("[AuthManager] Failed to load auth file")}}persist(){try{const e=T.dirname(this.filePath);v.existsSync(e)||v.mkdirSync(e,{recursive:!0}),v.writeFileSync(this.filePath,JSON.stringify(this.stored,null,2),{encoding:"utf-8",mode:384})}catch(e){console.error("[AuthManager] Failed to persist auth:",e)}}}const H="https://phosra-api.fly.dev/api/v1";class Te{constructor(e){this.getToken=e}async quickSetup(e){return this.post("/setup/quick",e)}async listFamilies(){return this.get("/families")}async listChildren(e){return this.get(`/families/${e}/children`)}async getChild(e){return this.get(`/children/${e}`)}async listPolicies(e){return this.get(`/children/${e}/policies`)}async addChild(e,t,i){return this.post(`/families/${e}/children`,{name:t,birth_date:i})}async listMembers(e){return this.get(`/families/${e}/members`)}async addMember(e,t,i,s){return this.post(`/families/${e}/members`,{email:t,role:i,display_name:s||""})}async removeMember(e,t){return this.del(`/families/${e}/members/${t}`)}async updateChild(e,t){return this.put(`/children/${e}`,t)}async updateMember(e,t,i){return this.put(`/families/${e}/members/${t}`,i)}async syncViewingHistory(e){await this.post("/viewing-history/sync",{entries:e})}async syncCSMReviews(e){return this.post("/csm/reviews/bulk",{reviews:e})}async linkViewingHistoryCSM(){return this.post("/viewing-history/link-csm",{})}async getChildViewingHistory(e,t=5e3){return this.get(`/viewing-history/${e}?limit=${t}`)}async getCSMReviewsByFamily(e){return this.get(`/csm/reviews/by-family/${e}`)}async saveConfigState(e,t){await this.put(`/config-agent/state/${e}`,{state:t})}async getConfigState(e){try{return await this.get(`/config-agent/state/${e}`)}catch{return null}}async deleteConfigState(e){await this.del(`/config-agent/state/${e}`)}async get(e){const t=await this.getToken();if(!t)throw new Error("Not authenticated");const i=await l.net.fetch(`${H}${e}`,{method:"GET",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"}});if(!i.ok){const s=await i.text().catch(()=>"");throw new Error(`API ${i.status}: ${s||i.statusText}`)}return i.json()}async del(e){const t=await this.getToken();if(!t)throw new Error("Not authenticated");const i=await l.net.fetch(`${H}${e}`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"}});if(!i.ok){const s=await i.text().catch(()=>"");throw new Error(`API ${i.status}: ${s||i.statusText}`)}}async put(e,t){const i=await this.getToken();if(!i)throw new Error("Not authenticated");const s=await l.net.fetch(`${H}${e}`,{method:"PUT",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify(t)});if(!s.ok){const n=await s.text().catch(()=>"");throw new Error(`API ${s.status}: ${n||s.statusText}`)}return s.json()}async post(e,t){const i=await this.getToken();if(!i)throw new Error("Not authenticated");const s=await l.net.fetch(`${H}${e}`,{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify(t)});if(!s.ok){const n=await s.text().catch(()=>"");throw new Error(`API ${s.status}: ${n||s.statusText}`)}return s.json()}}const kt=Re();for(const a of kt){const e=a.indexOf("=");if(e>0){const t=a.substring(0,e),i=a.substring(e+1);l.app.commandLine.appendSwitch(t,i)}else l.app.commandLine.appendSwitch(a)}const fe=process.argv.find(a=>a.startsWith("--cdp-port=")),Ct=fe&&parseInt(fe.split("=")[1],10)||9222;l.app.commandLine.appendSwitch("remote-debugging-port",String(Ct));const At=process.argv.some(a=>a.startsWith("--agent-debug")),ge=process.argv.find(a=>a.startsWith("--agent-debug-port=")),Mt=ge&&parseInt(ge.split("=")[1],10)||9333;At&&We(Mt);l.protocol.registerSchemesAsPrivileged([{scheme:"phosra",privileges:{standard:!0,secure:!0,supportFetchAPI:!0,corsEnabled:!1}}]);l.app.setAsDefaultProtocolClient("phosra-browser");const ke=T.join(__dirname,"..","preload","chrome-ui-preload.js"),Ce=T.join(__dirname,"..","preload","stealth-preload.js"),Ae=T.join(__dirname,"..","preload","home-preload.js"),Me=T.join(__dirname,"..","preload","family-preload.js");let C=null,V=null,B=null,$=null,G=null;const Et="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";l.app.whenReady().then(()=>{l.session.defaultSession.setUserAgent(Et);const a=!!process.env.VITE_DEV_SERVER_URL,e=T.join(__dirname,".."),t=T.join(e,"home"),i=T.join(e,"family"),s=P=>{const x=new URL(P.url),S=x.hostname;if(a&&process.env.VITE_DEV_SERVER_URL){const u=process.env.VITE_DEV_SERVER_URL.replace(/\/$/,"");let d;const f=S==="family"?"family":"home";x.pathname==="/"||x.pathname===""?d=`/${f}/index.html`:x.pathname.startsWith("/@")||x.pathname.startsWith("/home/")||x.pathname.startsWith("/family/")||x.pathname.startsWith("/node_modules/")?d=x.pathname:d=`/${f}${x.pathname}`;const m=`${u}${d}`;return l.net.fetch(m)}const r=S==="family"?i:t;let o;if(x.pathname==="/"||x.pathname==="")o=T.join(r,"index.html");else{const u=T.normalize(x.pathname).replace(/^(\.\.[\/\\])+/,""),d=T.join(e,u);if(!d.startsWith(e))return new Response("Forbidden",{status:403});o=d}return l.net.fetch(`file://${o}`)};l.protocol.handle("phosra",s),V=new Ue;const n=V.getDefaultProfilePath(),c=T.basename(n),p=l.session.fromPartition(`persist:${c}`,{cache:!0});p.protocol.handle("phosra",s),p.webRequest.onBeforeSendHeaders({urls:["https://*.stytch.com/*","https://*.phosra.com/*","https://phosra.com/*"]},(P,x)=>{const S={...P.requestHeaders};!S.Origin&&!S.origin&&(S.Origin="https://www.phosra.com"),!S.Referer&&!S.referer&&(S.Referer="https://www.phosra.com/"),x({requestHeaders:S})}),B=new Pe(n),$=new xe(n,p),G=new Te(()=>$.getToken()),C=new ye(ke,Ce,Ae,Me,n),C.createWindow(),C.getTabManager().setCredentialManager(B),C.getTabManager().setAuthManager($),ve(C,V,B,$,G);const y=be(C);l.Menu.setApplicationMenu(y);const g=Ne();C.getTabManager().createTab(g),console.log("[Phosra Browser] Ready"),console.log(`[Phosra Browser] CDP port: ${vt()}`),console.log(`[Phosra Browser] Profile: ${n}`)});l.app.on("activate",()=>{if(C&&!C.getWindow().isDestroyed())C.getWindow().show();else if(V){const a=V.getDefaultProfilePath();B=new Pe(a);const e=T.basename(a),t=l.session.fromPartition(`persist:${e}`,{cache:!0});$=new xe(a,t),G=new Te(()=>$.getToken()),C=new ye(ke,Ce,Ae,Me,a),C.createWindow(),C.getTabManager().setCredentialManager(B),C.getTabManager().setAuthManager($),ve(C,V,B,$,G);const i=be(C);l.Menu.setApplicationMenu(i),C.getTabManager().createTab(Ne())}});l.app.on("window-all-closed",()=>{process.platform!=="darwin"&&l.app.quit()});l.app.on("open-url",(a,e)=>{a.preventDefault(),Ee(e)});const Nt=l.app.requestSingleInstanceLock();Nt?l.app.on("second-instance",(a,e)=>{const t=e.find(i=>i.startsWith("phosra-browser://"));if(t&&Ee(t),C&&!C.getWindow().isDestroyed()){const i=C.getWindow();i.isMinimized()&&i.restore(),i.focus()}}):l.app.quit();function Ee(a){try{const e=new URL(a);if(e.protocol!=="phosra-browser:"||!$)return;const t=e.searchParams.get("session_token"),i=e.searchParams.get("token"),s=e.searchParams.get("email")||void 0;if(t)$.storeSessionToken(t,s),console.log("[DeepLink] Session token received and stored");else if(i)$.storeToken(i),console.log("[DeepLink] Legacy JWT received and stored");else return;if(C){const n=C.getChromeView();n&&!n.webContents.isDestroyed()&&n.webContents.send("auth:status-changed",$.getInfo())}if(C&&!C.getWindow().isDestroyed()){const n=C.getWindow();n.isMinimized()&&n.restore(),n.focus()}}catch(e){console.error("[DeepLink] Failed to handle auth URL:",e)}}function Ne(){const a=process.argv.find(e=>e.startsWith("--url="));return a?a.split("=").slice(1).join("="):"phosra://home"}
