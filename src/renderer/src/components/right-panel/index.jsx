import { useState } from 'react'

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState('empty1')

  return (
    <div className="bg-[#1e1e1e] flex h-full">
      {/* Panel İçeriği */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'empty1' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Empty Panel 1</p>
              <p className="text-[10px] text-gray-600 mt-2">Ready for new content</p>
            </div>
          </div>
        )}

        {activeTab === 'empty2' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Empty Panel 2</p>
              <p className="text-[10px] text-gray-600 mt-2">Ready for new content</p>
            </div>
          </div>
        )}
      </div>

      {/* Dikey Tab Butonları (Sağda) */}
      <div className="w-12 bg-[#252526] border-l border-[#333] flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => setActiveTab('empty1')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            activeTab === 'empty1' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'
          }`}
          title="Empty Panel 1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setActiveTab('empty2')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            activeTab === 'empty2' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'
          }`}
          title="Empty Panel 2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
