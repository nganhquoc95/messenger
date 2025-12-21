const { app, BrowserWindow, nativeImage, Menu, MenuItem, Tray, session } = require('electron');
const path = require('path');
const { updateBadge } = require('./src/badge');
const { openFacebookHandler } = require('./src/handlers/open-facebook-handler');

let win;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
}

app.whenReady().then(() => {
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

    win.webContents.setWindowOpenHandler(openFacebookHandler);

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
