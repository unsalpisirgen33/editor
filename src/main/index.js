import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PluginLoader from "./core/pluginLoader"
import ProjectCreator from "./core/projectCreator"
import os from 'os'
import { existsSync, mkdirSync } from 'fs'
import WebSocket from 'ws'


let mainWindow
const terminals = new Map()
let runningCommand = null // Çalışan komut process'i
let currentProjectPath = null // Açık proje yolu

// Plugin klasörü yolu - exe'nin yanında
const getPluginsPath = () => {
  if (is.dev) {
    // Development modunda proje klasöründeki plugins
    return join(__dirname, '../plugins')
  } else {
    // Production'da exe'nin yanındaki plugins klasörü
    const exePath = process.execPath
    const exeDir = join(exePath, '..')
    return join(exeDir, 'plugins')
  }
}

// Plugins klasörünü oluştur (yoksa)
const ensurePluginsFolder = () => {
  const pluginsPath = getPluginsPath()
  if (!existsSync(pluginsPath)) {
    mkdirSync(pluginsPath, { recursive: true })
    console.log('✓ Plugins klasörü oluşturuldu:', pluginsPath)
  }
  return pluginsPath
}

// node-pty'yi dinamik olarak yükle
let pty
try {
  pty = require('node-pty')
} catch (error) {
  console.warn('node-pty not available:', error.message)
}

