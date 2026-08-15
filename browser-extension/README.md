# IDE Console Bridge - Chrome Extension

Bu extension, browser console mesajlarını IDE'ye gönderir.

## Kurulum

1. Chrome'u aç
2. `chrome://extensions/` adresine git
3. Sağ üstten "Developer mode" açık olduğundan emin ol
4. "Load unpacked" butonuna tıkla
5. Bu klasörü (`browser-extension`) seç
6. Extension yüklendi!

## Kullanım

1. IDE'yi aç (WebSocket server otomatik başlar - port 9999)
2. Browser'da herhangi bir siteyi aç
3. Extension otomatik bağlanır
4. Console mesajları IDE'nin Output panelinde görünür

## Özellikler

- ✅ console.log, console.warn, console.error yakalama
- ✅ Global error yakalama
- ✅ Unhandled promise rejection yakalama
- ✅ Stack trace bilgisi
- ✅ Otomatik yeniden bağlanma
- ✅ Kaynak dosya ve satır numarası

## Not

Extension sadece IDE açıkken çalışır. IDE kapalıysa 5 saniyede bir bağlanmayı dener.
