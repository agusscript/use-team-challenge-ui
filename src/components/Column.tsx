import type React from "react"
import { useState, useRef } from "react"
import { useDrop } from "react-dnd"
import Card from "./Card"
import type { Column as ColumnType, Card as CardType } from "../types"
import { useBoard } from "../context/BoardContext"
import { MoreHorizontal, Plus, X, Check, Trash2 } from "lucide-react"

interface ColumnProps {
  column: ColumnType
}

const Column: React.FC<ColumnProps> = ({ column }) => {
  const { moveCard, addCard, updateColumn, removeColumn } = useBoard()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item: { id: string; columnId: string; index: number }) => {
      if (item.columnId !== column.id) {
        const sourceColumnId = item.columnId
        const sourceIndex = item.index
        const destinationColumnId = column.id
        const destinationIndex = column.cards?.length || 0

        moveCard(item.id, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      const newCard: Omit<CardType, "id" | "createdAt" | "updatedAt"> = {
        title: newCardTitle,
        description: "",
      }

      await addCard(newCard, column.id)
      setNewCardTitle("")
      setIsAddingCard(false)
    }
  }

  const handleUpdateTitle = async () => {
    if (editedTitle.trim() && editedTitle !== column.title) {
      await updateColumn(column.id, editedTitle)
    } else {
      setEditedTitle(column.title)
    }
    setIsEditingTitle(false)
  }

  const handleDeleteColumn = async () => {
    if (confirm("Are you sure you want to delete this column and all its cards?")) {
      await removeColumn(column.id)
    }
  }

  const cards = Array.isArray(column.cards) ? column.cards : []

  const dropTarget = drop(
    <div
      className={`bg-gray-100 rounded-lg shadow-md p-3 min-w-[280px] max-w-[280px] flex flex-col h-fit max-h-full ${isOver ? "bg-gray-200" : ""
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-1 w-full">
            <input
              type="text"
              className="border rounded p-1 flex-1"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
            />
            <button onClick={handleUpdateTitle} className="text-gray-600 hover:text-gray-900">
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setIsEditingTitle(false)
                setEditedTitle(column.title)
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-700">{column.title}</h3>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 w-40"
                >
                  <button
                    onClick={() => {
                      setIsEditingTitle(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Edit title
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteColumn()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete column
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="overflow-y-auto flex-1 space-y-2 mb-2">
        {cards.map((card, index) => (
          <Card key={card.id} card={card} columnId={column.id} index={index} />
        ))}
      </div>

      {isAddingCard ? (
        <div className="mt-2">
          <textarea
            className="w-full border rounded p-2 mb-2 text-sm"
            placeholder="Enter card title..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button className="bg-emerald-500 text-white px-3 py-1 rounded text-sm" onClick={handleAddCard}>
              Add
            </button>
            <button className="border px-3 py-1 rounded text-sm" onClick={() => setIsAddingCard(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm mt-2"
        >
          <Plus size={16} />
          <span>Add a card</span>
        </button>
      )}
    </div>
  );

  return dropTarget;
}

export default Column
