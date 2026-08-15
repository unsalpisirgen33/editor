import { useState, useEffect, useRef } from 'react'
import {
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function GlobalSearch() {
  const [searchText, setSearchText] = useState('')
  const [searchPath, setSearchPath] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState(new Set())
  const searchInputRef = useRef(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const performSearch = async () => {
    if (!searchText.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    try {
      const searchResults = await window.api.searchInFiles({
        query: searchText,
        path: searchPath || null,
        caseSensitive,
        wholeWord,
        useRegex
      })
      
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performSearch()
    }
  }

  const toggleFileExpansion = (filePath) => {
    const newExpanded = new Set(expandedFiles)
    if (expandedFiles.has(filePath)) {
      newExpanded.delete(filePath)
    } else {
      newExpanded.add(filePath)
    }
    setExpandedFiles(newExpanded)
  }

  const openFileAtLine = async (filePath, lineNumber) => {
    try {
      const content = await window.api.readFile(filePath)
      const fileName = filePath.split(/[\\/]/).pop()
      const ext = fileName.split('.').pop()
      
      const languageMap = {
        js: 'javascript', jsx: 'javascript', mjs: 'javascript',
        ts: 'typescript', tsx: 'typescript',
        json: 'json',
        html: 'html', htm: 'html',
        css: 'css', scss: 'scss', sass: 'sass',
        md: 'markdown',
        py: 'python',
        java: 'java',
        cpp: 'cpp', c: 'c',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        xml: 'xml',
        yaml: 'yaml', yml: 'yaml',
        txt: 'plaintext'
      }

      if (window.openFileInEditor) {
        window.openFileInEditor(
          filePath,
          fileName,
          content,
          languageMap[ext] || 'plaintext'
        )
        
        // Satıra git (biraz bekle ki editör hazır olsun)
        setTimeout(() => {
          if (window.goToLine) {
            window.goToLine(lineNumber)
          }
        }, 200)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  const selectSearchPath = async () => {
    const result = await window.api.openFolder()
    if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
      setSearchPath(result.filePaths[0])
    }
  }

  const getTotalMatches = () => {
    return results.reduce((total, file) => total + file.matches.length, 0)
  }

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      {/* Search Header */}
      <div className="p-3 border-b border-[#333]">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center bg-[#3c3c3c] border border-[#555] rounded">
            <MagnifyingGlassIcon className="w-4 h-4 mx-2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search in files..."
              className="flex-1 bg-transparent text-white px-2 py-2 outline-none text-sm"
            />
          </div>
        </div>

        {/* Search Path */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center bg-[#3c3c3c] border border-[#555] rounded">
            <FolderIcon className="w-4 h-4 mx-2 text-gray-400" />
            <input
              type="text"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              placeholder="Search path (optional)"
              className="flex-1 bg-transparent text-white px-2 py-1 outline-none text-sm"
            />
          </div>
          <button
            onClick={selectSearchPath}
            className="px-3 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded"
          >
            Browse
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`px-2 py-1 text-xs rounded ${caseSensitive ? 'bg-blue-600' : 'bg-[#3c3c3c] hover:bg-[#4c4c4c]'}`}
            title="Match Case"
          >
            Aa
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`px-2 py-1 text-xs rounded ${wholeWord ? 'bg-blue-600' : 'bg-[#3c3c3c] hover:bg-[#4c4c4c]'}`}
            title="Match Whole Word"
          >
            Ab
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`px-2 py-1 text-xs rounded ${useRegex ? 'bg-blue-600' : 'bg-[#3c3c3c] hover:bg-[#4c4c4c]'}`}
            title="Use Regular Expression"
          >
            .*
          </button>
          <button
            onClick={performSearch}
            disabled={!searchText.trim() || isSearching}
            className="ml-auto px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-30"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            {getTotalMatches()} results in {results.length} files
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-2">
        {results.length === 0 && searchText && !isSearching && (
          <div className="text-center text-gray-500 mt-8">
            No results found
          </div>
        )}

        {results.map((file) => (
          <div key={file.path} className="mb-2">
            {/* File Header */}
            <div
              onClick={() => toggleFileExpansion(file.path)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded"
            >
              <DocumentIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-gray-500">{file.matches.length}</span>
            </div>

            {/* Matches */}
            {expandedFiles.has(file.path) && (
              <div className="ml-6 mt-1">
                {file.matches.map((match, index) => (
                  <div
                    key={index}
                    onClick={() => openFileAtLine(file.path, match.line)}
                    className="px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded text-xs"
                  >
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="w-8 text-right">{match.line}</span>
                      <span className="flex-1 font-mono text-gray-300">
                        {match.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
