/**
 * IntelliSense Konfigürasyon Dosyası
 * 
 * @description
 * Bu dosya, Monaco Editor'ün IntelliSense özelliklerini tüm diller için yapılandırır.
 * Her dil için özel ayarlar, snippet'ler ve otomatik tamamlama kuralları içerir.
 * 
 * Desteklenen Özellikler:
 * - Auto-completion (Otomatik tamamlama)
 * - Parameter hints (Parametre ipuçları)
 * - Hover documentation (Üzerine gelince dokümantasyon)
 * - Signature help (İmza yardımı)
 * - Code snippets (Kod parçacıkları)
 * - Quick suggestions (Hızlı öneriler)
 * 
 * @module intellisense-config
 */

/**
 * Varsayılan IntelliSense ayarları
 * Tüm diller için geçerli olan temel ayarlar
 */
export const defaultIntelliSenseOptions = {
  // Otomatik tamamlama
  quickSuggestions: {
    other: true,      // Diğer bağlamlarda
    comments: false,  // Yorumlarda kapalı
    strings: true     // String'lerde açık
  },
  
  // Parametre ipuçları
  parameterHints: {
    enabled: true,
    cycle: true  // Tab ile parametreler arası geçiş
  },
  
  // Öneri ayarları
  suggestOnTriggerCharacters: true,  // Tetikleyici karakterlerde öner (., (, [ vb.)
  acceptSuggestionOnCommitCharacter: true,  // Commit karakterinde kabul et
  acceptSuggestionOnEnter: 'on',  // Enter'da kabul et
  tabCompletion: 'on',  // Tab ile tamamlama
  
  // Snippet ayarları
  snippetSuggestions: 'top',  // Snippet'leri en üstte göster
  
  // Hover ayarları
  hover: {
    enabled: true,
    delay: 300,  // 300ms gecikme
    sticky: true  // Mouse çıkınca hemen kapanmasın
  },
  
  // Signature help
  signatureHelp: {
    enabled: true
  },
  
  // Öneri widget ayarları
  suggest: {
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true,
    showUsers: true,
    showIssues: true
  },
  
  // IntelliSense filtreleme
  suggestSelection: 'first',  // İlk öneriyi seç
  filterGraceful: true,  // Yumuşak filtreleme
  
  // Otomatik import
  autoClosingBrackets: 'languageDefined',
  autoClosingQuotes: 'languageDefined',
  autoSurround: 'languageDefined',
  
  // Format ayarları
  formatOnType: true,  // Yazarken formatla
  formatOnPaste: true  // Yapıştırırken formatla
}

/**
 * JavaScript/TypeScript için özel IntelliSense ayarları
 */
export const javascriptIntelliSense = {
  ...defaultIntelliSenseOptions,
  
  // JavaScript özel ayarlar
  validate: true,
  
  // TypeScript compiler options
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'node',
    lib: ['ES2020', 'DOM'],
    jsx: 'react',
    allowJs: true,
    checkJs: false,
    strict: false,
    esModuleInterop: true,
    skipLibCheck: true
  }
}

/**
 * Python için özel IntelliSense ayarları
 */
export const pythonIntelliSense = {
  ...defaultIntelliSenseOptions,
  
  // Python özel ayarlar
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true
  }
}

/**
 * PHP için özel IntelliSense ayarları
 */
export const phpIntelliSense = {
  ...defaultIntelliSenseOptions,
  
  // PHP özel ayarlar
  suggest: {
    ...defaultIntelliSenseOptions.suggest,
    showSnippets: true
  }
}

/**
 * HTML için özel IntelliSense ayarları
 */
export const htmlIntelliSense = {
  ...defaultIntelliSenseOptions,
  
  // HTML özel ayarlar
  autoClosingTags: true,
  suggest: {
    ...defaultIntelliSenseOptions.suggest,
    html5: true
  }
}

/**
 * CSS için özel IntelliSense ayarları
 */
export const cssIntelliSense = {
  ...defaultIntelliSenseOptions,
  
  // CSS özel ayarlar
  validate: true,
  lint: {
    compatibleVendorPrefixes: 'warning',
    vendorPrefix: 'warning',
    duplicateProperties: 'warning',
    emptyRules: 'warning',
    importStatement: 'warning',
    boxModel: 'warning',
    universalSelector: 'warning',
    zeroUnits: 'warning',
    fontFaceProperties: 'warning',
    hexColorLength: 'warning',
    argumentsInColorFunction: 'warning',
    unknownProperties: 'warning',
    ieHack: 'warning',
    unknownVendorSpecificProperties: 'warning',
    propertyIgnoredDueToDisplay: 'warning',
    important: 'warning',
    float: 'warning',
    idSelector: 'warning'
  }
}

/**
 * Dil bazlı IntelliSense ayarlarını döndürür
 * 
 * @param {string} language - Dil adı (javascript, python, php, vb.)
 * @returns {Object} IntelliSense ayarları
 */
export function getIntelliSenseForLanguage(language) {
  const languageMap = {
    javascript: javascriptIntelliSense,
    typescript: javascriptIntelliSense,
    python: pythonIntelliSense,
    php: phpIntelliSense,
    html: htmlIntelliSense,
    css: cssIntelliSense,
    scss: cssIntelliSense,
    sass: cssIntelliSense,
    less: cssIntelliSense
  }
  
  return languageMap[language] || defaultIntelliSenseOptions
}

/**
 * Tüm diller için IntelliSense'i yapılandırır
 * 
 * @param {Object} monaco - Monaco editor instance
 */
export function configureIntelliSense(monaco) {
  // JavaScript/TypeScript ayarları
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  })
  
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })
  
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  })
  
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    typeRoots: ['node_modules/@types']
  })
  
  // HTML ayarları
  monaco.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
      wrapLineLength: 120,
      unformatted: 'wbr',
      contentUnformatted: 'pre,code,textarea',
      indentInnerHtml: false,
      preserveNewLines: true,
      maxPreserveNewLines: null,
      indentHandlebars: false,
      endWithNewline: false,
      extraLiners: 'head, body, /html',
      wrapAttributes: 'auto'
    },
    suggest: {
      html5: true,
      angular1: false,
      ionic: false
    }
  })
  
  // CSS ayarları
  monaco.languages.css.cssDefaults.setOptions({
    validate: true,
    lint: {
      compatibleVendorPrefixes: 'warning',
      vendorPrefix: 'warning',
      duplicateProperties: 'warning'
    }
  })
  
  // JSON ayarları
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    schemas: [],
    enableSchemaRequest: true
  })
}
