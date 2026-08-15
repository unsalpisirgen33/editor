import {
  MinusIcon,
  Square2StackIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";

export default function FormControlsButtons(){

  const [maximized, setMaximized] = useState(true)

  async function check() {
    const state = await window.electron.ipcRenderer.invoke('isMaximized')
    setMaximized(state)
  }

  useEffect(() => {
    (async ()=>{
      await check()
    })()
    return()=>{
      window.electron.ipcRenderer.removeAllListeners('maximize')
      window.electron.ipcRenderer.removeAllListeners('isMaximized')
      window.electron.ipcRenderer.removeAllListeners('minimize')
      window.electron.ipcRenderer.removeAllListeners('close')
    }
  }, [])

  async function toggleMaximize() {
    window.electron.ipcRenderer.send('maximize')
    setTimeout(check, 100)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Minimize */}
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-[#444] transition-colors"
        onClick={() => window.electron.ipcRenderer.send('minimize')}
        title="Minimize"
      >
        <MinusIcon className="w-4 h-4" />
      </button>

      {/* Maximize/Restore */}
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-[#444] transition-colors"
        onClick={toggleMaximize}
        title={maximized ? "Restore" : "Maximize"}
      >
        {maximized ? (
          <Square2StackIcon className="w-4 h-4" />
        ) : (
          <StopIcon className="w-4 h-4" />
        )}
      </button>

      {/* Close */}
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors"
        onClick={() => window.electron.ipcRenderer.send('close')}
        title="Close"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
