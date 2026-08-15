import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { configureIntelliSense } from './config/intellisense-config'
import { registerSnippets } from './config/snippets'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

// IntelliSense'i yapılandır
configureIntelliSense(monaco)

// Snippet'leri kaydet
registerSnippets(monaco)

// Global import command'ını kaydet - Monaco'nun internal API'si ile
if (!window._importCommandRegistered) {
  window._importCommandRegistered = true

  // Monaco editor'ün global command service'ine erişim
  // Bu biraz hack ama çalışıyor
  const originalCreate = monaco.editor.create
  monaco.editor.create = function (...args) {
    const editor = originalCreate.apply(this, args)

    // İlk editor oluşturulduğunda command'ı kaydet
    if (!window._commandServiceRegistered) {
      window._commandServiceRegistered = true

      try {
        // Editor'ün command service'ine erişim
        const commandService = editor._commandService || editor._actions?.get('addImportFromLightbulb')

        // Global command handler
        window.executeImportCommand = () => {
          console.log('executeImportCommand çağrıldı')
          if (window._pendingImport && window.addImportToEditor) {
            const { symbolName, fromFile, toFile, language, exportType } = window._pendingImport
            window.addImportToEditor(symbolName, fromFile, toFile, language, exportType)
            delete window._pendingImport
          }
        }
      } catch (e) {
        console.log('Command service erişilemedi:', e)
      }
    }

    return editor
  }
}

export default monaco
