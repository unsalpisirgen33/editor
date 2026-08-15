/**
 * Klavye Kısayolları (Keybindings)
 * 
 * @description
 * Bu dosya, IDE'deki tüm klavye kısayollarını yönetir.
 * Kullanıcılar bu kısayolları özelleştirebilir.
 * 
 * Kısayol Formatı:
 * - key: Tuş kombinasyonu (Ctrl+S, Cmd+P vb.)
 * - command: Çalıştırılacak komut
 * - when: Koşul (opsiyonel)
 * - description: Açıklama
 * 
 * @module keybindings
 */

/**
 * Varsayılan klavye kısayolları
 */
export const defaultKeybindings = {
  // Dosya İşlemleri
  'save': {
    key: 'Ctrl+S',
    mac: 'Cmd+S',
    command: 'editor.action.save',
    description: 'Dosyayı kaydet'
  },
  'saveAll': {
    key: 'Ctrl+K S',
    mac: 'Cmd+K S',
    command: 'editor.action.saveAll',
    description: 'Tüm dosyaları kaydet'
  },
  'closeFile': {
    key: 'Ctrl+W',
    mac: 'Cmd+W',
    command: 'editor.action.closeFile',
    description: 'Dosyayı kapat'
  },
  'closeAllFiles': {
    key: 'Ctrl+K W',
    mac: 'Cmd+K W',
    command: 'editor.action.closeAllFiles',
    description: 'Tüm dosyaları kapat'
  },
  'newFile': {
    key: 'Ctrl+N',
    mac: 'Cmd+N',
    command: 'editor.action.newFile',
    description: 'Yeni dosya'
  },
  'openFolder': {
    key: 'Ctrl+O',
    mac: 'Cmd+O',
    command: 'editor.action.openFolder',
    description: 'Klasör aç'
  },
  
  // Düzenleme İşlemleri
  'undo': {
    key: 'Ctrl+Z',
    mac: 'Cmd+Z',
    command: 'editor.action.undo',
    description: 'Geri al'
  },
  'redo': {
    key: 'Ctrl+Y',
    mac: 'Cmd+Shift+Z',
    description: 'Yinele'
  },
  'cut': {
    key: 'Ctrl+X',
    mac: 'Cmd+X',
    command: 'editor.action.cut',
    description: 'Kes'
  },
  'copy': {
    key: 'Ctrl+C',
    mac: 'Cmd+C',
    command: 'editor.action.copy',
    description: 'Kopyala'
  },
  'paste': {
    key: 'Ctrl+V',
    mac: 'Cmd+V',
    command: 'editor.action.paste',
    description: 'Yapıştır'
  },
  'selectAll': {
    key: 'Ctrl+A',
    mac: 'Cmd+A',
    command: 'editor.action.selectAll',
    description: 'Tümünü seç'
  },
  'find': {
    key: 'Ctrl+F',
    mac: 'Cmd+F',
    command: 'editor.action.find',
    description: 'Bul'
  },
  'replace': {
    key: 'Ctrl+H',
    mac: 'Cmd+H',
    command: 'editor.action.replace',
    description: 'Bul ve değiştir'
  },
  'findInFiles': {
    key: 'Ctrl+Shift+F',
    mac: 'Cmd+Shift+F',
    command: 'editor.action.findInFiles',
    description: 'Dosyalarda bul'
  },
  
  // IntelliSense ve Kod Yardımı
  'triggerSuggest': {
    key: 'Ctrl+Space',
    mac: 'Cmd+Space',
    command: 'editor.action.triggerSuggest',
    description: 'Öneri göster'
  },
  'triggerParameterHints': {
    key: 'Ctrl+Shift+Space',
    mac: 'Cmd+Shift+Space',
    command: 'editor.action.triggerParameterHints',
    description: 'Parametre ipuçlarını göster'
  },
  'showHover': {
    key: 'Ctrl+K Ctrl+I',
    mac: 'Cmd+K Cmd+I',
    command: 'editor.action.showHover',
    description: 'Hover bilgisini göster'
  },
  'goToDefinition': {
    key: 'F12',
    mac: 'F12',
    command: 'editor.action.revealDefinition',
    description: 'Tanıma git'
  },
  'peekDefinition': {
    key: 'Alt+F12',
    mac: 'Option+F12',
    command: 'editor.action.peekDefinition',
    description: 'Tanıma göz at'
  },
  'goToReferences': {
    key: 'Shift+F12',
    mac: 'Shift+F12',
    command: 'editor.action.goToReferences',
    description: 'Referanslara git'
  },
  'rename': {
    key: 'F2',
    mac: 'F2',
    command: 'editor.action.rename',
    description: 'Yeniden adlandır'
  },
  'formatDocument': {
    key: 'Shift+Alt+F',
    mac: 'Shift+Option+F',
    command: 'editor.action.formatDocument',
    description: 'Belgeyi formatla'
  },
  'formatSelection': {
    key: 'Ctrl+K Ctrl+F',
    mac: 'Cmd+K Cmd+F',
    command: 'editor.action.formatSelection',
    description: 'Seçimi formatla'
  },
  
  // Satır İşlemleri
  'copyLineDown': {
    key: 'Shift+Alt+Down',
    mac: 'Shift+Option+Down',
    command: 'editor.action.copyLinesDownAction',
    description: 'Satırı aşağı kopyala'
  },
  'copyLineUp': {
    key: 'Shift+Alt+Up',
    mac: 'Shift+Option+Up',
    command: 'editor.action.copyLinesUpAction',
    description: 'Satırı yukarı kopyala'
  },
  'moveLinesDown': {
    key: 'Alt+Down',
    mac: 'Option+Down',
    command: 'editor.action.moveLinesDownAction',
    description: 'Satırı aşağı taşı'
  },
  'moveLinesUp': {
    key: 'Alt+Up',
    mac: 'Option+Up',
    command: 'editor.action.moveLinesUpAction',
    description: 'Satırı yukarı taşı'
  },
  'deleteLine': {
    key: 'Ctrl+Shift+K',
    mac: 'Cmd+Shift+K',
    command: 'editor.action.deleteLines',
    description: 'Satırı sil'
  },
  'insertLineBelow': {
    key: 'Ctrl+Enter',
    mac: 'Cmd+Enter',
    command: 'editor.action.insertLineAfter',
    description: 'Aşağıya satır ekle'
  },
  'insertLineAbove': {
    key: 'Ctrl+Shift+Enter',
    mac: 'Cmd+Shift+Enter',
    command: 'editor.action.insertLineBefore',
    description: 'Yukarıya satır ekle'
  },
  'toggleComment': {
    key: 'Ctrl+/',
    mac: 'Cmd+/',
    command: 'editor.action.commentLine',
    description: 'Yorum satırı aç/kapat'
  },
  'toggleBlockComment': {
    key: 'Shift+Alt+A',
    mac: 'Shift+Option+A',
    command: 'editor.action.blockComment',
    description: 'Blok yorum aç/kapat'
  },
  
  // Gezinme
  'goToLine': {
    key: 'Ctrl+G',
    mac: 'Cmd+G',
    command: 'editor.action.gotoLine',
    description: 'Satıra git'
  },
  'quickOpen': {
    key: 'Ctrl+P',
    mac: 'Cmd+P',
    command: 'editor.action.quickOpen',
    description: 'Hızlı aç'
  },
  'commandPalette': {
    key: 'Ctrl+Shift+P',
    mac: 'Cmd+Shift+P',
    command: 'editor.action.showCommands',
    description: 'Komut paleti'
  },
  'nextTab': {
    key: 'Ctrl+Tab',
    mac: 'Cmd+Tab',
    command: 'editor.action.nextEditor',
    description: 'Sonraki sekme'
  },
  'previousTab': {
    key: 'Ctrl+Shift+Tab',
    mac: 'Cmd+Shift+Tab',
    command: 'editor.action.previousEditor',
    description: 'Önceki sekme'
  },
  
  // Panel İşlemleri
  'toggleLeftPanel': {
    key: 'Ctrl+B',
    mac: 'Cmd+B',
    command: 'view.toggleLeftPanel',
    description: 'Sol paneli aç/kapat'
  },
  'toggleRightPanel': {
    key: 'Ctrl+Alt+B',
    mac: 'Cmd+Option+B',
    command: 'view.toggleRightPanel',
    description: 'Sağ paneli aç/kapat'
  },
  'toggleTerminal': {
    key: 'Ctrl+`',
    mac: 'Cmd+`',
    command: 'view.toggleTerminal',
    description: 'Terminal aç/kapat'
  },
  
  // Zoom
  'zoomIn': {
    key: 'Ctrl+=',
    mac: 'Cmd+=',
    command: 'editor.action.zoomIn',
    description: 'Yakınlaştır'
  },
  'zoomOut': {
    key: 'Ctrl+-',
    mac: 'Cmd+-',
    command: 'editor.action.zoomOut',
    description: 'Uzaklaştır'
  },
  'zoomReset': {
    key: 'Ctrl+0',
    mac: 'Cmd+0',
    command: 'editor.action.zoomReset',
    description: 'Zoom sıfırla'
  }
}

