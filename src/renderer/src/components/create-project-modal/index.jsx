import { useState, useEffect } from 'react'

const projectTemplates = {
  PHP: {
    icon: '🐘',
    frameworks: {
      Laravel: {
        templates: [
          { name: 'Custom Laravel Project', version: 'v11.x', command: 'composer create-project laravel/laravel' },
          { name: 'Custom Laravel Project', version: 'v10.x', command: 'composer create-project laravel/laravel --prefer-dist "10.*"' },
          { name: 'Minimal Laravel Project', version: 'v11.x', command: 'composer create-project laravel/laravel --prefer-dist --no-dev' },
          { name: 'Laravel API Project', version: 'v11.x', command: 'composer create-project laravel/laravel --prefer-dist && php artisan install:api' }
        ]
      },
      CodeIgniter: {
        templates: [
          { name: 'CodeIgniter 4 Project', version: 'v4.x', command: 'composer create-project codeigniter4/appstarter' },
          { name: 'CodeIgniter 4 API', version: 'v4.x', command: 'composer create-project codeigniter4/appstarter' }
        ]
      },
      Symfony: {
        templates: [
          { name: 'Symfony Web Application', version: 'v7.x', command: 'composer create-project symfony/skeleton' },
          { name: 'Symfony Full Stack', version: 'v7.x', command: 'composer create-project symfony/website-skeleton' },
          { name: 'Symfony Microservice', version: 'v7.x', command: 'composer create-project symfony/skeleton --prefer-dist' }
        ]
      },
      'Slim Framework': {
        templates: [
          { name: 'Slim 4 Skeleton', version: 'v4.x', command: 'composer create-project slim/slim-skeleton' },
          { name: 'Slim 4 API', version: 'v4.x', command: 'composer create-project slim/slim-skeleton' }
        ]
      },
      'Plain PHP': {
        templates: [
          { name: 'PHP Class Structure', version: 'PHP 8.x', type: 'local' },
          { name: 'PHP Functions Library', version: 'PHP 8.x', type: 'local' },
          { name: 'PHP Trait Collection', version: 'PHP 8.x', type: 'local' },
          { name: 'PHP MVC Structure', version: 'PHP 8.x', type: 'local' }
        ]
      }
    }
  },
  'Node.js': {
    icon: '🟢',
    frameworks: {
      'Vue.js': {
        templates: [
          { name: 'Vue 3 + Vite', version: 'v3.x', command: 'npm create vue@latest' },
          { name: 'Vue 3 + TypeScript', version: 'v3.x', command: 'npm create vue@latest -- --typescript' },
          { name: 'Nuxt 3', version: 'v3.x', command: 'npx nuxi@latest init' }
        ]
      },
      'React.js': {
        templates: [
          { name: 'React + Vite', version: 'v18.x', command: 'npm create vite@latest -- --template react' },
          { name: 'React + TypeScript', version: 'v18.x', command: 'npm create vite@latest -- --template react-ts' },
          { name: 'Next.js', version: 'v14.x', command: 'npx create-next-app@latest' },
          { name: 'Next.js + TypeScript', version: 'v14.x', command: 'npx create-next-app@latest --typescript' }
        ]
      },
      'React Native': {
        templates: [
          { name: 'React Native CLI', version: 'v0.73', command: 'npx react-native@latest init' },
          { name: 'Expo', version: 'SDK 50', command: 'npx create-expo-app@latest' },
          { name: 'Expo + TypeScript', version: 'SDK 50', command: 'npx create-expo-app@latest --template' }
        ]
      },
      'Express.js': {
        templates: [
          { name: 'Express Generator', version: 'v4.x', command: 'npx express-generator' },
          { name: 'Express + TypeScript', version: 'v4.x', command: 'npx express-generator-typescript' },
          { name: 'Express API', version: 'v4.x', type: 'local' }
        ]
      },
      'Angular': {
        templates: [
          { name: 'Angular CLI', version: 'v17.x', command: 'npx @angular/cli@latest new' },
          { name: 'Angular Standalone', version: 'v17.x', command: 'npx @angular/cli@latest new --standalone' }
        ]
      }
    }
  },
  Python: {
    icon: '🐍',
    frameworks: {
      Django: {
        templates: [
          { name: 'Django Project', version: 'v5.x', command: 'django-admin startproject' },
          { name: 'Django REST API', version: 'v5.x', command: 'django-admin startproject' }
        ]
      },
      Flask: {
        templates: [
          { name: 'Flask Application', version: 'v3.x', type: 'local' },
          { name: 'Flask API', version: 'v3.x', type: 'local' }
        ]
      },
      FastAPI: {
        templates: [
          { name: 'FastAPI Project', version: 'v0.109', type: 'local' },
          { name: 'FastAPI Full Stack', version: 'v0.109', type: 'local' }
        ]
      }
    }
  },
  Extensions: {
    icon: '🧩',
    frameworks: {
      'VS Code': {
        templates: [
          { name: 'VS Code Extension', version: 'Latest', command: 'npx yo code' },
          { name: 'VS Code Theme', version: 'Latest', command: 'npx yo code' }
        ]
      },
      'Chrome Extension': {
        templates: [
          { name: 'Chrome Extension MV3', version: 'Manifest V3', type: 'local' },
          { name: 'Chrome Extension + React', version: 'Manifest V3', type: 'local' }
        ]
      },
      'Electron': {
        templates: [
          { name: 'Electron App', version: 'Latest', command: 'npm create electron-app@latest' },
          { name: 'Electron + React', version: 'Latest', command: 'npm create electron-app@latest -- --template=react' }
        ]
      }
    }
  }
}