function createWindow() {
  // Create the browser window.
    mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    frame:false,
  })



  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    
    // Console mesajlarını yakala - SADECE EMBEDDED BROWSER İÇİN DEĞİL
    // Ana window'un kendi console'u için listener EKLEME
    // Çünkü bu sonsuz döngüye sebep oluyor
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // WebSocket Server - Browser Extension için
  const wss = new WebSocket.Server({ port: 9999 })
  
  console.log('🌐 WebSocket server started on port 9999')
  
  wss.on('connection', (ws) => {
    console.log('✅ Browser extension connected')
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())
        
        // Ana pencereye gönder
        if (mainWindow && !mainWindow.isDestroyed()) {
          // %c format kodlarını ve style argümanlarını temizle
          let cleanMessage = msg.message || ''
          if (typeof cleanMessage === 'string') {
            cleanMessage = cleanMessage.replace(/%c/g, '').trim()
          }
          
          const payload = {
            type: msg.type || 'info',
            message: cleanMessage,
            source: msg.source || '',
            timestamp: msg.timestamp || new Date().toLocaleTimeString(),
            from: 'browser-extension'
          }
          
          mainWindow.webContents.send('browser-console', payload)
        }
      } catch (error) {
        console.error('❌ WebSocket message parse error:', error)
      }
    })
    
    ws.on('close', () => {
      console.log('❌ Browser extension disconnected')
    })
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })
  
  wss.on('error', (error) => {
    console.error('WebSocket Server error:', error)
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))


  ipcMain.on('minimize', () => {

    mainWindow.minimize()

  })

  ipcMain.on('maximize', () => {

    if (mainWindow.isMaximized())
      mainWindow.unmaximize()
    else
      mainWindow.maximize()
  })

  ipcMain.on('close', () => {

    mainWindow.close()

  })

  ipcMain.on('open-folder-in-explorer', (event, folderPath) => {
    shell.openPath(folderPath)
  })

  ipcMain.handle('isMaximized', () => {

    return mainWindow.isMaximized()

  })

  // Dosya işlemleri
  const { dialog } = require('electron')
  const fs = require('fs').promises
  const path = require('path')

  ipcMain.handle('open-file', async (event, defaultPath) => {
    const dialogOptions = {
      properties: ['openFile'],
      filters: [
        { name: 'Package JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
        { name: 'JavaScript', extensions: ['js', 'jsx', 'mjs'] },
        { name: 'TypeScript', extensions: ['ts', 'tsx'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'CSS', extensions: ['css', 'scss', 'sass'] }
      ]
    }
    
    // Eğer defaultPath verilmişse, o dizinde aç
    if (defaultPath) {
      const stats = await fs.stat(defaultPath).catch(() => null)
      if (stats && stats.isDirectory()) {
        // Klasör ise, package.json'ı default olarak göster
        dialogOptions.defaultPath = path.join(defaultPath, 'package.json')
      } else {
        dialogOptions.defaultPath = defaultPath
      }
    }
    
    const result = await dialog.showOpenDialog(mainWindow, dialogOptions)

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const content = await fs.readFile(filePath, 'utf-8')
      const fileName = path.basename(filePath)
      const ext = path.extname(filePath).slice(1)
      
      const languageMap = {
        js: 'javascript', jsx: 'javascript', mjs: 'javascript',
        ts: 'typescript', tsx: 'typescript',
        json: 'json',
        html: 'html', htm: 'html',
        css: 'css', scss: 'scss', sass: 'sass',
        md: 'markdown',
        py: 'python',
        java: 'java',
        cpp: 'cpp', c: 'c',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        xml: 'xml',
        yaml: 'yaml', yml: 'yaml'
      }

      return {
        path: filePath,
        name: fileName,
        content: content,
        language: languageMap[ext] || 'plaintext'
      }
    }
    return null
  })

  ipcMain.handle('save-file', async (event, { path: filePath, content }) => {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  })

  ipcMain.handle('save-file-as', async (event, { content }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'JavaScript', extensions: ['js'] },
        { name: 'TypeScript', extensions: ['ts'] },
        { name: 'JSON', extensions: ['json'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'CSS', extensions: ['css'] }
      ]
    })

    if (!result.canceled && result.filePath) {
      await fs.writeFile(result.filePath, content, 'utf-8')
      return { 
        success: true, 
        path: result.filePath,
        name: path.basename(result.filePath)
      }
    }
    return { success: false }
  })

  ipcMain.handle('read-file', async (event, filePath) => {
    // Path'i normalize et
    let cleanPath = filePath.replace(/\\/g, '/')
    
    // Çift drive letter düzelt (C:/C:/ -> C:/)
    if (cleanPath.match(/^[A-Z]:\/[A-Z]:\//)) {
      cleanPath = cleanPath.substring(3)
    }
    
    // Başta / varsa ve drive letter varsa / kaldır (/C:/ -> C:/)
    if (cleanPath.match(/^\/[A-Z]:\//)) {
      cleanPath = cleanPath.substring(1)
    }
    
    // Çift slash temizle
    cleanPath = cleanPath.replace(/\/\//g, '/')
    
    // Dosya uzantısı yoksa ekle
    if (!cleanPath.match(/\.(jsx?|tsx?|json|html|css|md|txt|py|java|c|cpp|go|rs|php|rb|xml|yaml|yml)$/)) {
      const extensions = ['.jsx', '.tsx', '.js', '.ts']
      for (const ext of extensions) {
        const testPath = cleanPath + ext
        try {
          await fs.access(testPath)
          cleanPath = testPath
          break
        } catch (e) {
          // Devam et
        }
      }
    }
    
    // Windows için backslash'e geri çevir (fs.readFile için)
    const fsPath = process.platform === 'win32' ? cleanPath.replace(/\//g, '\\') : cleanPath
    
    const content = await fs.readFile(fsPath, 'utf-8')
    return content
  })

  ipcMain.handle('open-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      currentProjectPath = result.filePaths[0] // Proje yolunu sakla
      return { filePaths: result.filePaths, canceled: false }
    }
    return { filePaths: [], canceled: true }
  })

  ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      const result = []

      for (const item of items) {
        let fullPath = path.join(dirPath, item.name)
        
        // Windows path'i normalize et - backslash'leri forward slash'e çevir
        fullPath = fullPath.replace(/\\/g, '/')
        
        // Çift drive letter varsa düzelt (C:/C:/ -> C:/)
        if (fullPath.match(/^[A-Z]:\/[A-Z]:\//)) {
          fullPath = fullPath.substring(3)
        }
        
        // Çift slash temizle
        fullPath = fullPath.replace(/\/\//g, '/')
        
        const stats = await fs.stat(fullPath)
        
        result.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          isFile: item.isFile(),
          size: stats.size,
          modified: stats.mtime
        })
      }

      // Klasörler önce, sonra dosyalar (alfabetik)
      result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

      return result
    } catch (error) {
      console.error('Read directory error:', error)
      return []
    }
  })

  ipcMain.handle('create-file', async (event, filePath) => {
    try {
      await fs.writeFile(filePath, '', 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('create-folder', async (event, folderPath) => {
    try {
      await fs.mkdir(folderPath, { recursive: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('delete-file', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath)
      if (stats.isDirectory()) {
        await fs.rm(filePath, { recursive: true, force: true })
      } else {
        await fs.unlink(filePath)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('get-stats', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath)
      return {
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        modified: stats.mtime
      }
    } catch (error) {
      return null
    }
  })

  // Dosya var mı kontrol et
  ipcMain.handle('file-exists', async (event, filePath) => {
    try {
      // Path'i normalize et
      let cleanPath = filePath.replace(/\\/g, '/')
      
      // Çift drive letter düzelt
      if (cleanPath.match(/^[A-Z]:\/[A-Z]:\//)) {
        cleanPath = cleanPath.substring(3)
      }
      
      // Başta / varsa ve drive letter varsa / kaldır
      if (cleanPath.match(/^\/[A-Z]:\//)) {
        cleanPath = cleanPath.substring(1)
      }
      
      // Çift slash temizle
      cleanPath = cleanPath.replace(/\/\//g, '/')
      
      // Windows için backslash'e geri çevir
      const fsPath = process.platform === 'win32' ? cleanPath.replace(/\//g, '\\') : cleanPath
      
      await fs.access(fsPath)
      return true
    } catch (error) {
      return false
    }
  })

  // Proje yolunu al
  ipcMain.handle('get-project-path', async () => {
    return currentProjectPath
  })

  // Komut çalıştır - gerçek zamanlı output
  ipcMain.handle('execute-command', async (event, command, cwd) => {
    return new Promise((resolve) => {
      const { spawn } = require('child_process')
      
      const options = {
        cwd: cwd || process.cwd(),
        shell: true,
        env: process.env
      }

      const childProcess = spawn(command, [], options)
      runningCommand = childProcess // Global'e kaydet
      
      let stdout = ''
      let stderr = ''

      // Stdout'u gerçek zamanlı gönder
      childProcess.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        
        // ANSI renk kodlarını temizle
        const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '')
        
        mainWindow.webContents.send('command-output', cleanText)
      })

      // Stderr'i gerçek zamanlı gönder
      childProcess.stderr.on('data', (data) => {
        const text = data.toString()
        stderr += text
        
        // ANSI renk kodlarını temizle
        const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '')
        
        mainWindow.webContents.send('command-output', cleanText)
      })

      // Hata durumu
      childProcess.on('error', (error) => {
        runningCommand = null
        resolve({
          success: false,
          stdout: stdout,
          stderr: stderr,
          error: error.message
        })
      })

      // İşlem bittiğinde
      childProcess.on('close', (code) => {
        runningCommand = null
        resolve({
          success: code === 0,
          stdout: stdout,
          stderr: stderr,
          error: code !== 0 ? `Process exited with code ${code}` : null,
          exitCode: code
        })
      })
    })
  })
  
  // Komutu durdur
  ipcMain.handle('stop-command', async () => {
    if (runningCommand) {
      try {
        if (process.platform === 'win32') {
          // Windows'ta tree kill kullan (child process'leri de öldürür)
          const { exec } = require('child_process')
          exec(`taskkill /pid ${runningCommand.pid} /T /F`, (error) => {
            if (error) {
              console.error('Error killing process:', error)
            }
          })
        } else {
          // Unix'te SIGTERM gönder
          runningCommand.kill('SIGTERM')
        }
        runningCommand = null
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
    return { success: false, error: 'No running command' }
  })

  // URL'yi tarayıcıda aç
  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Embedded browser aç - MEMORY LEAK FIX
  let embeddedBrowserWindow = null
  let consoleMessageHandler = null
  
  ipcMain.handle('open-embedded-browser', async (event, url) => {
    try {
      // Eğer zaten açıksa, URL'yi güncelle
      if (embeddedBrowserWindow && !embeddedBrowserWindow.isDestroyed()) {
        embeddedBrowserWindow.loadURL(url)
        embeddedBrowserWindow.focus()
        return { success: true }
      }

      // Yeni embedded browser penceresi oluştur
      embeddedBrowserWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Browser Preview',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          devTools: true
        }
      })

      embeddedBrowserWindow.loadURL(url)

      // Console handler'ı oluştur (sadece bir kez)
      consoleMessageHandler = (details) => {
        const { level, message, line, sourceId } = details
        
        const levelMap = [
          'info',    // 0
          'warning', // 1
          'error',   // 2
          'info'     // 3
        ]
        
        const type = levelMap[level] || 'info'
        
        // Sadece error ve warning gönder
        if (type !== 'error' && type !== 'warning') return
        
        const timestamp = new Date().toLocaleTimeString()
        
        // Console format kodlarını temizle
        const cleanMessage = message.replace(/%[csdifoxO]/g, '')
        
        // Ana pencereye gönder
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('browser-console', {
            type: type,
            message: cleanMessage,
            source: sourceId ? `${sourceId}:${line}` : '',
            timestamp: timestamp,
            from: 'embedded-browser'
          })
        }
      }

      // Event listener ekle
      embeddedBrowserWindow.webContents.on('console-message', consoleMessageHandler)

      // Pencere kapatıldığında CLEANUP
      embeddedBrowserWindow.on('closed', () => {
        // Event listener'ı temizle
        if (embeddedBrowserWindow && !embeddedBrowserWindow.isDestroyed()) {
          embeddedBrowserWindow.webContents.removeListener('console-message', consoleMessageHandler)
        }
        embeddedBrowserWindow = null
        consoleMessageHandler = null
      })

      return { success: true }
    } catch (error) {
      console.error('Embedded browser error:', error)
      return { success: false, error: error.message }
    }
  })

  // Configuration kaydetme/yükleme
  const getConfigPath = () => {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'run-configurations.json')
  }

  ipcMain.handle('save-configurations', async (event, configs) => {
    try {
      const configPath = getConfigPath()
      await fs.writeFile(configPath, JSON.stringify(configs, null, 2), 'utf-8')
      console.log('✅ Configurations saved to:', configPath)
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to save configurations:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('load-configurations', async () => {
    try {
      const configPath = getConfigPath()
      
      // Dosya yoksa boş array döndür
      const exists = await fs.access(configPath).then(() => true).catch(() => false)
      if (!exists) {
        console.log('No configuration file found, returning empty array')
        return { success: true, data: [] }
      }
      
      const content = await fs.readFile(configPath, 'utf-8')
      const configs = JSON.parse(content)
      console.log('✅ Configurations loaded from:', configPath)
      return { success: true, data: configs }
    } catch (error) {
      console.error('❌ Failed to load configurations:', error)
      return { success: false, error: error.message, data: [] }
    }
  })

  // Windows Registry işlemleri
  ipcMain.handle('registry-get', async (event, key, valueName) => {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Registry only available on Windows' }
    }

    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execPromise = promisify(exec)

    try {
      const command = `reg query "${key}" /v "${valueName}"`
      const { stdout } = await execPromise(command)
      
      // Parse registry output
      const lines = stdout.split('\n')
      for (const line of lines) {
        if (line.includes(valueName)) {
          const parts = line.trim().split(/\s+/)
          const value = parts.slice(2).join(' ')
          return { success: true, value: value }
        }
      }
      
      return { success: false, error: 'Value not found' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('registry-set', async (event, key, valueName, value, type = 'REG_SZ') => {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Registry only available on Windows' }
    }

    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execPromise = promisify(exec)

    try {
      const command = `reg add "${key}" /v "${valueName}" /t ${type} /d "${value}" /f`
      await execPromise(command)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('registry-delete', async (event, key, valueName) => {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Registry only available on Windows' }
    }

    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execPromise = promisify(exec)

    try {
      const command = `reg delete "${key}" /v "${valueName}" /f`
      await execPromise(command)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Terminal işlemleri
  ipcMain.handle('create-terminal', (event, projectPath) => {
    if (!pty) {
      throw new Error('node-pty is not available')
    }

    const ptyId = `pty-${Date.now()}`
    const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash'
    
    // Terminal başlangıç dizini: proje klasörü > exe klasörü > home
    let cwd
    if (projectPath) {
      // Proje klasörü varsa onu kullan
      cwd = projectPath
    } else if (!is.dev) {
      // Production'da exe'nin bulunduğu klasör
      const exePath = process.execPath
      cwd = join(exePath, '..')
    } else {
      // Development'ta home klasörü
      cwd = process.env.HOME || process.env.USERPROFILE || os.homedir()
    }
    
    console.log('Terminal starting in:', cwd)
    
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: cwd,
      env: process.env
    })

    terminals.set(ptyId, ptyProcess)

    ptyProcess.onData(data => {
      mainWindow.webContents.send(`terminal-data-${ptyId}`, data)
    })

    ptyProcess.onExit(() => {
      terminals.delete(ptyId)
    })

    return ptyId
  })

  ipcMain.on('write-to-terminal', (event, ptyId, data) => {
    const ptyProcess = terminals.get(ptyId)
    if (ptyProcess) {
      ptyProcess.write(data)
    }
  })

  ipcMain.on('resize-terminal', (event, ptyId, cols, rows) => {
    const ptyProcess = terminals.get(ptyId)
    if (ptyProcess) {
      ptyProcess.resize(cols, rows)
    }
  })

  ipcMain.on('close-terminal', (event, ptyId) => {
    const ptyProcess = terminals.get(ptyId)
    if (ptyProcess) {
      ptyProcess.kill()
      terminals.delete(ptyId)
    }
  })

  ipcMain.on('kill-terminal', (event, ptyId) => {
    const ptyProcess = terminals.get(ptyId)
    if (ptyProcess) {
      ptyProcess.kill('SIGKILL')
      terminals.delete(ptyId)
    }
  })

  // Search in files
  ipcMain.handle('search-in-files', async (event, options) => {
    const { query, path: searchPath, caseSensitive, wholeWord, useRegex } = options
    
    if (!query) return []

    try {
      const searchDir = searchPath || process.cwd()
      const results = []

      // Recursive dosya arama fonksiyonu
      async function searchInDirectory(dirPath) {
        try {
          const items = await fs.readdir(dirPath, { withFileTypes: true })

          for (const item of items) {
            const fullPath = path.join(dirPath, item.name)

            // Ignore patterns
            if (item.name === 'node_modules' || 
                item.name === '.git' || 
                item.name === 'dist' || 
                item.name === 'build' ||
                item.name.startsWith('.')) {
              continue
            }

            if (item.isDirectory()) {
              await searchInDirectory(fullPath)
            } else if (item.isFile()) {
              // Sadece text dosyalarını ara
              const ext = path.extname(item.name).toLowerCase()
              const textExtensions = [
                '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', 
                '.scss', '.sass', '.md', '.txt', '.py', '.java', '.c', 
                '.cpp', '.go', '.rs', '.php', '.rb', '.xml', '.yaml', 
                '.yml', '.sh', '.bat', '.ps1', '.vue', '.svelte'
              ]

              if (!textExtensions.includes(ext) && ext !== '') continue

              try {
                const content = await fs.readFile(fullPath, 'utf-8')
                const lines = content.split('\n')
                const matches = []

                let searchRegex
                if (useRegex) {
                  searchRegex = new RegExp(query, caseSensitive ? 'g' : 'gi')
                } else {
                  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                  const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
                  searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
                }

                lines.forEach((line, index) => {
                  if (searchRegex.test(line)) {
                    matches.push({
                      line: index + 1,
                      text: line.trim().substring(0, 200) // İlk 200 karakter
                    })
                  }
                })

                if (matches.length > 0) {
                  results.push({
                    path: fullPath,
                    name: item.name,
                    matches: matches
                  })
                }
              } catch (error) {
                // Dosya okuma hatası, devam et
              }
            }
          }
        } catch (error) {
          console.error('Search directory error:', error)
        }
      }

      await searchInDirectory(searchDir)
      return results

    } catch (error) {
      console.error('Search in files error:', error)
      return []
    }
  })

 // console.log("realPath > ",join(__dirname, '../plugins/index.js') , is.dev)


  createWindow()

  // Plugin sistemi - exe'nin yanındaki plugins klasörü
  const pluginsPath = ensurePluginsFolder()
  console.log('📁 Plugins klasörü:', pluginsPath)
  
  const pluginLoader = new PluginLoader(pluginsPath)
  const loadedPlugins = pluginLoader.main()

  console.log(`✓ ${loadedPlugins.length} plugin yüklendi`)

  // Plugin listesini al
  ipcMain.handle('get-plugins', () => {
    return loadedPlugins
  })

  // Plugin klasörü yolunu al
  ipcMain.handle('get-plugins-path', () => {
    return pluginsPath
  })

  // Plugin'leri yeniden yükle
  ipcMain.handle('reload-plugins', () => {
    const reloadedPlugins = pluginLoader.loadPlugins()
    return reloadedPlugins
  })

  // Plugin action çalıştır
  ipcMain.handle('execute-plugin-action', (event, pluginId, action) => {
    try {
      const result = pluginLoader.executePluginAction(pluginId, action)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Plugin penceresi aç
  ipcMain.handle('open-plugin-window', (event, pluginId) => {
    try {
      const windowData = pluginLoader.executePluginAction(pluginId, 'open-window')
      
      // Yeni pencere oluştur
      const pluginWindow = new BrowserWindow({
        width: windowData.width || 800,
        height: windowData.height || 600,
        title: windowData.title || 'Plugin Window',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      // HTML içeriğini yükle
      pluginWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #1e1e1e;
                color: #cccccc;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              }
            </style>
          </head>
          <body>
            ${windowData.content}
          </body>
        </html>
      `)}`)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
  
  // Plugin yükle
  ipcMain.handle('install-plugin', async (event, sourcePath) => {
    try {
      pluginLoader.installPlugin(sourcePath)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
  
  // Plugin kaldır
  ipcMain.handle('uninstall-plugin', async (event, pluginId) => {
    try {
      pluginLoader.uninstallPlugin(pluginId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
  
  // Plugin aktif/pasif yap
  ipcMain.handle('toggle-plugin', async (event, pluginId, enabled) => {
    try {
      pluginLoader.togglePlugin(pluginId, enabled)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
  
  // Plugin detaylarını al
  ipcMain.handle('get-plugin-details', async (event, pluginId) => {
    try {
      const plugin = pluginLoader.getPlugin(pluginId)
      return { success: true, data: plugin }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Proje oluşturma sistemi
  const projectCreator = new ProjectCreator()

  ipcMain.handle('create-project', async (event, options) => {
    try {
      const result = await projectCreator.createProject(options)
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  })


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Tüm terminalleri temizle
  terminals.forEach(ptyProcess => {
    try {
      ptyProcess.kill()
    } catch (error) {
      console.error('Error killing terminal:', error)
    }
  })
  terminals.clear()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
