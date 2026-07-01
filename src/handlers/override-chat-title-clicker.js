/**
 * Override click on chat title to open conversation info
 * @param {Electron.BrowserWindow} win
 */
const overrideChatTitleClick = (win) => {
    return win.webContents.executeJavaScript(`
        (function() {
            if (window.__chatTitleOverrideInjected) {
                return true;
            }

            window.__chatTitleOverrideInjected = true;
            const headerSelector = '[data-pagelet="MWInboxDetail_MessageList_Header"]';

            const findTitleLink = (container) => {
                return container.querySelector('[role="link"]') || container.querySelector('a');
            };

            const findConversationInfoButton = (container) => {
                const buttons = container.querySelectorAll('[role="button"]');

                for (const button of buttons) {
                    const label = (button.getAttribute('aria-label') || '').toLowerCase();
                    const title = (button.getAttribute('title') || '').toLowerCase();

                    if (label.includes('info') || label.includes('details') || title.includes('info') || title.includes('details')) {
                        return button;
                    }
                }

                return container.querySelector('.x1c9tyrk[role="button"]') || buttons[0] || null;
            };

            const handleTitleClick = (event) => {
                const target = event.target && typeof event.target.closest === 'function'
                    ? event.target.closest('[role="link"], a')
                    : null;
                if (!target) {
                    return;
                }

                const header = target.closest(headerSelector);
                if (!header) {
                    return;
                }

                const titleLink = findTitleLink(header);
                if (!titleLink || (target !== titleLink && !titleLink.contains(target))) {
                    return;
                }

                const conversationInfoEl = findConversationInfoButton(header);
                if (!conversationInfoEl || typeof conversationInfoEl.click !== 'function') {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                conversationInfoEl.click();
            };

            document.addEventListener('mousedown', handleTitleClick, true);
            document.addEventListener('click', handleTitleClick, true);

            return true;
        })();
    `);
};

module.exports = { overrideChatTitleClick };
