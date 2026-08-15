import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Dosya işlemleri
  openFile: (defaultPath) => ipcRenderer.invoke('open-file', defaultPath),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  saveFileAs: (data) => ipcRenderer.invoke('save-file-as', data),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  
  // Dosya sistemi
  readDirectory: (path) => ipcRenderer.invoke('read-directory', path),
  createFile: (path) => ipcRenderer.invoke('create-file', path),
  createFolder: (path) => ipcRenderer.invoke('create-folder', path),
  deleteFile: (path) => ipcRenderer.invoke('delete-file', path),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  getStats: (path) => ipcRenderer.invoke('get-stats', path),
  fileExists: (path) => ipcRenderer.invoke('file-exists', path),
  getProjectPath: () => ipcRenderer.invoke('get-project-path'),
  executeCommand: (command, cwd) => ipcRenderer.invoke('execute-command', command, cwd),
  stopCommand: () => ipcRenderer.invoke('stop-command'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openEmbeddedBrowser: (url) => ipcRenderer.invoke('open-embedded-browser', url),
  onBrowserConsole: (callback) => {
    const handler = (event, data) => {
      try {
        callback(data)
      } catch (error) {
        console.error('Browser console callback error:', error)
      }
    }
    ipcRenderer.on('browser-console', handler)
  },
  
  // Configuration yönetimi
  saveConfigurations: (configs) => ipcRenderer.invoke('save-configurations', configs),
  loadConfigurations: () => ipcRenderer.invoke('load-configurations'),
  
  // Registry
  registryGet: (key, valueName) => ipcRenderer.invoke('registry-get', key, valueName),
  registrySet: (key, valueName, value, type) => ipcRenderer.invoke('registry-set', key, valueName, value, type),
  registryDelete: (key, valueName) => ipcRenderer.invoke('registry-delete', key, valueName),
  
  // Terminal
  createTerminal: (projectPath) => ipcRenderer.invoke('create-terminal', projectPath),
  writeToTerminal: (ptyId, data) => ipcRenderer.send('write-to-terminal', ptyId, data),
  onTerminalData: (ptyId, callback) => {
    const channel = `terminal-data-${ptyId}`
    ipcRenderer.on(channel, (event, data) => callback(data))
  },
  onCommandOutput: (callback) => {
    ipcRenderer.on('command-output', (event, data) => callback(data))
  },
  onConsoleMessage: (callback) => {
    const handler = (event, data) => {
      try {
        callback(data)
      } catch (error) {
        console.error('Console message callback error:', error)
      }
    }
    ipcRenderer.on('console-message', handler)
  },
  resizeTerminal: (ptyId, cols, rows) => ipcRenderer.send('resize-terminal', ptyId, cols, rows),
  closeTerminal: (ptyId) => ipcRenderer.send('close-terminal', ptyId),
  killTerminal: (ptyId) => ipcRenderer.send('kill-terminal', ptyId),
  
  // Search
  searchInFiles: (options) => ipcRenderer.invoke('search-in-files', options),
  
  // Plugins
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  getPluginsPath: () => ipcRenderer.invoke('get-plugins-path'),
  reloadPlugins: () => ipcRenderer.invoke('reload-plugins'),
  executePluginAction: (pluginId, action) => ipcRenderer.invoke('execute-plugin-action', pluginId, action),
  openPluginWindow: (pluginId) => ipcRenderer.invoke('open-plugin-window', pluginId),
  installPlugin: (pluginPath) => ipcRenderer.invoke('install-plugin', pluginPath),
  uninstallPlugin: (pluginId) => ipcRenderer.invoke('uninstall-plugin', pluginId),
  togglePlugin: (pluginId, enabled) => ipcRenderer.invoke('toggle-plugin', pluginId, enabled),
  getPluginDetails: (pluginId) => ipcRenderer.invoke('get-plugin-details', pluginId),
  
  // Project Creator
  createProject: (options) => ipcRenderer.invoke('create-project', options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
