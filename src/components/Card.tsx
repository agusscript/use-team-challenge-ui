import type React from "react"
import { useState, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { Card as CardType } from "../types"
import { useBoard } from "../context/BoardContext"
import { MoreHorizontal, X, Check, Trash2, Edit2 } from "lucide-react"
import CardDetail from "./CardDetail"

interface CardProps {
  card: CardType
  columnId: string
  index: number
}

const Card: React.FC<CardProps> = ({ card, columnId, index }) => {
  const { moveCard, updateCard, removeCard } = useBoard()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(card.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { id: card.id, columnId, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "CARD",
    hover(item: { id: string; columnId: string; index: number }) {
      if (item.id === card.id) {
        return
      }

      if (item.columnId === columnId) {
        moveCard(item.id, item.columnId, columnId, item.index, index)
        item.index = index
      }
    },
  })

  const handleUpdateTitle = async () => {
    if (editedTitle.trim() && editedTitle !== card.title) {
      await updateCard(card.id, columnId, { title: editedTitle })
    } else {
      setEditedTitle(card.title)
    }
    setIsEditing(false)
  }

  const handleDeleteCard = async () => {
    await removeCard(card.id, columnId)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const dragRef = useRef<HTMLDivElement>(null);

  const handleRef = (node: HTMLDivElement | null) => {
    if (node) {
      dragRef.current = node;
      drag(drop(node));
    }
  };

  return (
    <>
      <div
        ref={handleRef}
        className={`bg-white rounded shadow p-3 cursor-pointer ${isDragging ? "opacity-50" : ""}`}
        onClick={() => !isEditing && setShowDetail(true)}
      >
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <textarea
              className="w-full border rounded p-2 text-sm"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateTitle()
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(false)
                  setEditedTitle(card.title)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <p className="text-sm">{card.title}</p>
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 w-36"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteCard()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 text-red-600 text-sm flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {card.description && !isEditing && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{card.description}</p>
        )}

        {!isEditing && <div className="mt-2 text-xs text-gray-400">{formatDate(card.updatedAt)}</div>}
      </div>

      {showDetail && <CardDetail card={card} columnId={columnId} onClose={() => setShowDetail(false)} />}
    </>
  )
}

export default Card
