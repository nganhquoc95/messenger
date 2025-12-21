const { BrowserWindow, session } = require('electron');

const openFacebookHandler = ({ url }) => {
    if (!url.includes('.facebook.com')) {
        return { action: 'allow' };
    }

    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    const portalWin = new BrowserWindow({
        width: 450,
        height: 800,
        autoHideMenuBar: true,
        modal: false,
        webPreferences: {
            // run injected scripts in the page context so we can override
            // visibility/focus APIs used by Facebook to pause videos
            contextIsolation: false,
            backgroundThrottling: false
        },
        session: session.defaultSession
    });
    portalWin.webContents.setUserAgent(userAgent);
    portalWin.loadURL(url);
    portalWin.webContents.on('dom-ready', () => {
        portalWin.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
        portalWin.webContents.insertCSS(`
                    [role="tablist"] {
                        position: fixed!important;
                        bottom: 0!important;
                        z-index: 1!important;
                    }
                `);
        portalWin.webContents.executeJavaScript(`
                    (function(){
                        function hideOpenAppButtons(){
                            document.querySelectorAll('.fixed-container.bottom').forEach(el => {
                                try{
                                    const text = (el.innerText || el.textContent || '').toLowerCase();
                                    if(text.includes('open app')){
                                        el.classList.add('hidden');
                                        el.style.display = 'none';
                                        el.setAttribute('aria-hidden', 'true');
                                    }
                                }catch(e){/* ignore cross-origin or read errors */}
                            });
                        }
                        if(document.readyState === 'loading'){
                            document.addEventListener('DOMContentLoaded', hideOpenAppButtons);
                        } else {
                            hideOpenAppButtons();
                        }
                        try{
                            const observer = new MutationObserver(hideOpenAppButtons);
                            observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
                        }catch(e){/* ignore if MutationObserver unavailable */}

                        function updateMessengerTabToProfile() {
                            try {
                                const tabList = document.querySelector('[role="tablist"]');
                                if (!tabList) return;
                                const profileTab = tabList.querySelector('[role="tab"][aria-label*="messages"]');
                                try {
                                    const aria = profileTab.getAttribute('aria-label') || '';
                                    const replaced = aria.replace(/messages/gi, 'profile');
                                    profileTab.setAttribute('aria-label', replaced);
                                    profileTab.setAttribute('data-action-id', '32742'); // action ID for overview profile

                                    // ensure we don't attach handlers repeatedly
                                    if (!profileTab.dataset._profileHandlerAttached) {
                                        profileTab.dataset._profileHandlerAttached = '1';

                                        // Handle opening profile
                                        // when activated, perform actions 32742 then 32757
                                        const performSequentialActions = ()=>{
                                            try{
                                                const first = document.querySelector('[data-action-id="32742"]');
                                                if(first){ try{ first.click(); }catch(e){} }
                                                setTimeout(()=>{
                                                    try{
                                                        const second = document.querySelector('[data-action-id="32757"]');
                                                        if(second){ try{ second.click(); }catch(e){} }
                                                    }catch(e){}
                                                }, 250);
                                            }catch(e){}
                                        };

                                        profileTab.addEventListener('click', (ev)=>{
                                            try{ ev.preventDefault(); ev.stopPropagation(); }catch(e){}
                                            performSequentialActions();
                                        }, { capture: true });

                                        // support keyboard activation (Enter / Space)
                                        profileTab.addEventListener('keydown', (ev)=>{
                                            try{
                                                if(ev.key === 'Enter' || ev.key === ' '){
                                                    ev.preventDefault(); ev.stopPropagation();
                                                    performSequentialActions();
                                                }
                                            }catch(e){}
                                        }, { capture: true });
                                    }

                                    // update visible icon/text inside the tab if present
                                    const iconSpan = profileTab.querySelector('.native-text span, span.f3, .native-text');
                                    if (iconSpan) {
                                        // use a simple profile glyph
                                        if (iconSpan.tagName.toLowerCase() === 'span') {
                                            iconSpan.textContent = '👤';
                                        } else {
                                            iconSpan.innerText = '👤';
                                        }
                                    }
                                } catch (e) { }
                            } catch (e) { }
                        }

                        // run initially, on DOM mutations, and periodically to persist changes
                        try{ updateMessengerTabToProfile(); }catch(e){}
                        try{
                            const mo2 = new MutationObserver(()=>{ updateMessengerTabToProfile(); });
                            mo2.observe(document.documentElement || document.body, { childList: true, subtree: true });
                        }catch(e){}
                    })();
                `);
    });
    return { action: 'deny' };
}

module.exports = { openFacebookHandler };