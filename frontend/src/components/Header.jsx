import { useLocation } from 'react-router-dom'
import { MenuIcon, UserIcon } from './icons'

const titles = {
  '/productos': 'Productos',
  '/pedidos': 'Mis pedidos',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Panel'

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-700 lg:hidden">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600">
        <UserIcon className="w-5 h-5" />
      </div>
    </header>
  )
}
