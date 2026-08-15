import { useEffect, useRef, useState } from 'react'
import {
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import monaco from '../../monaco-config'

export default function BottomPanel() {
  const [terminals, setTerminals] = useState([])
  const [activeTerminal, setActiveTerminal] = useState(null)
  const [splitMode, setSplitMode] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState('terminal')
  const [outputLogs, setOutputLogs] = useState([])
  const [problems, setProblems] = useState([]) // Problems için ayrı state
  const [errorDetailModal, setErrorDetailModal] = useState(null) // Hata detay modal
  const terminalRefs = useRef({})
  const xtermInstances = useRef({})
  
  // Global output yazma fonksiyonu
  useEffect(() => {
    window.writeToOutput = (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString()
      setOutputLogs(prev => [...prev, { message, type, timestamp }])
      setActiveBottomTab('output') // Output tab'ına geç
    }
  }, [])
  
  // Console mesajlarını dinle - sadece error ve warning
  useEffect(() => {
    const handleConsoleMessage = (data) => {
      // Sadece error ve warning göster, info/log gösterme
      if (data.type !== 'error' && data.type !== 'warning') {
        return;
      }
      
      // React DevTools ve Electron Security uyarılarını filtrele
      if (data.message && (data.message.includes('React DevTools') || 
          data.message.includes('Electron Security Warning'))) {
        return;
      }
      
      const prefix = data.type === 'error' ? '❌' : '⚠️';
      const from = data.from === 'browser-extension' ? '[Browser] ' : '';
      const message = `${prefix} ${from}${data.message}${data.source ? ` (${data.source})` : ''}`;
      
      // Aynı mesajı tekrar ekleme - son 500ms içinde aynı mesaj varsa skip
      setOutputLogs(prev => {
        // Aynı mesaj zaten var mı kontrol et
        const isDuplicate = prev.some(log => 
          log.message === message && 
          log.type === data.type &&
          (Date.now() - new Date(log.timestamp).getTime() < 500)
        );
        
        if (isDuplicate) {
          return prev;
        }
        
        // Aynı kaynaktan gelen eski hatayı bul ve güncelle
        if (data.source) {
          const existingIndex = prev.findIndex(log => 
            log.source === data.source && 
            log.type === data.type &&
            log.message === message
          );
          
          if (existingIndex !== -1) {
            // Eski hatayı güncelle (timestamp)
            const updated = [...prev];
            updated[existingIndex] = {
              message: message,
              type: data.type,
              timestamp: data.timestamp,
              source: data.source
            };
            return updated;
          }
        }
        
        // Yeni hata ekle
        return [...prev, {
          message: message,
          type: data.type,
          timestamp: data.timestamp,
          source: data.source
        }].slice(-100); // Son 100 log'u tut
      });
      
      // Problems'e de ekle (daha düzenli format)
      if (data.source) {
        setProblems(prev => {
          // Aynı source'tan gelen eski problemi bul
          const existingIndex = prev.findIndex(p => 
            p.source === data.source && p.type === data.type
          );
          
          const problem = {
            message: data.message,
            type: data.type,
            source: data.source,
            timestamp: data.timestamp,
            file: data.source.split(':')[0], // src/App.jsx
            line: data.source.split(':')[1], // 25
            column: data.source.split(':')[2] // 10
          };
          
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = problem;
            return updated;
          }
          
          return [...prev, problem];
        }).slice(-50); // Son 50 problem'i tut
      }
      
      // Output tab'ına otomatik geç
      setActiveBottomTab('output');
    };
    
    // Listener'ları sadece bir kez ekle
    if (window.api?.onConsoleMessage) {
      window.api.onConsoleMessage(handleConsoleMessage);
    }
    if (window.api?.onBrowserConsole) {
      window.api.onBrowserConsole(handleConsoleMessage);
    }
    
    // Cleanup yok - Electron IPC removeListener desteklemiyor
  }, [])
  
  // Dosya kaydedildiğinde o dosyanın hatalarını temizle
  useEffect(() => {
    const handleFileSave = (filePath) => {
      // Kaydedilen dosyanın adını al
      const fileName = filePath.split('/').pop(); // App.jsx, index.html, style.css
      const fileNameWithPath = filePath.split('/').slice(-2).join('/'); // src/App.jsx
      const fileNameWithoutExt = fileName.split('.')[0]; // App, index, style
      
      // O dosyadan gelen TÜM hataları ve uyarıları sil
      setOutputLogs(prev => {
        const filtered = prev.filter(log => {
          // Eğer source yoksa tut
          if (!log.source) return true;
          
          // Source'u normalize et (URL'den temizle)
          let cleanSource = log.source;
          if (cleanSource.includes('localhost')) {
            const match = cleanSource.match(/localhost:\d+\/(.+?)(?:\?|:|$)/);
            if (match) {
              cleanSource = match[1];
            }
          }
          
          // Eğer bu dosyadan değilse tut
          // Tam dosya adı, path ile dosya adı, veya dosya adı (uzantısız) kontrolü
          if (!cleanSource.includes(fileName) && 
              !cleanSource.includes(fileNameWithPath) &&
              !cleanSource.includes(fileNameWithoutExt)) {
            return true;
          }
          
          // Bu dosyadan (error veya warning), sil
          console.log('Removing error from saved file:', fileName, '→', log.message);
          return false;
        });
        
        return filtered;
      });
      
      // Problems'ten de sil
      setProblems(prev => {
        return prev.filter(problem => {
          if (!problem.file) return true;
          
          return !problem.file.includes(fileName) && 
                 !problem.file.includes(fileNameWithPath) &&
                 !problem.file.includes(fileNameWithoutExt);
        });
      });

      // Monaco'daki error decoration'ları temizle
      if (window.monacoEditor && window._errorDecorations) {
        window.monacoEditor.deltaDecorations(window._errorDecorations, [])
        window._errorDecorations = null
        window._errorDetail = null
      }
    };
    
    // Global fonksiyon - CenterPanel'den çağrılacak
    window.onFileSaved = handleFileSave;
    
    return () => {
      window.onFileSaved = null;
    };
  }, [])

  useEffect(() => {
    // İlk terminal'i oluştur
    createNewTerminal()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+` veya Ctrl+Shift+` - Toggle terminal visibility
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        // Panel toggle (gelecekte eklenecek)
      }
      
      // Ctrl+Shift+T - New terminal
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        createNewTerminal()
      }
      
      // Ctrl+Shift+W - Close terminal
      if (e.ctrlKey && e.shiftKey && e.key === 'W' && activeTerminal) {
        e.preventDefault()
        const terminal = terminals.find(t => t.id === activeTerminal)
        if (terminal) {
          closeTerminal(terminal.id, e)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTerminal, terminals])

  const createNewTerminal = async () => {
    const terminalId = `terminal-${Date.now()}`
    
    try {
      // Proje dizinini al
      const projectDir = window.getCurrentProjectPath ? window.getCurrentProjectPath() : null
      
      const ptyId = await window.api.createTerminal(projectDir)
      
      setTerminals(prev => [...prev, {
        id: terminalId,
        ptyId: ptyId,
        title: `Terminal ${terminals.length + 1}`
      }])
      
      setActiveTerminal(terminalId)
      
      // Terminal hazır olduğunda xterm'i başlat
      setTimeout(() => initializeXterm(terminalId, ptyId), 100)
    } catch (error) {
      console.error('Failed to create terminal:', error)
    }
  }

  const initializeXterm = async (terminalId, ptyId) => {
    const container = terminalRefs.current[terminalId]
    if (!container) return

    try {
      // Dinamik import
      const { Terminal } = await import('xterm')
      const { FitAddon } = await import('xterm-addon-fit')
      const { WebLinksAddon } = await import('xterm-addon-web-links')
      
      // CSS'i import et
      await import('xterm/css/xterm.css')

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff'
        },
        scrollback: 1000,
        allowTransparency: false
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()
      
      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)
      
      term.open(container)
      fitAddon.fit()

      // Terminal'den gelen veriyi backend'e gönder
      term.onData(data => {
        window.api.writeToTerminal(ptyId, data)
      })

      // Backend'den gelen veriyi terminal'e yaz
      window.api.onTerminalData(ptyId, (data) => {
        term.write(data)
      })

      // Resize event
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit()
        window.api.resizeTerminal(ptyId, term.cols, term.rows)
      })
      resizeObserver.observe(container)

      xtermInstances.current[terminalId] = {
        term,
        fitAddon,
        resizeObserver
      }

    } catch (error) {
      console.error('Failed to initialize xterm:', error)
      // Fallback: basit terminal UI
      container.innerHTML = `
        <div style="padding: 10px; color: #ccc; font-family: monospace;">
          <div style="color: #f14c4c; margin-bottom: 10px;">⚠️ Terminal initialization failed</div>
          <div style="color: #888;">Please install terminal dependencies:</div>
          <div style="margin-top: 5px; color: #0dbc79;">npm install xterm xterm-addon-fit xterm-addon-web-links node-pty</div>
          <div style="margin-top: 10px; color: #888;">Then restart the application.</div>
        </div>
      `
    }
  }

  const closeTerminal = (terminalId, e) => {
    e.stopPropagation()
    
    const terminal = terminals.find(t => t.id === terminalId)
    if (terminal) {
      // PTY'yi kapat
      window.api.closeTerminal(terminal.ptyId)
      
      // Xterm instance'ı temizle
      const instance = xtermInstances.current[terminalId]
      if (instance) {
        instance.resizeObserver?.disconnect()
        instance.term?.dispose()
        delete xtermInstances.current[terminalId]
      }
      
      // State'ten kaldır
      setTerminals(prev => prev.filter(t => t.id !== terminalId))
      
      // Aktif terminal'i güncelle
      if (activeTerminal === terminalId) {
        const remaining = terminals.filter(t => t.id !== terminalId)
        setActiveTerminal(remaining.length > 0 ? remaining[0].id : null)
      }
    }
  }

  const clearTerminal = () => {
    const instance = xtermInstances.current[activeTerminal]
    if (instance?.term) {
      instance.term.clear()
    }
  }

  const killTerminal = () => {
    const terminal = terminals.find(t => t.id === activeTerminal)
    if (terminal) {
      window.api.killTerminal(terminal.ptyId)
    }
  }

  const handleOpenFile = async (fileName, line, column, errorMessage = '') => {
    try {
      // URL'den dosya yolunu çıkar
      let cleanFileName = fileName
      if (fileName.includes('localhost')) {
        const urlMatch = fileName.match(/localhost:\d+\/(.+?)(?:\?|$)/)
        if (urlMatch) {
          cleanFileName = urlMatch[1]
        }
      }

      // Proje dizinini al
      const projectPath = window.getCurrentProjectPath ? window.getCurrentProjectPath() : null

      if (!projectPath) {
        console.error('No project path')
        return
      }

      // Dosya yolunu oluştur
      let filePath = `${projectPath}/${cleanFileName}`

      // Dosya var mı kontrol et
      let exists = await window.api.fileExists(filePath)

      // Eğer bulunamazsa, public klasöründe ara (HTML dosyaları için)
      if (!exists && cleanFileName.endsWith('.html')) {
        filePath = `${projectPath}/public/${cleanFileName}`
        exists = await window.api.fileExists(filePath)
      }

      // Eğer hala bulunamazsa, index.html olabilir
      if (!exists && cleanFileName.includes('index')) {
        filePath = `${projectPath}/index.html`
        exists = await window.api.fileExists(filePath)
      }

      if (!exists) {
        console.error('File not found:', cleanFileName)
        return
      }

      // Dosyayı oku
      const content = await window.api.readFile(filePath)

      const ext = cleanFileName.split('.').pop()

      const languageMap = {
        js: 'javascript',
        jsx: 'javascript',
        mjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        json: 'json',
        html: 'html',
        htm: 'html',
        css: 'css',
        scss: 'scss',
        sass: 'sass',
        md: 'markdown',
        py: 'python',
        xml: 'xml',
        svg: 'xml'
      }

      const language = languageMap[ext] || 'plaintext'
      const displayName = cleanFileName.split('/').pop()

      // Dosyayı editörde aç
      if (window.openFileInEditor) {
        window.openFileInEditor(filePath, displayName, content, language)

        // Satıra git ve hatalı kodu bul
        setTimeout(() => {
          if (window.monacoEditor) {
            try {
              const model = window.monacoEditor.getModel()
              if (!model) return

              // Hatalı satırı al (bir sonraki satır)
              const errorLine = line + 1
              const lineContent = model.getLineContent(errorLine)

              // Hata mesajından hatalı kod parçasını çıkar
              let errorToken = null

              // "is not defined", "Cannot read", "undefined" gibi hatalarda değişken/fonksiyon adını bul
              const patterns = [
                /['"](\w+)['"]\s+is not defined/,
                /Cannot read (?:property|properties) ['"](\w+)['"]/,
                /(\w+) is not a function/,
                /(\w+) is undefined/,
                /Unexpected token ['"]?(\w+)['"]?/,
                /ReferenceError: (\w+)/
              ]

              for (const pattern of patterns) {
                const match = errorMessage.match(pattern)
                if (match && match[1]) {
                  errorToken = match[1]
                  break
                }
              }

              // Eğer token bulunduysa, satırda ara
              let targetColumn = column
              if (errorToken && lineContent.includes(errorToken)) {
                targetColumn = lineContent.indexOf(errorToken) + 1
              }

              window.monacoEditor.revealLineInCenter(errorLine)
              window.monacoEditor.setPosition({ lineNumber: errorLine, column: targetColumn })
              window.monacoEditor.focus()

              // Global state'e kaydet (tooltip'ten modal açmak için)
              window._errorDetail = {
                message: errorMessage,
                file: displayName,
                line: errorLine,
                column: targetColumn,
                code: lineContent,
                token: errorToken
              }

              // Hatalı kodu vurgula
              if (errorToken) {
                const endColumn = targetColumn + errorToken.length

                // Decoration ekle (süresiz)
                window._errorDecorations = window.monacoEditor.deltaDecorations(
                  window._errorDecorations || [],
                  [
                    {
                      range: new monaco.Range(errorLine, targetColumn, errorLine, endColumn),
                      options: {
                        inlineClassName: 'error-highlight',
                        hoverMessage: {
                          value: `**Error:** ${errorMessage}`
                        }
                      }
                    }
                  ]
                )
              } else {
                // Token bulunamadıysa sadece satırı vurgula
                window._errorDecorations = window.monacoEditor.deltaDecorations(
                  window._errorDecorations || [],
                  [
                    {
                      range: new monaco.Range(errorLine, 1, errorLine, 1000),
                      options: {
                        isWholeLine: true,
                        className: 'error-line-highlight',
                        hoverMessage: {
                          value: `**Error:** ${errorMessage}`
                        }
                      }
                    }
                  ]
                )
              }

              // Tooltip'e button ekle
              setTimeout(() => {
                const addButtonToTooltip = () => {
                  const hoverWidgets = document.querySelectorAll('.monaco-hover')
                  hoverWidgets.forEach((widget) => {
                    // Zaten button eklendiyse skip
                    if (widget.querySelector('.error-detail-button')) return
                    
                    // Error tooltip'i mi kontrol et
                    if (!widget.textContent.includes('Error:')) return

                    // Button oluştur
                    const button = document.createElement('div')
                    button.className = 'error-detail-button'
                    button.innerHTML = '<a href="#" style="color: #4fc3f7; text-decoration: none; font-size: 12px;">Show Details</a>'
                    button.style.cssText = `
                      margin-top: 8px;
                      padding-top: 8px;
                      border-top: 1px solid #3c3c3c;
                    `
                    
                    button.onclick = (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (window._errorDetail) {
                        setErrorDetailModal(window._errorDetail)
                      }
                    }

                    // Tooltip içeriğine ekle
                    const content = widget.querySelector('.monaco-hover-content') || widget
                    content.appendChild(button)
                  })
                }

                // İlk deneme
                addButtonToTooltip()

                // Observer ile sürekli kontrol et
                const observer = new MutationObserver(addButtonToTooltip)
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                })

                // Cleanup için sakla
                if (window._errorObserver) {
                  window._errorObserver.disconnect()
                }
                window._errorObserver = observer
              }, 100)
            } catch (error) {
              console.error('Error highlighting:', error)
            }
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error opening file:', error)
    }
  }

  const toggleSplitMode = () => {
    setSplitMode(!splitMode)
    // Resize tüm terminalleri
    setTimeout(() => {
      Object.values(xtermInstances.current).forEach(instance => {
        instance?.fitAddon?.fit()
      })
    }, 100)
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Yatay Tab Butonları */}
      <div className="flex items-center gap-1 bg-[#252526] border-b border-[#333] px-2 h-10">
        <button
          onClick={() => setActiveBottomTab('terminal')}
          className={`px-4 py-2 text-sm transition-colors border-b-2 ${
            activeBottomTab === 'terminal'
              ? 'border-[#007acc] text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveBottomTab('output')}
          className={`px-4 py-2 text-sm transition-colors border-b-2 ${
            activeBottomTab === 'output'
              ? 'border-[#007acc] text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveBottomTab('problems')}
          className={`px-4 py-2 text-sm transition-colors border-b-2 ${
            activeBottomTab === 'problems'
              ? 'border-[#007acc] text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Problems
        </button>
        
        {/* Clear Output butonu - sadece output tab'ında göster */}
        {activeBottomTab === 'output' && outputLogs.length > 0 && (
          <button
            onClick={() => setOutputLogs([])}
            className="ml-auto px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded"
            title="Clear Output"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab İçeriği - Terminal */}
      <div className={`flex flex-col flex-1 ${activeBottomTab === 'terminal' ? 'block' : 'hidden'}`}>
        {/* Terminal Tab Bar */}
        <div className="flex items-center bg-[#252526] border-b border-[#333] px-2">
          <div className="flex flex-1 overflow-x-auto">
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              onClick={() => setActiveTerminal(terminal.id)}
              className={`flex items-center px-3 py-2 cursor-pointer border-r border-[#333] hover:bg-[#2a2d2e] ${
                activeTerminal === terminal.id ? 'bg-[#1e1e1e]' : ''
              }`}
            >
              <span className="text-sm mr-2">{terminal.title}</span>
              <button
                onClick={(e) => closeTerminal(terminal.id, e)}
                className="text-gray-500 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={toggleSplitMode}
            className={`p-1 hover:bg-[#2a2d2e] rounded ${splitMode ? 'text-blue-400' : ''}`}
            title="Split Terminal"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            onClick={createNewTerminal}
            className="p-1 hover:bg-[#2a2d2e] rounded"
            title="New Terminal"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-[#2a2d2e] rounded"
            title="Clear Terminal"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={killTerminal}
            className="p-1 hover:bg-[#2a2d2e] rounded text-red-400"
            title="Kill Terminal"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          </div>
        </div>

        {/* Terminal Container */}
        <div className="flex-1 relative">
        {splitMode && terminals.length > 1 ? (
          // Split mode: Grid layout
          <div className="grid grid-cols-2 gap-1 h-full p-1">
            {terminals.slice(0, 4).map(terminal => (
              <div
                key={terminal.id}
                className={`border border-[#333] ${activeTerminal === terminal.id ? 'border-blue-500' : ''}`}
                onClick={() => setActiveTerminal(terminal.id)}
              >
                <div
                  ref={el => terminalRefs.current[terminal.id] = el}
                  className="h-full"
                  style={{ padding: '8px' }}
                />
              </div>
            ))}
          </div>
        ) : (
          // Normal mode: Single terminal
          <>
            {terminals.map(terminal => (
              <div
                key={terminal.id}
                ref={el => terminalRefs.current[terminal.id] = el}
                className={`absolute inset-0 ${activeTerminal === terminal.id ? 'block' : 'hidden'}`}
                style={{ padding: '8px' }}
              />
            ))}
          </>
        )}
        
        {terminals.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p>No terminals open</p>
              <button
                onClick={createNewTerminal}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
              >
                Open Terminal
              </button>
            </div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 ${activeBottomTab === 'output' ? 'flex' : 'hidden'} flex-col gap-2 p-4 overflow-auto`}>
        {outputLogs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Output Panel</p>
              <p className="text-[10px] text-gray-600 mt-2">No output yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {outputLogs.map((log, index) => {
              // Dosya yolunu parse et (filename:line:col)
              const sourceMatch = log.message.match(/\(([^)]+):(\d+):(\d+)\)/)
              const hasSource = sourceMatch && sourceMatch[1]
              
              return (
                <button
                  key={index} 
                  className={`w-full text-left p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/20 text-red-400' :
                    log.type === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                    log.type === 'success' ? 'bg-green-900/20 text-green-400' :
                    'bg-[#2d2d30] text-gray-300'
                  } ${hasSource ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
                  onClick={() => {
                    if (hasSource) {
                      // Hata mesajını da geç
                      const errorMsg = log.message.replace(/\([^)]+\)/, '').trim()
                      handleOpenFile(
                        sourceMatch[1],
                        parseInt(sourceMatch[2]),
                        parseInt(sourceMatch[3]),
                        errorMsg
                      )
                    }
                  }}
                  disabled={!hasSource}
                >
                  <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                  <span className="font-mono text-xs whitespace-pre-wrap">{log.message}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Tab İçeriği - Problems */}
      <div className={`flex-1 ${activeBottomTab === 'problems' ? 'flex' : 'hidden'} flex-col overflow-auto`}>
        {problems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Problems Panel</p>
              <p className="text-[10px] text-gray-600 mt-2">No problems detected</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d30] border-b border-[#3a3a3a]">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-red-400">
                  ❌ {problems.filter(p => p.type === 'error').length} Errors
                </span>
                <span className="text-yellow-400">
                  ⚠️ {problems.filter(p => p.type === 'warning').length} Warnings
                </span>
              </div>
              <button
                onClick={() => setProblems([])}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear All
              </button>
            </div>
            
            {/* Problems List */}
            <div className="flex-1">
              {problems.map((problem, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (problem.file && problem.line) {
                      handleOpenFile(
                        problem.file,
                        parseInt(problem.line),
                        parseInt(problem.column || 1),
                        problem.message
                      )
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2d2e] border-b border-[#3a3a3a] transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none mt-0.5">
                      {problem.type === 'error' ? '❌' : '⚠️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${
                        problem.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {problem.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {problem.file}:{problem.line}:{problem.column}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Detail Modal */}
      {errorDetailModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setErrorDetailModal(null)}
        >
          <div
            className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400">Error Details</h3>
              <button
                onClick={() => setErrorDetailModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">File</p>
                <p className="text-sm text-white font-mono">
                  {errorDetailModal.file}:{errorDetailModal.line}:{errorDetailModal.column}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Error Message</p>
                <p className="text-sm text-red-400">{errorDetailModal.message}</p>
              </div>

              {errorDetailModal.token && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Problematic Code</p>
                  <div className="bg-[#2d2d30] p-3 rounded font-mono text-sm">
                    <span className="text-gray-400">{errorDetailModal.code.substring(0, errorDetailModal.code.indexOf(errorDetailModal.token))}</span>
                    <span className="bg-red-900/50 text-red-300 px-1">{errorDetailModal.token}</span>
                    <span className="text-gray-400">{errorDetailModal.code.substring(errorDetailModal.code.indexOf(errorDetailModal.token) + errorDetailModal.token.length)}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Possible Solutions</p>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  {errorDetailModal.message.includes('is not defined') && (
                    <>
                      <li>Check if the variable/function is imported</li>
                      <li>Verify the spelling of the identifier</li>
                      <li>Make sure the variable is declared before use</li>
                    </>
                  )}
                  {errorDetailModal.message.includes('Cannot read') && (
                    <>
                      <li>Check if the object is null or undefined</li>
                      <li>Add optional chaining (?.) to safely access properties</li>
                      <li>Verify the object structure</li>
                    </>
                  )}
                  {errorDetailModal.message.includes('is not a function') && (
                    <>
                      <li>Check if the function is properly imported</li>
                      <li>Verify the function name spelling</li>
                      <li>Make sure you're calling a function, not a variable</li>
                    </>
                  )}
                  {!errorDetailModal.message.includes('is not defined') &&
                    !errorDetailModal.message.includes('Cannot read') &&
                    !errorDetailModal.message.includes('is not a function') && (
                      <li>Check the error message for specific details</li>
                    )}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setErrorDetailModal(null)}
                className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
