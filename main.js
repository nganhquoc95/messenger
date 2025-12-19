const { app, BrowserWindow, nativeImage, Menu, MenuItem, Tray } = require('electron');
const { createCanvas } = require('canvas');

let win;
let tray;

function generateBadgeDataURL(count) {
    const canvas = createCanvas(16, 16);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(count.toString(), 8, 12);
    return canvas.toDataURL();
}

function generateTrayIcon(withBadge) {
    const icon = nativeImage.createFromPath('assets/icon.png');
    if (!withBadge) return icon;
    const size = icon.getSize();
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');
    const iconBuffer = icon.toPNG();
    const img = new (require('canvas').Image)();
    img.src = iconBuffer;
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(size.width - 10, 10, 5, 0, 2 * Math.PI);
    ctx.fill();
    const buffer = canvas.toBuffer('image/png');
    return nativeImage.createFromBuffer(buffer);
}

function updateBadge(count) {
    // macOS
    if (process.platform === 'darwin') {
        app.dock.setBadge(count > 0 ? String(count) : '');
    }
    // Windows: overlay icon (numeric icon must be generated as NativeImage)
    if (process.platform === 'win32') {
        if (count > 0) {
            const img = nativeImage.createFromDataURL(generateBadgeDataURL(count)); // bạn tạo icon nhỏ
            win.setOverlayIcon(img, `${count} unread`);
        } else {
            win.setOverlayIcon(null, '');
        }
    }
    // Linux: thử app.setBadgeCount hoặc tray fallback
    if (process.platform === 'linux') {
        app.setBadgeCount(count);
    }
    if (tray) {
        tray.setImage(generateTrayIcon(count > 0));
    }
}

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
        icon: nativeImage.createFromPath('assets/icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true
        }
    });
    win.loadURL('https://www.messenger.com');

    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });

    const tray = new Tray(nativeImage.createFromPath('assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => { win.show(); win.focus(); } },
        { label: 'Quit', click: () => { app.quit(); } }
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

    updateBadge(0); // Initialize badge

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('facebook.com')) {
            const portalWin = new BrowserWindow({
                width: 450,
                height: 800,
                parent: win,
                autoHideMenuBar: true,
                modal: false,
                webPreferences: {
                    contextIsolation: true
                }
            });
            portalWin.webContents.setUserAgent(userAgent);
            portalWin.loadURL(url);
            portalWin.webContents.on('dom-ready', () => {
                portalWin.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
            });
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    win.webContents.on('page-title-updated', (event, title) => {
        const regex = /\(([\d+\+])\)/;
        const match = title.match(regex);
        const count = match ? parseInt(match[1]) : 0;
        updateBadge(count);
    });
});

app.on('second-instance', () => {
    if (win) {
        win.show();
        win.focus();
    }
});
