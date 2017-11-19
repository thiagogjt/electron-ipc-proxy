import path from 'path';
import url from 'url';
import { app, ipcMain, BrowserWindow } from 'electron';
import { registerProxy, ProxyPropertyType } from '../src/server';

let lastBounds = null;

function createWindow(title) {
    const windowUrl = url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    });
    const newBounds = lastBounds ? { y: lastBounds.y + 20, x: lastBounds.x + 20 } : {};
    const window = new BrowserWindow(Object.assign({ title: title, width: 1000, height: 600 }, newBounds));
    window.loadURL(windowUrl);
    window.openDevTools();
    lastBounds = window.getBounds();
}

/* This is the service we are going to expose to renderer threads */
const service = {
    createWindow: createWindow,
    add: (num1, num2) => num1 + num2
}

const unregister = registerProxy(ipcMain, service, {
    channel: 'service',
    properties: {
        createWindow: ProxyPropertyType.Function,
        add: ProxyPropertyType.Function
    }
});

/* Hook up the app events */
app.on('ready', () => {  
    createWindow('main');
});

app.on('window-all-closed', () => {
    unregister();
    app.quit();
});