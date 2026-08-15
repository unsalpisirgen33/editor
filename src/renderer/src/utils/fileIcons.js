export const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const iconMap = {
    // JavaScript/TypeScript
    js: { color: 'text-yellow-400', label: 'JS' },
    jsx: { color: 'text-blue-400', label: 'JSX' },
    ts: { color: 'text-blue-500', label: 'TS' },
    tsx: { color: 'text-blue-500', label: 'TSX' },
    mjs: { color: 'text-yellow-400', label: 'MJS' },
    
    // Web
    html: { color: 'text-orange-500', label: 'HTML' },
    htm: { color: 'text-orange-500', label: 'HTM' },
    css: { color: 'text-blue-400', label: 'CSS' },
    scss: { color: 'text-pink-400', label: 'SCSS' },
    sass: { color: 'text-pink-400', label: 'SASS' },
    
    // Data
    json: { color: 'text-yellow-300', label: 'JSON' },
    xml: { color: 'text-orange-400', label: 'XML' },
    yaml: { color: 'text-purple-400', label: 'YAML' },
    yml: { color: 'text-purple-400', label: 'YML' },
    
    // Documents
    md: { color: 'text-gray-300', label: 'MD' },
    txt: { color: 'text-gray-400', label: 'TXT' },
    
    // Programming
    py: { color: 'text-blue-400', label: 'PY' },
    java: { color: 'text-red-500', label: 'JAVA' },
    c: { color: 'text-blue-600', label: 'C' },
    cpp: { color: 'text-blue-600', label: 'CPP' },
    go: { color: 'text-cyan-400', label: 'GO' },
    rs: { color: 'text-orange-600', label: 'RS' },
    php: { color: 'text-purple-500', label: 'PHP' },
    rb: { color: 'text-red-400', label: 'RB' },
    
    // Config
    gitignore: { color: 'text-gray-500', label: 'GIT' },
    env: { color: 'text-yellow-500', label: 'ENV' },
    
    // Default
    default: { color: 'text-gray-400', label: '📄' }
  }
  
  // Özel dosya isimleri
  if (fileName === '.gitignore') return iconMap.gitignore
  if (fileName.startsWith('.env')) return iconMap.env
  
  return iconMap[ext] || iconMap.default
}

export const getFolderColor = (folderName) => {
  const specialFolders = {
    'node_modules': 'text-green-600',
    'src': 'text-blue-400',
    'dist': 'text-orange-400',
    'build': 'text-orange-400',
    'public': 'text-purple-400',
    'assets': 'text-pink-400',
    'components': 'text-cyan-400',
    'utils': 'text-yellow-400',
    'lib': 'text-indigo-400',
    'test': 'text-green-400',
    'tests': 'text-green-400',
    '.git': 'text-red-500',
    '.vscode': 'text-blue-500',
    '.idea': 'text-purple-500'
  }
  
  return specialFolders[folderName] || 'text-blue-400'
}
