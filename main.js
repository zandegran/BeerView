// Modules to control application life and create native browser window


const path = require('path')
const {ipcMain, app, Menu, Tray, BrowserWindow} = require('electron')
var fs = require('fs');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function getSettings() {
  return fs.readFile("config.json", 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message)
            return
        }
        // Change how to handle the file content
        var obj = JSON.parse(data)
        if (obj.devices) {
          console.log("Devices found");
        }
        else {
          alert("No devices in config")
        }
        return obj.devices
    });
}

function getContextMenu (tare) {
  var devices = getSettings()
  console.log(devices);
  if (tare) {
    const contextMenu = Menu.buildFromTemplate([{
        label: 'Remove',
        click: () => {
          event.sender.send('tray-removed')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Tare Keg1',
        click: () => {
        }
      },
      {
        label: 'Tare Keg2',
        click: () => {
        }
      }
      ])
      return contextMenu
  }
  else {
    const contextMenu = Menu.buildFromTemplate([{
      label: 'Remove',
      click: () => {
        event.sender.send('tray-removed')
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Stat Keg1'
    },
    {
      label: 'Stat Keg2'
    }
    ])
    return contextMenu
  }
}

let appIcon = null

ipcMain.on('put-in-tray', (event) => {
  const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'ss.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  console.log("Tray Created")


  appIcon.on('click', (event) => {
    console.log("tare: " + event.altKey) 
    appIcon.setContextMenu(getContextMenu(event.altKey))
  })
  
  appIcon.setToolTip('See Beer Status')

})

ipcMain.on('remove-tray', () => {
  appIcon.destroy()
})

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy()
})