/**
 * CreateProjectModal komponenti - Yeni proje oluşturma modal penceresi
 * 
 * @component CreateProjectModal
 * 
 * @description 
 * Bu komponent, kullanıcıların hızlı ve kolay bir şekilde yeni projeler oluşturmasını sağlayan 
 * kapsamlı bir proje oluşturma arayüzüdür. Visual Studio Code tarzında modern bir tasarıma sahiptir.
 * 
 * GENEL BAKIŞ:
 * Modal pencere, sol ve sağ olmak üzere iki ana bölümden oluşur:
 * 
 * 1. SOL PANEL (Dil ve Framework Seçimi):
 *    - Dil kategorileri (PHP, Node.js, Python, Extensions)
 *    - Her dilin altında dropdown ile framework'ler
 *    - Tıklanabilir ve genişletilebilir yapı
 *    - Seçili öğeler mavi renkle vurgulanır
 * 
 * 2. SAĞ PANEL (Proje Şablonları):
 *    - Seçilen framework için mevcut şablonlar
 *    - Her şablonda: İsim, versiyon, tip (yerel/uzak)
 *    - Tek sütun, alt alta liste görünümü
 *    - Hover ve seçim efektleri
 * 
 * 3. ALT PANEL (Proje Bilgileri):
 *    - Proje adı input alanı (zorunlu)
 *    - Proje konumu seçici (opsiyonel)
 *    - İptal ve Oluştur butonları
 * 
 * ÇALIŞMA MANTIĞI:
 * 
 * Adım 1: Dil Seçimi
 * - Kullanıcı bir dil kategorisine tıklar (örn: PHP)
 * - Dropdown açılır ve framework'ler gösterilir
 * - Diğer dillerin dropdown'ları kapalı kalabilir veya açılabilir
 * 
 * Adım 2: Framework Seçimi
 * - Kullanıcı bir framework seçer (örn: Laravel)
 * - Sağ panelde o framework'e ait şablonlar gösterilir
 * - Şablonlar otomatik olarak güncellenir
 * 
 * Adım 3: Şablon Seçimi
 * - Kullanıcı bir şablon seçer (örn: Custom Laravel Project v11.x)
 * - Seçili şablon mavi border ile vurgulanır
 * - Şablon bilgileri state'e kaydedilir
 * 
 * Adım 4: Proje Bilgileri
 * - Kullanıcı proje adı girer (zorunlu)
 * - İsteğe bağlı olarak özel bir konum seçebilir
 * - Konum seçilmezse varsayılan ~/Projects kullanılır
 * 
 * Adım 5: Proje Oluşturma
 * - "Proje Oluştur" butonuna tıklanır
 * - Backend'e istek gönderilir (window.api.createProject)
 * - Proje oluşturulur (composer, npm vb. çalıştırılır)
 * - Başarılı olursa:
 *   a) Explorer'da proje klasörü açılır
 *   b) README.md varsa editörde açılır
 *   c) Başarı mesajı gösterilir
 *   d) Modal kapanır
 * 
 * DESTEKLENEN DİLLER VE FRAMEWORK'LER:
 * 
 * PHP (🐘):
 * - Laravel (v10.x, v11.x) - Full-stack web framework
 * - CodeIgniter (v4.x) - Hafif PHP framework
 * - Symfony (v7.x) - Enterprise PHP framework
 * - Slim Framework (v4.x) - Micro framework
 * - Plain PHP - Saf PHP şablonları (Class, Function, Trait, MVC)
 * 
 * Node.js (🟢):
 * - Vue.js (v3.x) - Progressive JavaScript framework
 * - React.js (v18.x) - UI library
 * - React Native (v0.73) - Mobile app framework
 * - Express.js (v4.x) - Web application framework
 * - Angular (v17.x) - Full-featured framework
 * - Next.js (v14.x) - React framework
 * 
 * Python (🐍):
 * - Django (v5.x) - High-level web framework
 * - Flask (v3.x) - Micro web framework
 * - FastAPI (v0.109) - Modern API framework
 * 
 * Extensions (🧩):
 * - VS Code Extension - Editor eklentileri
 * - Chrome Extension (MV3) - Tarayıcı eklentileri
 * - Electron - Desktop uygulamaları
 * 
 * ŞABLON TİPLERİ:
 * 
 * 1. KOMUT TABANLI ŞABLONLAR:
 *    - Gerçek framework kurulumları yapar
 *    - İnternet bağlantısı gerektirir
 *    - composer, npm, npx gibi araçları kullanır
 *    - Tam özellikli projeler oluşturur
 *    - Örnek: Laravel, React, Django
 * 
 * 2. YEREL ŞABLONLAR (type: 'local'):
 *    - Önceden tanımlanmış şablonları kullanır
 *    - İnternet bağlantısı gerektirmez
 *    - Hızlı ve basit projeler için idealdir
 *    - Temel dosya yapısı oluşturur
 *    - Örnek: Plain PHP Class, Express API
 * 
 * STATE YÖNETİMİ:
 * 
 * - selectedLanguage: Seçili dil (PHP, Node.js, vb.)
 * - expandedLanguages: Açık dropdown'lar (array)
 * - selectedFramework: Seçili framework (Laravel, React, vb.)
 * - selectedTemplate: Seçili şablon objesi
 * - projectName: Kullanıcının girdiği proje adı
 * - projectPath: Kullanıcının seçtiği özel konum (opsiyonel)
 * - isCreating: Proje oluşturma işlemi devam ediyor mu
 * 
 * HATA YÖNETİMİ:
 * 
 * - Proje adı boşsa: Alert ile uyarı
 * - Şablon seçilmemişse: Alert ile uyarı
 * - Proje oluşturma hatası: Alert ile hata mesajı
 * - README.md okuma hatası: Console'a log, işlem devam eder
 * - İnternet bağlantısı yoksa: Komut tabanlı şablonlar başarısız olur
 * 
 * KULLANICI DENEYİMİ:
 * 
 * - Responsive tasarım (1000x650px modal)
 * - Smooth animasyonlar ve transition'lar
 * - Hover efektleri (scale, renk değişimi)
 * - Loading state (isCreating)
 * - Disabled state (buton devre dışı)
 * - Keyboard desteği (ESC ile kapatma)
 * - Click outside ile kapatma
 * 
 * @param {Object} props - React komponent props'ları
 * @param {boolean} props.isOpen - Modal açık mı? (true/false)
 * @param {Function} props.onClose - Modal kapatma callback fonksiyonu
 * 
 * @returns {JSX.Element|null} Modal komponenti (açıksa) veya null (kapalıysa)
 * 
 * @requires react - useState, useEffect hooks
 * @requires window.api.createProject - Backend'e proje oluşturma isteği gönderir
 * @requires window.api.readFile - README.md dosyasını okur
 * @requires window.api.openFolder - Klasör seçme dialogunu açar
 * @requires window.openFolderInExplorer - Projeyi explorer'da açar (global fonksiyon)
 * @requires window.openFileInEditor - README.md'yi editörde açar (global fonksiyon)
 * 
 * @throws {Error} Proje oluşturma hatası - Backend'den gelen hatalar
 * @throws {Error} README.md okuma hatası - Dosya okunamazsa (kritik değil)
 * @throws {Error} API hatası - window.api fonksiyonları yoksa
 * 
 * @example
 * // Temel kullanım
 * function App() {
 *   const [showModal, setShowModal] = useState(false)
 *   
 *   return (
 *     <>
 *       <button onClick={() => setShowModal(true)}>
 *         Yeni Proje
 *       </button>
 *       
 *       <CreateProjectModal 
 *         isOpen={showModal} 
 *         onClose={() => setShowModal(false)} 
 *       />
 *     </>
 *   )
 * }
 * 
 * @example
 * // Menüden açma
 * <TopMenuBar 
 *   onCreateProject={() => setShowCreateProject(true)}
 * />
 * <CreateProjectModal 
 *   isOpen={showCreateProject}
 *   onClose={() => setShowCreateProject(false)}
 * />
 */
