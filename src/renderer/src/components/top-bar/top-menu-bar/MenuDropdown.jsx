import { useState } from "react"
import { ChevronRightIcon } from '@heroicons/react/24/solid'

export function TopMenuBarDropdown({items, onAction}){

  const [submenu,setSubmenu] = useState(null)

  const handleClick = (name, child) => {
    if (!child || typeof child === 'function') {
      // Leaf node - execute action and close menu
      if (typeof child === 'function') {
        child()
      }
      // Close the menu by resetting submenu
      setSubmenu(null)
    }
  }

  const hasSubmenu = (child) => {
    return child && typeof child === 'object' && !Array.isArray(child)
  }

  return(

    <div className="
      absolute
      top-full
      left-0
      mt-1
      bg-[#252526]
      border
      border-[#454545]
      min-w-[240px]
      z-50
      shadow-xl
      py-2
      rounded
    ">

      {Object.entries(items).map(([name,child])=>{
        // Separator
        if (child === 'separator') {
          return (
            <div key={name} className="h-px bg-[#454545] my-2 mx-3" />
          )
        }

        const isSubmenu = hasSubmenu(child)
        const isDisabled = child === null
        
        return (
          <div
            key={name}
            className={`
              relative
              mx-2 px-3 py-2.5
              ${isDisabled ? 'text-gray-500 cursor-default' : 'hover:bg-[#094771] cursor-pointer text-gray-200'}
              flex
              justify-between
              items-center
              text-sm
              transition-colors
              duration-100
              rounded
            `}
            onMouseEnter={() => !isDisabled && isSubmenu && setSubmenu(name)}
            onMouseLeave={() => setSubmenu(null)}
            onClick={() => !isDisabled && handleClick(name, child)}
          >

            <span>{name}</span>

            {isSubmenu && (
              <ChevronRightIcon className="w-4 h-4 ml-8 text-gray-400" />
            )}

            {isSubmenu && submenu===name && (
              <div className="absolute left-full top-0 ml-1">
                <TopMenuBarDropdown items={child} onAction={onAction}/>
              </div>
            )}

          </div>
        )
      })}

    </div>

  )

}
