const styleFacebook = (portalWin) => {
    portalWin.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
    portalWin.webContents.insertCSS(`
        [data-comp-id="22222"] { display: none !important; } /* Hide Open App button */
        [data-tracking-duration-id="15"] { margin-top: 40px; }
        [role="tablist"] {
            height: 50px !important;
            position: fixed !important;
            bottom: 0 !important;
            z-index: 1 !important;
        }
        [role="tablist"] > [data-type="container"]:nth-last-child(1 of :not([role="tab"])) {
            position: fixed;
            top: 0;
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