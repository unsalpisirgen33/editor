import fs from 'fs'
import * as path from 'node:path'

export default class PluginLoader {
  constructor(pluginsDir) {
    this.pluginsDir = pluginsDir
    this.plugins = new Map()
    this.loadedPlugins = []
    this.disabledPlugins = this.loadDisabledPlugins()
  }
  
  loadDisabledPlugins() {
    try {
      const configPath = path.join(this.pluginsDir, '.disabled-plugins.json')
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf-8')
        return new Set(JSON.parse(data))
      }
    } catch (error) {
      console.error('Error loading disabled plugins:', error)
    }
    return new Set()
  }
  
  saveDisabledPlugins() {
    try {
      const configPath = path.join(this.pluginsDir, '.disabled-plugins.json')
      fs.writeFileSync(configPath, JSON.stringify([...this.disabledPlugins]), 'utf-8')
    } catch (error) {
      console.error('Error saving disabled plugins:', error)
    }
  }

  loadPlugins() {
    if (!fs.existsSync(this.pluginsDir)) {
      console.log('Plugins directory not found, creating...')
      fs.mkdirSync(this.pluginsDir, { recursive: true })
      return []
    }

    const folders = fs.readdirSync(this.pluginsDir)
    this.loadedPlugins = []

    folders.forEach((folder) => {
      try {
        const pluginPath = path.join(this.pluginsDir, folder)
        const pluginJsonPath = path.join(pluginPath, 'plugin.json')

        // plugin.json kontrolü
        if (!fs.existsSync(pluginJsonPath)) {
          console.log(`Plugin ${folder} skipped: no plugin.json`)
          return
        }

        const pluginJsonContent = fs.readFileSync(pluginJsonPath, 'utf-8')
        const pluginConfig = JSON.parse(pluginJsonContent)
        
        const isEnabled = !this.disabledPlugins.has(pluginConfig.id)

        const mainFile = path.join(pluginPath, pluginConfig.main)

        if (!fs.existsSync(mainFile)) {
          console.error(`Plugin ${folder} error: main file not found`)
          return
        }

        // Plugin'i yükle (sadece aktifse)
        let plugin = null
        let menuItem = null
        
        if (isEnabled) {
          plugin = require(mainFile)
          const context = { pluginPath, config: pluginConfig }
          const result = plugin.activate?.(context)
          menuItem = result?.menuItem
        }

        // Plugin bilgilerini sakla
        this.plugins.set(pluginConfig.id, {
          config: pluginConfig,
          plugin: plugin,
          menuItem: menuItem,
          path: pluginPath,
          enabled: isEnabled
        })

        this.loadedPlugins.push({
          id: pluginConfig.id,
          name: pluginConfig.name,
          version: pluginConfig.version,
          description: pluginConfig.description,
          author: pluginConfig.author,
          icon: pluginConfig.icon,
          menuItem: menuItem,
          path: pluginPath,
          enabled: isEnabled
        })

        console.log(`✓ Plugin loaded: ${pluginConfig.name} (${isEnabled ? 'enabled' : 'disabled'})`)
      } catch (error) {
        console.error(`Error loading plugin ${folder}:`, error)
      }
    })

    return this.loadedPlugins
  }

  getPlugins() {
    return this.loadedPlugins
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId)
  }

  executePluginAction(pluginId, action) {
    const pluginData = this.plugins.get(pluginId)
    if (!pluginData) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }

    const plugin = pluginData.plugin

    // Eklenti penceresini aç
    if (action === 'open-window' && plugin.openWindow) {
      return plugin.openWindow()
    }

    // Özel action
    if (plugin[action]) {
      return plugin[action]()
    }

    throw new Error(`Action not found: ${action}`)
  }

  main() {
    return this.loadPlugins()
  }
  
  togglePlugin(pluginId, enabled) {
    if (enabled) {
      this.disabledPlugins.delete(pluginId)
    } else {
      this.disabledPlugins.add(pluginId)
    }
    this.saveDisabledPlugins()
    return true
  }
  
  uninstallPlugin(pluginId) {
    const pluginData = this.plugins.get(pluginId)
    if (!pluginData) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }
    
    // Plugin klasörünü sil
    const pluginPath = pluginData.path
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true })
    }
    
    // Disabled listesinden kaldır
    this.disabledPlugins.delete(pluginId)
    this.saveDisabledPlugins()
    
    // Memory'den kaldır
    this.plugins.delete(pluginId)
    this.loadedPlugins = this.loadedPlugins.filter(p => p.id !== pluginId)
    
    return true
  }
  
  installPlugin(sourcePath) {
    // Plugin klasörünü kopyala
    const folderName = path.basename(sourcePath)
    const targetPath = path.join(this.pluginsDir, folderName)
    
    if (fs.existsSync(targetPath)) {
      throw new Error('Plugin zaten yuklu')
    }
    
    // Klasörü kopyala
    this.copyFolderRecursive(sourcePath, targetPath)
    
    // Plugin'i yükle
    this.loadPlugins()
    
    return true
  }
  
  copyFolderRecursive(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true })
    }
    
    const files = fs.readdirSync(source)
    
    files.forEach(file => {
      const sourcePath = path.join(source, file)
      const targetPath = path.join(target, file)
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyFolderRecursive(sourcePath, targetPath)
      } else {
        fs.copyFileSync(sourcePath, targetPath)
      }
    })
  }
}
