import { app, BrowserWindow } from 'electron';
import path from 'path';
import './index.js';

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 750,
        title: 'YouTube to MP3 Converter',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});