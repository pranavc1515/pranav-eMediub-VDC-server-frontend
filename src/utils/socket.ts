import { io, Socket } from 'socket.io-client'

// Get API URL from environment or use the backend URL
const SOCKET_URL = 'http://localhost:3000'

let socket: Socket | null = null

export const initializeSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        })

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id)
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })
    }

    return socket
}

export const getSocket = (): Socket | null => {
    return socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
}
