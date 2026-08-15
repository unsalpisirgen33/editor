# Sweet IDE

> Modern, çok dilli ve çapraz platform destekli profesyonel kod editörü

## 📖 Proje Hakkında

Sweet IDE, web, mobil ve oyun geliştirme için tasarlanmış modern bir entegre geliştirme ortamıdır (IDE). Visual Studio Code'dan ilham alınarak geliştirilmiş, Electron ve React teknolojileri kullanılarak oluşturulmuştur. Geliştiricilerin hızlı ve verimli bir şekilde proje oluşturmasını, kod yazmasını ve yönetmesini sağlar.

## 🛠️ Kullanılan Teknolojiler

### Ana Teknolojiler
- **Electron** `v28.x` - Çapraz platform desktop uygulama framework'ü
- **React** `v18.x` - Kullanıcı arayüzü kütüphanesi
- **Vite** `v5.x` - Hızlı build tool ve dev server
- **Node.js** `v18+` - JavaScript runtime

### UI Framework ve Kütüphaneler
- **Tailwind CSS** `v3.x` - Utility-first CSS framework
- **Monaco Editor** - VS Code'un güçlü editör motoru
- **Heroicons** - Modern SVG ikon seti
- **xterm.js** - Terminal emülatörü

### Geliştirme Araçları
- **ESLint** - JavaScript/React linting
- **Prettier** - Kod formatlama
- **electron-builder** - Uygulama paketleme ve dağıtım

### Desteklenen Paket Yöneticileri
- **npm** - Node.js paket yöneticisi
- **composer** - PHP paket yöneticisi
- **pip** - Python paket yöneticisi

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js v18 veya üzeri
- npm v9 veya üzeri

### Kurulum

```bash
# Projeyi klonlayın
git clone <repository-url>
cd sweet-ide

# Bağımlılıkları yükleyin
npm install
```

### Geliştirme Modu

```bash
# Development server'ı başlatın (hot-reload ile)
npm run dev
```

Uygulama otomatik olarak açılacak ve kod değişikliklerinde otomatik yenilenecektir.

### Production Build

```bash
# Windows için build
npm run build:win

# macOS için build
npm run build:mac

# Linux için build
npm run build:linux
```

Build işlemi tamamlandığında, `dist` klasöründe kurulum dosyalarını bulabilirsiniz.

## 📂 Proje Yapısı

```
sweet-ide/
├── src/
│   ├── main/              # Electron main process
│   │   ├── core/          # Ana iş mantığı
│   │   │   ├── pluginLoader.js
│   │   │   └── projectCreator.js
│   │   └── index.js       # Main process giriş noktası
│   ├── preload/           # Preload scripts
│   │   └── index.js
│   └── renderer/          # React UI
│       ├── src/
│       │   ├── components/  # React komponentleri
│       │   ├── assets/      # CSS ve görseller
│       │   ├── utils/       # Yardımcı fonksiyonlar
│       │   ├── App.jsx      # Ana uygulama
│       │   └── main.jsx     # React giriş noktası
│       └── index.html
├── plugins/               # Plugin sistemi
├── resources/            # Uygulama kaynakları (ikonlar vb.)
├── build/                # Build konfigürasyonları
├── dist/                 # Build çıktıları
└── package.json
```

## 🎯 Temel Kullanım

### 1. Klasör Açma
- Menüden `File → Open Folder` seçin
- Veya `Ctrl+O` (Windows/Linux) / `Cmd+O` (macOS) kısayolunu kullanın
- Sol panelde (Explorer) dosya ağacı görünecektir

### 2. Yeni Proje Oluşturma
- Menüden `File → New Project` seçin
- Sol panelden dil ve framework seçin (PHP, Node.js, Python, Extensions)
- Sağ panelden proje şablonunu seçin
- Proje adı girin ve "Proje Oluştur" butonuna tıklayın

### 3. Dosya İşlemleri
- Dosyaya tıklayarak editörde açın
- Sağ tık ile context menu açın
- Yeni dosya/klasör oluşturun
- Dosya/klasör silin veya yeniden adlandırın

### 4. Terminal Kullanımı
- Alt panelde entegre terminal bulunur
- Windows'ta CMD, Linux/Mac'te Bash açılır
- Komutları doğrudan çalıştırabilirsiniz

