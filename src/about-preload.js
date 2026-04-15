const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onVersion: (callback) => ipcRenderer.on('version', (event, version) => callback(version)),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});
