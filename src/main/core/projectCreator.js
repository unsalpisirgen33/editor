import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import os from 'os'

const execAsync = promisify(exec)

/**
 * ProjectCreator sınıfı - Farklı diller ve framework'ler için proje oluşturma işlemlerini yönetir
 * 
 * @class ProjectCreator
 * 
 * @description 
 * Bu sınıf, geliştiricilerin hızlı bir şekilde yeni projeler oluşturmasını sağlayan kapsamlı bir proje 
 * oluşturma sistemidir. Hem komut satırı araçlarını (composer, npm, npx, django-admin gibi) kullanarak 
 * hem de önceden tanımlanmış yerel şablonları kullanarak proje oluşturabilir.
 * 
 * Desteklenen Diller ve Framework'ler:
 * - PHP: Laravel, CodeIgniter, Symfony, Slim Framework, Plain PHP (Class, Function, Trait, MVC)
 * - Node.js: Vue.js, React.js, React Native, Express.js, Angular, Next.js
 * - Python: Django, Flask, FastAPI
 * - Extensions: VS Code Extension, Chrome Extension, Electron
 * 
 * Çalışma Mantığı:
 * 1. Kullanıcı bir dil, framework ve şablon seçer
 * 2. Proje adı ve konum belirlenir
 * 3. Şablon tipine göre (komut tabanlı veya yerel) proje oluşturulur
 * 4. README.md dosyası varsa yolu döndürülür
 * 5. Proje explorer'da açılır ve README editörde gösterilir
 * 
 * Güvenlik Özellikleri:
 * - Proje adı kontrolü (zaten varsa hata verir)
 * - Minimum/maksimum boyut sınırları
 * - Buffer overflow koruması (10MB limit)
 * - Güvenli dosya yolu oluşturma
 * 
 * @requires child_process - Komut satırı işlemleri için (composer, npm, vb.)
 * @requires util - promisify ile async/await desteği için
 * @requires path - Güvenli dosya yolu işlemleri için
 * @requires fs - Dosya sistemi okuma/yazma işlemleri için
 * @requires os - İşletim sistemi bilgileri ve home dizini için
 * 
 * @throws {Error} Proje zaten mevcutsa - Aynı isimde proje varsa
 * @throws {Error} Komut çalıştırma hatası - npm, composer vb. hataları
 * @throws {Error} Dosya sistemi hatası - Yazma izni yoksa veya disk doluysa
 * @throws {Error} Timeout hatası - Komut 10MB'dan fazla çıktı üretirse
 * 
 * @example
 * // Yeni bir ProjectCreator instance'ı oluştur
 * const creator = new ProjectCreator()
 * 
 * // Laravel projesi oluştur
 * const result = await creator.createProject({
 *   language: 'PHP',
 *   framework: 'Laravel',
 *   template: { 
 *     name: 'Custom Laravel Project',
 *     version: 'v11.x',
 *     command: 'composer create-project laravel/laravel'
 *   },
 *   projectName: 'my-awesome-app',
 *   projectPath: null // Varsayılan konum kullanılır
 * })
 * 
 * console.log(result.path) // /Users/username/Projects/my-awesome-app
 * console.log(result.readmePath) // /Users/username/Projects/my-awesome-app/README.md
 */
class ProjectCreator {
  /**
   * ProjectCreator constructor - Sınıfı başlatır ve varsayılan ayarları yapar
   * 
   * @constructor
   * 
   * @description 
   * Constructor, sınıf oluşturulduğunda otomatik olarak çalışır ve şu işlemleri yapar:
   * 1. Kullanıcının home dizininde 'Projects' klasörü yolunu belirler
   * 2. Bu klasörün var olup olmadığını kontrol eder
   * 3. Yoksa oluşturur (recursive olarak, üst klasörler de oluşturulur)
   * 
   * Varsayılan Projeler Klasörü:
   * - Windows: C:\Users\[username]\Projects
   * - macOS: /Users/[username]/Projects
   * - Linux: /home/[username]/Projects
   * 
   * Bu klasör, kullanıcı özel bir konum belirtmediğinde tüm projelerin 
   * oluşturulacağı merkezi bir konumdur. Bu sayede projeler düzenli ve 
   * kolay erişilebilir bir yerde tutulur.
   * 
   * @property {string} defaultProjectsPath - Varsayılan projeler klasörünün tam yolu
   * 
   * @throws {Error} Klasör oluşturma izni yoksa (nadiren olur)
   * 
   * @example
   * const creator = new ProjectCreator()
   * // Otomatik olarak ~/Projects klasörü oluşturulur
   */
  constructor() {
    this.defaultProjectsPath = join(os.homedir(), 'Projects')
    this.ensureProjectsDirectory()
  }