/**
 * İşletim sistemine göre doğru tuşu döndürür
 * 
 * @param {Object} keybinding - Kısayol objesi
 * @returns {string} Tuş kombinasyonu
 */
export function getKeyForPlatform(keybinding) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac && keybinding.mac ? keybinding.mac : keybinding.key
}

/**
 * Tuş kombinasyonunu parse eder
 * 
 * @param {string} key - Tuş kombinasyonu (Ctrl+S, Cmd+P vb.)
 * @returns {Object} Parse edilmiş tuş bilgisi
 */
export function parseKeybinding(key) {
  const parts = key.split('+')
  return {
    ctrl: parts.includes('Ctrl'),
    cmd: parts.includes('Cmd'),
    shift: parts.includes('Shift'),
    alt: parts.includes('Alt'),
    option: parts.includes('Option'),
    key: parts[parts.length - 1]
  }
}

/**
 * Klavye olayını kontrol eder ve eşleşen komutu döndürür
 * 
 * @param {KeyboardEvent} event - Klavye olayı
 * @param {Object} keybindings - Kısayol listesi
 * @returns {string|null} Komut adı veya null
 */
export function matchKeybinding(event, keybindings = defaultKeybindings) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  for (const [commandName, binding] of Object.entries(keybindings)) {
    const keyString = getKeyForPlatform(binding)
    const parsed = parseKeybinding(keyString)
    
    const ctrlMatch = isMac ? 
      (parsed.cmd ? event.metaKey : !event.metaKey) :
      (parsed.ctrl ? event.ctrlKey : !event.ctrlKey)
    
    const shiftMatch = parsed.shift ? event.shiftKey : !event.shiftKey
    const altMatch = (parsed.alt || parsed.option) ? event.altKey : !event.altKey
    
    const keyMatch = event.key.toUpperCase() === parsed.key.toUpperCase() ||
                     event.code === parsed.key
    
    if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
      return binding.command
    }
  }
  
  return null
}

