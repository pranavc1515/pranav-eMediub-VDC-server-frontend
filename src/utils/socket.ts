// This file is now deprecated as we're using the SocketContext
// You can safely remove this file and use the SocketContext instead

// For reference, import the socket context like this:
// import { useSocketContext } from '@/contexts/SocketContext'

import { io, Socket } from 'socket.io-client'
import { ENV } from '@/configs/environment'

// Get API URL from environment or use the backend URL
const SOCKET_URL = ENV.BACKEND_URL

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
