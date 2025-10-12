// main.js
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let nextServerProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
    },
    icon: path.join(__dirname, 'assets/icon.png') // opcional
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, carga del servidor Next.js integrado
    mainWindow.loadURL('http://localhost:3000');
  }
}

function startNextServer() {
  return new Promise((resolve) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // En desarrollo, usa next dev
      nextServerProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });
    } else {
      // En producción, usa next start con el build ya realizado
      nextServerProcess = spawn('npm', ['run', 'start'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });
    }

    // Esperar a que el servidor esté listo
    setTimeout(resolve, isDev ? 8000 : 5000);
  });
}

app.whenReady().then(async () => {
  await startNextServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (nextServerProcess) {
    nextServerProcess.kill('SIGTERM');
  }
});

// Manejar cierre forzoso
process.on('SIGTERM', () => {
  app.quit();
});