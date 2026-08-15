/**
 * Kod Snippet'leri (Kod Parçacıkları)
 * 
 * @description
 * Bu dosya, farklı programlama dilleri için hazır kod şablonları içerir.
 * Kullanıcılar kısa bir kelime yazıp Tab'a basarak tam kod bloğunu oluşturabilir.
 * 
 * Snippet Formatı:
 * - label: Gösterilecek isim
 * - kind: Snippet tipi (monaco.languages.CompletionItemKind.Snippet)
 * - insertText: Eklenecek kod
 * - insertTextRules: Snippet kuralları
 * - documentation: Açıklama
 * 
 * @module snippets
 */

/**
 * JavaScript/TypeScript snippet'leri
 */
export const javascriptSnippets = [
  {
    label: 'log',
    kind: 'Snippet',
    insertText: 'console.log(${1:value});',
    insertTextRules: 4, // InsertAsSnippet
    documentation: 'Console log'
  },
  {
    label: 'func',
    kind: 'Snippet',
    insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}',
    insertTextRules: 4,
    documentation: 'Function declaration'
  },
  {
    label: 'arrow',
    kind: 'Snippet',
    insertText: 'const ${1:name} = (${2:params}) => {\n\t${3:// code}\n};',
    insertTextRules: 4,
    documentation: 'Arrow function'
  },
  {
    label: 'class',
    kind: 'Snippet',
    insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3:// code}\n\t}\n}',
    insertTextRules: 4,
    documentation: 'Class declaration'
  },
  {
    label: 'if',
    kind: 'Snippet',
    insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
    insertTextRules: 4,
    documentation: 'If statement'
  },
  {
    label: 'for',
    kind: 'Snippet',
    insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3:// code}\n}',
    insertTextRules: 4,
    documentation: 'For loop'
  },
  {
    label: 'foreach',
    kind: 'Snippet',
    insertText: '${1:array}.forEach((${2:item}) => {\n\t${3:// code}\n});',
    insertTextRules: 4,
    documentation: 'ForEach loop'
  },
  {
    label: 'map',
    kind: 'Snippet',
    insertText: '${1:array}.map((${2:item}) => {\n\treturn ${3:item};\n});',
    insertTextRules: 4,
    documentation: 'Map function'
  },
  {
    label: 'filter',
    kind: 'Snippet',
    insertText: '${1:array}.filter((${2:item}) => ${3:condition});',
    insertTextRules: 4,
    documentation: 'Filter function'
  },
  {
    label: 'reduce',
    kind: 'Snippet',
    insertText: '${1:array}.reduce((${2:acc}, ${3:item}) => {\n\treturn ${4:acc};\n}, ${5:initialValue});',
    insertTextRules: 4,
    documentation: 'Reduce function'
  },
  {
    label: 'promise',
    kind: 'Snippet',
    insertText: 'new Promise((resolve, reject) => {\n\t${1:// code}\n});',
    insertTextRules: 4,
    documentation: 'Promise'
  },
  {
    label: 'async',
    kind: 'Snippet',
    insertText: 'async function ${1:name}(${2:params}) {\n\ttry {\n\t\t${3:// code}\n\t} catch (error) {\n\t\tconsole.error(error);\n\t}\n}',
    insertTextRules: 4,
    documentation: 'Async function with try-catch'
  },
  {
    label: 'try',
    kind: 'Snippet',
    insertText: 'try {\n\t${1:// code}\n} catch (${2:error}) {\n\t${3:console.error(error);}\n}',
    insertTextRules: 4,
    documentation: 'Try-catch block'
  },
  {
    label: 'import',
    kind: 'Snippet',
    insertText: "import ${1:module} from '${2:path}';",
    insertTextRules: 4,
    documentation: 'Import statement'
  },
  {
    label: 'export',
    kind: 'Snippet',
    insertText: 'export default ${1:name};',
    insertTextRules: 4,
    documentation: 'Export default'
  }
]

/**
 * React snippet'leri
 */
export const reactSnippets = [
  {
    label: 'rfc',
    kind: 'Snippet',
    insertText: 'import React from \'react\';\n\nfunction ${1:ComponentName}() {\n\treturn (\n\t\t<div>\n\t\t\t${2:// JSX}\n\t\t</div>\n\t);\n}\n\nexport default ${1:ComponentName};',
    insertTextRules: 4,
    documentation: 'React Functional Component'
  },
  {
    label: 'useState',
    kind: 'Snippet',
    insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});',
    insertTextRules: 4,
    documentation: 'useState hook'
  },
  {
    label: 'useEffect',
    kind: 'Snippet',
    insertText: 'useEffect(() => {\n\t${1:// effect}\n\treturn () => {\n\t\t${2:// cleanup}\n\t};\n}, [${3:dependencies}]);',
    insertTextRules: 4,
    documentation: 'useEffect hook'
  },
  {
    label: 'useContext',
    kind: 'Snippet',
    insertText: 'const ${1:value} = useContext(${2:Context});',
    insertTextRules: 4,
    documentation: 'useContext hook'
  }
]

/**
 * Python snippet'leri
 */
