import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import type { BoardData, Card, Column, WebSocketEvent } from "../types"
import { socketService } from "../services/socketService"
import * as api from "../services/api"

type BoardAction =
  | {
    type: "SET_BOARD_DATA"
    payload: BoardData
  }
  | {
    type: "MOVE_CARD"
    payload: {
      cardId: string
      sourceColumnId: string
      destinationColumnId: string
      sourceIndex: number
      destinationIndex: number
    }
  }
  | { type: "UPDATE_CARD"; payload: { cardId: string; columnId: string; data: Partial<Card> } }
  | { type: "ADD_CARD"; payload: { card: Card; columnId: string } }
  | { type: "REMOVE_CARD"; payload: { cardId: string; columnId: string } }
  | { type: "ADD_COLUMN"; payload: { column: Column } }
  | { type: "UPDATE_COLUMN"; payload: { columnId: string; title: string } }
  | { type: "REMOVE_COLUMN"; payload: { columnId: string } }
  | { type: "RECEIVE_WEBSOCKET_EVENT"; payload: WebSocketEvent }

interface BoardContextType {
  boardData: BoardData | null
  loading: boolean
  error: string | null
  moveCard: (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) => Promise<void>
  updateCard: (cardId: string, columnId: string, data: Partial<Card>) => Promise<void>
  addCard: (card: Omit<Card, "id" | "createdAt" | "updatedAt">, columnId: string) => Promise<void>
  removeCard: (cardId: string, columnId: string) => Promise<void>
  addColumn: (column: Omit<Column, "id" | "cards" | "createdAt" | "updatedAt">) => Promise<void>
  updateColumn: (columnId: string, title: string) => Promise<void>
  removeColumn: (columnId: string) => Promise<void>
  refreshBoard: () => Promise<void>
}

const BoardContext = createContext<BoardContextType | undefined>(undefined)

function boardReducer(state: BoardData | null, action: BoardAction): BoardData | null {
  if (!state && action.type !== "SET_BOARD_DATA") {
    return null
  }

  switch (action.type) {
    case "SET_BOARD_DATA":
      return action.payload

    case "MOVE_CARD": {
      if (!state) return null

      const { cardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = action.payload

      const columns = state.columns.map((col) => ({
        ...col,
        cards: Array.isArray(col.cards) ? col.cards : [],
      }))

      if (sourceColumnId === destinationColumnId) {
        const column = columns.find((col) => col.id === sourceColumnId)
        if (!column) return state

        const newCards = [...column.cards]
        const [movedCard] = newCards.splice(sourceIndex, 1)

        if (movedCard.id !== cardId) {
          console.warn("Card ID mismatch.")
          return state
        }

        newCards.splice(destinationIndex, 0, movedCard)

        return {
          ...state,
          columns: columns.map((col) => (col.id === sourceColumnId ? { ...col, cards: newCards } : col)),
        }
      } else {
        const sourceColumn = columns.find((col) => col.id === sourceColumnId)
        const destinationColumn = columns.find((col) => col.id === destinationColumnId)
        if (!sourceColumn || !destinationColumn) return state

        const sourceCards = [...sourceColumn.cards]
        const [movedCard] = sourceCards.splice(sourceIndex, 1)

        if (movedCard.id !== cardId) {
          console.warn("Card ID mismatch.")
          return state
        }

        if (!movedCard) {
          console.warn("No card found to move. Check indexes.")
          return state
        }

        const destinationCards = [...destinationColumn.cards]
        destinationCards.splice(destinationIndex, 0, movedCard)

        return {
          ...state,
          columns: columns.map((col) => {
            if (col.id === sourceColumnId) return { ...col, cards: sourceCards }
            if (col.id === destinationColumnId) return { ...col, cards: destinationCards }
            return col
          }),
        }
      }
    }

    case "UPDATE_CARD": {
      if (!state) return null

      const { cardId, columnId, data } = action.payload

      const columns = state.columns.map((col) => ({
        ...col,
        cards: Array.isArray(col.cards) ? col.cards : [],
      }))

      return {
        ...state,
        columns: columns.map((col) =>
          col.id === columnId
            ? {
              ...col,
              cards: col.cards.map((card) => (card.id === cardId ? { ...card, ...data } : card)),
            }
            : col,
        ),
      }
    }

    case "ADD_CARD": {
      if (!state) return null

      const { card, columnId } = action.payload

      const columns = state.columns.map((col) => ({
        ...col,
        cards: Array.isArray(col.cards) ? col.cards : [],
      }))

      return {
        ...state,
        columns: columns.map((col) => (col.id === columnId ? { ...col, cards: [...col.cards, card] } : col)),
      }
    }

    case "REMOVE_CARD": {
      if (!state) return null

      const { cardId, columnId } = action.payload

      const columns = state.columns.map((col) => ({
        ...col,
        cards: Array.isArray(col.cards) ? col.cards : [],
      }))

      const column = columns.find((col) => col.id === columnId)
      if (!column) return state

      const updatedCards = column.cards.filter((card) => card.id !== cardId)

      return {
        ...state,
        columns: columns.map((col) => (col.id === columnId ? { ...col, cards: updatedCards } : col)),
      }
    }

    case "ADD_COLUMN": {
      if (!state) return null

      return {
        ...state,
        columns: [...state.columns, action.payload.column],
      }
    }

    case "UPDATE_COLUMN": {
      if (!state) return null

      const { columnId, title } = action.payload
      return {
        ...state,
        columns: state.columns.map((col) => (col.id === columnId ? { ...col, title } : col)),
      }
    }

    case "REMOVE_COLUMN": {
      if (!state) return null

      return {
        ...state,
        columns: state.columns.filter((col) => col.id !== action.payload.columnId),
      }
    }

    case "RECEIVE_WEBSOCKET_EVENT": {
      if (!state) return null

      const event = action.payload

      switch (event.type) {
        case "CARD_MOVED":
          return boardReducer(state, {
            type: "MOVE_CARD",
            payload: {
              cardId: event.payload.cardId,
              sourceColumnId: event.payload.sourceColumnId,
              destinationColumnId: event.payload.destinationColumnId,
              sourceIndex: event.payload.sourceIndex,
              destinationIndex: event.payload.destinationIndex,
            },
          })

        case "CARD_UPDATED":
          return boardReducer(state, {
            type: "UPDATE_CARD",
            payload: {
              cardId: event.payload.cardId,
              columnId: event.payload.columnId,
              data: event.payload.data,
            },
          })

        case "CARD_ADDED":
          return boardReducer(state, {
            type: "ADD_CARD",
            payload: {
              card: event.payload.card,
              columnId: event.payload.columnId,
            },
          })

        case "CARD_REMOVED":
          return boardReducer(state, {
            type: "REMOVE_CARD",
            payload: {
              cardId: event.payload.cardId,
              columnId: event.payload.columnId,
            },
          })

        case "COLUMN_ADDED":
          return boardReducer(state, {
            type: "ADD_COLUMN",
            payload: {
              column: event.payload.column,
            },
          })

        case "COLUMN_UPDATED":
          return boardReducer(state, {
            type: "UPDATE_COLUMN",
            payload: {
              columnId: event.payload.columnId,
              title: event.payload.title,
            },
          })

        case "COLUMN_REMOVED":
          return boardReducer(state, {
            type: "REMOVE_COLUMN",
            payload: {
              columnId: event.payload.columnId,
            },
          })

        default:
          return state
      }
    }

    default:
      return state
  }
}

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boardData, dispatch] = useReducer(boardReducer, null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const boards = await api.fetchBoards()

      if (boards && boards.length > 0) {
        const board = {
          ...boards[0],
          columns: boards[0].columns.map((column) => ({
            ...column,
            cards: Array.isArray(column.cards) ? column.cards : [],
          })),
        }

        dispatch({ type: "SET_BOARD_DATA", payload: board })
      } else {
        setError("No boards found")
      }
    } catch (err) {
      console.error("Error fetching board data:", err)
      setError(err instanceof Error ? err.message : "Failed to load board data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoardData()
  }, [])

  useEffect(() => {
    const handleSocketEvent = (event: WebSocketEvent) => {
      dispatch({ type: "RECEIVE_WEBSOCKET_EVENT", payload: event })
    }

    socketService.connect()

    const unsubscribe = socketService.subscribe(handleSocketEvent)

    return () => {
      unsubscribe()
      socketService.disconnect()
    }
  }, [])

  const moveCard = async (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    try {
      dispatch({
        type: "MOVE_CARD",
        payload: { cardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex },
      })

      await api.moveCard(cardId, sourceColumnId, destinationColumnId, sourceIndex)

      socketService.emit({
        type: "CARD_MOVED",
        payload: {
          cardId,
          sourceColumnId,
          destinationColumnId,
          sourceIndex,
          destinationIndex,
        },
      })
    } catch (err) {
      console.error("Error moving card:", err)
      fetchBoardData()
    }
  }

  const updateCard = async (cardId: string, columnId: string, data: Partial<Card>) => {
    try {
      dispatch({ type: "UPDATE_CARD", payload: { cardId, columnId, data } })

      await api.updateCard(cardId, data)

      socketService.emit({
        type: "CARD_UPDATED",
        payload: { cardId, columnId, data },
      })
    } catch (err) {
      console.error("Error updating card:", err)
      fetchBoardData()
    }
  }

  const addCard = async (cardData: Omit<Card, "id" | "createdAt" | "updatedAt">, columnId: string) => {
    try {
      const cardWithColumnId = {
        ...cardData,
        columnId,
      }

      const newCard = await api.createCard(cardWithColumnId)

      dispatch({ type: "ADD_CARD", payload: { card: newCard, columnId } })

      socketService.emit({
        type: "CARD_ADDED",
        payload: { card: newCard, columnId },
      })
    } catch (err) {
      console.error("Error adding card:", err)
    }
  }

  const removeCard = async (cardId: string, columnId: string) => {
    try {
      dispatch({ type: "REMOVE_CARD", payload: { cardId, columnId } })

      await api.deleteCard(cardId)

      socketService.emit({
        type: "CARD_REMOVED",
        payload: { cardId, columnId },
      })
    } catch (err) {
      console.error("Error removing card:", err)
      fetchBoardData()
    }
  }

  const addColumn = async (columnData: Omit<Column, "id" | "cards" | "createdAt" | "updatedAt">) => {
    try {
      if (!boardData) return

      const columnWithBoardId = {
        ...columnData,
        boardId: boardData.id,
      }

      const newColumn = await api.createColumn(columnWithBoardId)

      const columnWithCards = {
        ...newColumn,
        cards: [],
      }

      dispatch({ type: "ADD_COLUMN", payload: { column: columnWithCards } })

      socketService.emit({
        type: "COLUMN_ADDED",
        payload: { column: columnWithCards },
      })
    } catch (err) {
      console.error("Error adding column:", err)
    }
  }

  const updateColumn = async (columnId: string, title: string) => {
    try {
      dispatch({ type: "UPDATE_COLUMN", payload: { columnId, title } })

      await api.updateColumn(columnId, { title })

      socketService.emit({
        type: "COLUMN_UPDATED",
        payload: { columnId, title },
      })
    } catch (err) {
      console.error("Error updating column:", err)
      fetchBoardData()
    }
  }

  const removeColumn = async (columnId: string) => {
    try {
      dispatch({ type: "REMOVE_COLUMN", payload: { columnId } })

      await api.deleteColumn(columnId)

      socketService.emit({
        type: "COLUMN_REMOVED",
        payload: { columnId },
      })
    } catch (err) {
      console.error("Error removing column:", err)
      fetchBoardData()
    }
  }

  const refreshBoard = async () => {
    await fetchBoardData()
  }

  return (
    <BoardContext.Provider
      value={{
        boardData,
        loading,
        error,
        moveCard,
        updateCard,
        addCard,
        removeCard,
        addColumn,
        updateColumn,
        removeColumn,
        refreshBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}

export const useBoard = () => {
  const context = useContext(BoardContext)
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider")
  }
  return context
}
