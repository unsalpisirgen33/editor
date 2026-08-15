// Emmet paketi ile abbreviation expansion
let expand = null

// Emmet'i dinamik import et
async function loadEmmet() {
  if (!expand) {
    const emmetModule = await import('emmet')
    expand = emmetModule.default
  }
  return expand
}

export async function expandEmmet(abbreviation) {
  try {
    const expandFn = await loadEmmet()
    
    // Emmet'in default export'unu kullan
    let result = expandFn(abbreviation, {
      options: {
        'output.field': (index, placeholder) => `\${${index}}`,
        'output.selfClosingStyle': 'html'
      }
    })
    
    return result || null
  } catch (error) {
    return null
  }
}

// Emmet pattern'i tanıma
export async function isEmmetAbbreviation(text) {
  if (!text || text.length === 0) return false
  
  try {
    const expandFn = await loadEmmet()
    // Emmet'i dene, hata vermezse geçerli
    const result = expandFn(text)
    return result && result.length > 0
  } catch (error) {
    return false
  }
}