export const pythonSnippets = [
  {
    label: 'def',
    kind: 'Snippet',
    insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}',
    insertTextRules: 4,
    documentation: 'Function definition'
  },
  {
    label: 'class',
    kind: 'Snippet',
    insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}',
    insertTextRules: 4,
    documentation: 'Class definition'
  },
  {
    label: 'if',
    kind: 'Snippet',
    insertText: 'if ${1:condition}:\n\t${2:pass}',
    insertTextRules: 4,
    documentation: 'If statement'
  },
  {
    label: 'for',
    kind: 'Snippet',
    insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
    insertTextRules: 4,
    documentation: 'For loop'
  },
  {
    label: 'while',
    kind: 'Snippet',
    insertText: 'while ${1:condition}:\n\t${2:pass}',
    insertTextRules: 4,
    documentation: 'While loop'
  },
  {
    label: 'try',
    kind: 'Snippet',
    insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}',
    insertTextRules: 4,
    documentation: 'Try-except block'
  },
  {
    label: 'with',
    kind: 'Snippet',
    insertText: 'with ${1:expression} as ${2:variable}:\n\t${3:pass}',
    insertTextRules: 4,
    documentation: 'With statement'
  },
  {
    label: 'main',
    kind: 'Snippet',
    insertText: 'if __name__ == "__main__":\n\t${1:pass}',
    insertTextRules: 4,
    documentation: 'Main guard'
  }
]

/**
 * PHP snippet'leri
 */
export const phpSnippets = [
  {
    label: 'php',
    kind: 'Snippet',
    insertText: '<?php\n\n${1:// code}\n',
    insertTextRules: 4,
    documentation: 'PHP opening tag'
  },
  {
    label: 'function',
    kind: 'Snippet',
    insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}',
    insertTextRules: 4,
    documentation: 'Function declaration'
  },
  {
    label: 'class',
    kind: 'Snippet',
    insertText: 'class ${1:ClassName} {\n\tpublic function __construct(${2:params}) {\n\t\t${3:// code}\n\t}\n}',
    insertTextRules: 4,
    documentation: 'Class declaration'
  },
  {
    label: 'if',
    kind: 'Snippet',
    insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
    insertTextRules: 4,
    documentation: 'If statement'
  },
  {
    label: 'foreach',
    kind: 'Snippet',
    insertText: 'foreach (${1:array} as ${2:value}) {\n\t${3:// code}\n}',
    insertTextRules: 4,
    documentation: 'Foreach loop'
  },
  {
    label: 'for',
    kind: 'Snippet',
    insertText: 'for (${1:\\$i} = 0; ${1:\\$i} < ${2:count}; ${1:\\$i}++) {\n\t${3:// code}\n}',
    insertTextRules: 4,
    documentation: 'For loop'
  },
  {
    label: 'try',
    kind: 'Snippet',
    insertText: 'try {\n\t${1:// code}\n} catch (${2:Exception} ${3:\\$e}) {\n\t${4:// handle exception}\n}',
    insertTextRules: 4,
    documentation: 'Try-catch block'
  },
  {
    label: 'echo',
    kind: 'Snippet',
    insertText: 'echo ${1:value};',
    insertTextRules: 4,
    documentation: 'Echo statement'
  }
]

/**
 * HTML snippet'leri
 */
export const htmlSnippets = [
  {
    label: 'html5',
    kind: 'Snippet',
    insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2:<!-- content -->}\n</body>\n</html>',
    insertTextRules: 4,
    documentation: 'HTML5 template'
  },
  {
    label: 'div',
    kind: 'Snippet',
    insertText: '<div${1: class="${2:className}"}>\n\t${3:content}\n</div>',
    insertTextRules: 4,
    documentation: 'Div element'
  },
  {
    label: 'link',
    kind: 'Snippet',
    insertText: '<link rel="stylesheet" href="${1:style.css}">',
    insertTextRules: 4,
    documentation: 'Link stylesheet'
  },
  {
    label: 'script',
    kind: 'Snippet',
    insertText: '<script src="${1:script.js}"></script>',
    insertTextRules: 4,
    documentation: 'Script tag'
  }
]

/**
 * CSS snippet'leri
 */
export const cssSnippets = [
  {
    label: 'flex',
    kind: 'Snippet',
    insertText: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};',
    insertTextRules: 4,
    documentation: 'Flexbox layout'
  },
  {
    label: 'grid',
    kind: 'Snippet',
    insertText: 'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:1rem};',
    insertTextRules: 4,
    documentation: 'Grid layout'
  },
  {
    label: 'media',
    kind: 'Snippet',
    insertText: '@media (${1:max-width}: ${2:768px}) {\n\t${3:/* styles */}\n}',
    insertTextRules: 4,
    documentation: 'Media query'
  }
]

/**
 * Dil bazlı snippet'leri döndürür
 * 
 * @param {string} language - Dil adı
 * @returns {Array} Snippet listesi
 */
export function getSnippetsForLanguage(language) {
  const snippetMap = {
    javascript: [...javascriptSnippets, ...reactSnippets],
    typescript: [...javascriptSnippets, ...reactSnippets],
    javascriptreact: [...javascriptSnippets, ...reactSnippets],
    typescriptreact: [...javascriptSnippets, ...reactSnippets],
    python: pythonSnippets,
    php: phpSnippets,
    html: htmlSnippets,
    css: cssSnippets,
    scss: cssSnippets,
    sass: cssSnippets,
    less: cssSnippets
  }
  
  return snippetMap[language] || []
}

/**
 * Monaco Editor'e snippet'leri kaydeder
 * 
 * @param {Object} monaco - Monaco editor instance
 */
export function registerSnippets(monaco) {
  const languages = [
    'javascript', 'typescript', 'javascriptreact', 'typescriptreact',
    'python', 'php', 'html', 'css', 'scss', 'sass', 'less'
  ]
  
  languages.forEach(language => {
    const snippets = getSnippetsForLanguage(language)
    
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        
        return {
          suggestions: snippets.map(snippet => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: snippet.documentation,
            range: range
          }))
        }
      }
    })
  })
}
