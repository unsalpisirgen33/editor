import { useState, useRef, useEffect } from "react"
import {TopMenuBarDropdown} from "./MenuDropdown";



export default function TopMenuBar({ onOpenFile, onNewFile, onOpenFolder, onCreateProject }){


  const [activeMenu,setActiveMenu] = useState(null)
  const [plugins, setPlugins] = useState([])

  const menuRef = useRef()

  // Plugin'leri yükle
  useEffect(() => {
    async function loadPlugins() {
      try {
        const loadedPlugins = await window.api.getPlugins()
        setPlugins(loadedPlugins || [])
      } catch (error) {
        console.error('Failed to load plugins:', error)
      }
    }
    loadPlugins()
  }, [])

  const handleMenuAction = (action) => {
    setActiveMenu(null)
    
    switch(action) {
      case 'File.New.File':
        onNewFile?.()
        break
      case 'File.New.Project':
        onCreateProject?.()
        break
      case 'File.Open.File':
        onOpenFile?.()
        break
      case 'File.Open.Folder':
        onOpenFolder?.()
        break
      case 'File.Exit':
        window.electron.ipcRenderer.send('close')
        break
      case 'Edit.Find':
        // Ctrl+F trigger
        window.dispatchEvent(new KeyboardEvent('keydown', { 
          key: 'f', 
          ctrlKey: true, 
          bubbles: true 
        }))
        break
      case 'Edit.Replace':
        // Ctrl+H trigger (gelecekte)
        break
      case 'View.ToggleExplorer':
        window.toggleLeftPanel?.()
        break
      case 'View.ToggleSearch':
        window.toggleRightPanel?.()
        break
      case 'View.ToggleTerminal':
        window.toggleBottomPanel?.()
        break
      case 'Tools.Settings':
        window.openSettings?.()
        break
      case 'Tools.KeyboardShortcuts':
        window.openSettings?.('keybindings')
        break
      default:
        // Plugin action kontrolü
        if (action.startsWith('Plugin.')) {
          const pluginId = action.replace('Plugin.', '')
          handlePluginAction(pluginId)
        } else {
          console.log('Menu action:', action)
        }
    }
  }

  const handlePluginAction = async (pluginId) => {
    try {
      await window.api.openPluginWindow(pluginId)
    } catch (error) {
      console.error('Plugin action error:', error)
    }
  }

  const handleOpenPluginsFolder = async () => {
    try {
      const pluginsPath = await window.api.getPluginsPath()
      // Klasörü dosya gezgininde aç
      window.electron.ipcRenderer.send('open-folder-in-explorer', pluginsPath)
    } catch (error) {
      console.error('Open plugins folder error:', error)
    }
  }

  const handleReloadPlugins = async () => {
    try {
      const reloadedPlugins = await window.api.reloadPlugins()
      setPlugins(reloadedPlugins || [])
      alert(`${reloadedPlugins.length} plugin yüklendi!`)
    } catch (error) {
      console.error('Reload plugins error:', error)
    }
  }

  const menus = {

    File: {
      'New File': () => handleMenuAction('File.New.File'),
      'New Project': () => handleMenuAction('File.New.Project'),
      'New Window': null,
      
      'separator-1': 'separator',

      'Open File': () => handleMenuAction('File.Open.File'),
      'Open Folder': () => handleMenuAction('File.Open.Folder'),
      'Open Recent': {
        'Reopen Closed Editor': null,
        'separator-1': 'separator',
        'Clear Recently Opened': null
      },
      
      'separator-2': 'separator',

      'Save': null,
      'Save As': null,
      'Save All': null,

      'separator-3': 'separator',

      'Close Editor': null,
      'Close Folder': null,
      'Close Window': null,

      'separator-4': 'separator',

      'Exit': () => handleMenuAction('File.Exit')
    },

    Edit: {
      'Undo': null,
      'Redo': null,
      
      'separator-1': 'separator',
      
      'Cut': null,
      'Copy': null,
      'Paste': null,

      'separator-2': 'separator',

      'Find': () => handleMenuAction('Edit.Find'),
      'Replace': () => handleMenuAction('Edit.Replace'),
      'Find in Files': null,

      'separator-3': 'separator',

      'Toggle Line Comment': null,
      'Toggle Block Comment': null
    },

    View: {
      'Command Palette': null,
      'Open View': null,

      'separator-1': 'separator',

      'Appearance': {
        'Full Screen': null,
        'Zen Mode': null,
        'separator-1': 'separator',
        'Menu Bar': null,
        'Side Bar': null,
        'Status Bar': null
      },

      'separator-2': 'separator',

      'Explorer': () => handleMenuAction('View.ToggleExplorer'),
      'Search': () => handleMenuAction('View.ToggleSearch'),
      'Terminal': () => handleMenuAction('View.ToggleTerminal'),

      'separator-3': 'separator',

      'Problems': null,
      'Output': null,
      'Debug Console': null
    },

    Tools: {
      'Command Line': null,
      'External Tools': null,

      'separator-1': 'separator',

      'Settings': () => handleMenuAction('Tools.Settings'),
      'Extensions': null,
      'Keyboard Shortcuts': () => handleMenuAction('Tools.KeyboardShortcuts'),

      'separator-2': 'separator',

      'Developer Tools': null
    },

    Build: {
      'Build Project': null,
      'Rebuild Project': null,
      'Clean Project': null,

      'separator-1': 'separator',

      'Run': null,
      'Debug': null,
      'Run Without Debugging': null,

      'separator-2': 'separator',

      'Build Configuration': null
    },

    Plugins: plugins.length > 0 ? {
      ...plugins.reduce((acc, plugin) => {
        acc[plugin.name] = () => handleMenuAction(`Plugin.${plugin.id}`)
        return acc
      }, {}),
      'separator-1': 'separator',
      'Open Plugins Folder': () => handleOpenPluginsFolder(),
      'Reload Plugins': () => handleReloadPlugins()
    } : {
      'No Plugins': null,
      'separator-1': 'separator',
      'Open Plugins Folder': () => handleOpenPluginsFolder(),
      'Reload Plugins': () => handleReloadPlugins()
    },

    Window: {
      'New Window': null,
      'Close Window': null,

      'separator-1': 'separator',

      'Minimize': null,
      'Zoom': null,

      'separator-2': 'separator',

      'Switch Window': null
    },

    Help: {
      'Welcome': null,
      'Documentation': null,
      'Release Notes': null,

      'separator-1': 'separator',

      'Keyboard Shortcuts Reference': null,
      'Video Tutorials': null,

      'separator-2': 'separator',

      'Report Issue': null,
      'View License': null,

      'separator-3': 'separator',

      'About': null
    }

  }



  useEffect(()=>{

    function close(e){

      if(!menuRef.current?.contains(e.target))
        setActiveMenu(null)

    }

    document.addEventListener("click",close)

    return ()=>document.removeEventListener("click",close)

  },[])



  return(

    <div
      ref={menuRef}
      className="flex text-sm h-full items-stretch gap-1"
    >

      {Object.entries(menus).map(([menu,items])=>(

        <div
          key={menu}
          className="relative flex items-stretch"
        >

          <div
            className={`
              px-4 flex items-center cursor-pointer transition-colors
              ${activeMenu === menu ? 'bg-[#3a3a3a]' : 'hover:bg-[#3a3a3a]'}
            `}
            onClick={()=>setActiveMenu(activeMenu === menu ? null : menu)}
          >
            {menu}
          </div>

          {activeMenu===menu && (
            <TopMenuBarDropdown items={items} onAction={handleMenuAction}/>
          )}

        </div>

      ))}

    </div>

  )

}