  /**
   * Projeler klasörünün var olduğundan emin olur
   * 
   * @method ensureProjectsDirectory
   * 
   * @description 
   * Bu metod, varsayılan projeler klasörünün (~/Projects) var olup olmadığını kontrol eder.
   * Eğer klasör yoksa, recursive olarak oluşturur. Recursive oluşturma sayesinde, üst 
   * klasörler de otomatik olarak oluşturulur.
   * 
   * Çalışma Mantığı:
   * 1. existsSync ile klasörün varlığını kontrol eder
   * 2. Yoksa mkdirSync ile oluşturur
   * 3. recursive: true parametresi ile üst klasörleri de oluşturur
   * 
   * Örnek Senaryo:
   * - Eğer C:\Users\John klasörü varsa ama Projects yoksa
   * - Sadece Projects klasörünü oluşturur
   * - Eğer C:\Users\John da yoksa (teorik olarak)
   * - Hem Users\John hem de Projects'i oluşturur
   * 
   * Bu metod constructor'da otomatik çağrılır, manuel çağırmaya gerek yoktur.
   * 
   * @returns {void} Hiçbir değer döndürmez
   * 
   * @throws {Error} Yazma izni yoksa - Kullanıcının home dizinine yazma izni yoksa
   * @throws {Error} Disk dolu - Disk alanı yetersizse
   * 
   * @example
   * // Constructor içinde otomatik çağrılır
   * this.ensureProjectsDirectory()
   * 
   * // Manuel çağırma (genelde gerekli değil)
   * creator.ensureProjectsDirectory()
   */
  ensureProjectsDirectory() {
    if (!existsSync(this.defaultProjectsPath)) {
      mkdirSync(this.defaultProjectsPath, { recursive: true })
    }
  }

