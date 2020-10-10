// Modules to control application life and create native browser window


const path = require('path')
const {ipcMain, app, Menu, MenuItem, Tray, BrowserWindow, net, ClientRequest} = require('electron')
var fs = require('fs');

app.dock.hide()

function createWindow () {
  
  loadIcon() 
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function format(s) {
  if (typeof s !== 'string') return ''
  s = s.replace(/([A-Z])/g, ' $1').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getTableFromJson(data) {
  var json = JSON.parse(data), key;
  var table = "<table>"
  for (key in json) {
    if (json[key] != null) {
      table += "<tr>"
      if (json.hasOwnProperty(key)) {
          table += "<td><strong>"+format(key)+"</strong></td>"
          table += "<td>"+ json[key] +"\t</td>"
          // console.log(key + " = " + json[key]);
      }
      table += "</tr>"
    }
  }    
  table += "</table>"
  return table
}


function showWindow(data) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    },
    frame: false
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('modal.html')

  var html = getFileContent('modal.html')
  html = html.replace("XXXXX", getTableFromJson(data))
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
  // mainWindow.loadFile('modal.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  loadIcon()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {}
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function getSettings() {
  var data = getFileContent("config.json")
  var obj = JSON.parse(data)
  if (obj.devices) {
    console.log("Devices found");
  }
  else {
    alert("No devices in config")
  }
  return obj.devices
}

function getFileContent(path){
  var data = fs.readFileSync(path, 'utf-8', (err, data) => {
          if(err){
              alert("An error ocurred reading the file :" + err.message)
              return
          }
      });
  return data;
}

function getContextMenu (opt) {
  var devices = getSettings()
  const contextMenu = new Menu()
  for (x in devices) {
    deviceJson = devices[x];
    const item = new MenuItem({label: (opt ? "Tare " : "") + deviceJson.name, 
      click: () => { 
        if(opt) {
          httpGet("http://"+deviceJson.host+"/"+deviceJson.opt-path, false)
        }
        else {
          httpGet("http://"+deviceJson.host+"/"+deviceJson.path, true)
        }
      }})
    contextMenu.append(item)
  }
  const separator = new MenuItem({type: 'separator'})
  contextMenu.append(separator)
  const reloadConfigItem = new MenuItem({label: 'Reload Config'})
  contextMenu.append(reloadConfigItem)
  // app.quit()
  return contextMenu
}

function httpGet(theUrl, displayOutput)
{
  const request = net.request(theUrl)
  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    // console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      // console.log(`BODY: ${chunk}`)
      if(displayOutput) {
        showWindow(chunk)
      }
    })
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()
}

let appIcon = null

function loadIcon() {
  const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'icon.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  console.log("Tray Created")


  appIcon.on('click', (event) => {
    console.log("tare: " + event.altKey) 
    appIcon.setContextMenu(getContextMenu(event.altKey))
  })
  
  appIcon.setToolTip('See Beer Status')
}

ipcMain.on('put-in-tray', (event) => {
loadIcon();
})

ipcMain.on('remove-tray', () => {
  appIcon.destroy()
})

app.on('window-all-closed', () => {
  //if (appIcon) appIcon.destroy()
})