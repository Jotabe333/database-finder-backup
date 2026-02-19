const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// Disable GPU acceleration for faster startup
app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 820,
    height: 620,
    minWidth: 720,
    minHeight: 520,
    icon: path.join(__dirname, '../dist/favicon.png'),
    autoHideMenuBar: true,
    resizable: true,
    show: false,
    backgroundColor: '#0b0e13', // Match dark theme --background: 222 22% 5%
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Show window only when content is fully rendered
  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Selecionar pasta de destino'
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
