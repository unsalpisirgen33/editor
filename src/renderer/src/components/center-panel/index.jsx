import { useEffect, useRef, useState } from 'react'
import monaco from '../../monaco-config'
import SearchPanel from '../search-panel'
import { getIntelliSenseForLanguage } from '../../config/intellisense-config'
import { loadUserKeybindings, matchKeybinding } from '../../config/keybindings'
import {
  scanProjectForExports,
  generateImportStatement,
  addImportToFile,
  findExportsInFile
} from '../../utils/autoImport'
import { expandEmmet, isEmmetAbbreviation } from '../../utils/emmet'

export default function CenterPanel() {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const modelsRef = useRef({}) // Her dosya için ayrı model
  const [openFiles, setOpenFiles] = useState([])
  const [activeFileIndex, setActiveFileIndex] = useState(-1)
  const [showSearch, setShowSearch] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [projectExports, setProjectExports] = useState([])
  const [projectPath, setProjectPath] = useState(null)
  const projectExportsRef = useRef([]) // Ref ile güncel değeri tut

  // Monaco Editor'ü oluştur
  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // IntelliSense ayarlarını yükle
      const intelliSenseOptions = getIntelliSenseForLanguage('javascript')
      
      monacoRef.current = monaco.editor.create(editorRef.current, {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        
        // IntelliSense ayarları
        ...intelliSenseOptions,
        
        // Ek özellikler
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: 'on',
          comments: false,
          strings: true
        },
        quickSuggestionsDelay: 0,
        parameterHints: {
          enabled: true,
          cycle: true
        },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoClosingOvertype: 'always',
        autoSurround: 'languageDefined',
        formatOnType: true,
        formatOnPaste: true,
        
        // Snippet ayarları
        snippetSuggestions: 'top',
        tabCompletion: 'on',
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        
        // Hover ayarları
        hover: {
          enabled: true,
          delay: 300,
          sticky: true
        },
        
        // Signature help
        signatureHelp: {
          enabled: true
        },
        
        // Emmet
        'emmet.triggerExpansionOnTab': true,
        'emmet.showExpandedAbbreviation': 'always',
        'emmet.showSuggestionsAsSnippets': true,
        
        // Go to definition ayarları - CTRL+HOVER KAPALI
        links: false, // Ctrl+hover ile link gösterme KAPALI
        gotoLocation: {
          multiple: 'goto',
          multipleDefinitions: 'goto',
          multipleTypeDefinitions: 'goto',
          multipleDeclarations: 'goto',
          multipleImplementations: 'goto',
          multipleReferences: 'goto'
        }
      })
      
      // Klavye kısayollarını yükle
      const keybindings = loadUserKeybindings()
      
      // Monaco'nun kendi kısayollarını ekle
      monacoRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space,
        () => {
          monacoRef.current.trigger('', 'editor.action.triggerSuggest', {})
        }
      )
      
      monacoRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Space,
        () => {
          monacoRef.current.trigger('', 'editor.action.triggerParameterHints', {})
        }
      )
      
      // Cursor pozisyonunu takip et
      monacoRef.current.onDidChangeCursorPosition((e) => {
        if (window.updateStatusBar) {
          window.updateStatusBar({
            line: e.position.lineNumber,
            column: e.position.column
          })
        }
      })
      
      // Global referans - output'tan dosya açmak için
      window.monacoEditor = monacoRef.current
      
      // Auto-import completion provider'ı kaydet
      const completionProvider = monaco.languages.registerCompletionItemProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }

            const currentFilePath = model.uri.path
            const suggestions = []

            // Proje export'larından öneriler oluştur
            projectExportsRef.current.forEach((exp) => {
              // Aynı dosyadan import etme
              if (exp.file === currentFilePath) return

              // Zaten import edilmiş mi kontrol et
              const content = model.getValue()
              if (content.includes(`import { ${exp.name} }`) || content.includes(`import ${exp.name}`)) {
                return
              }

              suggestions.push({
                label: exp.name,
                kind:
                  exp.type === 'component' || exp.type === 'default'
                    ? monaco.languages.CompletionItemKind.Class
                    : monaco.languages.CompletionItemKind.Function,
                detail: `Auto import from ${exp.file.split('/').pop()} (${exp.type})`,
                documentation: `Import ${exp.name} from ${exp.file}`,
                insertText: exp.name,
                range: range,
                command: {
                  id: 'editor.action.addImport',
                  title: 'Add Import',
                  arguments: [exp.name, exp.file, currentFilePath, model.getLanguageId(), exp.type]
                }
              })
            })

            return { suggestions }
          }
        }
      )

      // Emmet-like snippet provider
      const emmetProvider = monaco.languages.registerCompletionItemProvider(
        ['html', 'javascriptreact', 'typescriptreact', 'javascript', 'typescript'],
        {
          provideCompletionItems: async (model, position) => {
            const lineContent = model.getLineContent(position.lineNumber)
            const textBeforeCursor = lineContent.substring(0, position.column - 1)
            
            // Emmet abbreviation'ı al - özel karakterler ve boşluk dahil
            const emmetMatch = textBeforeCursor.match(/([\w.#>*+{}\[\]$ -]+)$/)
            
            if (!emmetMatch) {
              return { suggestions: [] }
            }
            
            let emmetText = emmetMatch[1].trim() // Boşlukları temizle
            
            // Çok kısa veya sadece boşluksa skip
            if (emmetText.length < 2) {
              return { suggestions: [] }
            }
            
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - emmetMatch[1].length,
              endColumn: position.column
            }

            const suggestions = []

            // Direkt expand dene
            try {
              const expanded = await expandEmmet(emmetText)
              
              if (expanded && expanded.length > 0) {
                suggestions.push({
                  label: emmetText,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: expanded,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  detail: 'Emmet abbreviation',
                  documentation: `Expand to:\n${expanded.substring(0, 200)}...`,
                  range: range,
                  sortText: '0' // En üstte göster
                })
              }
            } catch (error) {
              // Sessizce geç
            }

            return { suggestions }
          }
        }
      )

      // Code Action Provider - Alt+Enter için Quick Fix
      const codeActionProvider = monaco.languages.registerCodeActionProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        {
          provideCodeActions: (model, range, context) => {
            const actions = []
            const currentFilePath = model.uri.path
            const content = model.getValue()
            
            // Cursor'daki kelimeyi al
            const word = model.getWordAtPosition(range.getStartPosition())
            
            console.log('Code Action çağrıldı:', {
              word: word?.word,
              projectExportsCount: projectExportsRef.current.length,
              currentFile: currentFilePath
            })
            
            if (!word) {
              console.log('Kelime bulunamadı')
              return { actions: [], dispose: () => {} }
            }
            
            const symbolName = word.word
            
            // Bu sembol için import önerileri bul
            const matchingExports = projectExportsRef.current.filter(exp => {
              // Aynı dosyadan import etme
              if (exp.file === currentFilePath) return false
              
              // Sembol adı eşleşmeli
              if (exp.name !== symbolName) return false
              
              // Zaten import edilmiş mi kontrol et
              if (content.includes(`import { ${exp.name} }`) || content.includes(`import ${exp.name}`)) {
                return false
              }
              
              return true
            })
            
            console.log('Eşleşen export sayısı:', matchingExports.length)

            // Her eşleşen export için bir action oluştur
            matchingExports.forEach((exp) => {
              const importStatement = generateImportStatement(
                exp.name,
                exp.file,
                currentFilePath,
                model.getLanguageId(),
                exp.type
              )

              // Son import satırını bul
              const content = model.getValue()
              const lines = content.split('\n')
              let lastImportLine = 0

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()
                if (line.startsWith('import ') || line.startsWith('require(')) {
                  lastImportLine = i + 1 // 1-indexed
                }
              }

              // Eğer hiç import yoksa en başa ekle
              const insertLine = lastImportLine > 0 ? lastImportLine + 1 : 1

              // Monaco'nun WorkspaceEdit formatı
              actions.push({
                title: `Import '${exp.name}' from '${exp.file.split('/').pop()}'`,
                kind: 'quickfix',
                diagnostics: [],
                isPreferred: true,
                edit: {
                  edits: [
                    {
                      resource: model.uri,
                      textEdit: {
                        range: {
                          startLineNumber: insertLine,
                          startColumn: 1,
                          endLineNumber: insertLine,
                          endColumn: 1
                        },
                        text: importStatement
                      }
                    }
                  ]
                }
              })
            })

            console.log('Oluşturulan action sayısı:', actions.length)

            return {
              actions: actions,
              dispose: () => {}
            }
          }
        }
      )

      // Definition Provider - Ctrl+Click ile tanıma git
      // Monaco'nun built-in definition provider'ı yerine manuel event handler kullanıyoruz
      // çünkü dosyayı açmak için state'e erişmemiz gerekiyor
      
      // Dosya açma fonksiyonu (hem Ctrl+Click hem de context menu için)
      const openDefinitionFile = async (symbolName, currentFilePath, lineContent) => {
        // Import statement'ta mı?
        const importMatch = lineContent.match(/import\s+(?:{[^}]*}|[\w]+)\s+from\s+['"]([^'"]+)['"]/)
        
        if (importMatch) {
          let importPath = importMatch[1]
          
          if (importPath.startsWith('.')) {
            const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'))
            const parts = currentDir.split('/').filter(p => p)
            const importParts = importPath.split('/').filter(p => p)
            
            for (const part of importParts) {
              if (part === '..') parts.pop()
              else if (part !== '.') parts.push(part)
            }
            
            importPath = '/' + parts.join('/')
            
            if (!importPath.match(/\.(jsx?|tsx?)$/)) {
              const extensions = ['.jsx', '.tsx', '.js', '.ts']
              for (const ext of extensions) {
                try {
                  const exists = await window.api.fileExists(importPath + ext)
                  if (exists) {
                    importPath += ext
                    break
                  }
                } catch (e) {}
              }
            }
          }
          
          // Path'i temizle
          let cleanPath = importPath.replace(/\\/g, '/')
          if (cleanPath.match(/^[A-Z]:\/[A-Z]:\//)) cleanPath = cleanPath.substring(3)
          if (cleanPath.match(/^\/[A-Z]:\//)) cleanPath = cleanPath.substring(1)
          
          // Dosyayı oku ve aç
          try {
            const content = await window.api.readFile(cleanPath)
            if (content) {
              const fileName = cleanPath.split('/').pop()
              const ext = fileName.split('.').pop()
              const languageMap = {
                js: 'javascript', jsx: 'javascript',
                ts: 'typescript', tsx: 'typescript',
                json: 'json', html: 'html', css: 'css'
              }
              
              // Dosyayı state'e ekle
              setOpenFiles(prev => {
                // Zaten açık mı?
                const existing = prev.findIndex(f => f.path === cleanPath)
                if (existing >= 0) {
                  setActiveFileIndex(existing)
                  return prev
                }
                
                const newFile = {
                  path: cleanPath,
                  name: fileName,
                  content: content,
                  language: languageMap[ext] || 'plaintext',
                  isDirty: false
                }
                
                setActiveFileIndex(prev.length)
                return [...prev, newFile]
              })
            }
          } catch (error) {
            console.error('Dosya açma hatası:', error)
          }
          
          return
        }
        
        // Normal sembol - proje export'larında ara
        const matchingExports = projectExportsRef.current.filter(exp => exp.name === symbolName)
        
        if (matchingExports.length > 0) {
          const exp = matchingExports[0]
          let filePath = exp.file.replace(/\\/g, '/').replace(/\/\//g, '/')
          
          if (filePath.match(/^[A-Z]:\/[A-Z]:\//)) filePath = filePath.substring(3)
          if (filePath.match(/^\/[A-Z]:\//)) filePath = filePath.substring(1)
          
          if (!filePath.match(/\.(jsx?|tsx?)$/)) {
            const extensions = ['.jsx', '.tsx', '.js', '.ts']
            for (const ext of extensions) {
              try {
                const exists = await window.api.fileExists(filePath + ext)
                if (exists) {
                  filePath += ext
                  break
                }
              } catch (e) {}
            }
          }
          
          try {
            const content = await window.api.readFile(filePath)
            if (content) {
              const fileName = filePath.split('/').pop()
              const ext = fileName.split('.').pop()
              const languageMap = {
                js: 'javascript', jsx: 'javascript',
                ts: 'typescript', tsx: 'typescript',
                json: 'json', html: 'html', css: 'css'
              }
              
              // Export satırını bul
              const lines = content.split('\n')
              let targetLine = 1
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                if (line.includes(`export default ${symbolName}`) ||
                    line.includes(`export const ${symbolName}`) ||
                    line.includes(`export function ${symbolName}`) ||
                    line.includes(`export class ${symbolName}`) ||
                    line.includes(`const ${symbolName}`) ||
                    line.includes(`function ${symbolName}`) ||
                    line.includes(`class ${symbolName}`)) {
                  targetLine = i + 1
                  break
                }
              }
              
              // Dosyayı state'e ekle
              setOpenFiles(prev => {
                const existing = prev.findIndex(f => f.path === filePath)
                if (existing >= 0) {
                  setActiveFileIndex(existing)
                  // Satıra git
                  setTimeout(() => {
                    monacoRef.current?.setPosition({ lineNumber: targetLine, column: 1 })
                    monacoRef.current?.revealLineInCenter(targetLine)
                  }, 100)
                  return prev
                }
                
                const newFile = {
                  path: filePath,
                  name: fileName,
                  content: content,
                  language: languageMap[ext] || 'plaintext',
                  isDirty: false
                }
                
                setActiveFileIndex(prev.length)
                // Satıra git
                setTimeout(() => {
                  monacoRef.current?.setPosition({ lineNumber: targetLine, column: 1 })
                  monacoRef.current?.revealLineInCenter(targetLine)
                }, 100)
                
                return [...prev, newFile]
              })
            }
          } catch (error) {
            console.error('Dosya açma hatası:', error)
          }
        }
      }
      
      // Definition Provider - sağ tık menüsü ve F12 için (Ctrl+hover DEĞİL)
      let isCtrlPressed = false
      
      // Ctrl tuşunu takip et
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Control' || e.key === 'Meta') {
          isCtrlPressed = true
        }
      })
      
      window.addEventListener('keyup', (e) => {
        if (e.key === 'Control' || e.key === 'Meta') {
          isCtrlPressed = false
        }
      })
      
      monaco.languages.registerDefinitionProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        {
          provideDefinition: async (model, position) => {
            // Eğer sadece Ctrl basılıysa (hover), işlem yapma
            if (isCtrlPressed) {
              return null
            }
            
            const word = model.getWordAtPosition(position)
            if (!word) return null
            
            const symbolName = word.word
            const currentFilePath = model.uri.path
            const lineContent = model.getLineContent(position.lineNumber)
            
            // Dosyayı aç
            openDefinitionFile(symbolName, currentFilePath, lineContent)
            
            return null
          }
        }
      )

      // Alt+Enter kısayolu - Quick Fix (Basitleştirilmiş versiyon)
      monacoRef.current.addCommand(
        monaco.KeyMod.Alt | monaco.KeyCode.Enter,
        () => {
          console.log('Alt+Enter basıldı')
          
          const model = monacoRef.current.getModel()
          if (!model) return
          
          const position = monacoRef.current.getPosition()
          const word = model.getWordAtPosition(position)
          
          if (!word) {
            console.log('Kelime bulunamadı')
            return
          }
          
          const symbolName = word.word
          const currentFilePath = model.uri.path
          const content = model.getValue()
          
          // Eşleşen export'ları bul
          const matchingExports = projectExportsRef.current.filter(exp => {
            if (exp.file === currentFilePath) return false
            if (exp.name !== symbolName) return false
            if (content.includes(`import { ${exp.name} }`) || content.includes(`import ${exp.name}`)) {
              return false
            }
            return true
          })
          
          console.log('Eşleşen export sayısı:', matchingExports.length)
          
          if (matchingExports.length === 0) {
            console.log('Import edilecek sembol bulunamadı')
            return
          }
          
          // İlk eşleşmeyi kullan (birden fazla varsa ilkini)
          const exp = matchingExports[0]

          const importStatement = generateImportStatement(
            exp.name,
            exp.file,
            currentFilePath,
            model.getLanguageId(),
            exp.type
          )

          const newContent = addImportToFile(content, importStatement)
          model.setValue(newContent)

          console.log('Import eklendi:', importStatement.trim())
          
          // Dosyayı dirty olarak işaretle
          setOpenFiles((prev) => {
            const updated = [...prev]
            const index = updated.findIndex((f) => f.path === currentFilePath)
            if (index >= 0) {
              updated[index] = { ...updated[index], content: newContent, isDirty: true }
            }
            return updated
          })
        }
      )

      // Import ekleme komutunu kaydet (Ctrl+Space için)
      monacoRef.current.addCommand(0, (symbolName, fromFile, toFile, language, exportType) => {
        const model = monacoRef.current.getModel()
        if (!model) return

        const importStatement = generateImportStatement(
          symbolName,
          fromFile,
          toFile,
          language,
          exportType
        )
        const currentContent = model.getValue()
        const newContent = addImportToFile(currentContent, importStatement)

        // İçeriği güncelle
        model.setValue(newContent)

        // Dosyayı dirty olarak işaretle
        setOpenFiles((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((f) => f.path === toFile)
          if (index >= 0) {
            updated[index] = { ...updated[index], content: newContent, isDirty: true }
          }
          return updated
        })
      })

      // Global import ekleme fonksiyonu (Alt+Enter için)
      window.addImportToEditor = (symbolName, fromFile, toFile, language, exportType) => {
        const model = monacoRef.current.getModel()
        if (!model) return

        const importStatement = generateImportStatement(
          symbolName,
          fromFile,
          toFile,
          language,
          exportType
        )
        const currentContent = model.getValue()
        const newContent = addImportToFile(currentContent, importStatement)

        // İçeriği güncelle
        model.setValue(newContent)

        // Dosyayı dirty olarak işaretle
        setOpenFiles((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((f) => f.path === toFile)
          if (index >= 0) {
            updated[index] = { ...updated[index], content: newContent, isDirty: true }
          }
          return updated
        })
      }

      // Lightbulb için global command
      window.executeImportCommand = () => {
        console.log('executeImportCommand çağrıldı')
        if (window._pendingImport) {
          const { symbolName, fromFile, toFile, language, exportType } = window._pendingImport
          window.addImportToEditor(symbolName, fromFile, toFile, language, exportType)
          delete window._pendingImport
        }
      }

      // Monaco action olarak da kaydet
      monacoRef.current.addAction({
        id: 'executeImportCommand',
        label: 'Execute Import Command',
        run: () => {
          if (window.executeImportCommand) {
            window.executeImportCommand()
          }
        }
      })

      // Monaco command registry'ye import komutunu ekle
      if (monaco.commands && monaco.commands.registerCommand) {
        monaco.commands.registerCommand('_addImport', (accessor, uri, symbolName, fromFile, toFile, language) => {
          console.log('_addImport komutu çağrıldı:', { symbolName, fromFile, toFile })
          if (window.addImportToEditor) {
            window.addImportToEditor(symbolName, fromFile, toFile, language)
          }
        })
      }
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
      }
      // Tüm modelleri temizle
      Object.values(modelsRef.current).forEach(model => model.dispose())
    }
  }, [])

  // Aktif dosya değiştiğinde model'i değiştir
  useEffect(() => {
    if (!monacoRef.current || activeFileIndex < 0 || !openFiles[activeFileIndex]) {
      return
    }

    const file = openFiles[activeFileIndex]

    // Bu dosya için model var mı?
    if (!modelsRef.current[file.path]) {
      // Yeni model oluştur
      const uri = monaco.Uri.file(file.path)
      const model = monaco.editor.createModel(file.content || '', file.language, uri)
      modelsRef.current[file.path] = model

      // Model değişikliklerini takip et
      model.onDidChangeContent(() => {
        const content = model.getValue()
        setOpenFiles((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((f) => f.path === file.path)
          if (index >= 0) {
            updated[index] = { ...updated[index], content, isDirty: true }
          }
          return updated
        })
      })
    }

    // Model'i editöre ata
    monacoRef.current.setModel(modelsRef.current[file.path])
    monacoRef.current.focus()
    
    // Status bar'ı güncelle
    if (window.updateStatusBar) {
      const languageMap = {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        python: 'Python',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON',
        markdown: 'Markdown',
        plaintext: 'Plain Text'
      }
      
      const fileTypeMap = {
        javascript: 'JS',
        typescript: 'TS',
        jsx: 'JSX',
        tsx: 'TSX',
        python: 'PY',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON',
        markdown: 'MD'
      }
      
      const position = monacoRef.current.getPosition()
      
      window.updateStatusBar({
        language: languageMap[file.language] || file.language.toUpperCase(),
        fileType: fileTypeMap[file.language] || file.language.toUpperCase(),
        encoding: 'UTF-8',
        line: position?.lineNumber || 1,
        column: position?.column || 1,
        hasFile: true
      })
    }
  }, [activeFileIndex, openFiles])

  const handleTabClick = (index) => {
    setActiveFileIndex(index)
  }

  const handleTabClose = (index, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation()
    }
    
    const file = openFiles[index]
    if (file && file.isDirty) {
      const confirmClose = window.confirm(`${file.name} has unsaved changes. Close anyway?`)
      if (!confirmClose) return
    }

    // Model'i temizle
    if (modelsRef.current[file.path]) {
      modelsRef.current[file.path].dispose()
      delete modelsRef.current[file.path]
    }

    const newFiles = openFiles.filter((_, i) => i !== index)
    setOpenFiles(newFiles)
    
    // Aktif index'i güncelle
    if (newFiles.length === 0) {
      setActiveFileIndex(-1)
    } else if (activeFileIndex === index) {
      setActiveFileIndex(Math.max(0, index - 1))
    } else if (activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1)
    }
  }

  const handleCloseOthers = (index) => {
    const file = openFiles[index]
    const hasUnsaved = openFiles.some((f, i) => i !== index && f.isDirty)
    
    if (hasUnsaved) {
      const confirmClose = window.confirm('Some files have unsaved changes. Close anyway?')
      if (!confirmClose) return
    }

    // Diğer modelleri temizle
    openFiles.forEach((f, i) => {
      if (i !== index && modelsRef.current[f.path]) {
        modelsRef.current[f.path].dispose()
        delete modelsRef.current[f.path]
      }
    })

    setOpenFiles([file])
    setActiveFileIndex(0)
    setContextMenu(null)
  }

  const handleCloseAll = () => {
    const hasUnsaved = openFiles.some(f => f.isDirty)
    
    if (hasUnsaved) {
      const confirmClose = window.confirm('Some files have unsaved changes. Close anyway?')
      if (!confirmClose) return
    }

    // Tüm modelleri temizle
    Object.values(modelsRef.current).forEach(model => model.dispose())
    modelsRef.current = {}

    setOpenFiles([])
    setActiveFileIndex(-1)
    setContextMenu(null)
  }

  const handleContextMenu = (e, index) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      index: index
    })
  }

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (activeFileIndex >= 0 && openFiles[activeFileIndex]) {
          const file = openFiles[activeFileIndex]
          try {
            await window.api.saveFile({
              path: file.path,
              content: file.content
            })
            setOpenFiles((prev) => {
              const updated = [...prev]
              updated[activeFileIndex] = { ...updated[activeFileIndex], isDirty: false }
              return updated
            })

            // Dosya kaydedildi, hata kontrolü için bildir
            if (window.onFileSaved) {
              window.onFileSaved(file.path)
            }

            // Export'ları yeniden tara (dosya değiştiyse)
            if (projectPath && /\.(jsx?|tsx?)$/.test(file.name)) {
              const fileExports = await findExportsInFile(file.path, window.api)
              
              // Bu dosyanın eski export'larını kaldır
              const updatedExports = projectExportsRef.current.filter(exp => exp.file !== file.path)
              
              // Yeni export'ları ekle
              updatedExports.push(...fileExports)
              
              setProjectExports(updatedExports)
              projectExportsRef.current = updatedExports
              
              console.log(`Export'lar güncellendi: ${file.name} - ${fileExports.length} export`)
            }
          } catch (error) {
            console.error('Save failed:', error)
          }
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault()
        setShowSearch(true)
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        if (activeFileIndex >= 0) {
          const file = openFiles[activeFileIndex]
          if (file && file.isDirty) {
            const confirmClose = window.confirm(`${file.name} has unsaved changes. Close anyway?`)
            if (!confirmClose) return
          }

          if (modelsRef.current[file.path]) {
            modelsRef.current[file.path].dispose()
            delete modelsRef.current[file.path]
          }

          const newFiles = openFiles.filter((_, i) => i !== activeFileIndex)
          setOpenFiles(newFiles)
          
          if (newFiles.length === 0) {
            setActiveFileIndex(-1)
          } else {
            setActiveFileIndex(Math.max(0, activeFileIndex - 1))
          }
        }
      }
      
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFileIndex, openFiles, showSearch])

  // Global dosya açma fonksiyonu
  useEffect(() => {
    window.openFileInEditor = (filePath, fileName, content, language = 'javascript') => {
      
      setOpenFiles((prevFiles) => {
        const existingIndex = prevFiles.findIndex((f) => f.path === filePath)
        
        if (existingIndex >= 0) {
          // Dosya zaten açık
          setActiveFileIndex(existingIndex)
          return prevFiles
        } else {
          // Yeni dosya ekle
          const newFile = {
            path: filePath,
            name: fileName,
            content: content || '',
            language: language,
            isDirty: false
          }
          const newFiles = [...prevFiles, newFile]
          setActiveFileIndex(newFiles.length - 1)
          return newFiles
        }
      })
    }
    
    window.goToLine = (lineNumber) => {
      if (monacoRef.current) {
        monacoRef.current.revealLineInCenter(lineNumber)
        monacoRef.current.setPosition({ lineNumber, column: 1 })
        monacoRef.current.focus()
      }
    }

    // Definition'dan dosya açma
    window.openDefinitionFile = async (uri, range) => {
      let filePath = uri.path
      
      console.log('openDefinitionFile çağrıldı, URI path:', filePath)
      
      // Windows path düzeltmeleri
      // /C:/Users/... formatını C:/Users/... yap
      if (filePath.match(/^\/[A-Z]:\//)) {
        filePath = filePath.substring(1) // İlk / karakterini at
      }
      
      // Çift drive letter varsa düzelt (C:\C:\ -> C:\)
      if (filePath.match(/^[A-Z]:\\[A-Z]:\\/)) {
        filePath = filePath.substring(3)
      }
      
      // Backslash'leri forward slash'e çevir
      filePath = filePath.replace(/\\/g, '/')
      
      console.log('openDefinitionFile düzeltilmiş path:', filePath)
      
      const fileName = filePath.split('/').pop()
      
      try {
        const content = await window.api.readFile(filePath)
        const ext = fileName.split('.').pop()
        const languageMap = {
          js: 'javascript',
          jsx: 'javascript',
          ts: 'typescript',
          tsx: 'typescript',
          json: 'json',
          html: 'html',
          css: 'css'
        }
        const language = languageMap[ext] || 'javascript'
        
        window.openFileInEditor(filePath, fileName, content, language)
        
        // Satıra git
        setTimeout(() => {
          if (window.goToLine) {
            window.goToLine(range.startLineNumber)
          }
        }, 100)
      } catch (error) {
        console.error('Error opening definition file:', error)
      }
    }
  }, [])

  // Proje export'larını tara
  useEffect(() => {
    const scanProject = async () => {
      try {
        // Proje yolunu al
        let path = await window.api.getProjectPath()
        console.log('Proje yolu:', path)

        // Eğer proje yolu yoksa ve dosya açıksa, dosyanın klasöründen proje yolunu bul
        if (!path && openFiles.length > 0) {
          const firstFile = openFiles[0].path
          // Dosya yolundan proje kök dizinini bul (src klasörünün parent'ı)
          const parts = firstFile.split('/')
          const srcIndex = parts.findIndex((p) => p === 'src')
          if (srcIndex > 0) {
            path = parts.slice(0, srcIndex).join('/')
            console.log('Dosya yolundan proje yolu bulundu:', path)
          } else {
            // src yoksa dosyanın bulunduğu klasörü kullan
            path = parts.slice(0, -1).join('/')
            console.log('Dosya klasörü proje yolu olarak kullanılıyor:', path)
          }
        }

        if (path) {
          setProjectPath(path)

          // Export'ları tara
          console.log('Export taraması başlıyor...')
          const exports = await scanProjectForExports(path, window.api)
          setProjectExports(exports)
          projectExportsRef.current = exports // Ref'i de güncelle
          console.log(`Auto-import: ${exports.length} export bulundu`, exports)
        } else {
          console.log('Proje yolu bulunamadı. Lütfen bir klasör açın veya dosya açın.')
        }
      } catch (error) {
        console.error('Proje tarama hatası:', error)
      }
    }

    scanProject()
  }, [openFiles.length]) // openFiles değiştiğinde tekrar tara

  return (
    <div className="flex flex-col h-full">
      {showSearch && (
        <SearchPanel 
          editor={monacoRef.current} 
          onClose={() => setShowSearch(false)} 
        />
      )}
      
      <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto min-h-[40px]">
        {openFiles.length > 0 ? (
          openFiles.map((file, index) => (
            <div
              key={file.path}
              onContextMenu={(e) => handleContextMenu(e, index)}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[#333] hover:bg-[#2a2d2e] min-w-[120px] max-w-[200px] ${
                activeFileIndex === index ? 'bg-[#1e1e1e]' : ''
              }`}
            >
              <div 
                onClick={() => handleTabClick(index)}
                className="flex-1 flex items-center gap-1 overflow-hidden"
              >
                {file.isDirty && <span className="text-white">●</span>}
                <span className={`truncate ${file.isDirty ? 'text-white' : 'text-gray-400'}`}>
                  {file.name}
                </span>
              </div>
              <button
                onClick={(e) => handleTabClose(index, e)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-[#3a3a3a] text-gray-500 hover:text-white transition-colors"
                title="Close (Ctrl+W)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="flex items-center px-3 py-2 text-sm text-gray-500">
            No files open
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-[#3c3c3c] border border-[#555] rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              handleTabClose(contextMenu.index, {})
              setContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
          >
            <span>Close</span>
            <span className="ml-auto text-xs text-gray-500">Ctrl+W</span>
          </button>
          <button
            onClick={() => handleCloseOthers(contextMenu.index)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e]"
          >
            Close Others
          </button>
          <button
            onClick={handleCloseAll}
            className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e]"
          >
            Close All
          </button>
        </div>
      )}

      <div ref={editorRef} className="flex-1" />
    </div>
  )
}