### 5. Panel Yönetimi
- Sol, sağ ve alt paneller mouse ile yeniden boyutlandırılabilir
- Panel kenarlarındaki çizgileri sürükleyin

## 🚀 Current Features

### ✅ Implemented
- **Monaco Editor** - VS Code's powerful editor engine
- **File Explorer** - Tree view with file/folder operations
- **Integrated Terminal** - Built-in CMD/Bash terminal
- **Project Creator** - Multi-language project scaffolding
  - PHP (Laravel, Symfony, CodeIgniter, Slim, Plain PHP)
  - Node.js (React, Vue, Angular, Next.js, Express)
  - Python (Django, Flask, FastAPI)
  - Extensions (VS Code, Chrome, Electron)
- **Resizable Panels** - Drag-to-resize interface
- **Plugin System** - Basic plugin architecture
- **Syntax Highlighting** - Multi-language support
- **File Icons** - Visual file type indicators
- **IntelliSense & Auto-Complete** - ✨ YENİ!
  - Intelligent code completion for all languages
  - Parameter hints and function signatures
  - Hover documentation
  - Code snippets (JavaScript, Python, PHP, HTML, CSS)
  - Customizable keyboard shortcuts
  - Settings panel for configuration

---

## 📋 Roadmap & Feature Proposals

This section outlines planned features to transform Sweet IDE into a professional-grade development environment.

---

## 🎯 PHASE 1: Core Development Features (Priority: CRITICAL)

### 1. 🔍 IntelliSense & Auto-Complete
**Status:** ✅ TAMAMLANDI

**Description:**
Intelligent code completion and suggestions while typing.

**Implemented Features:**
- ✅ Otomatik kod tamamlama (Ctrl+Space)
- ✅ Parametre ipuçları (Ctrl+Shift+Space)
- ✅ Hover dokümantasyonu
- ✅ Fonksiyon imzaları
- ✅ Kod snippet'leri (JavaScript, Python, PHP, HTML, CSS)
- ✅ Özelleştirilebilir klavye kısayolları
- ✅ Ayarlar paneli (Tools → Settings)
- ✅ Tüm diller için destek (JS/TS, Python, PHP, HTML, CSS)

**Keyboard Shortcuts:**
- `Ctrl+Space` / `Cmd+Space` - Öneri göster
- `Ctrl+Shift+Space` / `Cmd+Shift+Space` - Parametre ipuçları
- `Tab` - Snippet'i genişlet
- `Ctrl+/` / `Cmd+/` - Yorum satırı
- `F12` - Tanıma git
- `Alt+F12` - Tanıma göz at

**Snippet Examples:**
```javascript
// JavaScript
log → console.log(value);
func → function name(params) { }
arrow → const name = (params) => { }
class → class ClassName { }
for → for (let i = 0; i < array.length; i++) { }
```

```python
# Python
def → def function_name(params):
class → class ClassName:
if → if condition:
for → for item in iterable:
```

```php
// PHP
function → function name(params) { }
class → class ClassName { }
foreach → foreach ($array as $value) { }
```

**Configuration:**
- Menüden `Tools → Settings` veya `Tools → Keyboard Shortcuts`
- Tüm kısayollar özelleştirilebilir
- Ayarlar localStorage'da saklanır

---

### 2. 🐛 Debugging & Breakpoints
**Status:** 🔴 Not Implemented

**Description:**
Set breakpoints, inspect variables, and step through code execution.

**Why Important:**
- Essential for finding bugs
- View variable values in real-time
- Step-by-step code execution

**Implementation:**
- Debug Adapter Protocol (DAP)
- Node.js debugger (built-in)
- PHP Xdebug integration
- Python debugpy
- Chrome DevTools Protocol

**Features:**
- Add/remove breakpoints
- Step Over, Step Into, Step Out
- Watch expressions
- Call stack view
- Variable inspector
- Debug console

---

### 3. 🎮 Git Integration
**Status:** 🔴 Not Implemented

**Description:**
Complete Git version control system integration.

**Why Important:**
- Essential for modern development
- Team collaboration
- Code history tracking

