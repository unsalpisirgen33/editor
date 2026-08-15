import {
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/solid'
import { useState, useRef, useEffect } from "react"

const RUN_STATE = {
  STOPPED: "stopped",
  RUNNING: "running"
}

export default function TopBarRunControls() {
  const [runState, setRunState] = useState(RUN_STATE.STOPPED)
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configurations, setConfigurations] = useState([])
  const [editingConfig, setEditingConfig] = useState(null)
  const [availableScripts, setAvailableScripts] = useState([])
  const [projectPath, setProjectPath] = useState(null)
  const dropdownRef = useRef()
  const runningProcessRef = useRef(null) // Çalışan process'i takip et

  // JSON dosyasından configuration'ları yükle
  useEffect(() => {
    const loadConfigsFromFile = async () => {
      try {
        const result = await window.api?.loadConfigurations?.()
        
        if (result?.success && result?.data) {
          setConfigurations(result.data)
        }
      } catch (error) {
        console.error('Error loading configurations:', error)
      }
    }
    
    loadConfigsFromFile()
  }, [])

  // Configuration'ları JSON dosyasına kaydet
  const saveConfigurationsToFile = async (configs) => {
    try {
      const manualConfigs = configs.filter(c => !c.auto)
      await window.api?.saveConfigurations?.(manualConfigs)
    } catch (error) {
      console.error('Error saving configurations:', error)
    }
  }

  // Proje açıldığında package.json veya composer.json'ı kontrol et
  useEffect(() => {
    const checkProjectFiles = async () => {
      // Global proje yolunu al
      if (window.getCurrentProjectPath) {
        const path = window.getCurrentProjectPath()
        if (path) {
          setProjectPath(path)
          // Otomatik configuration yüklemeyi kaldırdık
          // await loadProjectConfigurations(path)
        }
      }
    }
    
    checkProjectFiles()
    
    // Proje değişikliklerini dinle
    window.onProjectOpened = (path) => {
      setProjectPath(path)
      // Otomatik configuration yüklemeyi kaldırdık
      // loadProjectConfigurations(path)
    }
  }, [])

  async function loadProjectConfigurations(path) {
    try {
      const configs = []
      
      // package.json kontrolü
      const packageJsonPath = `${path}/package.json`
      const packageJsonExists = await window.api?.fileExists?.(packageJsonPath)
      
      if (packageJsonExists) {
        const packageJson = await window.api?.readFile?.(packageJsonPath)
        const packageData = JSON.parse(packageJson)
        
        if (packageData.scripts) {
          Object.keys(packageData.scripts).forEach(scriptName => {
            configs.push({
              name: `npm: ${scriptName}`,
              command: scriptName,
              type: 'npm',
              auto: true
            })
          })
        }
      }
      
      // composer.json kontrolü
      const composerJsonPath = `${path}/composer.json`
      const composerJsonExists = await window.api?.fileExists?.(composerJsonPath)
      
      if (composerJsonExists) {
        const composerJson = await window.api?.readFile?.(composerJsonPath)
        const composerData = JSON.parse(composerJson)
        
        if (composerData.scripts) {
          Object.keys(composerData.scripts).forEach(scriptName => {
            configs.push({
              name: `composer: ${scriptName}`,
              command: scriptName,
              type: 'composer',
              auto: true
            })
          })
        }
      }
      
      // Otomatik bulunan configuration'ları ekle
      setConfigurations(prev => {
        // Manuel eklenen configuration'ları koru
        const manualConfigs = prev.filter(c => !c.auto)
        return [...manualConfigs, ...configs]
      })
      
    } catch (error) {
      console.error('Error loading project configurations:', error)
    }
  }

  useEffect(() => {
    function handleClickOutside(e){
      if (!dropdownRef.current?.contains(e.target))
        setOpen(false)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  async function handleRun(){
    setRunState(RUN_STATE.RUNNING)
    await executeCommand()
  }

  async function handleStop(){
    setRunState(RUN_STATE.STOPPED)
    
    // Çalışan process'i durdur
    try {
      const result = await window.api?.stopCommand?.()
      
      if (result?.success) {
        if (window.writeToOutput) {
          window.writeToOutput(`\n🛑 Process stopped\n`, 'warning')
        }
      }
    } catch (error) {
      console.error('Error stopping process:', error)
    }
  }

  async function handleRestart(){
    // Önce durdur
    await handleStop()
    
    // 500ms bekle
    setTimeout(async () => {
      setRunState(RUN_STATE.RUNNING)
      await executeCommand()
    }, 500)
  }

  function handleBuild(){
    executeBuild()
  }

  async function executeCommand() {
    try {
      let command = ''
      let cwd = projectPath || process.cwd()
      
      if (!selected || selected === 'Current File') {
        if (window.writeToOutput) {
          window.writeToOutput(`⚠️ Please select a configuration from the dropdown`, 'warning')
        }
        setRunState(RUN_STATE.STOPPED)
        return
      }
      
      // Seçili configuration'ı çalıştır
      const config = configurations.find(c => c.name === selected)
      if (!config) {
        if (window.writeToOutput) {
          window.writeToOutput(`❌ Configuration not found: ${selected}`, 'error')
        }
        setRunState(RUN_STATE.STOPPED)
        return
      }
      
      // package.json path varsa, o dizinde çalıştır
      if (config.packageJsonPath) {
        cwd = config.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')
      }
      
      // Komutu kullan - custom ise direkt, npm ise npm run ekle
      if (config.packageJsonPath && config.type === 'npm' && !config.isCustomScript) {
        command = `npm run ${config.command}`
      } else {
        command = config.command
      }

      if (command) {
        if (window.writeToOutput) {
          window.writeToOutput(`🚀 Running: ${command}`, 'info')
          window.writeToOutput(`📁 Working directory: ${cwd}`, 'info')
          window.writeToOutput(`\n`, 'info')
        }
        
        let urlOpened = false
        const openIn = config.openIn || 'external'
        
        // Gerçek zamanlı output dinle ve URL tespit et
        const outputHandler = (data) => {
          if (window.writeToOutput) {
            window.writeToOutput(data, 'info')
          }
          
          // URL tespiti - sadece bir kez
          if (urlOpened) return
          
          // ANSI renk kodlarını temizle
          const cleanData = data.replace(/\x1b\[[0-9;]*m/g, '')
          
          const urlPatterns = [
            /Local:\s+(https?:\/\/[^\s]+)/i,
            /running at:\s+(https?:\/\/[^\s]+)/i,
            /server running on\s+(https?:\/\/[^\s]+)/i,
            /listening on\s+(https?:\/\/[^\s]+)/i,
            /available at\s+(https?:\/\/[^\s]+)/i,
            /(https?:\/\/localhost:\d+)/i,
            /(https?:\/\/127\.0\.0\.1:\d+)/i,
            /(https?:\/\/0\.0\.0\.0:\d+)/i
          ]
          
          for (const pattern of urlPatterns) {
            const match = cleanData.match(pattern)
            if (match) {
              let url = match[1]
              url = url.replace('0.0.0.0', 'localhost')
              
              urlOpened = true
              
              // 2 saniye bekle
              setTimeout(async () => {
                if (openIn === 'none') {
                  if (window.writeToOutput) {
                    window.writeToOutput(`\n🌐 Server ready at: ${url}\n`, 'success')
                  }
                } else {
                  // External browser
                  await window.api?.openExternal?.(url)
                  if (window.writeToOutput) {
                    window.writeToOutput(`\n🌐 Opening browser: ${url}\n`, 'success')
                  }
                }
              }, 2000)
              
              break
            }
          }
        }
        
        window.api?.onCommandOutput?.(outputHandler)
        
        const result = await window.api?.executeCommand?.(command, cwd)
        
        // Sonuç mesajı
        if (window.writeToOutput) {
          window.writeToOutput(`\n`, 'info')
          if (result.error) {
            window.writeToOutput(`❌ Process failed with exit code ${result.exitCode || 'unknown'}`, 'error')
          } else {
            window.writeToOutput(`✅ Process completed successfully`, 'success')
          }
        }
        
        // İşlem bitti, state'i güncelle
        setRunState(RUN_STATE.STOPPED)
      }
    } catch (error) {
      console.error('Execute error:', error)
      if (window.writeToOutput) {
        window.writeToOutput(`❌ Error: ${error.message}`, 'error')
      }
      setRunState(RUN_STATE.STOPPED)
    }
  }

  async function executeBuild() {
    try {
      let command = ''
      let cwd = projectPath || process.cwd()
      
      if (!selected || selected === 'Current File') {
        // Seçili config yoksa, otomatik build script ara
        const buildConfig = configurations.find(c => 
          c.name.includes('build') || 
          c.command.includes('build')
        )
        
        if (buildConfig) {
          command = buildConfig.type === 'npm' && !buildConfig.isCustomScript
            ? `npm run ${buildConfig.command}`
            : buildConfig.command
            
          if (buildConfig.packageJsonPath) {
            cwd = buildConfig.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')
          }
        } else {
          // Hiç build config yoksa, default npm run build
          command = 'npm run build'
        }
      } else {
        // Seçili configuration'ın build versiyonunu kullan
        const config = configurations.find(c => c.name === selected)
        
        if (config) {
          // Eğer seçili config "dev" ise, "build" ara
          if (config.command.includes('dev') || config.command.includes('start')) {
            const buildConfig = configurations.find(c => 
              c.packageJsonPath === config.packageJsonPath &&
              (c.name.includes('build') || c.command.includes('build'))
            )
            
            if (buildConfig) {
              command = buildConfig.type === 'npm' && !buildConfig.isCustomScript
                ? `npm run ${buildConfig.command}`
                : buildConfig.command
                
              if (buildConfig.packageJsonPath) {
                cwd = buildConfig.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')
              }
            } else {
              command = 'npm run build'
              if (config.packageJsonPath) {
                cwd = config.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')
              }
            }
          } else {
            // Seçili config zaten build ise, onu kullan
            command = config.type === 'npm' && !config.isCustomScript
              ? `npm run ${config.command}`
              : config.command
              
            if (config.packageJsonPath) {
              cwd = config.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')
            }
          }
        } else {
          command = 'npm run build'
        }
      }
      
      if (window.writeToOutput) {
        window.writeToOutput(`🔨 Building: ${command}`, 'info')
        window.writeToOutput(`📁 Working directory: ${cwd}`, 'info')
        window.writeToOutput(`\n`, 'info')
      }
      
      // Gerçek zamanlı output dinle
      const outputHandler = (data) => {
        if (window.writeToOutput) {
          window.writeToOutput(data, 'info')
        }
      }
      
      window.api?.onCommandOutput?.(outputHandler)
      
      const result = await window.api?.executeCommand?.(command, cwd)
      
      if (window.writeToOutput) {
        window.writeToOutput(`\n`, 'info')
        if (result.error) {
          window.writeToOutput(`❌ Build failed with exit code ${result.exitCode || 'unknown'}`, 'error')
        } else {
          window.writeToOutput(`✅ Build completed successfully`, 'success')
          
          // Build başarılı, Explorer'ı yenile
          if (window.refreshExplorer) {
            setTimeout(() => {
              window.refreshExplorer()
              window.writeToOutput(`🔄 Explorer refreshed`, 'info')
            }, 500)
          }
        }
      }
    } catch (error) {
      console.error('Build error:', error)
      if (window.writeToOutput) {
        window.writeToOutput(`❌ Build Error: ${error.message}`, 'error')
      }
    }
  }

  function handleAddConfiguration() {
    if (newConfigName && newConfigCommand) {
      const newConfig = {
        name: newConfigName,
        command: newConfigCommand,
        type: newConfigType,
        auto: false // Manuel eklenen
      }
      setConfigurations([...configurations, newConfig])
      setNewConfigName('')
      setNewConfigCommand('')
      setNewConfigType('npm')
      setShowConfigModal(false)
    }
  }

  const options = [
    ...configurations.filter(c => !c.auto).map(c => c.name),
    "---",
    "Configurations"
  ]

  return (
    <>
      <div className="flex items-center gap-2">
        {/* RUN */}
        {runState === RUN_STATE.STOPPED && (
          <button
            onClick={handleRun}
            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
            title="Run"
          >
            <PlayIcon className="w-5 h-5 text-green-500" />
          </button>
        )}

        {/* STOP */}
        {runState === RUN_STATE.RUNNING && (
          <button
            onClick={handleStop}
            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
            title="Stop"
          >
            <StopIcon className="w-5 h-5 text-red-500" />
          </button>
        )}

        {/* RESTART */}
        {runState === RUN_STATE.RUNNING && (
          <button
            onClick={handleRestart}
            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
            title="Restart"
          >
            <ArrowPathIcon className="w-5 h-5 text-blue-500" />
          </button>
        )}

        {/* BUILD */}
        <button
          onClick={handleBuild}
          className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
          title="Build"
        >
          <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />
        </button>

        {/* CUSTOM SELECT */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1 bg-[#2d2d2d] hover:bg-[#3a3a3a] border border-[#444] rounded cursor-pointer text-xs transition-colors"
          >
            {selected || 'Select Configuration'}
            <ChevronDownIcon className="w-3 h-3" />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 bg-[#2d2d2d] border border-[#444] rounded shadow-lg z-50 w-48 max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                option === '---' ? (
                  <div key={index} className="border-t border-[#444] my-1" />
                ) : (
                  <div
                    key={option}
                    onClick={() => {
                      if (option === 'Configurations') {
                        setShowConfigModal(true)
                        setOpen(false)
                      } else {
                        setSelected(option)
                        setOpen(false)
                      }
                    }}
                    className={`px-3 py-2 hover:bg-[#3a3a3a] cursor-pointer text-xs ${
                      option === 'Configurations' ? 'text-blue-400 font-medium' : ''
                    }`}
                  >
                    {option}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfigModal(false)}>
          <div className="bg-[#252526] rounded-lg shadow-2xl w-[900px] h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
              <h2 className="text-lg font-semibold text-gray-200">Run/Debug Configurations</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sol Panel - Configuration Listesi */}
              <div className="w-64 border-r border-[#3a3a3a] flex flex-col">
                <div className="p-3 border-b border-[#3a3a3a]">
                  <button
                    onClick={() => {
                      setEditingConfig({
                        id: Date.now().toString(),
                        name: 'New Configuration',
                        type: 'npm',
                        command: '',
                        packageJsonPath: '',
                        isNew: true
                      })
                    }}
                    className="w-full px-3 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors text-sm"
                  >
                    + Add New Configuration
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  {configurations.filter(c => !c.auto).map((config) => (
                    <div
                      key={config.id}
                      onClick={() => setEditingConfig(config)}
                      className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                        editingConfig?.id === config.id
                          ? 'bg-[#094771] border border-[#1177bb]'
                          : 'bg-[#2d2d30] hover:bg-[#3a3a3a]'
                      }`}
                    >
                      <div className="text-sm font-medium text-white truncate">
                        {config.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {config.type.toUpperCase()}
                      </div>
                    </div>
                  ))}
                  
                  {configurations.filter(c => !c.auto).length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      No configurations yet
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ Panel - Configuration Düzenleme */}
              <div className="flex-1 flex flex-col">
                {!editingConfig ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚙️</div>
                      <p className="text-sm">Select a configuration to edit</p>
                      <p className="text-xs mt-1">or create a new one</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4 max-w-2xl">
                      {/* Name */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={editingConfig.name}
                          onChange={(e) => setEditingConfig({...editingConfig, name: e.target.value})}
                          placeholder="e.g., Dev Server"
                          className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Type</label>
                        <select
                          value={editingConfig.type}
                          onChange={(e) => setEditingConfig({...editingConfig, type: e.target.value})}
                          className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                        >
                          <option value="npm">NPM</option>
                          <option value="composer">Composer</option>
                          <option value="custom">Custom Command</option>
                        </select>
                      </div>

                      {/* Open In (Web projeler için) */}
                      {(editingConfig.type === 'npm' || editingConfig.type === 'custom') && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Open In</label>
                          <select
                            value={editingConfig.openIn || 'external'}
                            onChange={(e) => setEditingConfig({...editingConfig, openIn: e.target.value})}
                            className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                          >
                            <option value="external">External Browser</option>
                            <option value="none">Don't Open Browser</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            {editingConfig.openIn === 'external'
                              ? 'Opens in your default browser'
                              : 'No browser will open automatically'
                            }
                          </p>
                        </div>
                      )}

                      {/* Package.json Path (NPM için) */}
                      {editingConfig.type === 'npm' && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">package.json Path</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingConfig.packageJsonPath || ''}
                              onChange={(e) => setEditingConfig({...editingConfig, packageJsonPath: e.target.value})}
                              placeholder="Select package.json file"
                              className="flex-1 bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                              readOnly
                            />
                            <button
                              onClick={async () => {
                                // Proje klasörünü default path olarak kullan
                                const defaultPath = projectPath || process.cwd()
                                const result = await window.api?.openFile?.(defaultPath)
                                
                                if (result && result.path.endsWith('package.json')) {
                                  setEditingConfig({...editingConfig, packageJsonPath: result.path})
                                  
                                  // package.json'dan script'leri oku
                                  try {
                                    const content = await window.api?.readFile?.(result.path)
                                    const packageData = JSON.parse(content)
                                    if (packageData.scripts) {
                                      setAvailableScripts(Object.keys(packageData.scripts))
                                    } else {
                                      setAvailableScripts([])
                                    }
                                  } catch (error) {
                                    console.error('Error reading package.json:', error)
                                    setAvailableScripts([])
                                  }
                                } else if (result) {
                                  alert('Please select a package.json file')
                                }
                              }}
                              className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"
                            >
                              Browse
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Script Selection (NPM için) */}
                      {editingConfig.type === 'npm' && editingConfig.packageJsonPath && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Script</label>
                          <select
                            value={editingConfig.isCustomScript ? '__custom__' : editingConfig.command}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setEditingConfig({...editingConfig, isCustomScript: true, command: editingConfig.customScript || ''})
                              } else {
                                setEditingConfig({...editingConfig, isCustomScript: false, command: e.target.value, customScript: ''})
                              }
                            }}
                            className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                          >
                            <option value="">Select a script</option>
                            {availableScripts.map(script => (
                              <option key={script} value={script}>{script}</option>
                            ))}
                            <option value="__custom__">Custom Script</option>
                          </select>
                          
                          {/* Custom Script Input */}
                          {editingConfig.isCustomScript && (
                            <div className="mt-3">
                              <input
                                type="text"
                                placeholder="Enter full command (e.g., npm start, node server.js)"
                                onChange={(e) => setEditingConfig({...editingConfig, command: e.target.value})}
                                value={editingConfig.command || ''}
                                className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Will run: {editingConfig.command || 'your-command'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Command (Custom veya NPM değilse veya script seçilmediyse) */}
                      {(editingConfig.type === 'custom' || (editingConfig.type !== 'npm' || !editingConfig.packageJsonPath)) && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Command</label>
                          <input
                            type="text"
                            value={editingConfig.command}
                            onChange={(e) => setEditingConfig({...editingConfig, command: e.target.value})}
                            placeholder={
                              editingConfig.type === 'npm' ? 'e.g., npm run start' :
                              editingConfig.type === 'composer' ? 'e.g., composer install' :
                              'e.g., python script.py'
                            }
                            className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the full command to execute
                          </p>
                        </div>
                      )}

                      {/* Preview */}
                      {editingConfig.command && (
                        <div className="p-4 bg-[#2d2d30] rounded border border-[#3a3a3a]">
                          <div className="text-xs text-gray-400 mb-1">Command Preview:</div>
                          <div className="text-sm text-green-400 font-mono">
                            {editingConfig.isCustomScript
                              ? editingConfig.command
                              : editingConfig.packageJsonPath && editingConfig.type === 'npm'
                                ? `npm run ${editingConfig.command}`
                                : editingConfig.command
                            }
                          </div>
                          {editingConfig.packageJsonPath && (
                            <div className="text-xs text-gray-500 mt-2">
                              Working directory: {editingConfig.packageJsonPath.replace('/package.json', '').replace('\\package.json', '')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                {editingConfig && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#3a3a3a]">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this configuration?')) {
                          const updatedConfigs = configurations.filter(c => c.id !== editingConfig.id)
                          setConfigurations(updatedConfigs)
                          setEditingConfig(null)
                          saveConfigurationsToFile(updatedConfigs)
                        }
                      }}
                      className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                    >
                      Delete
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingConfig(null)}
                        className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!editingConfig.name || !editingConfig.command) {
                            alert('Please fill in all required fields')
                            return
                          }
                          
                          const configToSave = {
                            ...editingConfig,
                            isNew: false,
                            auto: false
                          }
                          
                          const updatedConfigs = editingConfig.isNew
                            ? [...configurations, configToSave]
                            : configurations.map(c => c.id === editingConfig.id ? configToSave : c)
                          
                          setConfigurations(updatedConfigs)
                          saveConfigurationsToFile(updatedConfigs)
                          setEditingConfig(null)
                        }}
                        className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors"
                      >
                        {editingConfig.isNew ? 'Add' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
