import logo from '../../assets/img/logo.svg'
import FormControlsButtons from "./form-controls-buttons"
import TopBarUserControls from "./top-bar-user-controls"
import TopBarSearch from "./top-bar-search"
import TopBarRunControls from "./top-bar-run-controls"
import TopMenuBar from "./top-menu-bar"
import CreateProjectModal from "../create-project-modal"
import { useState } from 'react'

export function TopBar() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const handleOpenFile = async () => {
    const file = await window.api.openFile()
    if (file && window.openFileInEditor) {
      window.openFileInEditor(file.path, file.name, file.content, file.language)
    }
  }

  const handleNewFile = () => {
    if (window.openFileInEditor) {
      window.openFileInEditor(
        `untitled-${Date.now()}`,
        'Untitled',
        '',
        'javascript'
      )
    }
  }

  const handleOpenFolder = async () => {
    const result = await window.api.openFolder()
    if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
      const folderPath = result.filePaths[0]
      if (window.openFolderInExplorer) {
        window.openFolderInExplorer(folderPath)
      }
    }
  }

  return (
    <>
      <div 
        className="h-10 bg-[#2d2d2d] border-b border-[#333] flex items-center justify-between px-2" 
        style={{WebkitAppRegion: "drag"}}
      >
        
        {/* Left Side - Logo & Menu Bar */}
        <div className="flex items-center gap-1" style={{WebkitAppRegion: "no-drag"}}>
          <img
            src={logo}
            className="w-7 h-7 mr-1"
            alt="Sweet IDE"
          />

          {/* Menu Bar */}
          <TopMenuBar 
            onOpenFile={handleOpenFile}
            onNewFile={handleNewFile}
            onOpenFolder={handleOpenFolder}
            onCreateProject={() => setShowCreateProject(true)}
          />
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-3" style={{WebkitAppRegion: "no-drag"}}>
          <TopBarRunControls />
          <TopBarSearch />
          <TopBarUserControls />
          
          {/* Divider */}
          <div className="w-px h-6 bg-[#444]" />
          
          <FormControlsButtons />
        </div>
        
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
    </>
  )
}
