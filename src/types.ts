export interface Card {
  id: string
  title: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Column {
  id: string
  title: string
  cards: Card[]
  createdAt?: string
  updatedAt?: string
}

export interface BoardData {
  id: string
  title: string
  columns: Column[]
  createdAt?: string
  updatedAt?: string
}

export interface DragItem {
  type: string
  id: string
  columnId: string
  index: number
}

export interface User {
  id: string
  name: string
  color: string
}

export type WebSocketEvent =
  | {
      type: "CARD_MOVED"
      payload: {
        cardId: string
        sourceColumnId: string
        destinationColumnId: string
        sourceIndex: number
        destinationIndex: number
      }
    }
  | { type: "CARD_UPDATED"; payload: { cardId: string; columnId: string; data: Partial<Card> } }
  | { type: "CARD_ADDED"; payload: { card: Card; columnId: string } }
  | { type: "CARD_REMOVED"; payload: { cardId: string; columnId: string } }
  | { type: "COLUMN_ADDED"; payload: { column: Column } }
  | { type: "COLUMN_UPDATED"; payload: { columnId: string; title: string } }
  | { type: "COLUMN_REMOVED"; payload: { columnId: string } }
  | { type: "USER_JOINED"; payload: { user: User } }
  | { type: "USER_LEFT"; payload: { user: User } }
