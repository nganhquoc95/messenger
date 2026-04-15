const {
    app,
    BrowserWindow,
    nativeImage,
    Menu,
    MenuItem,
    Tray,
    session,
} = require('electron');
const path = require('path');
const { updateBadge } = require('./src/badge');
const { openFacebookHandler } = require('./src/handlers/open-facebook-handler');
const { getUnreadMessageCounter } = require('./src/handlers/get-unread-message-counter');
const styleMessages = require('./src/handlers/styles/messages');
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = false;

autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
});
autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
});
autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err);
});
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ")";
    console.log(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
});

let win;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
}

app.whenReady().then(() => {
    const splash = new BrowserWindow({
        width: 400,
        height: 500,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.png'))
    });
    splash.loadFile('splash.html');

    win = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false, // hide initially
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.png')),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            backgroundThrottling: false
        },
        session: session.defaultSession
    });
    // win.loadURL('https://www.messenger.com');
    win.loadURL('https://www.facebook.com/messages');
    win.webContents.on('did-finish-load', async () => {
        try {
            await styleMessages(win);
        } catch (err) {
            console.error('Failed to inject custom styles:', err);
        }

        if (splash && !splash.isDestroyed()) {
            splash.destroy();
            win.show();
        }

        // Check for updates
        autoUpdater.checkForUpdatesAndNotify();
    });

    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });

    const tray = new Tray(
        nativeImage.createFromPath(
            path.join(app.getAppPath(), 'assets/icon.png')
        ).resize({ width: 16, height: 16 })
    );
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

    win.webContents.setWindowOpenHandler(openFacebookHandler);

    win.webContents.on('will-navigate', (event, url) => {
        try {
            const parsedUrl = new URL(url);
            const domain = parsedUrl.hostname;

            // Handle Facebook's outward link redirection
            if (domain === 'l.facebook.com' || domain === 'lm.facebook.com') {
                const urlParam = parsedUrl.searchParams.get('u');
                if (urlParam) {
                    event.preventDefault();
                    require('electron').shell.openExternal(urlParam);
                    return;
                }
            }

            const isMessenger = domain.includes('messenger.com');
            const isFacebook = domain.includes('facebook.com');
            const path = parsedUrl.pathname;

            // Allow login, checkpoint, and messages paths to navigate within the app
            const isAllowedPath = path.startsWith('/messages') || path.startsWith('/login') || path.startsWith('/checkpoint') || path === '/';

            // Navigate externally if not a messenger/facebook domain, or if it's a facebook domain but not an allowed path
            if (!isMessenger && (!isFacebook || !isAllowedPath)) {
                event.preventDefault();
                require('electron').shell.openExternal(url);
            }
        } catch (err) {
            console.error('Error handling navigation:', err);
        }
    });

    win.webContents.on('page-title-updated', async (event, title) => {
        try {
            const unreadMessageCounter = await getUnreadMessageCounter(win);
            updateBadge(app, win, tray, unreadMessageCounter);
        } catch (err) {
            console.error('Failed to update unread message counter:', err);
        }
    });
});

app.on('second-instance', () => {
    if (win) {
        win.show();
        win.focus();
    }
});