/**
 * Kullanıcı ayarlarından kısayolları yükler
 * 
 * @returns {Object} Varsayılan kısayollar
 */
export function loadUserKeybindings() {
  return defaultKeybindings
}

/**
 * Kullanıcı kısayollarını kaydeder (devre dışı)
 * 
 * @param {Object} keybindings - Kısayol listesi
 */
export function saveUserKeybindings(keybindings) {
  // localStorage kullanımı kaldırıldı
  console.log('Keybinding kaydetme devre dışı')
}

/**
 * Kısayolları varsayılana sıfırlar
 */
export function resetKeybindings() {
  return defaultKeybindings
}

/**
 * Tüm kısayolları kategorilere göre gruplar
 * 
 * @returns {Object} Kategorilere ayrılmış kısayollar
 */
export function getKeybindingsByCategory() {
  return {
    'Dosya İşlemleri': [
      'save', 'saveAll', 'closeFile', 'closeAllFiles', 'newFile', 'openFolder'
    ],
    'Düzenleme': [
      'undo', 'redo', 'cut', 'copy', 'paste', 'selectAll', 
      'find', 'replace', 'findInFiles'
    ],
    'IntelliSense': [
      'triggerSuggest', 'triggerParameterHints', 'showHover',
      'goToDefinition', 'peekDefinition', 'goToReferences', 'rename',
      'formatDocument', 'formatSelection'
    ],
    'Satır İşlemleri': [
      'copyLineDown', 'copyLineUp', 'moveLinesDown', 'moveLinesUp',
      'deleteLine', 'insertLineBelow', 'insertLineAbove',
      'toggleComment', 'toggleBlockComment'
    ],
    'Gezinme': [
      'goToLine', 'quickOpen', 'commandPalette', 'nextTab', 'previousTab'
    ],
    'Panel': [
      'toggleLeftPanel', 'toggleRightPanel', 'toggleTerminal'
    ],
    'Zoom': [
      'zoomIn', 'zoomOut', 'zoomReset'
    ]
  }
}
