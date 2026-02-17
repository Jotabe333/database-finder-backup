const { app, BrowserWindow } = require('electron');
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
      contextIsolation: true
    }
  });

  // Show window only when content is fully rendered
  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