**Implementation:**
- nodegit or simple-git library
- Git commands via UI
- Diff viewer
- Commit history

**Features:**
- Source Control panel
- View changes (diff)
- Commit with message
- Create/switch branches
- Push/Pull/Fetch
- Merge conflict resolution
- Git history viewer
- Blame view (who changed what)
- Stash management

---

### 4. ⚡ Command Palette
**Status:** 🔴 Not Implemented

**Description:**
Quick access to all commands and files.

**Why Important:**
- Dramatically increases speed
- No need to navigate menus
- Professional workflow

**Implementation:**
- Fuzzy search algorithm
- Ctrl+P (Quick Open)
- Ctrl+Shift+P (Command Palette)

**Features:**
- File search (fuzzy matching)
- Command search
- Symbol search (@)
- Go to line (:)
- Recent files
- Keyboard shortcuts display

---

### 5. 🔧 Code Formatting & Linting
**Status:** 🔴 Not Implemented

**Description:**
Automatic code formatting and error detection.

**Why Important:**
- Improves code quality
- Enforces team standards
- Catches errors while typing

**Implementation:**
- Prettier integration (formatting)
- ESLint (JavaScript/TypeScript)
- PHPStan/Psalm (PHP)
- Pylint/Black (Python)

**Features:**
- Auto-format on save
- Syntax error highlighting
- Code smell detection
- Customizable rules
- Fix on save

---

## 🎯 PHASE 2: Advanced Development Tools (Priority: HIGH)

### 6. 🧪 Testing Integration
**Status:** 🔴 Not Implemented

**Description:**
Run and view test results directly in the IDE.

**Implementation:**
- Jest integration (JavaScript)
- PHPUnit (PHP)
- Pytest (Python)
- Test Explorer UI

**Features:**
- Test discovery
- Run/Debug individual tests
- Test results view
- Code coverage
- Failed test highlighting

---

### 7. 🔄 Refactoring Tools
**Status:** 🔴 Not Implemented

**Description:**
Safe code restructuring tools.

**Features:**
- Rename symbol (all references)
- Extract method/function
- Extract variable
- Inline variable
- Move to file
- Convert to arrow function
- Auto-import management

---

### 8. 📦 Package Manager Integration
**Status:** 🔴 Not Implemented

**Description:**
GUI for npm, composer, pip package management.

**Features:**
- Package search
- Install/update/remove via UI
- Dependency tree view
- Vulnerability scanning
- Update notifications
- Version management

---

### 9. 📊 Database Viewer & Manager
**Status:** 🔴 Not Implemented

**Description:**
View and manage databases directly in IDE.

**Implementation:**
- MySQL/PostgreSQL support
- MongoDB viewer
- SQLite browser
- SQL query editor

**Features:**
- Database connections
- Table viewer/editor
- Run SQL queries
- Export/Import (CSV, JSON)
- ER diagram view

---

### 10. 🌐 Live Preview & Hot Reload
**Status:** 🔴 Not Implemented

**Description:**
Preview HTML/CSS changes in real-time.

**Features:**
- Split view (code + preview)
- Auto refresh on save
- Responsive preview (mobile/tablet/desktop)
- DevTools integration
- Live CSS editing

---

## 🎯 PHASE 3: Professional Features (Priority: MEDIUM)

### 11. 🔍 Advanced Find & Replace
**Status:** 🟡 Partially Implemented

**Current:** Basic search exists
**Needed:**
- Regex support
- Multi-file search
- Replace in files
- Search history
- Exclude patterns

---

### 12. 💡 Snippets & Templates
**Status:** 🔴 Not Implemented

**Description:**
Code templates for faster development.

**Features:**
- Built-in snippets
- Custom user snippets
- Placeholder support
- Tab stops
- Variable substitution

**Example:**
```javascript
// Type "for" + TAB
for (let i = 0; i < array.length; i++) {
  const element = array[i];
  
}
```

---

### 13. 🎨 Emmet Support
**Status:** 🔴 Not Implemented

**Description:**
Fast HTML/CSS writing with abbreviations.

**Example:**
```
div.container>ul>li*5 → TAB
```
Expands to:
```html
<div class="container">
  <ul>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
  </ul>
</div>
```

---

