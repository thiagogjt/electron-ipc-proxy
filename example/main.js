import path from 'path';
import url from 'url';
import { app, BrowserWindow } from 'electron';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { registerProxy, ProxyPropertyType } from '../';

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
    add: (num1, num2) => num1 + num2,
    time: interval(10).pipe(map(() => new Date())),
    respondAfter: (millis) => new Promise(resolve => setTimeout(resolve, millis))
}

const unregister = registerProxy(service, {
    channel: 'service',
    properties: {
        createWindow: ProxyPropertyType.Function,
        add: ProxyPropertyType.Function,
        time: ProxyPropertyType.Value$,
        respondAfter: ProxyPropertyType.Function
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
