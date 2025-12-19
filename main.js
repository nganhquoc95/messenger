const { app, BrowserWindow, nativeImage } = require('electron');
const { createCanvas } = require('canvas');

let win;

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
}

app.whenReady().then(() => {
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

    updateBadge(0); // Initialize badge

    win.webContents.on('page-title-updated', (event, title) => {
        const regex = /\(([\d+\+])\)/;
        const match = title.match(regex);
        const count = match ? parseInt(match[1]) : 0;
        updateBadge(count);
    });
});