### 14. 🎯 Jump to Definition
**Status:** 🔴 Not Implemented

**Description:**
Navigate to function/class definitions.

**Features:**
- Go to Definition (F12)
- Go to Type Definition
- Find All References
- Peek Definition
- Go to Implementation

---

### 15. 🌍 Multi-Language Support Enhancement
**Status:** 🟡 Partially Implemented

**Current Languages:**
- JavaScript, TypeScript, HTML, CSS, JSON
- Python, PHP, Java, C/C++, Go, Rust, Ruby

**Should Add:**
- **Mobile:** Swift, Kotlin, Dart (Flutter)
- **Game:** C#, GDScript, Lua
- **Web:** Vue templates, Svelte, Angular
- **Data:** SQL, GraphQL, YAML
- **Markup:** Markdown preview, XML, TOML

---

## 🎯 PHASE 4: Platform-Specific Features (Priority: MEDIUM)

### 16. 📱 Mobile Development Tools
**Status:** 🔴 Not Implemented

**Features:**
- React Native debugger
- Flutter DevTools integration
- Android Emulator integration
- iOS Simulator integration
- Expo integration
- Device preview
- Hot reload support

---

### 17. 🎮 Game Development Support
**Status:** 🔴 Not Implemented

**Features:**
- Unity integration
- Unreal Engine support
- Godot support
- Asset preview
- Scene viewer
- Shader editor

---

### 18. 🌐 Built-in Web Server
**Status:** 🔴 Not Implemented

**Features:**
- One-click server start
- Auto port selection
- Live reload
- HTTPS support
- Proxy configuration
- PHP built-in server

---

## 🎯 PHASE 5: Extensibility & Customization (Priority: LOW)

### 19. 🛒 Marketplace & Extensions
**Status:** 🟡 Basic Plugin System Exists

**Needed:**
- Extension marketplace UI
- Extension search
- Auto-update system
- Rating/review system
- Extension API documentation
- Community contributions

---

### 20. ⚙️ Advanced Settings System
**Status:** 🔴 Not Implemented

**Features:**
- User settings
- Workspace settings
- Language-specific settings
- Settings sync
- Settings UI
- JSON-based config

---

### 21. ⌨️ Keyboard Shortcuts Customization
**Status:** 🔴 Not Implemented

**Features:**
- Customizable shortcuts
- Preset keymaps (VS Code, Sublime, Vim)
- Conflict detection
- Cheat sheet
- Vim mode (optional)

---

### 22. 🎨 Theme System
**Status:** 🟡 Basic Dark Theme Exists

**Needed:**
- Light theme
- High contrast themes
- Custom theme support
- Theme marketplace
- Color customization

---

## 🎯 PHASE 6: Productivity & Tools (Priority: LOW)

### 23. 📝 Task System
**Status:** 🔴 Not Implemented

**Features:**
- Build tasks
- Custom tasks
- Task templates
- Problem matchers
- Task output panel

---

### 24. 🎨 UI/UX Design Tools
**Status:** 🔴 Not Implemented

**Features:**
- Color picker (hex, rgb, hsl)
- CSS gradient generator
- Box shadow generator
- Font preview
- Icon library
- Image optimizer

---

### 25. ❌ XML/JSON Tools
**Status:** 🔴 Not Implemented

**Features:**
- Format/minify
- Validate
- Convert between formats
- JSON schema validation
- XPath tester
- JSON to TypeScript

---

### 26. 📊 Output Panel
**Status:** 🔴 Not Implemented

**Features:**
- Build output
- Extension logs
- Language server logs
- Git output
- Task output
- Log filtering

---

### 27. 🔍 Zoom & Accessibility
**Status:** 🔴 Not Implemented

**Features:**
- Zoom in/out (Ctrl +/-)
- Font size adjustment
- High contrast themes
- Screen reader support
- Keyboard navigation
- ARIA labels

---

## 📊 Development Timeline Estimate

### Phase 1 (Critical) - 2-3 months
- IntelliSense
- Debugging
- Git Integration
- Command Palette
- Code Formatting

### Phase 2 (High Priority) - 2-3 months
- Testing Integration
- Refactoring Tools
- Package Manager UI
- Database Viewer
- Live Preview

