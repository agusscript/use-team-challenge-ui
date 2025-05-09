import type { BoardData, Card, Column } from "../types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error: ${response.status}`)
  }

  const contentType = response.headers.get("Content-Type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }

  return {}
}

export const fetchBoards = async (): Promise<BoardData[]> => {
  const response = await fetch(`${API_BASE_URL}/board`)
  return handleResponse(response)
}

export const fetchBoard = async (boardId: string): Promise<BoardData> => {
  const response = await fetch(`${API_BASE_URL}/board/${boardId}`)
  return handleResponse(response)
}

export const fetchColumns = async (boardId: string): Promise<Column[]> => {
  const response = await fetch(`${API_BASE_URL}/column?boardId=${boardId}`)
  return handleResponse(response)
}

export const createColumn = async (
  column: Omit<Column, "id" | "cards" | "createdAt" | "updatedAt"> & { boardId: string },
): Promise<Column> => {
  const response = await fetch(`${API_BASE_URL}/column`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(column),
  })
  return handleResponse(response)
}

export const updateColumn = async (id: string, data: Partial<Column>): Promise<Column> => {
  const response = await fetch(`${API_BASE_URL}/column/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export const deleteColumn = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/column/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

export const fetchCards = async (columnId: string): Promise<Card[]> => {
  const response = await fetch(`${API_BASE_URL}/card?columnId=${columnId}`)
  return handleResponse(response)
}

export const createCard = async (
  card: Omit<Card, "id" | "createdAt" | "updatedAt"> & { columnId: string },
): Promise<Card> => {
  const response = await fetch(`${API_BASE_URL}/card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(card),
  })
  return handleResponse(response)
}

export const updateCard = async (cardId: string, data: Partial<Card>): Promise<Card> => {
  const response = await fetch(`${API_BASE_URL}/card/${cardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export const deleteCard = async (cardId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/card/${cardId}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

export const moveCard = async (
  cardId: string,
  sourceColumnId: string,
  destinationColumnId: string,
  sourcePosition: number,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/card/${cardId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceColumnId,
      destinationColumnId,
      sourcePosition,
    }),
  })
  return handleResponse(response)
}
