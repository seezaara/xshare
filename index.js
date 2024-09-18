var { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const electron = require('electron')
function createWindow() {

    const win = new BrowserWindow({
        minWidth: 360,
        minHeight: 480,
        webPreferences: {
            preload: __dirname + '/preload.js',
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: !__dirname.includes("app.asar"),
        },
        autoHideMenuBar: true,
        frame: false,
    })

    win.loadFile(__dirname + '/www/index.html')
    ev(ipcMain, win, electron)

    trayvar = new Tray(__dirname + '/www/icon.ico')
    var contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', click: function () { app.isQuiting = true; app.quit(); } }
    ]);
    trayvar.on('click', function () { win.show(); });
    trayvar.setContextMenu(contextMenu)
    win.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            win.hide();
        }
    });
    app.on('second-instance', (e, s) => {
        if (win)
            win.show()
    })
}

// if (!app.requestSingleInstanceLock()) {
//     return app.quit()
// }


// close all program when window closed
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});
// for Boost animation
app.disableHardwareAcceleration();

app.whenReady().then(createWindow)

function winev(win) {
    win.on('enter-full-screen', function () { return win.webContents.send('enter-full-screen') })
    win.on('leave-full-screen', function () { return win.webContents.send('leave-full-screen') })
    win.on('maximize', function () { return win.webContents.send('maximize') })
    win.on('unmaximize', function () { return win.webContents.send('unmaximize') })
}
function ev(ipcMain, win, electron) {
    winev(win)
    ipcMain.handle('isMaximized', function (e) { return e.sender.getOwnerBrowserWindow().isMaximized() })
    ipcMain.handle('minimize', function (e) { return e.sender.getOwnerBrowserWindow().minimize() })
    ipcMain.handle('unmaximize', function (e) { return e.sender.getOwnerBrowserWindow().unmaximize() })
    ipcMain.handle('maximize', function (e) { return e.sender.getOwnerBrowserWindow().maximize() })
    ipcMain.handle('close', function (e) { return e.sender.getOwnerBrowserWindow().close() })
    ipcMain.handle('version', function (e) { return app.getVersion() })

    ipcMain.handle('desktopCapturerSources', function (e, a) { return electron.desktopCapturer.getSources(a) })
    ipcMain.handle('showOpenDialog', function (e, a) { return electron.dialog.showOpenDialog(a) })
    // ipcMain.handle('BrowserWindow', function (e, a) {
    //     a = {
    //         ...{

    //             minWidth: 360,
    //             minHeight: 480,
    //             webPreferences: {
    //                 preload: __dirname + '/preload.js',
    //                 nodeIntegration: true,
    //                 contextIsolation: false,
    //                 enableRemoteModule: true,
    //                 devTools: !__dirname.includes("app.asar"),
    //             },
    //             autoHideMenuBar: true,
    //             frame: false,
    //         },
    //         ...a
    //     }
    //     const win = new electron.BrowserWindow(a);

    //     win.loadFile(__dirname + a.curl)
    //     winev(win) 
    // })

}