### Phase 3 (Medium Priority) - 2-3 months
- Advanced Find/Replace
- Snippets
- Emmet
- Jump to Definition
- Enhanced Language Support

### Phase 4 (Platform-Specific) - 2-3 months
- Mobile Tools
- Game Development Support
- Built-in Server

### Phase 5 (Extensibility) - 1-2 months
- Marketplace
- Settings System
- Keyboard Customization
- Theme System

### Phase 6 (Productivity) - 1-2 months
- Task System
- Design Tools
- XML/JSON Tools
- Output Panel
- Accessibility

**Total Estimated Time:** 10-16 months (full-time development)

---

## 🏗️ Architecture Recommendations

### 1. Plugin Architecture
- Keep core minimal
- All features as plugins
- Strong Extension API
- Plugin isolation

### 2. Language Server Protocol (LSP)
- Standard protocol for all languages
- Easy integration
- Community support
- Reusable across editors

### 3. Workspace Concept
- Multi-root workspace support
- Workspace-specific settings
- Project-specific configuration
- .vscode folder compatibility

### 4. Settings System
- JSON-based configuration
- User vs Workspace settings
- Language-specific overrides
- Settings sync (future)

### 5. Task System
- Build automation
- Custom task definitions
- Problem matchers
- Task dependencies

---

## 🎓 Comparison with Major IDEs

| Feature | Sweet IDE | VS Code | WebStorm | IntelliJ |
|---------|-----------|---------|----------|----------|
| **Core Editor** | ✅ Monaco | ✅ Monaco | ✅ Custom | ✅ Custom |
| **IntelliSense** | 🔴 No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Debugging** | 🔴 No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Git Integration** | 🔴 No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Testing** | 🔴 No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Refactoring** | 🔴 No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Terminal** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **File Explorer** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Extensions** | 🟡 Basic | ✅ Rich | ✅ Rich | ✅ Rich |
| **Project Creator** | ✅ Yes | 🔴 No | 🟡 Limited | 🟡 Limited |
| **Multi-Language** | ✅ Yes | ✅ Yes | 🟡 Limited | ✅ Yes |

**Legend:**
- ✅ Fully Implemented
- 🟡 Partially Implemented
- 🔴 Not Implemented

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Pick a Feature** from the roadmap above
2. **Create an Issue** to discuss implementation
3. **Fork & Develop** following our coding standards
4. **Submit a Pull Request** with tests and documentation

### Priority Areas for Contributors:
- 🔴 **Critical:** Git Integration, IntelliSense, Debugging
- 🟡 **High:** Testing, Refactoring, Package Manager
- 🟢 **Medium:** Mobile Tools, Design Tools, Marketplace

---

## 📚 Resources & Documentation

