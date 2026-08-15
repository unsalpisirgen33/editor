import { useState, useEffect } from 'react'
import { 
  FolderIcon, 
  FolderOpenIcon, 
  DocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { getFileIcon, getFolderColor } from '../../utils/fileIcons'

export default function LeftPanel() {
  const [rootPath, setRootPath] = useState(null)
  const [fileTree, setFileTree] = useState([])
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [selectedItem, setSelectedItem] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [newItemInput, setNewItemInput] = useState(null)
  const [showHidden, setShowHidden] = useState(false)
  const [activeTab, setActiveTab] = useState('explorer')

  const handleOpenFolder = async (folderPath = null) => {
    let path = folderPath
    if (!path) {
      const result = await window.api.openFolder()
      if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
        path = result.filePaths[0]
      }
    }
    if (path) {
      setRootPath(path)
      loadDirectory(path)
      
      // Global proje yolunu kaydet
      window.getCurrentProjectPath = () => path
      
      // Proje açıldığını bildir
      if (window.onProjectOpened) {
        window.onProjectOpened(path)
      }
    }
  }

  useEffect(() => {
    window.openFolderInExplorer = handleOpenFolder
    
    // Global refresh fonksiyonu
    window.refreshExplorer = () => {
      if (rootPath) {
        loadDirectory(rootPath)
      }
    }
    
    return () => {
      window.refreshExplorer = null
    }
  }, [rootPath])

  const loadDirectory = async (dirPath) => {
    let items = await window.api.readDirectory(dirPath)
    if (!showHidden) {
      items = items.filter(item => !item.name.startsWith('.'))
    }
    setFileTree(items)
  }

  const toggleFolder = async (item) => {
    const newExpanded = new Set(expandedFolders)
    if (expandedFolders.has(item.path)) {
      newExpanded.delete(item.path)
    } else {
      newExpanded.add(item.path)
      if (!item.children) {
        const children = await window.api.readDirectory(item.path)
        item.children = children
        setFileTree([...fileTree])
      }
    }
    setExpandedFolders(newExpanded)
  }

  const handleFileClick = async (item) => {
    if (item.isFile) {
      setSelectedItem(item.path)
      const content = await window.api.readFile(item.path)
      const ext = item.name.split('.').pop()
      const languageMap = {
        js: 'javascript', jsx: 'javascript', mjs: 'javascript',
        ts: 'typescript', tsx: 'typescript',
        json: 'json', html: 'html', htm: 'html',
        css: 'css', scss: 'scss', sass: 'sass',
        md: 'markdown', py: 'python', java: 'java',
        cpp: 'cpp', c: 'c', go: 'go', rs: 'rust',
        php: 'php', rb: 'ruby', xml: 'xml',
        yaml: 'yaml', yml: 'yaml', txt: 'plaintext'
      }
      if (window.openFileInEditor) {
        window.openFileInEditor(item.path, item.name, content, languageMap[ext] || 'plaintext')
      }
    } else {
      toggleFolder(item)
    }
  }

  const handleContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, item: item })
  }

  const handleCreateFile = async (parentPath) => {
    setNewItemInput({ type: 'file', parentPath })
    setContextMenu(null)
  }

  const handleCreateFolder = async (parentPath) => {
    setNewItemInput({ type: 'folder', parentPath })
    setContextMenu(null)
  }

  const handleConfirmNewItem = async (name) => {
    if (!name || !newItemInput) return
    const fullPath = `${newItemInput.parentPath}/${name}`
    if (newItemInput.type === 'file') {
      await window.api.createFile(fullPath)
    } else {
      await window.api.createFolder(fullPath)
    }
    loadDirectory(rootPath)
    setNewItemInput(null)
  }

  const handleRename = async (item) => {
    setRenaming({ path: item.path, name: item.name })
    setContextMenu(null)
  }

  const handleConfirmRename = async (newName) => {
    if (!newName || !renaming) return
    const dir = renaming.path.substring(0, renaming.path.lastIndexOf('/'))
    const newPath = `${dir}/${newName}`
    await window.api.renameFile(renaming.path, newPath)
    loadDirectory(rootPath)
    setRenaming(null)
  }

  const handleDelete = async (item) => {
    const confirm = window.confirm(`Delete ${item.name}?`)
    if (confirm) {
      await window.api.deleteFile(item.path)
      loadDirectory(rootPath)
    }
    setContextMenu(null)
  }

  useEffect(() => {
    if (rootPath) {
      loadDirectory(rootPath)
    }
  }, [showHidden])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center px-2 py-1.5 cursor-pointer rounded transition-colors ${
            selectedItem === item.path ? 'bg-[#094771]' : 'hover:bg-[#2a2d2e]'
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleFileClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {item.isDirectory && (
            <span className="mr-1.5 flex-shrink-0">
              {expandedFolders.has(item.path) ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              )}
            </span>
          )}
          {item.isDirectory ? (
            expandedFolders.has(item.path) ? (
              <FolderOpenIcon className={`w-[18px] h-[18px] mr-2.5 flex-shrink-0 ${getFolderColor(item.name)}`} />
            ) : (
              <FolderIcon className={`w-[18px] h-[18px] mr-2.5 flex-shrink-0 ${getFolderColor(item.name)}`} />
            )
          ) : (
            <span className={`text-xs mr-2.5 flex-shrink-0 ${getFileIcon(item.name).color}`}>
              {getFileIcon(item.name).label}
            </span>
          )}
          {renaming && renaming.path === item.path ? (
            <input
              type="text"
              defaultValue={renaming.name}
              autoFocus
              className="bg-[#3c3c3c] text-white px-2 py-1 outline-none text-sm flex-1 rounded"
              onBlur={(e) => handleConfirmRename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename(e.target.value)
                if (e.key === 'Escape') setRenaming(null)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm text-gray-300 truncate">{item.name}</span>
          )}
        </div>
        {item.isDirectory && expandedFolders.has(item.path) && item.children && (
          <div>
            {newItemInput && newItemInput.parentPath === item.path && (
              <div className="flex items-center px-2 py-1.5" style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}>
                {newItemInput.type === 'folder' ? (
                  <FolderIcon className="w-[18px] h-[18px] mr-2.5 text-blue-400" />
                ) : (
                  <DocumentIcon className="w-[18px] h-[18px] mr-2.5 text-gray-400" />
                )}
                <input
                  type="text"
                  autoFocus
                  placeholder={newItemInput.type === 'folder' ? 'Folder name' : 'File name'}
                  className="bg-[#3c3c3c] text-white px-2 py-1 outline-none text-sm flex-1 rounded"
                  onBlur={(e) => handleConfirmNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmNewItem(e.target.value)
                    if (e.key === 'Escape') setNewItemInput(null)
                  }}
                />
              </div>
            )}
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="bg-[#1e1e1e] flex h-full">
      {/* Dikey Tab Butonları */}
      <div className="w-12 bg-[#252526] border-r border-[#333] flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            activeTab === 'explorer' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'
          }`}
          title="Explorer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => setActiveTab('empty')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            activeTab === 'empty' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'
          }`}
          title="Empty Panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Panel İçeriği */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'explorer' && (
          <>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Explorer</span>
              {rootPath && (
                <div className="flex gap-1">
                  <button onClick={() => loadDirectory(rootPath)} className="p-1.5 hover:bg-[#2a2d2e] rounded transition-colors" title="Refresh">
                    <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleCreateFile(rootPath)} className="p-1.5 hover:bg-[#2a2d2e] rounded transition-colors" title="New File">
                    <DocumentIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleCreateFolder(rootPath)} className="p-1.5 hover:bg-[#2a2d2e] rounded transition-colors" title="New Folder">
                    <FolderIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {!rootPath ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-gray-500">No folder opened</p>
                  <p className="text-[10px] text-gray-600 mt-2">Use File → Open Folder from menu</p>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <div className="mb-2">
                    <div className="flex items-center px-2 py-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                      <FolderOpenIcon className="w-[18px] h-[18px] mr-2.5 text-blue-400" />
                      {rootPath.split(/[/\\]/).pop()}
                    </div>
                  </div>
                  {newItemInput && newItemInput.parentPath === rootPath && (
                    <div className="flex items-center px-2 py-1.5 ml-2">
                      {newItemInput.type === 'folder' ? (
                        <FolderIcon className="w-[18px] h-[18px] mr-2.5 text-blue-400" />
                      ) : (
                        <DocumentIcon className="w-[18px] h-[18px] mr-2.5 text-gray-400" />
                      )}
                      <input
                        type="text"
                        autoFocus
                        placeholder={newItemInput.type === 'folder' ? 'Folder name' : 'File name'}
                        className="bg-[#3c3c3c] text-white px-2 py-1 outline-none text-sm flex-1 rounded"
                        onBlur={(e) => handleConfirmNewItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmNewItem(e.target.value)
                          if (e.key === 'Escape') setNewItemInput(null)
                        }}
                      />
                    </div>
                  )}
                  {renderFileTree(fileTree)}
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'empty' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Empty Panel</p>
              <p className="text-[10px] text-gray-600 mt-2">Ready for new content</p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed bg-[#3c3c3c] border border-[#454545] rounded shadow-2xl py-1 z-50 min-w-[180px]" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.item.isDirectory && (
            <>
              <button onClick={() => handleCreateFile(contextMenu.item.path)} className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#094771] flex items-center gap-2 text-gray-200">
                <DocumentIcon className="w-3.5 h-3.5" />
                New File
              </button>
              <button onClick={() => handleCreateFolder(contextMenu.item.path)} className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#094771] flex items-center gap-2 text-gray-200">
                <FolderIcon className="w-3.5 h-3.5" />
                New Folder
              </button>
              <div className="border-t border-[#555] my-1" />
            </>
          )}
          <button onClick={() => handleRename(contextMenu.item)} className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#094771] flex items-center gap-2 text-gray-200">
            <PencilIcon className="w-3.5 h-3.5" />
            Rename
          </button>
          <button onClick={() => handleDelete(contextMenu.item)} className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#5a1d1d] flex items-center gap-2 text-red-400">
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
