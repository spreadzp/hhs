"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var PythonShell = require('python-shell').PythonShell;
var pathPyLib = process.cwd() + '/python/proxy/';
console.log('normalization : ' + pathPyLib);
var options = {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: pathPyLib,
    args: ""
};
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
function callPythonFile(fileName, param, responseName, eventItem) {
    options.args = param;
    PythonShell.run(fileName, options, function (err, results) {
        if (err)
            throw err;
        console.log('results :', results);
        eventItem.sender.send(responseName, results);
    });
}
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    if (serve) {
        electron_1.ipcMain.on('asynchronous-message', function (event, arg) {
            console.log(arg); // prints "ping"
            callPythonFile('rekey.py', "!!!!", 'asynchronous-reply', event);
            // event.sender.send('asynchronous-reply', results);
        });
        electron_1.ipcMain.on('get-keys-for-rekey', function (event, arg) {
            console.log(arg); // prints "ping"
            callPythonFile(arg, "!!!!", 'response-keys', event);
            // event.sender.send('asynchronous-reply', results);
        });
        electron_1.ipcMain.on('send-re-capsule', function (event, args) {
            console.log(args[0]); // prints "ping"
            console.log('hexCapsule :', args[1]);
            callPythonFile(args[0], args[1], 'response-capsule', event);
            // event.sender.send('asynchronous-reply', results);
        });
        electron_1.ipcMain.on('create-enc-capsule', function (event, publicBobKey) {
            console.log(publicBobKey); // prints "ping"
            event.sender.send('asynchronous-reply', publicBobKey);
        });
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
        win.webContents.openDevTools();
    }
    else {
        /*  PythonShell.run('rekey.py',options, function (err: any, results: any) {
           if (err) throw err;
           console.log('hello.py finished.');
           console.log('results', results);
         }); */
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    electron_1.ipcMain.on('synchronous-message', function (event, arg) {
        console.log(arg); // prints "ping"
        event.returnValue = 'pong';
    });
    /* if (serve) {
      win.webContents.openDevTools();
    } */
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map