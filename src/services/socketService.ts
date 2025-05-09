import { io, type Socket } from "socket.io-client"
import type { WebSocketEvent } from "../types"

class SocketService {
  private socket: Socket | null = null
  private listeners: ((event: WebSocketEvent) => void)[] = []
  private connected = false
  private socketUrl = import.meta.env.VITE_SERVER_SOCKET_URL

  connect() {
    if (this.connected) return

    this.initializeSocket()
  }

  private initializeSocket() {
    try {
      this.socket = io(this.socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      this.socket.on("connect", () => {
        console.log("[Socket.IO] Connected")
        this.connected = true
      })

      this.socket.on("disconnect", (reason) => {
        console.log("[Socket.IO] Disconnected:", reason)
        this.connected = false
      })

      this.socket.on("connect_error", (error) => {
        console.error("[Socket.IO] Connection error:", error)
      })

      this.socket.on("board:update", (data: WebSocketEvent) => {
        console.log("[Socket.IO] Received board update:", data)
        this.notifyListeners(data)
      })

      this.socket.on("column:added", (data) => {
        this.notifyListeners({
          type: "COLUMN_ADDED",
          payload: data,
        })
      })

      this.socket.on("column:updated", (data) => {
        this.notifyListeners({
          type: "COLUMN_UPDATED",
          payload: data,
        })
      })

      this.socket.on("column:removed", (data) => {
        this.notifyListeners({
          type: "COLUMN_REMOVED",
          payload: data,
        })
      })

      this.socket.on("card:added", (data) => {
        this.notifyListeners({
          type: "CARD_ADDED",
          payload: data,
        })
      })

      this.socket.on("card:updated", (data) => {
        this.notifyListeners({
          type: "CARD_UPDATED",
          payload: data,
        })
      })

      this.socket.on("card:removed", (data) => {
        this.notifyListeners({
          type: "CARD_REMOVED",
          payload: data,
        })
      })

      this.socket.on("card:moved", (data) => {
        this.notifyListeners({
          type: "CARD_MOVED",
          payload: data,
        })
      })
    } catch (error) {
      console.error("[Socket.IO] Initialization error:", error)
    }
  }

  disconnect() {
    if (!this.connected || !this.socket) return

    try {
      this.socket.disconnect()
      this.connected = false
      console.log("[Socket.IO] Disconnected")
    } catch (error) {
      console.error("[Socket.IO] Error disconnecting:", error)
    }
  }

  subscribe(listener: (event: WebSocketEvent) => void) {
    this.listeners.push(listener)
    return () => this.unsubscribe(listener)
  }

  unsubscribe(listener: (event: WebSocketEvent) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  emit(event: WebSocketEvent) {
    if (!this.connected || !this.socket) {
      console.warn("[Socket.IO] Cannot emit event: not connected")
      return
    }

    try {
      switch (event.type) {
        case "CARD_MOVED":
          this.socket.emit("card:move", event.payload)
          break
        case "CARD_UPDATED":
          this.socket.emit("card:update", event.payload)
          break
        case "CARD_ADDED":
          this.socket.emit("card:add", event.payload)
          break
        case "CARD_REMOVED":
          this.socket.emit("card:remove", event.payload)
          break
        case "COLUMN_ADDED":
          this.socket.emit("column:add", event.payload)
          break
        case "COLUMN_UPDATED":
          this.socket.emit("column:update", event.payload)
          break
        case "COLUMN_REMOVED":
          this.socket.emit("column:remove", event.payload)
          break
        default:
          this.socket.emit("board:update", event)
      }

      console.log("[Socket.IO] Emitted event:", event)
    } catch (error) {
      console.error("[Socket.IO] Error emitting event:", error)
    }
  }

  private notifyListeners(event: WebSocketEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error("[Socket.IO] Error in listener:", error)
      }
    })
  }
}

export const socketService = new SocketService()
