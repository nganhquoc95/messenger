const { BrowserWindow, Menu, shell, session  } = require('electron');
const styleFacebook = require('./styles/style-facebook');
const copyPost = require('./facebook/copy-post');
const hideOpenAppButtons = require('./facebook/hide-open-app-buttons');
const replaceMessengerToProfile = require('./facebook/replace-messenger-to-profile');
const preventOpenPost = require('./facebook/prevent-open-post');

const openFacebookHandler = ({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };

    if (!url.includes('.facebook.com')) {
        shell.openExternal(url);
        return { action: 'deny' };
    }

    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    const portalWin = new BrowserWindow({
        width: 450,
        height: 800,
        autoHideMenuBar: true,
        modal: false,
        webPreferences: {
            // run injected scripts in the page context so we can override
            // visibility/focus APIs used by Facebook to pause videos
            contextIsolation: false,
            backgroundThrottling: false
        },
        session: session.defaultSession
    });
    portalWin.webContents.setUserAgent(userAgent);
    portalWin.loadURL(url);
    portalWin.webContents.on('dom-ready', () => {
        // Inject custom styles and handlers
        styleFacebook(portalWin);
                
        hideOpenAppButtons(portalWin);
        replaceMessengerToProfile(portalWin);
        preventOpenPost(portalWin);
    });
    // Provide a native context menu so users can select/copy content
    portalWin.webContents.on('context-menu', (event, params) => {
        try {
            const hasSelection = params && params.selectionText && params.selectionText.trim().length > 0;
            const editFlags = params && params.editFlags ? params.editFlags : {};

            const copyPostItem = {
                label: 'Copy post',
                click: () => { copyPost(portalWin, params); }
            };

            const template = [
                { role: 'selectall', label: 'Select all' },
                { type: 'separator' },
                { role: 'copy', label: 'Copy', enabled: hasSelection },
                copyPostItem,
                { type: 'separator' },
                { role: 'cut', label: 'Cut', enabled: !!editFlags.canCut },
                { role: 'paste', label: 'Paste', enabled: !!editFlags.canPaste }
            ];
            const menu = Menu.buildFromTemplate(template);
            menu.popup({ window: portalWin });
        } catch (e) { /* ignore context menu errors */ }
    });
    return { action: 'deny' };
}

module.exports = { openFacebookHandler };