const styleMessages = (win) => {
    return Promise.all([
        win.webContents.insertCSS('::-webkit-scrollbar { display: none; }'),
        win.webContents.insertCSS(`
            body::-webkit-scrollbar {
                overflow: auto;
                -ms-overflow-style: none;
                scrollbar-width: none;
            }

            div[role="banner"] { display: none !important; }
            div[role="banner"] + div > div > div {
                top: 0 !important;
                min-height: 100%!important;
            }

            div[data-pagelet="MWInboxDetail"] > div[role="region"],
            div[data-pagelet="MWInboxDetail"] > div[role="region"] > div > div > div {
                max-height: 100vh !important;
            }

            div[data-pagelet="MWInboxDetail"] > div[role="region"] > div > div > div > div {
                max-height: calc(100vh - 2 * var(--messenger-card-spacing)) !important;
            }

            div[role="banner"] + div > div > div > div {
                margin-bottom: 0!important;
            }

            div[role="banner"] + div > div > div > div > div > div {
                max-height: 100vh!important;
            }

            div[data-pagelet="MWInboxDetail"] > [role="main"] {
                max-height: 100vh!important;
            }

            div[data-pagelet="MWInboxDetail"] > [role="main"] > div > div > div {
                max-height: 100vh!important;
            }

            div[data-pagelet="MWInboxDetail"] > [role="main"] > div > div > div > div {
                max-height: calc(100vh - 2*var(--messenger-card-spacing))!important;
            }
        `)
    ]);
}

module.exports = styleMessages;