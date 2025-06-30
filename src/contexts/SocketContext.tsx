import { createContext, useState, useEffect, useContext } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/auth'
import { ENV } from '@/configs/environment'

// Define the context type
interface SocketContextType {
    socket: Socket | null
}

// Create the context
const SocketContext = createContext<SocketContextType | undefined>(undefined)

// API URL - should match your configuration
const API_URL = ENV.BACKEND_URL

// Custom hook to use socket context
export const useSocketContext = () => {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error(
            'useSocketContext must be used within a SocketContextProvider',
        )
    }
    return context
}

// Props type for the provider
interface SocketContextProviderProps {
    children: React.ReactNode
}

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({
    children,
}) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const { user } = useAuth()

    useEffect(() => {
        // Get user ID - the authStore should have already mapped it to userId
        const userId = user?.userId
        if (!userId) {
            console.log('SocketContext - No valid user ID found:', {
                user,
                userId,
            })
            return
        }

        // Determine if user is a doctor
        const isDoctor = user.authority?.includes('doctor') || false
        console.log(
            'SocketContext - User type:',
            isDoctor ? 'doctor' : 'patient',
            'UserID:',
            userId,
        )

        // Initialize socket with appropriate user type
        const newSocket = io(API_URL, {
            query: {
                userType: isDoctor ? 'doctor' : 'patient',
                userId: userId,
            },
            transports: ['websocket', 'polling'],
            secure: true,
            rejectUnauthorized: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            withCredentials: true,
        })

        // Set up event listeners
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
        })

        // Store socket in state
        setSocket(newSocket)

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect()
            }
        }
    }, [user])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}
