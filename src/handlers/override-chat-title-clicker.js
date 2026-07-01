/**
 * Override click on chat title to open conversation info
 * @param {Electron.BrowserWindow} win
 */
const overrideChatTitleClick = (win) => {
    return win.webContents.executeJavaScript(`
        (function() {
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

            const attachOverride = () => {
                const header = document.querySelector(headerSelector);
                if (!header) {
                    return false;
                }

                const titleEl = findTitleLink(header);
                const conversationInfoEl = findConversationInfoButton(header);

                if (!titleEl || !conversationInfoEl) {
                    return false;
                }

                if (titleEl.dataset.chatTitleOverrideBound === 'true') {
                    return true;
                }

                titleEl.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (conversationInfoEl && typeof conversationInfoEl.click === 'function') {
                        conversationInfoEl.click();
                    }
                }, true);

                titleEl.dataset.chatTitleOverrideBound = 'true';
                return true;
            };

            if (attachOverride()) {
                return true;
            }

            const observer = new MutationObserver(() => {
                if (attachOverride()) {
                    observer.disconnect();
                }
            });

            const target = document.body || document.documentElement;
            if (target) {
                observer.observe(target, { childList: true, subtree: true });
            }

            setTimeout(() => {
                observer.disconnect();
            }, 10000);

            return true;
        })();
    `);
};

module.exports = { overrideChatTitleClick };