### For Developers:
- [Electron Documentation](https://www.electronjs.org/docs)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)

### Inspiration:
- [VS Code](https://code.visualstudio.com/)
- [Atom](https://atom.io/)
- [Sublime Text](https://www.sublimetext.com/)
- [WebStorm](https://www.jetbrains.com/webstorm/)

---

## 📝 Notes

- This roadmap is subject to change based on community feedback
- Features are prioritized based on developer needs and impact
- Timeline estimates assume full-time development
- Community contributions can accelerate development

---

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

---

## 📄 License

[Add your license here]

## 👥 Team

[Add team members here]

## 📧 Contact

[Add contact information here]


---

## 🎉 Son Eklenen Özellikler (Yeni Tamamlananlar)

### ✅ Auto-Import Sistemi
**Tarih:** 2024
**Durum:** Tamamlandı

**Özellikler:**
- Otomatik import önerisi (Ctrl+Space ile)
- Alt+Enter ile hızlı import ekleme
- Lightbulb (💡) ile kod eylemi önerisi
- Default ve named export desteği
- Relative path hesaplama (Windows uyumlu)
- Proje taraması ve export cache
- Dosya kaydedildiğinde otomatik güncelleme
- Duplicate import kontrolü

**Kullanım:**
1. Tanımlanmamış bir sembol yazın (örn: `Header`)
2. `Ctrl+Space` ile öneri listesini açın veya `Alt+Enter` basın
3. Import otomatik olarak dosyanın başına eklenecek

**Desteklenen Formatlar:**
- `export default ClassName`
- `export const/function/class Name`
- `export { Name1, Name2 }`
- React component'leri

---

### ✅ Emmet Abbreviation Desteği
**Tarih:** 2024
**Durum:** Tamamlandı

**Özellikler:**
- Resmi `emmet` npm paketi entegrasyonu
- Tüm Emmet özellikleri destekleniyor
- HTML, JSX, TSX dosyalarında çalışır
- Tab tuşu ile genişletme
- Async dinamik import

**Örnekler:**
```html
div.container → <div class="container"></div>
ul>li*5 → <ul><li></li><li></li>...</ul>
ul#nav>li.item$*4>a{Item $} → Tam navigasyon yapısı
```

**Desteklenen Pattern'ler:**
- Temel taglar: `div`, `span`, `p`
- Class: `.classname`
- ID: `#idname`
- Child: `>`
- Sibling: `+`
- Multiplication: `*`
- Numbering: `$`
- Text: `{}`
- Attributes: `[]`

---

### ✅ Otomatik Parantez ve Tırnak Kapatma
**Tarih:** 2024
**Durum:** Tamamlandı

**Özellikler:**
- Otomatik parantez kapatma: `()`, `[]`, `{}`
- Otomatik tırnak kapatma: `''`, `""`
- Overtype desteği (kapatma karakterinin üzerine yazma)
- Tüm dillerde çalışır

**Monaco Ayarları:**
```javascript
autoClosingBrackets: 'always'
autoClosingQuotes: 'always'
autoClosingOvertype: 'always'
```

---

### ✅ Hata Detayı Tooltip ve Modal Sistemi
**Tarih:** 2024
**Durum:** Tamamlandı

**Özellikler:**
- Output panelindeki hatalara tıklayınca dosya açılır
- Hatalı satır otomatik highlight edilir (kırmızı arka plan)
- Hover ile tooltip gösterimi
- "Show Details" butonu ile detaylı modal
- Akıllı token bulma (değişken/fonksiyon adı)
- Context-aware çözüm önerileri
- Dosya kaydedilince highlight temizlenir

**Desteklenen Hata Tipleri:**
- ReferenceError
- TypeError
- SyntaxError
- RangeError
- Custom hatalar

**Modal İçeriği:**
- Dosya konumu (file:line:column)
- Tam hata mesajı
- Highlight edilmiş kod snippet'i
- Hata tipine özel çözüm önerileri

---

### ✅ Go to Definition (F12 ve Sağ Tık)
**Tarih:** 2024
**Durum:** Tamamlandı

**Özellikler:**
- F12 tuşu ile tanıma gitme
- Sağ tık menüsünden "Go to Definition"
- Import statement'larda dosyaya gitme
- Proje export'larında sembol arama
- Otomatik satır bulma (export satırı)
- Yeni tab'da dosya açma
- Doğru satıra scroll ve highlight

**Kullanım:**
1. Bir sembol üzerine imleci getirin (örn: `MenuBar`)
2. F12'ye basın veya sağ tıklayıp "Go to Definition" seçin
3. Dosya yeni tab'da açılır ve ilgili satıra gidilir

**Desteklenen Durumlar:**
- Import statement'lar: `import { X } from './path'`
- Function/Class/Variable tanımları
- React component'leri
- Named ve default export'lar

**Path Normalizasyonu:**
- Windows path desteği (C:\...)
- Relative path çözümleme
- Otomatik dosya uzantısı ekleme (.jsx, .tsx, .js, .ts)
- Çift path ve drive letter düzeltme

---

### ✅ localStorage Kullanımı Kaldırıldı
**Tarih:** 2024
**Durum:** Tamamlandı

**Değişiklikler:**
- `localStorage` ve `sessionStorage` kullanımı tamamen kaldırıldı
- Keybinding kaydetme devre dışı bırakıldı
- Tüm ayarlar varsayılan değerlerde
- Tarayıcı depolama bağımlılığı yok

**Etkilenen Dosyalar:**
- `src/renderer/src/config/keybindings.js`

---

## 🔧 Teknik Detaylar

### Auto-Import Mimarisi
**Dosyalar:**
- `src/renderer/src/utils/autoImport.js` - Core logic
- `src/renderer/src/components/center-panel/index.jsx` - Monaco integration
- `src/preload/index.js` - IPC API
- `src/main/index.js` - Backend handlers

**Akış:**
1. Proje açıldığında tüm dosyalar taranır
2. Export'lar cache'e alınır
3. Kullanıcı kod yazarken completion provider devreye girer
4. Alt+Enter veya Ctrl+Space ile import eklenir
5. Dosya kaydedildiğinde cache güncellenir

### Path Normalizasyonu
**Sorun:** Windows'ta path'ler karışıyor (C:\C:\, backslash vs forward slash)

**Çözüm:**
- Backend'de `read-directory` handler'ı path'leri normalize ediyor
- Frontend'de path temizleme fonksiyonları
- Monaco URI için `file:///C:/path` formatı kullanılıyor
- Çift drive letter ve slash kontrolü

### Definition Provider
**Sorun:** Monaco'nun built-in provider dosya açmıyor (model yok)

**Çözüm:**
- Custom Definition Provider ile dosya manuel açılıyor
- State'e yeni file ekleniyor
- Monaco model otomatik oluşturuluyor
- Doğru satıra scroll ve highlight

---

## 🐛 Bilinen Sorunlar ve Çözümler

### 1. Ctrl+Hover ile Otomatik Gitme
**Sorun:** Ctrl basınca hover ile otomatik definition'a gidiyor

**Çözüm Denemeleri:**
- ❌ `links: false` - Yeterli olmadı
- ❌ Custom event handler - Monaco'nun kendi handler'ı öncelikli
- ✅ Definition Provider + Ctrl tuşu takibi (şu an aktif)

**Mevcut Durum:**
- F12 ve sağ tık menüsü çalışıyor
- Ctrl+hover sorunu devam ediyor (Monaco'nun built-in özelliği)

### 2. Path Corruption
**Sorun:** `C:\C:\Users\...` gibi çift path'ler

**Çözüm:**
- Backend'de path normalizasyonu
- Frontend'de temizleme fonksiyonları
- Regex ile çift drive letter kontrolü
- Forward slash standardizasyonu

### 3. Dosya Uzantısı Eksikliği
**Sorun:** Import path'lerde `.jsx` uzantısı yok

**Çözüm:**
- Otomatik uzantı ekleme (.jsx, .tsx, .js, .ts)
- `fileExists` ile kontrol
- İlk bulunan uzantı kullanılıyor

---

## 📊 Performans İyileştirmeleri

### Export Cache
- Proje açılışında bir kez tarama
- Dosya kaydedildiğinde sadece o dosya güncellenir
- Ref kullanımı ile gereksiz re-render önlenir

### Path Normalizasyonu
- Backend'de bir kez normalize edilir
- Frontend'de minimal işlem
- Regex kullanımı optimize edildi

### Monaco Integration
- Lazy loading (async import)
- Provider'lar sadece gerektiğinde çalışır
- Model cache ile gereksiz oluşturma önlenir

---

## 🎯 Gelecek İyileştirmeler

### Auto-Import
- [ ] TypeScript type import desteği
- [ ] Barrel export desteği (index.js)
- [ ] Alias path desteği (@/, ~/)
- [ ] Import sıralama ve gruplama
- [ ] Unused import temizleme

### Go to Definition
- [ ] Ctrl+Click desteği (hover olmadan)
- [ ] Peek Definition (modal preview)
- [ ] Go to Type Definition
- [ ] Find All References
- [ ] Go to Implementation

### Emmet
- [ ] CSS Emmet desteği
- [ ] Custom snippet'ler
- [ ] Emmet ayarları (prefix, trigger key)

### Error Handling
- [ ] Multi-file error tracking
- [ ] Error history
- [ ] Quick fix suggestions
- [ ] Auto-fix for common errors

---

## 📝 Notlar

- Tüm özellikler Windows, macOS ve Linux'ta test edildi
- Monaco Editor v0.45.0 kullanılıyor
- Electron v28.x ile uyumlu
- React 18.x ile çalışıyor

---

**Son Güncelleme:** 2024
**Geliştirici:** Sweet IDE Team
"# editor" 
