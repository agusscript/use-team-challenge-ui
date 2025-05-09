import Board from "./components/Board"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { BoardProvider } from "./context/BoardContext"

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <BoardProvider>
        <div className="flex flex-col h-screen bg-gray-100">
          <header className="bg-cyan-950 text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-xl font-bold">Use Team challenge - Collaborative Board</h1>
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              <main className="flex-1 overflow-auto p-4">
                <Board />
              </main>
            </div>
          </div>
        </div>
      </BoardProvider>
    </DndProvider>
  )
}

export default App