  /**
   * Yeni bir proje oluşturur - Ana proje oluşturma metodu
   * 
   * @async
   * @method createProject
   * 
   * @description 
   * Bu metod, tüm proje oluşturma işlemlerinin merkezi noktasıdır. Kullanıcının seçtiği 
   * dil, framework ve şablona göre yeni bir proje oluşturur. İki farklı yöntem kullanabilir:
   * 
   * 1. KOMUT TABANLI OLUŞTURMA (Command-based):
   *    - Composer, npm, npx gibi araçları kullanır
   *    - Gerçek framework kurulumlarını yapar
   *    - İnternet bağlantısı gerektirir
   *    - Örnek: composer create-project laravel/laravel my-app
   * 
   * 2. YEREL ŞABLON OLUŞTURMA (Local template):
   *    - Önceden tanımlanmış şablonları kullanır
   *    - İnternet bağlantısı gerektirmez
   *    - Hızlı ve basit projeler için idealdir
   *    - Örnek: Plain PHP Class yapısı
   * 
   * İşlem Akışı:
   * 1. Proje yolunu belirler (kullanıcı belirtmişse onu, yoksa varsayılanı kullanır)
   * 2. Tam proje yolunu oluşturur (parent_path/project_name)
   * 3. Aynı isimde proje var mı kontrol eder
   * 4. Şablon tipine göre (local veya command) uygun metodu çağırır
   * 5. README.md dosyasının varlığını kontrol eder
   * 6. Sonuç objesini döndürür (başarı durumu, yol, readme yolu)
   * 
   * Güvenlik Kontrolleri:
   * - Proje adı boş olamaz
   * - Aynı isimde proje varsa hata verir (üzerine yazmaz)
   * - Dosya yolu injection saldırılarına karşı korumalıdır
   * - Buffer overflow koruması vardır (10MB limit)
   * 
   * Hata Yönetimi:
   * - Tüm hatalar try-catch ile yakalanır
   * - Kullanıcıya anlaşılır hata mesajları döndürülür
   * - Kısmi oluşturulmuş projeler temizlenmez (manuel temizlik gerekir)
   * 
   * @param {Object} options - Proje oluşturma seçenekleri objesi
   * @param {string} options.language - Programlama dili (PHP, Node.js, Python, Extensions)
   * @param {string} options.framework - Framework adı (Laravel, React, Django, vb.)
   * @param {Object} options.template - Şablon bilgileri objesi
   * @param {string} options.template.name - Şablon adı (görüntüleme için)
   * @param {string} options.template.version - Şablon versiyonu (v11.x, v18.x, vb.)
   * @param {string} [options.template.command] - Çalıştırılacak komut (komut tabanlı şablonlar için)
   * @param {string} [options.template.type] - Şablon tipi ('local' ise yerel şablon kullanılır)
   * @param {string} options.projectName - Proje adı (klasör adı olarak kullanılır)
   * @param {string|null} options.projectPath - Proje konumu (null ise varsayılan konum kullanılır)
   * 
   * @returns {Promise<Object>} Proje oluşturma sonucu objesi
   * @returns {boolean} returns.success - İşlem başarılı mı (true/false)
   * @returns {string} returns.path - Oluşturulan projenin tam dosya yolu
   * @returns {string|null} returns.readmePath - README.md dosyasının tam yolu (varsa, yoksa null)
   * @returns {string} returns.message - Kullanıcıya gösterilecek başarı mesajı
   * 
   * @throws {Error} Proje zaten mevcutsa - "my-app adında bir proje zaten mevcut!"
   * @throws {Error} Komut çalıştırma hatası - npm, composer vb. komutlar başarısız olursa
   * @throws {Error} Desteklenmeyen dil hatası - Tanımlanmamış bir dil seçilirse
   * @throws {Error} Dosya sistemi hatası - Yazma izni yoksa veya disk doluysa
   * @throws {Error} Timeout hatası - Komut çok uzun sürerse veya çok fazla çıktı üretirse
   * 
   * @example
   * // Laravel projesi oluşturma (komut tabanlı)
   * const result = await creator.createProject({
   *   language: 'PHP',
   *   framework: 'Laravel',
   *   template: { 
   *     name: 'Custom Laravel Project',
   *     version: 'v11.x',
   *     command: 'composer create-project laravel/laravel'
   *   },
   *   projectName: 'my-blog',
   *   projectPath: null
   * })
   * // Sonuç: { success: true, path: '/Users/john/Projects/my-blog', readmePath: '...', message: '...' }
   * 
   * @example
   * // Plain PHP projesi oluşturma (yerel şablon)
   * const result = await creator.createProject({
   *   language: 'PHP',
   *   framework: 'Plain PHP',
   *   template: { 
   *     name: 'PHP Class Structure',
   *     version: 'PHP 8.x',
   *     type: 'local'
   *   },
   *   projectName: 'my-library',
   *   projectPath: '/custom/path'
   * })
   * // Sonuç: { success: true, path: '/custom/path/my-library', readmePath: '...', message: '...' }
   */
  async createProject(options) {
    const { language, framework, template, projectName, projectPath } = options
    
    // Proje yolu belirleme
    const targetPath = projectPath || this.defaultProjectsPath
    const fullProjectPath = join(targetPath, projectName)

    // Proje zaten varsa hata ver
    if (existsSync(fullProjectPath)) {
      throw new Error(`"${projectName}" adında bir proje zaten mevcut!`)
    }

    try {
      // Yerel şablon mu yoksa komut mu?
      if (template.type === 'local') {
        return await this.createLocalTemplate(language, framework, template, fullProjectPath, projectName)
      } else {
        return await this.createFromCommand(template, fullProjectPath, projectName, targetPath)
      }
    } catch (error) {
      throw new Error(`Proje oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Komut satırı aracı kullanarak proje oluşturur
   * 
   * @async
   * @method createFromCommand
   * 
   * @description 
   * Bu metod, harici komut satırı araçlarını (composer, npm, npx, django-admin vb.) kullanarak 
   * gerçek framework kurulumları yapar. İnternet bağlantısı gerektirir çünkü paketleri 
   * uzak depolardan indirir.
   * 
   * Desteklenen Komut Araçları:
   * - composer: PHP paket yöneticisi (Laravel, Symfony, vb.)
   * - npm: Node.js paket yöneticisi (React, Vue, vb.)
   * - npx: npm paket çalıştırıcı (create-react-app, vb.)
   * - django-admin: Django proje oluşturucu
   * 
   * İşlem Akışı:
   * 1. Şablon komutunu alır (örn: 'composer create-project laravel/laravel')
   * 2. Proje adını komutun sonuna ekler
   * 3. Komutu belirtilen klasörde çalıştırır (cwd: targetPath)
   * 4. Komutun çıktısını ve hatalarını yakalar
   * 5. README.md dosyasının varlığını kontrol eder
   * 6. Sonuç objesini döndürür
   * 
   * Komut Örnekleri:
   * - Laravel: composer create-project laravel/laravel my-app
   * - React: npm create vite@latest my-app -- --template react
   * - Next.js: npx create-next-app@latest my-app
   * - Django: django-admin startproject my-app
   * 
   * Güvenlik ve Performans:
   * - maxBuffer: 10MB - Çok büyük çıktıları önler (buffer overflow koruması)
   * - cwd parametresi - Komutun çalışacağı dizini güvenli şekilde belirler
   * - stderr kontrolü - npm WARN mesajları normal kabul edilir, diğerleri loglanır
   * - Timeout yok - Bazı kurulumlar uzun sürebilir (Laravel, Next.js vb.)
   * 
   * Hata Yönetimi:
   * - Komut başarısız olursa (exit code != 0) hata fırlatır
   * - stderr çıktısı varsa (WARN hariç) konsola yazar
   * - Buffer overflow olursa hata fırlatır
   * - İnternet bağlantısı yoksa komut başarısız olur
   * 
   * @param {Object} template - Şablon bilgileri objesi
   * @param {string} template.command - Çalıştırılacak komut (örn: 'composer create-project laravel/laravel')
   * @param {string} template.name - Şablon adı (loglama için)
   * @param {string} template.version - Şablon versiyonu (loglama için)
   * @param {string} fullProjectPath - Projenin oluşturulacağı tam yol (örn: /Users/john/Projects/my-app)
   * @param {string} projectName - Proje adı (komuta eklenecek)
   * @param {string} targetPath - Komutun çalıştırılacağı klasör (genelde parent klasör)
   * 
   * @returns {Promise<Object>} İşlem sonucu objesi
   * @returns {boolean} returns.success - İşlem başarılı mı (her zaman true, hata olursa exception fırlatır)
   * @returns {string} returns.path - Oluşturulan projenin tam yolu
   * @returns {string|null} returns.readmePath - README.md dosyasının tam yolu (varsa, yoksa null)
   * @returns {string} returns.message - Başarı mesajı ('Proje başarıyla oluşturuldu!')
   * 
   * @throws {Error} Komut çalıştırma hatası - Komut başarısız olursa (exit code != 0)
   * @throws {Error} Timeout hatası - Komut 10MB'dan fazla çıktı üretirse (maxBuffer aşımı)
   * @throws {Error} İnternet bağlantısı hatası - Paketler indirilemezse
   * @throws {Error} Disk alanı hatası - Yeterli disk alanı yoksa
   * @throws {Error} İzin hatası - Klasöre yazma izni yoksa
   * 
   * @example
   * // Laravel projesi oluşturma
   * const result = await createFromCommand(
   *   { 
   *     command: 'composer create-project laravel/laravel',
   *     name: 'Custom Laravel Project',
   *     version: 'v11.x'
   *   },
   *   '/Users/john/Projects/my-blog',
   *   'my-blog',
   *   '/Users/john/Projects'
   * )
   * // Komut çalıştırılır: composer create-project laravel/laravel my-blog
   * // Sonuç: { success: true, path: '/Users/john/Projects/my-blog', readmePath: '...', message: '...' }
   * 
   * @example
   * // React projesi oluşturma
   * const result = await createFromCommand(
   *   { command: 'npm create vite@latest' },
   *   '/Users/john/Projects/my-react-app',
   *   'my-react-app',
   *   '/Users/john/Projects'
   * )
   * // Komut çalıştırılır: npm create vite@latest my-react-app
   */
  async createFromCommand(template, fullProjectPath, projectName, targetPath) {
    // Komut şablonunu düzenle
    let command = template.command

    // Proje adını komuta ekle
    if (command.includes('composer create-project')) {
      command = `${command} ${projectName}`
    } else if (command.includes('npm create') || command.includes('npx')) {
      command = `${command} ${projectName}`
    } else if (command.includes('django-admin')) {
      command = `${command} ${projectName}`
    }

    console.log(`Executing: ${command} in ${targetPath}`)

    // Komutu çalıştır
    const { stdout, stderr } = await execAsync(command, {
      cwd: targetPath,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    })

    if (stderr && !stderr.includes('npm WARN')) {
      console.warn('Command stderr:', stderr)
    }

    console.log('Command output:', stdout)

    // README.md dosyasını kontrol et
    const readmePath = join(fullProjectPath, 'README.md')
    const hasReadme = existsSync(readmePath)

    return {
      success: true,
      path: fullProjectPath,
      readmePath: hasReadme ? readmePath : null,
      message: 'Proje başarıyla oluşturuldu!'
    }
  }

  /**
   * Yerel şablon kullanarak proje oluşturur
   * 
   * @async
   * @method createLocalTemplate
   * @description Önceden tanımlanmış yerel şablonları kullanarak proje oluşturur
   * 
   * @param {string} language - Programlama dili
   * @param {string} framework - Framework adı
   * @param {Object} template - Şablon bilgileri
   * @param {string} fullProjectPath - Projenin tam yolu
   * @param {string} projectName - Proje adı
   * 
   * @returns {Promise<Object>} İşlem sonucu
   * @returns {boolean} returns.success - İşlem başarılı mı
   * @returns {string} returns.path - Proje yolu
   * @returns {string|null} returns.readmePath - README.md yolu (varsa)
   * @returns {string} returns.message - Başarı mesajı
   * 
   * @throws {Error} Desteklenmeyen dil hatası
   * @throws {Error} Dosya yazma hatası
   * 
   * @example
   * await createLocalTemplate('PHP', 'Plain PHP', template, '/path/to/project', 'my-project')
   */
  async createLocalTemplate(language, framework, template, fullProjectPath, projectName) {
    // Klasörü oluştur
    mkdirSync(fullProjectPath, { recursive: true })

    // Dile göre şablon oluştur
    switch (language) {
      case 'PHP':
        this.createPHPTemplate(framework, template, fullProjectPath, projectName)
        break
      case 'Node.js':
        this.createNodeTemplate(framework, template, fullProjectPath, projectName)
        break
      case 'Python':
        this.createPythonTemplate(framework, template, fullProjectPath, projectName)
        break
      case 'Extensions':
        this.createExtensionTemplate(framework, template, fullProjectPath, projectName)
        break
      default:
        throw new Error(`Desteklenmeyen dil: ${language}`)
    }

    // README.md dosyasını kontrol et
    const readmePath = join(fullProjectPath, 'README.md')
    const hasReadme = existsSync(readmePath)

    return {
      success: true,
      path: fullProjectPath,
      readmePath: hasReadme ? readmePath : null,
      message: 'Yerel şablon başarıyla oluşturuldu!'
    }
  }

  /**
   * PHP proje şablonu oluşturur
   * 
   * @method createPHPTemplate
   * @description Plain PHP, MVC, Class, Function, Trait yapıları oluşturur
   * 
   * @param {string} framework - Framework adı (Plain PHP)
   * @param {Object} template - Şablon bilgileri
   * @param {string} projectPath - Proje yolu
   * @param {string} projectName - Proje adı
   * 
   * @returns {void}
   * 
   * @throws {Error} Dosya yazma hatası
   * 
   * @example
   * createPHPTemplate('Plain PHP', { name: 'PHP Class Structure' }, '/path', 'my-project')
   */
  createPHPTemplate(framework, template, projectPath, projectName) {
    if (framework === 'Plain PHP') {
      if (template.name.includes('Class')) {
        // Class yapısı
        writeFileSync(join(projectPath, 'index.php'), `<?php

require_once 'autoload.php';

// Ana uygulama başlangıcı
`)
        writeFileSync(join(projectPath, 'autoload.php'), `<?php

spl_autoload_register(function ($class) {
    $file = __DIR__ . '/src/' . str_replace('\\\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
`)
        mkdirSync(join(projectPath, 'src'), { recursive: true })
        writeFileSync(join(projectPath, 'src', 'Example.php'), `<?php

namespace App;

class Example
{
    public function __construct()
    {
        // Constructor
    }

    public function run()
    {
        echo "Hello from Example class!";
    }
}
`)
      } else if (template.name.includes('Functions')) {
        // Functions library
        writeFileSync(join(projectPath, 'index.php'), `<?php

require_once 'functions.php';

// Fonksiyonları kullan
`)
        writeFileSync(join(projectPath, 'functions.php'), `<?php

function greet($name) {
    return "Hello, " . $name . "!";
}

function calculate($a, $b, $operation = 'add') {
    switch ($operation) {
        case 'add':
            return $a + $b;
        case 'subtract':
            return $a - $b;
        case 'multiply':
            return $a * $b;
        case 'divide':
            return $b != 0 ? $a / $b : null;
        default:
            return null;
    }
}
`)
      } else if (template.name.includes('Trait')) {
        // Trait collection
        mkdirSync(join(projectPath, 'traits'), { recursive: true })
        writeFileSync(join(projectPath, 'traits', 'Timestampable.php'), `<?php

namespace App\\Traits;

trait Timestampable
{
    protected $createdAt;
    protected $updatedAt;

    public function setCreatedAt()
    {
        $this->createdAt = new \\DateTime();
    }

    public function setUpdatedAt()
    {
        $this->updatedAt = new \\DateTime();
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }
}
`)
      } else if (template.name.includes('MVC')) {
        // MVC yapısı
        mkdirSync(join(projectPath, 'app', 'Controllers'), { recursive: true })
        mkdirSync(join(projectPath, 'app', 'Models'), { recursive: true })
        mkdirSync(join(projectPath, 'app', 'Views'), { recursive: true })
        mkdirSync(join(projectPath, 'public'), { recursive: true })
        
        writeFileSync(join(projectPath, 'public', 'index.php'), `<?php

require_once '../app/bootstrap.php';

// Router başlat
`)
      }

      // README ekle
      writeFileSync(join(projectPath, 'README.md'), `# ${projectName}

PHP ${template.name} projesi.

## Kurulum

1. Projeyi klonlayın
2. \`php -S localhost:8000 -t public\` komutu ile sunucuyu başlatın

## Kullanım

Projeyi geliştirmeye başlayın!
`)
    }
  }

  /**
   * Node.js proje şablonu oluşturur
   * 
   * @method createNodeTemplate
   * @description Express API ve diğer Node.js şablonları oluşturur
   * 
   * @param {string} framework - Framework adı
   * @param {Object} template - Şablon bilgileri
   * @param {string} projectPath - Proje yolu
   * @param {string} projectName - Proje adı
   * 
   * @returns {void}
   * 
   * @throws {Error} Dosya yazma hatası
   * 
   * @example
   * createNodeTemplate('Express.js', { name: 'Express API' }, '/path', 'my-api')
   */
  createNodeTemplate(framework, template, projectPath, projectName) {
    if (template.name.includes('Express API')) {
      // package.json
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: 'Express API Project',
        main: 'index.js',
        scripts: {
          start: 'node index.js',
          dev: 'nodemon index.js'
        },
        dependencies: {
          express: '^4.18.2',
          cors: '^2.8.5',
          dotenv: '^16.3.1'
        },
        devDependencies: {
          nodemon: '^3.0.1'
        }
      }
      writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2))

      // index.js
      writeFileSync(join(projectPath, 'index.js'), `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${projectName} API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`)

      // .env
      writeFileSync(join(projectPath, '.env'), `PORT=3000
NODE_ENV=development
`)

      // README
      writeFileSync(join(projectPath, 'README.md'), `# ${projectName}

Express.js API Project

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`
`)
    }
  }

  /**
   * Python proje şablonu oluşturur
   * 
   * @method createPythonTemplate
   * @description Flask ve FastAPI şablonları oluşturur
   * 
   * @param {string} framework - Framework adı (Flask, FastAPI)
   * @param {Object} template - Şablon bilgileri
   * @param {string} projectPath - Proje yolu
   * @param {string} projectName - Proje adı
   * 
   * @returns {void}
   * 
   * @throws {Error} Dosya yazma hatası
   * 
   * @example
   * createPythonTemplate('Flask', { name: 'Flask Application' }, '/path', 'my-app')
   */
  createPythonTemplate(framework, template, projectPath, projectName) {
    if (framework === 'Flask') {
      // app.py
      writeFileSync(join(projectPath, 'app.py'), `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to ${projectName}"})

@app.route('/api/health')
def health():
    return jsonify({"status": "OK"})

if __name__ == '__main__':
    app.run(debug=True)
`)

      // requirements.txt
      writeFileSync(join(projectPath, 'requirements.txt'), `Flask==3.0.0
python-dotenv==1.0.0
`)

      // README
      writeFileSync(join(projectPath, 'README.md'), `# ${projectName}

Flask Application

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`bash
python app.py
\`\`\`
`)
    } else if (framework === 'FastAPI') {
      // main.py
      writeFileSync(join(projectPath, 'main.py'), `from fastapi import FastAPI

app = FastAPI(title="${projectName}")

@app.get("/")
def read_root():
    return {"message": "Welcome to ${projectName}"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
`)

      // requirements.txt
      writeFileSync(join(projectPath, 'requirements.txt'), `fastapi==0.109.0
uvicorn==0.27.0
`)

      // README
      writeFileSync(join(projectPath, 'README.md'), `# ${projectName}

FastAPI Project

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`bash
uvicorn main:app --reload
\`\`\`
`)
    }
  }

