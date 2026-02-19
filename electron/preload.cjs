const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  runBat: (batContent) => ipcRenderer.invoke('run-bat', batContent),
  cancelBat: () => ipcRenderer.invoke('cancel-bat'),
  onBatOutput: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('bat-output', handler);
    return () => ipcRenderer.removeListener('bat-output', handler);
  },
});
