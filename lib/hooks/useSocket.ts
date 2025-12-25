"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface SocketMessage {
  type: string
  data: any
  timestamp: string
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null)
  const listeners = useRef<Map<string, Function[]>>(new Map())

  const emit = useCallback((type: string, data: any) => {
    // Emit events (future Socket.io integration)
    console.log("[v0] Socket emit:", type, data)
  }, [])

  const on = useCallback((type: string, callback: Function) => {
    if (!listeners.current.has(type)) {
      listeners.current.set(type, [])
    }
    listeners.current.get(type)?.push(callback)

    return () => {
      const callbacks = listeners.current.get(type)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) callbacks.splice(index, 1)
      }
    }
  }, [])

  const off = useCallback((type: string, callback?: Function) => {
    if (!callback) {
      listeners.current.delete(type)
    } else {
      const callbacks = listeners.current.get(type)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) callbacks.splice(index, 1)
      }
    }
  }, [])

  useEffect(() => {
    setIsConnected(true)
    // Future: Connect to Socket.io server
    // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
    return () => {
      // Cleanup
    }
  }, [])

  return { isConnected, lastMessage, emit, on, off }
}
