// main.js (modo producción)
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 🔹 Carga desde la carpeta estática
  win.loadFile(path.join(import.meta.dirname, 'out', 'index.html'));

  // ✅ Abre DevTools (opcional, solo para depurar el build)
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});