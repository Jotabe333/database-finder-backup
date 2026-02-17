const { app, BrowserWindow } = require('electron');
const path = require('path');

// Disable GPU acceleration for faster startup
app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 780,
    height: 580,
    minWidth: 680,
    minHeight: 480,
    icon: path.join(__dirname, '../public/favicon.png'),
    autoHideMenuBar: true,
    resizable: true,
    show: false, // Don't show until ready — prevents white flash
    backgroundColor: '#101318', // Match dark theme background
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
