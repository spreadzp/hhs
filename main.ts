import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const { PythonShell } = require('python-shell');
const pathPyLib = process.cwd() + '/python/proxy/';
console.log('normalization : ' + pathPyLib);
const options = {
  mode: 'text',
  pythonPath: '/usr/bin/python3',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: pathPyLib,
  args: ''
};
let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function callPythonFile(fileName, param, responseName, eventItem) {
  options.args = param;
  PythonShell.run(fileName, options, function (err: any, results: any) {
    if (err) throw err;
    console.log('results :', results);
    eventItem.sender.send(responseName, results);
  });
}

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    ipcMain.on('asynchronous-message', (event, arg) => {
      callPythonFile('rekey.py', '', 'asynchronous-reply', event);
      // event.sender.send('asynchronous-reply', results);
    });

    ipcMain.on('get-keys-for-rekey', (event, arg) => {
      callPythonFile(arg, '', 'response-keys', event);
    });

    ipcMain.on('send-re-capsule', (event, args) => {
      console.log('hexCapsule :', args[1]);
      callPythonFile(args[0], args[1], 'response-capsule', event);
    });

    ipcMain.on('create-enc-capsule', (event, publicBobKey) => {
      console.log(publicBobKey); // prints "ping"
      event.sender.send('asynchronous-reply', publicBobKey);
    });

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });

    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  ipcMain.on('synchronous-message', (event, arg) => {
    event.returnValue = 'pong';
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
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
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
