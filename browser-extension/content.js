// IDE Console Bridge - Content Script
// IMMEDIATELY override console before anything else loads
(function() {
  'use strict';
  
  console.log('[IDE Bridge] Script started');
  
  // Sadece localhost'ta çalış
  if (!window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1')) {
    console.log('[IDE Bridge] Not localhost, exiting');
    return;
  }
  
  console.log('[IDE Bridge] Localhost detected, initializing...');
  
  let ws = null;
  let reconnectInterval = null;
  let isConnected = false;
  
  // WebSocket bağlantısı kur
  function connect() {
    console.log('[IDE Bridge] Attempting to connect...');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('[IDE Bridge] Already connected');
      return;
    }
    
    try {
      ws = new WebSocket('ws://localhost:9999');
      
      ws.onopen = () => {
        isConnected = true;
        console.log('[IDE Bridge] ✅ Connected to IDE');
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };
      
      ws.onclose = () => {
        isConnected = false;
        console.log('[IDE Bridge] ❌ Disconnected from IDE');
        ws = null;
        
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('[IDE Bridge] Reconnecting...');
            connect();
          }, 5000);
        }
      };
      
      ws.onerror = (error) => {
        isConnected = false;
        console.error('[IDE Bridge] WebSocket error:', error);
      };
      
    } catch (error) {
      isConnected = false;
      console.error('[IDE Bridge] Connection error:', error);
    }
  }
  
  // Mesaj gönder
  function sendToIDE(type, message, source) {
    if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const payload = {
        type: type,
        message: message,
        source: source,
        timestamp: new Date().toLocaleTimeString(),
        url: window.location.href
      };
      
      ws.send(JSON.stringify(payload));
    } catch (error) {
      // Silent fail
    }
  }
  
  // Stack trace al
  function getStackTrace() {
    try {
      const stack = new Error().stack;
      if (!stack) return '';
      
      const lines = stack.split('\n');
      
      // İlk anlamlı satırı bul (extension ve chrome-extension olmayan)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Extension ve internal kodları atla
        if (line.includes('chrome-extension://') || 
            line.includes('installHook.js') ||
            line.includes('content.js') ||
            line.includes('at Object.') ||
            line.includes('at console.')) {
          continue;
        }
        
        // Dosya yolu ve satır numarasını bul
        const match = line.match(/at\s+(?:(.+?)\s+)?\(?(.+?):(\d+):(\d+)\)?/);
        if (match) {
          const [, funcName, filePath, lineNum, colNum] = match;
          
          // Sadece localhost dosyalarını al
          if (filePath && filePath.includes('localhost')) {
            // URL'den dosya yolunu çıkar
            // http://localhost:5176/src/App.jsx -> src/App.jsx
            const urlMatch = filePath.match(/localhost:\d+\/(.+?)(?:\?|$)/);
            if (urlMatch) {
              return `${urlMatch[1]}:${lineNum}:${colNum}`;
            }
          }
        }
      }
      
      return '';
    } catch (e) {
      return '';
    }
  }
  
  // Console'u HEMEN override et - React DevTools yüklenmeden önce
  const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console)
  };
  
  let isSending = false;
  let lastMessage = '';
  let lastMessageTime = 0;
  
  // Error override
  Object.defineProperty(console, 'error', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function(...args) {
      originalConsole.error.apply(console, args);
      
      if (isSending || (args[0] && typeof args[0] === 'string' && args[0].includes('[IDE Bridge]'))) {
        return;
      }
      
      isSending = true;
      
      // ANSI kodlarını ve %s formatlarını temizle
      const cleanArgs = args.map(arg => {
        if (typeof arg === 'string') {
          return arg
            .replace(/\x1b\[[0-9;]*m/g, '') // ANSI renk kodları
            .replace(/%[csdifoxO]/g, '')     // Console format kodları
            .trim();
        }
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      }).filter(arg => arg !== ''); // Boş stringleri filtrele
      
      const message = cleanArgs.join(' ');
      
      // Boş mesaj gönderme
      if (!message) {
        isSending = false;
        return;
      }
      
      // Aynı mesajı 500ms içinde tekrar gönderme (duplicate prevention)
      const now = Date.now();
      if (message === lastMessage && (now - lastMessageTime) < 500) {
        isSending = false;
        return;
      }
      
      lastMessage = message;
      lastMessageTime = now;
      
      sendToIDE('error', message, getStackTrace());
      isSending = false;
    }
  });
  
  // Warning override
  Object.defineProperty(console, 'warn', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function(...args) {
      originalConsole.warn.apply(console, args);
      
      if (isSending || (args[0] && typeof args[0] === 'string' && args[0].includes('[IDE Bridge]'))) {
        return;
      }
      
      isSending = true;
      
      // ANSI kodlarını ve %s formatlarını temizle
      const cleanArgs = args.map(arg => {
        if (typeof arg === 'string') {
          return arg
            .replace(/\x1b\[[0-9;]*m/g, '') // ANSI renk kodları
            .replace(/%[csdifoxO]/g, '')     // Console format kodları
            .trim();
        }
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      }).filter(arg => arg !== ''); // Boş stringleri filtrele
      
      const message = cleanArgs.join(' ');
      
      // Boş mesaj gönderme
      if (!message) {
        isSending = false;
        return;
      }
      
      // Aynı mesajı 500ms içinde tekrar gönderme (duplicate prevention)
      const now = Date.now();
      if (message === lastMessage && (now - lastMessageTime) < 500) {
        isSending = false;
        return;
      }
      
      lastMessage = message;
      lastMessageTime = now;
      
      sendToIDE('warning', message, getStackTrace());
      isSending = false;
    }
  });
  
  // Global error handler
  window.addEventListener('error', (event) => {
    console.log('[IDE Bridge] Global error caught:', event.message);
    sendToIDE('error', 
      `${event.message}`,
      `${event.filename}:${event.lineno}:${event.colno}`
    );
  });
  
  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    console.log('[IDE Bridge] Unhandled rejection caught:', event.reason);
    sendToIDE('error', 
      `Unhandled Promise Rejection: ${event.reason}`,
      ''
    );
  });
  
  // Bağlantıyı başlat
  connect();
  
  console.log('[IDE Bridge] Extension loaded and ready');
  console.log('[IDE Bridge] Console override installed');
})();
