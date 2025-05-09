import type React from "react"
import type { User } from "../types"

interface HeaderProps {
  currentUser: User
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  return (
    <header className="bg-emerald-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentUser.name}</span>
          <div
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
