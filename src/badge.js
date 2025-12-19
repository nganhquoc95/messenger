const { nativeImage } = require('electron');
const { createCanvas, Image } = require('canvas');

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
    const img = new Image();
    img.src = iconBuffer;
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(size.width - 10, 10, 5, 0, 2 * Math.PI);
    ctx.fill();
    const buffer = canvas.toBuffer('image/png');
    return nativeImage.createFromBuffer(buffer);
}

function updateBadge(app, win, tray, count) {
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

module.exports = { updateBadge };