import fs from 'fs'
import serve from 'electron-serve'
import { dialog, ipcMain, app } from 'electron'

import { createWindow } from './helpers'

const isProd: boolean = process.env.NODE_ENV === 'production'

if (isProd) {
   serve({ directory: 'app' })
} else {
   app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let _window
;(async () => {
   await app.whenReady()

   _window = createWindow('main', {
      width: 1000,
      height: 600,
   })

   if (isProd) {
      await _window.loadURL('app://./home.html')
   } else {
      const port = process.argv[2]
      await _window.loadURL(`http://localhost:${port}`)
   }
})()

app.on('window-all-closed', () => {
   app.quit()
})

ipcMain.handle('select-folder-window', () => {
   return new Promise((resolve, reject) => {
      dialog
         .showOpenDialog(_window, { properties: ['openDirectory'] })
         .then(({ filePaths: paths }) => {
            if (paths) {
               if (fs.existsSync(paths[0] + '/package.json')) {
                  resolve(paths[0])
               } else {
                  reject('NOT_VALID')
               }
            } else {
               reject('FAILED_TO_OPEN')
            }
         })
         .catch(error => {
            reject(error.message)
         })
   })
})
