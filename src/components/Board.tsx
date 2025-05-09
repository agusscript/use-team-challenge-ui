import { useState } from "react"
import Column from "./Column"
import { useBoard } from "../context/BoardContext"
import type { Column as ColumnType } from "../types"
import { Plus, RefreshCw } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"

const Board = () => {
  const { boardData, loading, error, addColumn, refreshBoard } = useBoard()
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      const newColumn: Omit<ColumnType, "id" | "cards" | "createdAt" | "updatedAt"> = {
        title: newColumnTitle,
      }

      await addColumn(newColumn)
      setNewColumnTitle("")
      setIsAddingColumn(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBoard()
    setIsRefreshing(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshBoard} />
  }

  if (!boardData) {
    return <ErrorMessage message="No board data available" onRetry={refreshBoard} />
  }

  const columns = Array.isArray(boardData.columns) ? boardData.columns : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{boardData.title}</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded border"
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}

        {isAddingColumn ? (
          <div className="bg-white rounded-lg shadow-md p-3 min-w-[280px] max-w-[280px] flex flex-col">
            <input
              type="text"
              className="border rounded p-2 mb-2"
              placeholder="Enter column title..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="bg-emerald-500 text-white px-3 py-1 rounded" onClick={handleAddColumn}>
                Add
              </button>
              <button className="border px-3 py-1 rounded" onClick={() => setIsAddingColumn(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="bg-white/80 hover:bg-white rounded-lg shadow-md p-3 min-w-[280px] max-w-[280px] h-fit flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Plus size={20} />
            <span>Add Column</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default Board
