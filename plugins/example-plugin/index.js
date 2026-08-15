// Example Plugin
module.exports = {
  activate(context) {
    console.log('Example Plugin activated!')
    
    // Eklenti menü öğesi
    return {
      menuItem: {
        label: 'Example Plugin',
        action: 'open-example-window'
      }
    }
  },

  // Eklenti penceresi açıldığında çalışacak
  openWindow() {
    return {
      title: 'Example Plugin Window',
      width: 600,
      height: 400,
      content: `
        <div style="padding: 20px; color: white;">
          <h1>Example Plugin</h1>
          <p>Bu bir örnek eklenti penceresidir!</p>
          <button onclick="alert('Merhaba!')">Tıkla</button>
        </div>
      `
    }
  }
}
