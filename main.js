// Modules to control application life and create native browser window


const path = require('path')
const {ipcMain, app, Menu, MenuItem, Tray, BrowserWindow, net, ClientRequest} = require('electron')
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
  var data = fs.readFileSync("config.json", 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message)
            return
        }
    });
  var obj = JSON.parse(data)
if (obj.devices) {
          console.log("Devices found");
        }
        else {
          alert("No devices in config")
        }
  return obj.devices
}

function getContextMenu (tare) {
  var devices = getSettings()
  const contextMenu = new Menu()
  for (x in devices) {
    deviceJson = devices[x];
    const item = new MenuItem({label: (tare ? "Tare " : "") + deviceJson.name, 
      click: () => { 
        if(tare) {

        }
      }})
    contextMenu.append(item)
    console.log(httpGet("http://"+deviceJson.host+"/"+deviceJson.path, contextMenu));
  }
  const separator = new MenuItem({type: 'separator'})
  contextMenu.append(separator)
  const reloadConfigItem = new MenuItem({label: 'Reload Config'})
  contextMenu.append(reloadConfigItem)
  return contextMenu
  // if (tare) {
  //   const contextMenu = Menu.buildFromTemplate([{
  //       label: 'Remove',
  //       click: () => {
  //         event.sender.send('tray-removed')
  //       }
  //     },
  //     {
  //       type: 'separator'
  //     },
  //     {
  //       label: 'Tare Keg1',
  //       click: () => {
  //       }
  //     },
  //     {
  //       label: 'Tare Keg2',
  //       click: () => {
  //       }
  //     }
  //     ])
  //     return contextMenu
  // }
  // else {
  //   const contextMenu = Menu.buildFromTemplate([{
  //     label: 'Remove',
  //     click: () => {
  //       event.sender.send('tray-removed')
  //     }
  //   },
  //   {
  //     type: 'separator'
  //   },
  //   {
  //     label: 'Stat Keg1'
  //   },
  //   {
  //     label: 'Stat Keg2'
  //   }
  //   ])
  //   return contextMenu
  // }
}

function httpGet(theUrl, cm)
{
  // const request = net.request({
  //   method: 'GET',
  //   protocol: 'http:',
  //   hostname: '192.168.0.220',
  //   port: 80,
  //   path: '/getstatus'
  // })
  // request.on('response', (response) => {
  //   console.log(`STATUS: ${response.statusCode}`);
  //   response.on('error', (error) => {
  //     console.log(`ERROR: ${JSON.stringify(error)}`)
  //   })
  // })
  const request = net.request('http://192.168.0.220/getstatus')
  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
      return chunk
      const item = new MenuItem({label: chunk, 
      click: () => { 
        if(tare) {

        }
      }})
    cm.append(item)
    })
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()
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