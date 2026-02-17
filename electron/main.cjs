const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 780,
    height: 580,
    minWidth: 680,
    minHeight: 480,
    icon: path.join(__dirname, '../public/favicon.png'),
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
