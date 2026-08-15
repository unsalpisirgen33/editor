import { TopBar } from './components/top-bar'
import LeftPanel from './components/left-panel'
import CenterPanel from './components/center-panel'
import RightPanel from './components/right-panel'
import BottomPanel from './components/bottom-panel'
import SettingsPanel from './components/settings-panel'
import { useState, useRef, useEffect } from 'react'

/**
 * Ana uygulama komponenti
 * 
 * @component App
 * @description IDE'nin ana layout'unu yönetir. Sol panel (Explorer), sağ panel, 
 *              alt panel (Terminal) ve merkez panel (Editor) içerir.
 *              Paneller mouse ile yeniden boyutlandırılabilir.
 * 
 * @returns {JSX.Element} Ana uygulama layout'u
 * 
 * @requires react - useState, useRef, useEffect hooks
 * @requires ./components/top-bar - Üst menü çubuğu
 * @requires ./components/left-panel - Sol panel (Explorer)
 * @requires ./components/center-panel - Merkez panel (Editor)
 * @requires ./components/right-panel - Sağ panel
 * @requires ./components/bottom-panel - Alt panel (Terminal)
 * 
 * @global {Function} window.toggleLeftPanel - Sol paneli aç/kapat
 * @global {Function} window.toggleRightPanel - Sağ paneli aç/kapat
 * @global {Function} window.toggleBottomPanel - Alt paneli aç/kapat
 * 
 * @example
 * <App />
 */
function App() {
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showBottomPanel, setShowBottomPanel] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('keybindings')
  
  // Status bar bilgileri
  const [statusBarInfo, setStatusBarInfo] = useState({
    language: '',
    fileType: '',
    encoding: '',
    spaces: 2,
    line: 1,
    column: 1,
    autocomplete: 'On',
    hasFile: false
  })
  
  // Panel boyutları
  const [leftPanelWidth, setLeftPanelWidth] = useState(256) // 64 * 4 = 256px
  const [rightPanelWidth, setRightPanelWidth] = useState(320) // 80 * 4 = 320px
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300)
  
  // Resize state
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [isResizingBottom, setIsResizingBottom] = useState(false)

  // Global toggle fonksiyonları
  window.toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel)
  window.toggleRightPanel = () => setShowRightPanel(!showRightPanel)
  window.toggleBottomPanel = () => setShowBottomPanel(!showBottomPanel)
  window.openSettings = (tab = 'keybindings') => {
    setSettingsTab(tab)
    setShowSettings(true)
  }
  window.updateStatusBar = (info) => {
    setStatusBarInfo(prev => ({ ...prev, ...info }))
  }

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft) {
        const newWidth = e.clientX
        if (newWidth >= 200 && newWidth <= 600) {
          setLeftPanelWidth(newWidth)
        }
      }
      
      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX
        if (newWidth >= 200 && newWidth <= 600) {
          setRightPanelWidth(newWidth)
        }
      }
      
      if (isResizingBottom) {
        const topBarHeight = 40 // TopBar yüksekliği
        const newHeight = window.innerHeight - e.clientY - topBarHeight
        if (newHeight >= 100 && newHeight <= window.innerHeight - 200) {
          setBottomPanelHeight(newHeight)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingLeft(false)
      setIsResizingRight(false)
      setIsResizingBottom(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizingLeft || isResizingRight || isResizingBottom) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      
      if (isResizingLeft || isResizingRight) {
        document.body.style.cursor = 'ew-resize'
      } else if (isResizingBottom) {
        document.body.style.cursor = 'ns-resize'
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingLeft, isResizingRight, isResizingBottom])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e]">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Explorer */}
        {showLeftPanel && (
          <>
            <div 
              className="flex-shrink-0 border-r border-[#333]"
              style={{ width: `${leftPanelWidth}px` }}
            >
              <LeftPanel />
            </div>
            {/* Resize Handle - Left */}
            <div
              className="w-1 flex-shrink-0 bg-[#333] hover:bg-[#007acc] cursor-ew-resize transition-colors"
              onMouseDown={() => setIsResizingLeft(true)}
            />
          </>
        )}

        {/* Center Area - Editor + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Editor */}
          <div 
            className="overflow-hidden"
            style={{ 
              height: showBottomPanel 
                ? `calc(100% - ${bottomPanelHeight}px)` 
                : '100%' 
            }}
          >
            <CenterPanel />
          </div>

          {/* Bottom Panel - Terminal */}
          {showBottomPanel && (
            <>
              {/* Resize Handle - Bottom */}
              <div
                className="h-1 flex-shrink-0 bg-[#333] hover:bg-[#007acc] cursor-ns-resize transition-colors"
                onMouseDown={() => setIsResizingBottom(true)}
              />
              <div 
                className="border-t border-[#333] overflow-hidden flex-shrink-0"
                style={{ height: `${bottomPanelHeight}px` }}
              >
                <BottomPanel />
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Search */}
        {showRightPanel && (
          <>
            {/* Resize Handle - Right */}
            <div
              className="w-1 flex-shrink-0 bg-[#333] hover:bg-[#007acc] cursor-ew-resize transition-colors"
              onMouseDown={() => setIsResizingRight(true)}
            />
            <div 
              className="flex-shrink-0 border-l border-[#333]"
              style={{ width: `${rightPanelWidth}px` }}
            >
              <RightPanel />
            </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        defaultTab={settingsTab}
      />

      {/* Status Bar */}
      <div className="w-full h-[25px] bg-[#1e1e1e] border-t border-[#333] flex items-center justify-between px-4 text-xs text-gray-300">
        {/* Sol Taraf - Boş */}
        <div className="flex items-center gap-4">
          {/* Buraya başka şeyler eklenecek */}
        </div>
        
        {/* Sağ Taraf */}
        <div className="flex items-center gap-4 pr-[10px]">
          {statusBarInfo.hasFile && statusBarInfo.language && (
            <span className="font-medium">{statusBarInfo.language}</span>
          )}
          {statusBarInfo.hasFile && statusBarInfo.fileType && (
            <span>{statusBarInfo.fileType}</span>
          )}
          {statusBarInfo.hasFile && statusBarInfo.encoding && (
            <span>{statusBarInfo.encoding}</span>
          )}
          {statusBarInfo.hasFile && (
            <span>Spaces: {statusBarInfo.spaces}</span>
          )}
          {statusBarInfo.hasFile && (
            <span>Ln {statusBarInfo.line}, Col {statusBarInfo.column}</span>
          )}
          {statusBarInfo.hasFile && (
            <span className="mr-4">Autocomplete: {statusBarInfo.autocomplete}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