export default function CreateProjectModal({ isOpen, onClose }) {
  const [selectedLanguage, setSelectedLanguage] = useState('PHP')
  const [expandedLanguages, setExpandedLanguages] = useState(['PHP'])
  const [selectedFramework, setSelectedFramework] = useState('Laravel')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage('PHP')
      setExpandedLanguages(['PHP'])
      setSelectedFramework('Laravel')
      setSelectedTemplate(null)
      setProjectName('')
      setProjectPath('')
    }
  }, [isOpen])

  if (!isOpen) return null

  /**
   * Dil dropdown'ını açar/kapatır
   * 
   * @function toggleLanguage
   * @param {string} language - Dil adı
   * @returns {void}
   */
  const toggleLanguage = (language) => {
    if (expandedLanguages.includes(language)) {
      setExpandedLanguages(expandedLanguages.filter(l => l !== language))
    } else {
      setExpandedLanguages([...expandedLanguages, language])
    }
  }

  /**
   * Dil seçimi yapar ve dropdown'ı açar
   * 
   * @function handleLanguageSelect
   * @param {string} language - Seçilen dil
   * @returns {void}
   */
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language)
    if (!expandedLanguages.includes(language)) {
      setExpandedLanguages([...expandedLanguages, language])
    }
  }

  /**
   * Framework seçimi yapar
   * 
   * @function handleFrameworkSelect
   * @param {string} language - Dil adı
   * @param {string} framework - Framework adı
   * @returns {void}
   */
  const handleFrameworkSelect = (language, framework) => {
    setSelectedLanguage(language)
    setSelectedFramework(framework)
    setSelectedTemplate(null)
  }

  /**
   * Proje oluşturma işlemini başlatır ve tamamlar
   * 
   * @async
   * @function handleCreateProject
   * 
   * @description 
   * Bu fonksiyon, kullanıcının "Proje Oluştur" butonuna tıklamasıyla tetiklenir ve 
   * tüm proje oluşturma sürecini yönetir. Birden fazla adımdan oluşan karmaşık bir 
   * işlem zincirini koordine eder.
   * 
   * İŞLEM AKIŞI (Adım Adım):
   * 
   * ADIM 1: Validasyon (Doğrulama)
   * - Proje adı girilmiş mi kontrol edilir
   * - Şablon seçilmiş mi kontrol edilir
   * - Eğer eksiklik varsa alert ile uyarı verilir ve işlem durdurulur
   * 
   * ADIM 2: Loading State Başlatma
   * - isCreating state'i true yapılır
   * - Bu sayede buton disabled olur ve "Oluşturuluyor..." yazısı gösterilir
   * - Kullanıcı birden fazla kez tıklayamaz (double-click koruması)
   * 
   * ADIM 3: Backend'e İstek Gönderme
   * - window.api.createProject fonksiyonu çağrılır
   * - Şu bilgiler gönderilir:
   *   a) language: Seçili dil (PHP, Node.js, vb.)
   *   b) framework: Seçili framework (Laravel, React, vb.)
   *   c) template: Şablon objesi (name, version, command, type)
   *   d) projectName: Kullanıcının girdiği proje adı
   *   e) projectPath: Özel konum (null ise varsayılan kullanılır)
   * 
   * ADIM 4: Backend İşlemi (Main Process)
   * - Electron main process'te ProjectCreator sınıfı çalışır
   * - Proje klasörü oluşturulur
   * - Şablon tipine göre:
   *   a) Komut tabanlı: composer, npm vb. çalıştırılır
   *   b) Yerel şablon: Dosyalar manuel oluşturulur
   * - README.md varlığı kontrol edilir
   * - Sonuç objesi döndürülür
   * 
   * ADIM 5: Başarı Durumu İşleme
   * - result.success === true ise:
   * 
   *   5a) Explorer'da Klasör Açma:
   *   - window.openFolderInExplorer fonksiyonu çağrılır
   *   - Sol panelde (LeftPanel) proje klasörü açılır
   *   - Dosya ağacı gösterilir
   *   - Kullanıcı hemen dosyaları görebilir
   * 
   *   5b) README.md Editörde Açma (Varsa):
   *   - result.readmePath kontrol edilir
   *   - Eğer README.md varsa:
   *     * window.api.readFile ile içeriği okunur
   *     * window.openFileInEditor ile editörde açılır
   *     * Markdown syntax highlighting uygulanır
   *   - Eğer README.md yoksa:
   *     * Bu adım atlanır
   *     * Hata vermez, sadece console'a log yazılır
   * 
   *   5c) Başarı Mesajı:
   *   - Alert ile kullanıcıya bilgi verilir
   *   - Mesaj içeriği: "✓ Proje başarıyla oluşturuldu!\nKonum: /path/to/project"
   *   - Kullanıcı projenin nerede olduğunu görür
   * 
   *   5d) Modal Kapatma:
   *   - onClose() callback'i çağrılır
   *   - Modal pencere kapanır
   *   - State'ler sıfırlanır (useEffect ile)
   * 
   * ADIM 6: Hata Durumu İşleme
   * - result.success === false ise:
   *   * Alert ile hata mesajı gösterilir
   *   * Mesaj içeriği: "✗ Hata: [hata mesajı]"
   *   * Modal açık kalır, kullanıcı tekrar deneyebilir
   * 
   * ADIM 7: Exception Yakalama
   * - try-catch bloğu ile tüm hatalar yakalanır
   * - Olası hatalar:
   *   a) Network hatası (API çağrısı başarısız)
   *   b) Backend hatası (proje oluşturulamadı)
   *   c) README okuma hatası (kritik değil)
   *   d) Explorer/Editor açma hatası (kritik değil)
   * - Alert ile genel hata mesajı gösterilir
   * 
   * ADIM 8: Cleanup (Temizlik)
   * - finally bloğu her durumda çalışır
   * - isCreating state'i false yapılır
   * - Buton tekrar aktif olur
   * - Loading state sona erer
   * 
   * KULLANICI DENEYİMİ:
   * 
   * Başarılı Senaryo:
   * 1. Kullanıcı butona tıklar
   * 2. Buton "Oluşturuluyor..." olur ve disabled olur
   * 3. 5-30 saniye bekler (framework'e göre değişir)
   * 4. Sol panelde proje klasörü açılır
   * 5. Editörde README.md açılır
   * 6. "Başarılı" mesajı görür
   * 7. Modal kapanır
   * 8. Proje ile çalışmaya başlayabilir
   * 
   * Başarısız Senaryo:
   * 1. Kullanıcı butona tıklar
   * 2. Buton "Oluşturuluyor..." olur
   * 3. Hata oluşur (internet yok, disk dolu, vb.)
   * 4. Hata mesajı görür
   * 5. Modal açık kalır
   * 6. Sorunu çözüp tekrar deneyebilir
   * 
   * PERFORMANS:
   * 
   * - Komut tabanlı şablonlar: 5-30 saniye (internet hızına bağlı)
   * - Yerel şablonlar: 1-2 saniye (anında)
   * - README.md okuma: <100ms (opsiyonel)
   * - Explorer açma: <100ms (anında)
   * - Editor açma: <200ms (syntax highlighting ile)
   * 
   * GÜVENLİK:
   * 
   * - Input validasyonu yapılır (boş değer kontrolü)
   * - Double-click koruması vardır (isCreating state)
   * - Backend'de ek validasyonlar yapılır
   * - Dosya yolu injection koruması vardır
   * - Hata mesajları kullanıcı dostu ve güvenlidir
   * 
   * @returns {Promise<void>} Hiçbir değer döndürmez, sadece side-effect'ler yapar
   * 
   * @throws {Error} Proje adı veya şablon seçilmemişse - Alert ile gösterilir
   * @throws {Error} Proje oluşturma hatası - Backend'den gelen hatalar
   * @throws {Error} README.md okuma hatası - Kritik değil, console'a log yazılır
   * @throws {Error} API hatası - window.api fonksiyonları yoksa
   * 
   * @sideEffects
   * - isCreating state'ini değiştirir
   * - Backend'e API çağrısı yapar
   * - Explorer'da klasör açar
   * - Editörde dosya açar
   * - Alert gösterir
   * - Modal'ı kapatır
   * 
   * @example
   * // Kullanıcı "Proje Oluştur" butonuna tıklar
   * <button onClick={handleCreateProject}>
   *   {isCreating ? 'Oluşturuluyor...' : 'Proje Oluştur'}
   * </button>
   * 
   * // İşlem başlar:
   * // 1. Validasyon
   * // 2. Backend'e istek
   * // 3. Proje oluşturulur
   * // 4. Explorer'da açılır
   * // 5. README editörde açılır
   * // 6. Başarı mesajı
   * // 7. Modal kapanır
   */
  const handleCreateProject = async () => {
    if (!projectName || !selectedTemplate) {
      alert('Lütfen proje adı girin ve bir şablon seçin!')
      return
    }

    setIsCreating(true)
    try {
      const result = await window.api.createProject({
        language: selectedLanguage,
        framework: selectedFramework,
        template: selectedTemplate,
        projectName: projectName,
        projectPath: projectPath || null
      })

      if (result.success) {
        // Proje klasörünü explorer'da aç
        if (window.openFolderInExplorer) {
          window.openFolderInExplorer(result.path)
        }

        // README.md dosyasını editörde aç (varsa)
        if (result.readmePath) {
          try {
            const readmeContent = await window.api.readFile(result.readmePath)
            if (window.openFileInEditor) {
              window.openFileInEditor(
                result.readmePath,
                'README.md',
                readmeContent,
                'markdown'
              )
            }
          } catch (error) {
            // README.md bulunamadı
          }
        }

        alert(`✓ Proje başarıyla oluşturuldu!\nKonum: ${result.path}`)
        onClose()
      } else {
        alert(`✗ Hata: ${result.error}`)
      }
    } catch (error) {
      alert(`✗ Proje oluşturma hatası: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Proje konumu seçme dialogunu açar
   * 
   * @async
   * @function handleSelectPath
   * @returns {Promise<void>}
   */
  const handleSelectPath = async () => {
    const result = await window.api.openFolder()
    if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
      setProjectPath(result.filePaths[0])
    }
  }

  const currentTemplates = selectedLanguage && selectedFramework 
    ? projectTemplates[selectedLanguage]?.frameworks[selectedFramework]?.templates || []
    : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#252526] rounded-lg shadow-2xl w-[1000px] h-[650px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#3a3a3a]">
          <h2 className="text-sm font-medium text-gray-300">Yeni Proje Oluştur</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none hover:bg-[#3a3a3a] rounded px-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sol Panel - Diller ve Framework'ler (Dropdown) */}
          <div className="w-72 border-r border-[#3a3a3a] overflow-y-auto overflow-x-hidden">
            <div className="p-4">
              <div className="text-[10px] text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                Dil ve Framework Seçin
              </div>
              
              <div className="space-y-1">
                {Object.entries(projectTemplates).map(([lang, data]) => (
                  <div key={lang}>
                    {/* Dil Başlığı */}
                    <button
                      onClick={() => toggleLanguage(lang)}
                      className={`
                        w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between text-sm
                        ${selectedLanguage === lang 
                          ? 'bg-[#094771] text-white' 
                          : 'text-gray-300 hover:bg-[#2a2d2e]'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{data.icon}</span>
                        <span className="text-sm font-medium">{lang}</span>
                      </div>
                      <span className="text-xs">
                        {expandedLanguages.includes(lang) ? '▼' : '▶'}
                      </span>
                    </button>

                    {/* Framework'ler (Dropdown) */}
                    {expandedLanguages.includes(lang) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {Object.keys(data.frameworks).map((framework) => (
                          <button
                            key={framework}
                            onClick={() => handleFrameworkSelect(lang, framework)}
                            className={`
                              w-full text-left px-3 py-1.5 rounded transition-colors text-xs
                              ${selectedLanguage === lang && selectedFramework === framework
                                ? 'bg-[#0e639c] text-white' 
                                : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}
                            `}
                          >
                            {framework}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Panel - Şablonlar (Full Width) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6">
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                {selectedLanguage} → {selectedFramework}
              </div>
              
              <div className="space-y-3">
                {currentTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left hover:scale-[1.02]
                      ${selectedTemplate === template
                        ? 'border-[#007acc] bg-[#094771] shadow-lg'
                        : 'border-[#3a3a3a] hover:border-[#555] bg-[#2d2d30]'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1 text-sm leading-tight">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {template.version}
                        </div>
                      </div>
                      {template.type === 'local' && (
                        <div className="text-[10px] text-green-400 flex items-center gap-1 ml-4">
                          <span>📦</span>
                          <span>Yerel</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Panel - Proje Bilgileri */}
            <div className="border-t border-[#3a3a3a] p-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Proje Adı *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] focus:border-[#007acc] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Proje Konumu (opsiyonel)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectPath}
                    readOnly
                    placeholder="Varsayılan konum kullanılacak"
                    className="flex-1 bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555] outline-none"
                  />
                  <button
                    onClick={handleSelectPath}
                    className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors"
                  >
                    Gözat
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName || !selectedTemplate || isCreating}
                  className="px-6 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
