const { app, BrowserWindow, nativeImage, Menu, MenuItem, Tray, session } = require('electron');
const path = require('path');
const { updateBadge } = require('./src/badge');

let win;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
}

app.whenReady().then(() => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

    win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.png')),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            backgroundThrottling: false
        },
        session: session.defaultSession
    });
    win.loadURL('https://www.messenger.com');

    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });

    const tray = new Tray(nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.png')).resize({ width: 16, height: 16 }));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: () => {
                win.show();
                win.focus();
            }
        },
        {
            label: 'Quit', click: () => {
                win.destroy();
                tray.destroy();
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        win.show();
        win.focus();
    });

    win.webContents.on('context-menu', (event, params) => {
        const menu = new Menu();
        if (params.selectionText) {
            menu.append(new MenuItem({ label: 'Copy', role: 'copy' }));
        }
        if (params.isEditable) {
            menu.append(new MenuItem({ label: 'Cut', role: 'cut' }));
            menu.append(new MenuItem({ label: 'Paste', role: 'paste' }));
            menu.append(new MenuItem({ label: 'Select All', role: 'selectall' }));
        }
        if (menu.items.length > 0) {
            menu.popup();
        }
    });

    updateBadge(app, win, tray, 0); // Initialize badge

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('facebook.com')) {
            const portalWin = new BrowserWindow({
                width: 450,
                height: 800,
                // parent: win,
                autoHideMenuBar: true,
                modal: false,
                webPreferences: {
                    contextIsolation: true,
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
                    })();
                `);
            });
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    win.webContents.on('page-title-updated', (event, title) => {
        const regex = /\((\d+)\+?\)/; // capture digits, optional trailing +
        const match = title.match(regex);
        const count = match ? parseInt(match[1], 10) : 0;
        updateBadge(app, win, tray, count);
    });
});

app.on('second-instance', () => {
    if (win) {
        win.show();
        win.focus();
    }
});
