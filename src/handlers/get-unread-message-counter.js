const getUnreadMessageCounter = (portalWin) => {
    return portalWin.webContents.executeJavaScript(`
        (function getUnreadMessageCounter() {
            let unreadMessageCounter = 0;
            // First try to find by aria-label containing 'unread' on Messenger or Facebook
            const ariaLabelMatches = document.querySelector('[aria-label*="unread message"], [aria-label*="unread Message"]');
            if (ariaLabelMatches) {
                const match = ariaLabelMatches.getAttribute('aria-label').match(/(\\d+)/);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }
            
            // Then Try the original way, but more safely
            try {
                const accountControlsAndSettings = document.querySelectorAll('div[role="navigation"]')[1];
                if (accountControlsAndSettings) {
                    const messagesItem = accountControlsAndSettings.childNodes[1];
                    if (messagesItem) {
                        const messengerCounterEle = messagesItem.querySelector('div[role=button] span span, a span span:not(:empty)');
                        if (messengerCounterEle && messengerCounterEle.innerText) {
                            unreadMessageCounter = parseInt(messengerCounterEle.innerText, 10) || 0;
                        }
                    }
                }
            } catch (e) {
                console.error('Error getting unread count:', e);
            }
            
            // Fallback: check document.title
            if (unreadMessageCounter === 0 && document.title) {
                const titleMatch = document.title.match(/^\\((\\d+)\\)/);
                if (titleMatch) {
                    unreadMessageCounter = parseInt(titleMatch[1], 10) || 0;
                }
            }

            return unreadMessageCounter;
        })();
    `);
}

module.exports = { getUnreadMessageCounter };
