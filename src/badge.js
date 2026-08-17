const { nativeImage } = require('electron');
const path = require('path');
const { Canvas, Image } = require('skia-canvas');

function generateBadgeDataURL(count) {
    const canvas = new Canvas(16, 16);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    
    const display = count > 9 ? '9+' : String(count);
    ctx.font = '10px Sans-Serif';
    ctx.textAlign = 'center';
    ctx.fillText(display, 8, 12);

    // Sử dụng toDataURLSync để trả về chuỗi dataURL ngay lập tức
    return canvas.toDataURLSync('png');
}

async function generateTrayIcon(app, withBadge) {
    const icon = nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.png'));
    const canvas = new Canvas(16, 16);
    const ctx = canvas.getContext('2d');
    
    // Nạp ảnh bất đồng bộ đúng cách trong skia-canvas
    const img = new Image();
    const iconBuffer = icon.toPNG();
    
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = iconBuffer;
    });

    ctx.drawImage(img, 0, 0, 16, 16);

    if (withBadge) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(16 - 4, 4, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Xuất buffer dạng async và chuyển sang Node.js Buffer
    const arrayBuffer = await canvas.toBuffer('png');
    const buffer = Buffer.from(arrayBuffer);

    return nativeImage.createFromBuffer(buffer);
}

async function updateBadge(app, win, tray, count) {
    // macOS
    if (process.platform === 'darwin') {
        app.dock.setBadge(count > 0 ? String(count) : '');
    }

    // Windows
    if (process.platform === 'win32') {
        if (count > 0) {
            const img = nativeImage.createFromDataURL(generateBadgeDataURL(count));
            win.setOverlayIcon(img, `${count} unread`);
        } else {
            win.setOverlayIcon(null, '');
        }
    }

    // Linux
    if (process.platform === 'linux') {
        app.setBadgeCount(count);
    }

    // Tray Icon
    if (tray) {
        try {
            const trayImg = await generateTrayIcon(app, count > 0);
            tray.setImage(trayImg);
        } catch (err) {
            console.error('Failed to generate tray icon:', err);
        }
    }
}

module.exports = { updateBadge };