const getUnreadMessageCounter = (portalWin) => {
    portalWin.webContents.executeJavaScript(`
        (function getUnreadMessageCounter() {
            const accountControlsAndSettings = document.querySelectorAll('div[role="navigation"]')[1];
            const messagesItem = accountControlsAndSettings.childNodes[1];
            const messengerCounterEle = messagesItem.querySelector('div[role=button] span span');
            let unreadMessageCounter = 0;
            if (messengerCounterEle) {
                unreadMessageCounter = parseInt(messengerCounterEle.innerText, 10) || 0;
            }
            return unreadMessageCounter;
        })();
    `);
}

module.exports = { getUnreadMessageCounter };
