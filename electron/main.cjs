const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// Disable GPU acceleration for faster startup
app.disableHardwareAcceleration();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 620,
    minWidth: 720,
    minHeight: 520,
    icon: path.join(__dirname, '../dist/favicon.png'),
    autoHideMenuBar: true,
    resizable: true,
    show: false,
    backgroundColor: '#0b0e13',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Selecionar pasta de destino'
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

let runningProc = null;

ipcMain.handle('run-bat', async (_event, batContent) => {
  return new Promise((resolve) => {
    // Save .bat to temp file with CRLF line endings and Windows-1252 encoding
    const tmpDir = os.tmpdir();
    const batPath = path.join(tmpDir, `backup_${Date.now()}.bat`);
    const crlfContent = batContent.replace(/\n/g, '\r\n');
    fs.writeFileSync(batPath, crlfContent, { encoding: 'latin1' });

    let output = '';
    let hasError = false;

    const proc = spawn('cmd.exe', ['/c', batPath], {
      cwd: tmpDir,
      windowsHide: true
    });

    runningProc = proc;

    proc.stdout.on('data', (data) => {
      const text = data.toString('latin1');
      output += text;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('bat-output', text);
      }
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString('latin1');
      output += text;
      hasError = true;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('bat-output', text);
      }
    });

    proc.on('close', (code) => {
      runningProc = null;
      try { fs.unlinkSync(batPath); } catch {}

      const hadErrors = output.includes('[ERRO]') || output.includes('TEVE_ERRO');
      const exitError = code !== 0;

      resolve({
        success: !exitError && !hadErrors,
        output,
        exitCode: code,
        hadErrors: hadErrors || exitError
      });
    });

    proc.on('error', (err) => {
      runningProc = null;
      try { fs.unlinkSync(batPath); } catch {}
      resolve({
        success: false,
        output: `Erro ao executar: ${err.message}`,
        exitCode: -1,
        hadErrors: true
      });
    });
  });
});

ipcMain.handle('cancel-bat', async () => {
  if (runningProc) {
    runningProc.kill();
    runningProc = null;
    return true;
  }
  return false;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
