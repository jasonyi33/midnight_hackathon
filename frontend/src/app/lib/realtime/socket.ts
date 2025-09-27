import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? (import.meta.env.VITE_API_BASE_URL as string | undefined)
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() === 'true'

let socket: Socket | null = null

export const getSocket = (token?: string | null) => {
  if (DEMO_MODE || !SOCKET_URL) {
    return null
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      autoConnect: true,
      reconnectionAttempts: 5,
    })
  } else if (token) {
    socket.auth = { token }
    if (!socket.connected) {
      socket.connect()
    }
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
