import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { 
  loadUserKeybindings, 
  saveUserKeybindings, 
  resetKeybindings,
  getKeybindingsByCategory,
  getKeyForPlatform
} from '../../config/keybindings'

export default function SettingsPanel({ isOpen, onClose, defaultTab = 'keybindings' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [keybindings, setKeybindings] = useState({})
  const [editingKey, setEditingKey] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [plugins, setPlugins] = useState([])
  const [pluginsPath, setPluginsPath] = useState('')
  const [loadingPlugins, setLoadingPlugins] = useState(false)
  const [selectedPlugin, setSelectedPlugin] = useState(null)

  useEffect(() => {
    if (isOpen) {
      // Keybindings'i yükle
      const loadKeybindings = () => {
        try {
          const loadedKeybindings = loadUserKeybindings()
          setKeybindings(loadedKeybindings || {})
          setActiveTab(defaultTab)
        } catch (error) {
          console.error('Keybindings yuklenemedi:', error)
          setKeybindings({})
        }
      }
      loadKeybindings()
    }
  }, [isOpen, defaultTab])
  
  useEffect(() => {
    // Plugins sekmesi açıldığında pluginleri yükle
    if (isOpen && activeTab === 'plugins') {
      loadPlugins()
    }
  }, [isOpen, activeTab])
  
  const loadPlugins = async () => {
    setLoadingPlugins(true)
    try {
      const pluginsList = await window.api?.getPlugins?.()
      const path = await window.api?.getPluginsPath?.()
      setPlugins(pluginsList || [])
      setPluginsPath(path || '')
    } catch (error) {
      console.error('Plugins yuklenemedi:', error)
      setPlugins([])
      setPluginsPath('')
    } finally {
      setLoadingPlugins(false)
    }
  }
  
  const handleInstallPlugin = async () => {
    try {
      const result = await window.api?.openFolder?.()
      if (result && result.filePaths && result.filePaths[0]) {
        await window.api?.installPlugin?.(result.filePaths[0])
        await loadPlugins()
        alert('Plugin basariyla yuklendi!')
      }
    } catch (error) {
      console.error('Plugin yukleme hatasi:', error)
      alert('Plugin yuklenemedi: ' + error.message)
    }
  }
  
  const handleUninstallPlugin = async (pluginId) => {
    if (confirm('Bu plugini kaldirmak istediginize emin misiniz?')) {
      try {
        await window.api?.uninstallPlugin?.(pluginId)
        await loadPlugins()
        alert('Plugin basariyla kaldirildi!')
      } catch (error) {
        console.error('Plugin kaldirma hatasi:', error)
        alert('Plugin kaldirilamadi: ' + error.message)
      }
    }
  }
  
  const handleTogglePlugin = async (pluginId, currentStatus) => {
    try {
      await window.api?.togglePlugin?.(pluginId, !currentStatus)
      await loadPlugins()
    } catch (error) {
      console.error('Plugin durum degistirme hatasi:', error)
      alert('Plugin durumu degistirilemedi: ' + error.message)
    }
  }

  if (!isOpen) return null

  const handleSave = () => {
    try {
      saveUserKeybindings(keybindings)
      alert('Ayarlar kaydedildi!')
      onClose()
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
      alert('Ayarlar kaydedilirken bir hata olustu!')
    }
  }

  const handleApply = () => {
    try {
      saveUserKeybindings(keybindings)
      alert('Ayarlar uygulandı!')
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
      alert('Ayarlar kaydedilirken bir hata olustu!')
    }
  }

  const handleReset = () => {
    if (confirm('Tum ayarlari varsayilana sifirlamak istediginize emin misiniz?')) {
      try {
        const defaults = resetKeybindings()
        setKeybindings(defaults || {})
      } catch (error) {
        console.error('Sifirlama hatasi:', error)
      }
    }
  }

  const handleKeyEdit = (commandName, newKey) => {
    setKeybindings(prev => ({
      ...prev,
      [commandName]: {
        ...prev[commandName],
        key: newKey
      }
    }))
  }

  let categories = {}
  try {
    categories = getKeybindingsByCategory()
  } catch (error) {
    console.error('Kategoriler yuklenemedi:', error)
    categories = {}
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ padding: 'clamp(20px, 5vw, 100px)' }}
      onClick={onClose}
    >
      <div 
        className="bg-[#252526] rounded-lg shadow-2xl flex flex-col w-full h-full"
        style={{ 
          maxWidth: 'min(1100px, calc(100vw - 40px))',
          maxHeight: 'min(750px, calc(100vh - 40px))',
          minWidth: '600px',
          minHeight: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-[#3a3a3a]">
          <div className="w-40 pl-2 text-base flex font-semibold text-gray-200 ml-2"> 
            <h2 className='w-20 text-center ml-4 pl-4'>Ayarlar</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 text-gray-400 hover:text-white transition-colors text-3xl leading-none hover:bg-[#3a3a3a] rounded px-3 py-1"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[220px] h-full border-r border-[#3a3a3a] bg-[#2d2d30] overflow-y-auto">
            <div className="p-3 h-full flex flex-col items-center gap-1">
              <button
                onClick={() => setActiveTab('keybindings')}
                className={`w-full h-8 text-left px-4 py-3  transition-colors text-sm ${
                  activeTab === 'keybindings' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-7 pl-1 "> ⌨️</span> Klavye Kisayollari
              </button>
              <button
                onClick={() => {
                  setActiveTab('editor')
                }}
                className={`w-full h-8 text-left px-4 py-3  transition-colors text-sm mt-1 ${
                  activeTab === 'editor' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-6 pl-1">📝</span> Editor
              </button>
              <button
                onClick={() => setActiveTab('intellisense')}
                className={`w-full h-8 text-left px-4 py-2.5 rounded transition-colors text-sm mt-1 ${
                  activeTab === 'intellisense' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-6 pl-1">💡</span> IntelliSense
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full h-8 text-left px-4 py-2.5 rounded transition-colors text-sm mt-1 ${
                  activeTab === 'appearance' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-6 pl-1">🎨</span> Gorunum
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`w-full h-8 text-left px-4 py-2.5 rounded transition-colors text-sm mt-1 ${
                  activeTab === 'terminal' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-6 pl-1">💻</span> Terminal
              </button>
              <button
                onClick={() => setActiveTab('plugins')}
                className={`w-full h-8 text-left px-4 py-2.5 rounded transition-colors text-sm mt-1 ${
                  activeTab === 'plugins' ? 'bg-[#094771] text-white' : 'text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                <span className="inline-block w-6 pl-1">🧩</span> Pluginler
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'keybindings' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Klavye Kisayollari</h3>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Kisayol ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#3c3c3c] text-white px-4 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                    />
                  </div>

                  <div className="space-y-6">
                    {Object.keys(keybindings).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Kisayollar yukleniyor...</p>
                      </div>
                    ) : (
                      Object.entries(categories).map(([category, commands]) => {
                        const categoryBindings = commands
                          .map(cmd => [cmd, keybindings[cmd]])
                          .filter(([cmd, binding]) => {
                            if (!binding) return false
                            if (!searchQuery) return true
                            const query = searchQuery.toLowerCase()
                            return (
                              cmd.toLowerCase().includes(query) ||
                              binding?.description?.toLowerCase().includes(query) ||
                              binding?.key?.toLowerCase().includes(query)
                            )
                          })

                        if (categoryBindings.length === 0) return null

                        return (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                              {category}
                            </h4>
                            <div className="space-y-2">
                              {categoryBindings.map(([commandName, binding]) => (
                                <div
                                  key={commandName}
                                  className="flex items-center justify-between p-3 bg-[#2d2d30] rounded hover:bg-[#3a3a3a] transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm text-white font-medium">
                                      {binding.description}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {commandName}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {editingKey === commandName ? (
                                      <input
                                        type="text"
                                        defaultValue={getKeyForPlatform(binding)}
                                        autoFocus
                                        className="bg-[#3c3c3c] text-white px-3 py-1 rounded border border-[#007acc] outline-none text-sm w-40"
                                        onBlur={(e) => {
                                          handleKeyEdit(commandName, e.target.value)
                                          setEditingKey(null)
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleKeyEdit(commandName, e.target.value)
                                            setEditingKey(null)
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingKey(null)
                                          }
                                        }}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setEditingKey(commandName)}
                                        className="px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-sm font-mono transition-colors"
                                      >
                                        {getKeyForPlatform(binding)}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Editor Ayarlari</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#2d2d30] rounded">
                      <h4 className="text-sm font-medium text-white mb-2">Font Boyutu</h4>
                      <p className="text-xs text-gray-400 mb-3">Editor font boyutunu ayarlayin</p>
                      <input type="number" defaultValue={14} min={10} max={30} className="bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] w-24" />
                      <span className="text-xs text-gray-400 ml-2">px</span>
                    </div>
                    <div className="p-4 bg-[#2d2d30] rounded">
                      <h4 className="text-sm font-medium text-white mb-2">Tab Boyutu</h4>
                      <p className="text-xs text-gray-400 mb-3">Tab karakteri bosluk sayisi</p>
                      <input type="number" defaultValue={2} min={1} max={8} className="bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] w-24" />
                    </div>
                    <div className="p-4 bg-[#2d2d30] rounded">
                      <h4 className="text-sm font-medium text-white mb-2">Word Wrap</h4>
                      <p className="text-xs text-gray-400 mb-3">Uzun satirlari otomatik sar</p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-gray-300">Etkin</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'intellisense' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">IntelliSense Ayarlari</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#2d2d30] rounded">
                      <h4 className="text-sm font-medium text-white mb-2">Otomatik Tamamlama</h4>
                      <p className="text-xs text-gray-400 mb-3">Yazarken otomatik kod onerileri gosterir</p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-gray-300">Etkin</span>
                      </label>
                    </div>
                    <div className="p-4 bg-[#2d2d30] rounded">
                      <h4 className="text-sm font-medium text-white mb-2">Parametre Ipuclari</h4>
                      <p className="text-xs text-gray-400 mb-3">Fonksiyon parametrelerini gosterir</p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-gray-300">Etkin</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Gorunum Ayarlari</h3>
                  <p className="text-sm text-gray-500">Gorunum ayarlari yakinda eklenecek...</p>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Terminal Ayarlari</h3>
                  <p className="text-sm text-gray-500">Terminal ayarlari yakinda eklenecek...</p>
                </div>
              )}

              {activeTab === 'plugins' && (
                <div className="flex h-full">
                  {/* Sol Panel - Plugin Listesi */}
                  <div className="w-[410px] border-r border-[#3a3a3a] flex flex-col">

                    <div className="p-4 h-8 border-b border-[#3a3a3a]">
                      <div className="flex h-full items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-200">Pluginler</h3>
                        <button
                          onClick={handleInstallPlugin}
                          className="px-3 cursor-pointer h-full w-15 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors text-xs font-medium"
                        >
                          + Yukle
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {loadingPlugins ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400 text-sm">Yukleniyor...</p>
                        </div>
                      ) : plugins.length === 0 ? (
                        <div className="text-center py-8 px-4">
                          <p className="text-gray-400 text-sm mb-2">Plugin yok</p>
                          <p className="text-xs text-gray-500">Yukle butonuna tiklayin</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          {plugins.map((plugin) => (
                            <div
                              key={plugin.id}
                              onClick={() => setSelectedPlugin(plugin)}
                              className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                                selectedPlugin?.id === plugin.id
                                  ? 'bg-[#094771] border border-[#1177bb]'
                                  : 'bg-[#2d2d30] hover:bg-[#3a3a3a] border border-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {plugin.icon && (
                                  <img
                                    src={plugin.icon}
                                    alt={plugin.name}
                                    className="w-10 h-10 rounded flex-shrink-0"
                                    onError={(e) => (e.target.style.display = 'none')}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-white truncate">
                                    {plugin.name}
                                  </h4>
                                  <p className="text-xs text-gray-400 truncate">
                                    v{plugin.version}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        plugin.enabled !== false
                                          ? 'bg-green-900/30 text-green-400'
                                          : 'bg-red-900/30 text-red-400'
                                      }`}
                                    >
                                      {plugin.enabled !== false ? 'Aktif' : 'Pasif'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sag Panel - Plugin Detaylari */}
                  <div className="flex-1 overflow-y-auto">
                    {!selectedPlugin ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🧩</div>
                          <p className="text-gray-400 text-sm">Plugin secin</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Detaylari gormek icin sol taraftan bir plugin secin
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        {/* Plugin Header */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[#3a3a3a]">
                          {selectedPlugin.icon && (
                            <img
                              src={selectedPlugin.icon}
                              alt={selectedPlugin.name}
                              className="w-20 h-20 rounded"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          )}
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">
                              {selectedPlugin.name}
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                              <span>v{selectedPlugin.version}</span>
                              {selectedPlugin.author && (
                                <>
                                  <span>•</span>
                                  <span>{selectedPlugin.author}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  selectedPlugin.enabled !== false
                                    ? 'bg-green-900/30 text-green-400'
                                    : 'bg-red-900/30 text-red-400'
                                }`}
                              >
                                {selectedPlugin.enabled !== false ? '✓ Aktif' : '✗ Pasif'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Plugin Aciklama */}
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                            Aciklama
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {selectedPlugin.description || 'Aciklama yok'}
                          </p>
                        </div>

                        {/* Plugin Bilgileri */}
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                            Bilgiler
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-[#2d2d30] rounded">
                              <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                                Plugin ID:
                              </span>
                              <span className="text-xs text-gray-300 font-mono break-all">
                                {selectedPlugin.id}
                              </span>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-[#2d2d30] rounded">
                              <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                                Versiyon:
                              </span>
                              <span className="text-xs text-gray-300 font-mono">
                                {selectedPlugin.version}
                              </span>
                            </div>
                            {selectedPlugin.author && (
                              <div className="flex items-start gap-3 p-3 bg-[#2d2d30] rounded">
                                <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                                  Yazar:
                                </span>
                                <span className="text-xs text-gray-300">
                                  {selectedPlugin.author}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Plugin Aksiyonlar */}
                        <div className="pt-6 flex flex-col gap-2 border-t border-[#3a3a3a]">
                          <h3 className="text-sm py-3 font-semibold text-gray-300 mb-3 mt-4 uppercase tracking-wider">
                            Aksiyonlar
                          </h3>
                          <div className="flex gap-3 h-10 pt-5">
                            <button
                              onClick={() =>
                                handleTogglePlugin(
                                  selectedPlugin.id,
                                  selectedPlugin.enabled !== false
                                )
                              }
                              className={` h-10 w-full px-4 py-2.5 rounded transition-colors text-sm font-medium ${
                                selectedPlugin.enabled !== false
                                  ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400'
                                  : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                              }`}
                            >
                              {selectedPlugin.enabled !== false
                                ? '⏸ Devre Disi Birak'
                                : '▶ Etkinlestir'}
                            </button>
                            <button
                              onClick={() => {
                                handleUninstallPlugin(selectedPlugin.id)
                                setSelectedPlugin(null)
                              }}
                              className="w-full h-10 px-4 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors text-sm font-medium"
                            >
                              🗑 Kaldir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between  px-6 py-4 h-8 border-t border-[#3a3a3a] bg-[#2d2d30]">

           <div className='h-full flex px-4 w-[150px]'>
             <button
            onClick={handleReset}
            className="h-full w-full px-4   cursor-pointer  bg-[#5a1d1d] hover:bg-[#6a2d2d] text-white rounded transition-colors text-sm font-medium"
          >
            Varsayilana Sifirla
          </button>
                </div>

          <div className="flex gap-2 h-full w-[250px] bg-red-400 ">
            <button
              onClick={onClose}
              className="h-full w-full mr-1 cursor-pointer bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white transition-colors text-sm font-medium"
            >
              Vazgec
            </button>
            <button
              onClick={handleApply}
              className="h-full w-full mr-1 bg-[#0e639c] 
              hover:bg-[#1177bb] text-white  cursor-pointer  transition-colors text-sm font-medium"
            >
              Uygula
            </button>
            <button
              onClick={handleSave}
              className="h-full w-full cursor-pointer bg-[#0e639c] hover:bg-[#1177bb] text-white transition-colors text-sm font-semibold"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


SettingsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultTab: PropTypes.string
}
