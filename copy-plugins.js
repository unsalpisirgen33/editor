// Plugin'leri out klasörüne kopyalayan script
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, resolve } from 'path'

function copyPlugins() {
  const srcPlugins = resolve('plugins')
  const destPlugins = resolve('out/plugins')
  
  try {
    // Hedef klasörü oluştur
    mkdirSync(destPlugins, { recursive: true })
    
    // Eğer plugins klasörü yoksa çık
    if (!existsSync(srcPlugins)) {
      console.log('⚠️  plugins/ klasörü bulunamadı')
      return
    }
    
    // Plugin klasörlerini kopyala
    const folders = readdirSync(srcPlugins)
    
    folders.forEach(folder => {
      const srcPath = join(srcPlugins, folder)
      
      try {
        const stat = statSync(srcPath)
        
        if (stat.isDirectory()) {
          const destPath = join(destPlugins, folder)
          mkdirSync(destPath, { recursive: true })
          
          // Klasör içindeki dosyaları kopyala
          const files = readdirSync(srcPath)
          files.forEach(file => {
            const srcFile = join(srcPath, file)
            const destFile = join(destPath, file)
            
            if (statSync(srcFile).isFile()) {
              copyFileSync(srcFile, destFile)
              console.log(`✓ Copied plugin: ${folder}/${file}`)
            }
          })
        }
      } catch (error) {
        // Dosya ise atla
      }
    })
    
    console.log('✅ Pluginler kopyalandı!')
  } catch (error) {
    console.error('❌ Plugin kopyalama hatası:', error)
  }
}

copyPlugins()
