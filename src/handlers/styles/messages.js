const styleMessages = (win) => {
    win.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
    win.webContents.insertCSS(`
        div[role="banner"] { display: none !important; }
        div[role="banner"] + div > div > div {
            top: 0;
            min-height: 100vh;
        }

        div[role="banner"] + div > div > div > div {
            margin-bottom: 0;
        }

        div[role="banner"] + div > div > div > div > div {
            min-height: 100vh;
        }

        div[data-pagelet="MWInboxDetail"] > [role="main"] {
            max-height: 100vh;
        }

        div[data-pagelet="MWInboxDetail"] > [role="main"] > div > div > div {
            max-height: 100vh;
        }

        div[data-pagelet="MWInboxDetail"] > [role="main"] > div > div > div > div {
            max-height: calc(100vh - 2*var(--messenger-card-spacing));
        }
    `);
}

module.exports = styleMessages;