/**
 * Auto Import Utility
 * Otomatik import ekleme fonksiyonları
 */

/**
 * Dosyadan export edilen sembolleri bul
 */
export async function findExportsInFile(filePath, api) {
  try {
    // Path'i düzelt
    let cleanPath = filePath.replace(/\\/g, '/')
    
    // Çift drive letter varsa düzelt (C:/C:/ -> C:/)
    if (cleanPath.match(/^[A-Z]:\/[A-Z]:\//)) {
      cleanPath = cleanPath.substring(3)
    }
    
    // Başta / varsa ve drive letter varsa / kaldır (/C:/ -> C:/)
    if (cleanPath.match(/^\/[A-Z]:\//)) {
      cleanPath = cleanPath.substring(1)
    }
    
    console.log('Dosya taranıyor:', cleanPath)
    const content = await api.readFile(cleanPath)
    const exports = []

    // Default export'ları bul
    const defaultExportRegex = /export\s+default\s+(?:class|function)?\s*(\w+)/g
    let match
    while ((match = defaultExportRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'default',
        file: cleanPath
      })
    }

    // ES6 named export'ları bul
    const exportRegex = /export\s+(?:class|function|const|let|var)\s+(\w+)/g
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'named',
        file: cleanPath
      })
    }

    // Named export'ları bul: export { Menu, Button }
    const namedExportRegex = /export\s+\{([^}]+)\}/g
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map((n) => n.trim().split(' as ')[0])
      names.forEach((name) => {
        exports.push({
          name: name,
          type: 'named',
          file: cleanPath
        })
      })
    }

    // React component'leri bul (default export olabilir)
    const componentRegex = /(?:function|const)\s+([A-Z]\w+)\s*(?:=|:)/g
    while ((match = componentRegex.exec(content)) !== null) {
      if (!exports.find((e) => e.name === match[1])) {
        // Default export mu kontrol et
        const isDefault = content.includes(`export default ${match[1]}`)
        exports.push({
          name: match[1],
          type: isDefault ? 'default' : 'component',
          file: cleanPath
        })
      }
    }

    if (exports.length > 0) {
      console.log(`  → ${exports.length} export bulundu:`, exports.map((e) => `${e.name} (${e.type})`))
    }

    return exports
  } catch (error) {
    console.error('Export bulma hatası:', filePath, error)
    return []
  }
}

/**
 * Proje dosyalarını tara ve export'ları bul
 */
export async function scanProjectForExports(projectPath, api) {
  const exports = []

  try {
    console.log('Proje taranıyor:', projectPath)
    // src klasörünü tara
    const srcPath = `${projectPath}/src`
    const exists = await api.fileExists(srcPath)

    console.log('src klasörü var mı?', exists, srcPath)

    if (exists) {
      await scanDirectory(srcPath, exports, api, projectPath)
    } else {
      // src yoksa direkt proje klasörünü tara
      await scanDirectory(projectPath, exports, api, projectPath)
    }

    return exports
  } catch (error) {
    console.error('Proje tarama hatası:', error)
    return []
  }
}

async function scanDirectory(dirPath, exports, api, projectPath) {
  try {
    console.log('Klasör taranıyor:', dirPath)
    const items = await api.readDirectory(dirPath)

    console.log(`  → ${items.length} öğe bulundu`)

    for (const item of items) {
      // node_modules, dist, build atla
      if (
        item.name === 'node_modules' ||
        item.name === 'dist' ||
        item.name === 'build' ||
        item.name.startsWith('.')
      ) {
        continue
      }

      // Path'i düzelt - çift path varsa temizle
      let itemPath = item.path
      
      // Windows'ta çift drive letter varsa düzelt (C:\C:\ -> C:\)
      if (itemPath.match(/^[A-Z]:\\[A-Z]:\\/)) {
        itemPath = itemPath.substring(3) // İlk "C:\" kısmını at
      }
      
      // Çift slash varsa düzelt
      itemPath = itemPath.replace(/\\/g, '/').replace(/\/\//g, '/')

      if (item.isDirectory) {
        await scanDirectory(itemPath, exports, api, projectPath)
      } else if (item.isFile) {
        // Sadece JS/JSX/TS/TSX dosyaları
        if (/\.(jsx?|tsx?)$/.test(item.name)) {
          const fileExports = await findExportsInFile(itemPath, api)
          exports.push(...fileExports)
        }
      }
    }
  } catch (error) {
    console.error('Klasör tarama hatası:', dirPath, error)
  }
}

/**
 * Import statement oluştur
 */
export function generateImportStatement(symbolName, filePath, currentFilePath, language, exportType = 'named') {
  // Relative path hesapla
  const relativePath = getRelativePath(currentFilePath, filePath)

  // Dile göre import formatı
  if (
    language === 'javascript' ||
    language === 'typescript' ||
    language === 'javascriptreact' ||
    language === 'typescriptreact'
  ) {
    // ES6 import - default vs named
    if (exportType === 'default') {
      return `import ${symbolName} from '${relativePath}';\n`
    } else {
      return `import { ${symbolName} } from '${relativePath}';\n`
    }
  } else if (language === 'python') {
    // Python import
    const moduleName = filePath.split('/').pop().replace('.py', '')
    return `from ${moduleName} import ${symbolName}\n`
  } else if (language === 'php') {
    // PHP require
    return `require_once '${relativePath}';\n`
  }

  return `import { ${symbolName} } from '${relativePath}';\n`
}

/**
 * Relative path hesapla
 */
function getRelativePath(from, to) {
  // Windows path'lerini normalize et (\ -> /)
  from = from.replace(/\\/g, '/')
  to = to.replace(/\\/g, '/')

  // Drive letter'ı kaldır (C:/ gibi) ve başındaki / karakterini temizle
  from = from.replace(/^\/[A-Za-z]:/, '').replace(/^[A-Za-z]:/, '')
  to = to.replace(/^\/[A-Za-z]:/, '').replace(/^[A-Za-z]:/, '')

  const fromParts = from.split('/').filter((p) => p)
  const toParts = to.split('/').filter((p) => p)

  // Dosya adını çıkar
  fromParts.pop()

  // Ortak path'i bul
  let i = 0
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++
  }

  // .. ekle
  const upLevels = fromParts.length - i
  const relativeParts = Array(upLevels).fill('..')

  // Kalan path'i ekle
  relativeParts.push(...toParts.slice(i))

  let relativePath = relativeParts.join('/')

  // .js, .jsx uzantısını kaldır
  relativePath = relativePath.replace(/\.(jsx?|tsx?)$/, '')

  // ./ veya ../ ile başlamalı
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }

  return relativePath
}

/**
 * Dosyanın başına import ekle
 */
export function addImportToFile(content, importStatement) {
  // Zaten var mı kontrol et
  if (content.includes(importStatement.trim())) {
    return content
  }

  // İlk import'tan sonra ekle
  const lines = content.split('\n')
  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('require(')) {
      lastImportIndex = i
    }
  }

  if (lastImportIndex >= 0) {
    // Son import'tan sonra ekle
    lines.splice(lastImportIndex + 1, 0, importStatement.trim())
  } else {
    // Başa ekle
    lines.unshift(importStatement.trim())
  }

  return lines.join('\n')
}
