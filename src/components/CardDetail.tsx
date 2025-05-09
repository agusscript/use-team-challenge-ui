import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Card as CardType } from "../types"
import { useBoard } from "../context/BoardContext"
import { X, AlignLeft } from "lucide-react"

interface CardDetailProps {
  card: CardType
  columnId: string
  onClose: () => void
}

const CardDetail: React.FC<CardDetailProps> = ({ card, columnId, onClose }) => {
  const { updateCard } = useBoard()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleTitleSave = async () => {
    if (title.trim() && title !== card.title) {
      await updateCard(card.id, columnId, { title })
    } else {
      setTitle(card.title)
    }
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = async () => {
    if (description !== card.description) {
      await updateCard(card.id, columnId, { description })
    }
    setIsEditingDescription(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            {isEditingTitle ? (
              <div className="flex-1">
                <textarea
                  className="w-full border rounded p-2 text-xl font-semibold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleTitleSave} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false)
                      setTitle(card.title)
                    }}
                    className="border px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h2
                className="text-xl font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h2>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-4">
              <X size={24} />
            </button>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            <p>Created: {formatDate(card.createdAt)}</p>
            <p>Updated: {formatDate(card.updatedAt)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <AlignLeft size={16} />
              Description
            </h3>

            {isEditingDescription ? (
              <div>
                <textarea
                  className="w-full border rounded p-3 text-sm min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleDescriptionSave}
                    className="bg-emerald-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingDescription(false)
                      setDescription(card.description || "")
                    }}
                    className="border px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                className={`p-3 rounded cursor-pointer ${
                  description ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-100 hover:bg-gray-200 text-gray-500 italic"
                }`}
              >
                {description || "Add a more detailed description..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetail
