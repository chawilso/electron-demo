const electron = require('electron')
const Store = require('./store')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Hackathon
const crashReporter = electron.crashReporter
const globalShortcut = electron.globalShortcut

// Set up crash reporter
crashReporter.start({
  productName: 'Electron-ServiceDesk',
  companyName: 'Hackathon-Rocks',
  submitURL: "https://eae.sp.backtrace.io:6098/post?format=minidump&token=4ce974310113c1ec49c289029fd14592de9e3393ca1fb8e93e85d58bdc3e13ca",
  uploadToServer: true
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let dataStore

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:5000/ServiceDesk/#")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  dataStore = new Store({
    // We'll call our data file 'user-preferences'
    configName: 'test-data',
    defaults: {}
  });

  ipcMain.on('store-data', (event, arg) => {
    dataStore.set(arg.key, arg.value);
  });

  ipcMain.on('retrieve-data', (event, arg) => {
    let data = dataStore.get(arg.key);
    event.returnValue = data;
  });
  
  // Hackathon. Use a global shortcut to send an event to Capture screenshot
  globalShortcut.register('Ctrl+Alt+C', _ => {
    console.log('Received keyboard shortcut!')

    mainWindow.webContents.send('captureScreenEvent', app.getPath('pictures'))
  })  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Hackathon. Inject a process crash to verify crash reporting
ipcMain.on('injectCrashEvent', _ => {
  console.log('Crashing!')
  process.crash();
})