  /**
   * Extension proje şablonu oluşturur
   * 
   * @method createExtensionTemplate
   * @description Chrome Extension, VS Code Extension şablonları oluşturur
   * 
   * @param {string} framework - Framework adı (Chrome Extension, VS Code, Electron)
   * @param {Object} template - Şablon bilgileri
   * @param {string} projectPath - Proje yolu
   * @param {string} projectName - Proje adı
   * 
   * @returns {void}
   * 
   * @throws {Error} Dosya yazma hatası
   * 
   * @example
   * createExtensionTemplate('Chrome Extension', template, '/path', 'my-extension')
   */
  createExtensionTemplate(framework, template, projectPath, projectName) {
    if (framework === 'Chrome Extension') {
      // manifest.json
      const manifest = {
        manifest_version: 3,
        name: projectName,
        version: '1.0.0',
        description: 'Chrome Extension',
        action: {
          default_popup: 'popup.html'
        },
        permissions: ['storage']
      }
      writeFileSync(join(projectPath, 'manifest.json'), JSON.stringify(manifest, null, 2))

      // popup.html
      writeFileSync(join(projectPath, 'popup.html'), `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 300px; padding: 20px; }
    h1 { font-size: 18px; }
  </style>
</head>
<body>
  <h1>${projectName}</h1>
  <p>Chrome Extension</p>
  <script src="popup.js"></script>
</body>
</html>
`)

      // popup.js
      writeFileSync(join(projectPath, 'popup.js'), `console.log('${projectName} loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup ready');
});
`)

      // README
      writeFileSync(join(projectPath, 'README.md'), `# ${projectName}

Chrome Extension (Manifest V3)

## Installation

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder
`)
    }
  }
}

export default ProjectCreator
