// main.js
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path'; // ✅ Importa path

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  win.loadURL('http://localhost:3000');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  serverProcess = spawn('npx', ['serve', '-s', 'out', '-p', '3000'], {
    stdio: 'inherit',
    shell: true
  });

  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});