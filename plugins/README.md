# Sweet IDE Plugin Sistemi

## Eklenti Nasıl Oluşturulur?

### 1. Klasör Yapısı

Her eklenti kendi klasöründe olmalıdır:

```
plugins/
  └── my-plugin/
      ├── plugin.json
      └── index.js
```

### 2. plugin.json Dosyası

Her eklentinin bir `plugin.json` dosyası olmalıdır:

```json
{
  "name": "My Plugin",
  "id": "my-plugin",
  "version": "1.0.0",
  "description": "Eklenti açıklaması",
  "main": "index.js",
  "author": "İsminiz"
}
```

**Alanlar:**
- `name`: Menüde görünecek isim
- `id`: Benzersiz eklenti ID'si (kebab-case)
- `version`: Eklenti versiyonu
- `description`: Kısa açıklama
- `main`: Ana JavaScript dosyası (genellikle index.js)
- `author`: Geliştirici adı

### 3. index.js Dosyası

Ana eklenti dosyası şu yapıda olmalıdır:

```javascript
module.exports = {
  // Eklenti yüklendiğinde çalışır
  activate(context) {
    console.log('My Plugin activated!')
    
    // Menü öğesi döndür
    return {
      menuItem: {
        label: 'My Plugin',
        action: 'open-my-plugin-window'
      }
    }
  },

  // Eklenti penceresi açıldığında çalışır
  openWindow() {
    return {
      title: 'My Plugin Window',
      width: 800,
      height: 600,
      content: `
        <div style="padding: 20px; color: white;">
          <h1>My Plugin</h1>
          <p>Eklenti içeriği buraya gelir!</p>
          <button onclick="alert('Merhaba!')">Tıkla</button>
        </div>
      `
    }
  }
}
```

### 4. Pencere İçeriği

`openWindow()` fonksiyonu şu özellikleri döndürür:

- `title`: Pencere başlığı
- `width`: Pencere genişliği (px)
- `height`: Pencere yüksekliği (px)
- `content`: HTML içeriği (string)

**HTML içeriğinde:**
- Inline CSS kullanabilirsiniz
- JavaScript kodları `<script>` tagı içinde çalışır
- Dark tema için `background: #1e1e1e` ve `color: white` kullanın

### 5. Örnek Eklentiler

#### Basit Eklenti

```javascript
module.exports = {
  activate(context) {
    return {
      menuItem: {
        label: 'Hello World',
        action: 'open-hello-window'
      }
    }
  },

  openWindow() {
    return {
      title: 'Hello World',
      width: 400,
      height: 300,
      content: `
        <div style="padding: 20px; color: white; text-align: center;">
          <h1>Hello World!</h1>
          <p>Bu bir örnek eklentidir.</p>
        </div>
      `
    }
  }
}
```

#### İnteraktif Eklenti

```javascript
module.exports = {
  activate(context) {
    return {
      menuItem: {
        label: 'Counter',
        action: 'open-counter-window'
      }
    }
  },

  openWindow() {
    return {
      title: 'Counter',
      width: 400,
      height: 300,
      content: `
        <div style="padding: 20px; color: white; text-align: center;">
          <h1>Counter</h1>
          <h2 id="count" style="font-size: 48px; margin: 20px 0;">0</h2>
          <button onclick="increment()" style="padding: 10px 20px; font-size: 18px; margin: 5px; cursor: pointer;">+</button>
          <button onclick="decrement()" style="padding: 10px 20px; font-size: 18px; margin: 5px; cursor: pointer;">-</button>
          <button onclick="reset()" style="padding: 10px 20px; font-size: 18px; margin: 5px; cursor: pointer;">Reset</button>
          
          <script>
            let count = 0;
            
            function increment() {
              count++;
              document.getElementById('count').textContent = count;
            }
            
            function decrement() {
              count--;
              document.getElementById('count').textContent = count;
            }
            
            function reset() {
              count = 0;
              document.getElementById('count').textContent = count;
            }
          </script>
        </div>
      `
    }
  }
}
```

## Eklenti Nasıl Yüklenir?

1. Eklenti klasörünü `plugins/` dizinine kopyalayın
2. IDE'yi yeniden başlatın
3. Eklenti otomatik olarak yüklenecek ve "Plugins" menüsünde görünecektir

## Eklenti Nasıl Kullanılır?

1. Top bar'da "Plugins" menüsüne tıklayın
2. Eklentinizin adına tıklayın
3. Yeni bir pencere açılacaktır

## Önemli Notlar

- Eklenti ID'si benzersiz olmalıdır
- HTML içeriği güvenli olmalıdır (XSS'e dikkat)
- Büyük eklentiler için harici CSS/JS dosyaları kullanabilirsiniz
- Eklenti hataları console'da görünür

## Gelecek Özellikler

- Eklenti API'si (dosya sistemi erişimi)
- Eklenti ayarları
- Eklenti marketplace
- Hot reload (yeniden başlatmadan güncelleme)

## Destek

Sorun yaşarsanız veya öneriniz varsa issue açın!
