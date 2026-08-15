import { useState, useEffect, useRef } from 'react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function SearchPanel({ editor, onClose }) {
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [matches, setMatches] = useState([])
  const [currentMatch, setCurrentMatch] = useState(0)
  const searchInputRef = useRef(null)

  useEffect(() => {
    // Panel açıldığında input'a focus
    searchInputRef.current?.focus()
    
    // Seçili metin varsa otomatik doldur
    if (editor) {
      const selection = editor.getSelection()
      const selectedText = editor.getModel()?.getValueInRange(selection)
      if (selectedText && !selectedText.includes('\n')) {
        setSearchText(selectedText)
      }
    }
  }, [editor])

  useEffect(() => {
    if (searchText && editor) {
      performSearch()
    } else {
      clearMatches()
    }
  }, [searchText, caseSensitive, wholeWord, useRegex, editor])

  const performSearch = () => {
    if (!editor || !searchText) return

    const model = editor.getModel()
    if (!model) return

    try {
      const searchOptions = {
        matchCase: caseSensitive,
        wholeWord: wholeWord,
        isRegex: useRegex
      }

      const foundMatches = model.findMatches(
        searchText,
        true, // searchOnlyEditableRange
        useRegex,
        caseSensitive,
        wholeWord ? '\\b' : null,
        true // captureMatches
      )

      setMatches(foundMatches)
      if (foundMatches.length > 0) {
        setCurrentMatch(0)
        highlightMatch(foundMatches[0])
      }
    } catch (error) {
      console.error('Search error:', error)
      setMatches([])
    }
  }

  const highlightMatch = (match) => {
    if (!editor || !match) return

    editor.setSelection(match.range)
    editor.revealRangeInCenter(match.range)
  }

  const clearMatches = () => {
    setMatches([])
    setCurrentMatch(0)
  }

  const goToNextMatch = () => {
    if (matches.length === 0) return
    const nextIndex = (currentMatch + 1) % matches.length
    setCurrentMatch(nextIndex)
    highlightMatch(matches[nextIndex])
  }

  const goToPreviousMatch = () => {
    if (matches.length === 0) return
    const prevIndex = currentMatch === 0 ? matches.length - 1 : currentMatch - 1
    setCurrentMatch(prevIndex)
    highlightMatch(matches[prevIndex])
  }

  const replaceCurrentMatch = () => {
    if (!editor || matches.length === 0) return

    const match = matches[currentMatch]
    const model = editor.getModel()
    if (!model) return

    model.pushEditOperations(
      [],
      [{
        range: match.range,
        text: replaceText
      }],
      () => null
    )

    // Arama sonuçlarını güncelle
    setTimeout(() => performSearch(), 100)
  }

  const replaceAllMatches = () => {
    if (!editor || matches.length === 0) return

    const model = editor.getModel()
    if (!model) return

    const edits = matches.map(match => ({
      range: match.range,
      text: replaceText
    }))

    model.pushEditOperations([], edits, () => null)

    // Arama sonuçlarını temizle
    setTimeout(() => {
      setSearchText('')
      clearMatches()
    }, 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        goToPreviousMatch()
      } else {
        goToNextMatch()
      }
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <div className="bg-[#252526] border-b border-[#333] p-2">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-[#3c3c3c] border border-[#555] rounded">
          <MagnifyingGlassIcon className="w-4 h-4 mx-2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find"
            className="flex-1 bg-transparent text-white px-2 py-1 outline-none text-sm"
          />
          {matches.length > 0 && (
            <span className="text-xs text-gray-400 mr-2">
              {currentMatch + 1} of {matches.length}
            </span>
          )}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPreviousMatch}
          disabled={matches.length === 0}
          className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-30"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUpIcon className="w-4 h-4" />
        </button>
        <button
          onClick={goToNextMatch}
          disabled={matches.length === 0}
          className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-30"
          title="Next Match (Enter)"
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {/* Options */}
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`px-2 py-1 text-xs rounded ${caseSensitive ? 'bg-blue-600' : 'hover:bg-[#2a2d2e]'}`}
          title="Match Case"
        >
          Aa
        </button>
        <button
          onClick={() => setWholeWord(!wholeWord)}
          className={`px-2 py-1 text-xs rounded ${wholeWord ? 'bg-blue-600' : 'hover:bg-[#2a2d2e]'}`}
          title="Match Whole Word"
        >
          Ab
        </button>
        <button
          onClick={() => setUseRegex(!useRegex)}
          className={`px-2 py-1 text-xs rounded ${useRegex ? 'bg-blue-600' : 'hover:bg-[#2a2d2e]'}`}
          title="Use Regular Expression"
        >
          .*
        </button>

        {/* Replace Toggle */}
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 hover:bg-[#2a2d2e] rounded ${showReplace ? 'text-blue-400' : ''}`}
          title="Toggle Replace"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2a2d2e] rounded"
          title="Close (Esc)"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Replace Input */}
      {showReplace && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 flex items-center bg-[#3c3c3c] border border-[#555] rounded">
            <DocumentTextIcon className="w-4 h-4 mx-2 text-gray-400" />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace"
              className="flex-1 bg-transparent text-white px-2 py-1 outline-none text-sm"
            />
          </div>

          <button
            onClick={replaceCurrentMatch}
            disabled={matches.length === 0}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-30"
            title="Replace"
          >
            Replace
          </button>
          <button
            onClick={replaceAllMatches}
            disabled={matches.length === 0}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-30"
            title="Replace All"
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  )
}
