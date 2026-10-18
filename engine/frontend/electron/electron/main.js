import { app, BrowserWindow } from 'electron'

const DEV_URL = process.env.DESKTOP_DEV_URL || 'http://localhost:3000'

let mainWindow

async function waitForUrl(url, timeoutMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' })
      if (res.status < 500) return
    } catch {
      // Web stack is still booting
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

async function createWindow() {
  await waitForUrl(DEV_URL)

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  await mainWindow.loadURL(DEV_URL)

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow().catch((err) => {
    console.error('[Electron] Failed to open desktop window:', err)
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow().catch((err) => {
      console.error('[Electron] Failed to reopen desktop window:', err)
    })
  }
})
