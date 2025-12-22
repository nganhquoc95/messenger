const styleFacebook = (portalWin) => {
    portalWin.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
    portalWin.webContents.insertCSS(`
        [role="tablist"] {
            position: fixed!important;
            bottom: 0!important;
            z-index: 1!important;
        }
    `);
    // Force-enable text selection/copy on pages that disable it (Facebook mobile web)
    portalWin.webContents.insertCSS(`
        * {
            -webkit-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
        }
        html, body { -webkit-user-select: text !important; user-select: text !important; }
    `);
}

module.exports = styleFacebook;