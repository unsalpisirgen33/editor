import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function TopBarUserControls() {
  return(
    <button
      className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
      title="User"
    >
      <UserCircleIcon className="w-5 h-5 text-gray-400" />
    </button>
  )
}
