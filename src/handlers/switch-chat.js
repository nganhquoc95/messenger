/**
 * Switches to the N-th chat in the chat list.
 * @param {Electron.BrowserWindow} win 
 * @param {number} index 0-indexed index of the chat to switch to
 */
const switchChat = (win, index) => {
    return win.webContents.executeJavaScript(`
        (function switchChat(index) {
            // Priority selectors for the chat list items
            const selectors = [
                '[role="grid"] [role="row"]',
                '[data-testid="mwthreadlist-item"]',
                '.x1n2onr6[role="link"]' // Common class-based selector for Messenger links
            ];
            
            let items = [];
            for (const selector of selectors) {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    items = Array.from(found);
                    break;
                }
            }

            if (items.length > index) {
                const target = items[index];
                
                // Try clicking the element itself
                target.click();
                
                // Also trigger a mouse event just in case
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                target.dispatchEvent(clickEvent);

                // If it has a link inside, click that too
                const link = target.querySelector('a') || (target.tagName === 'A' ? target : null);
                if (link) {
                    link.click();
                }
                
                return true;
            }
            return false;
        })(${index});
    `);
};

module.exports = { switchChat };
