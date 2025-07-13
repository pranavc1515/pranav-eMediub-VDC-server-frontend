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

// Helper function to get user data from localStorage
const getUserDataFromStorage = () => {
    try {
        // Try to get sessionUser first (from Zustand store)
        const sessionUser = localStorage.getItem('sessionUser')
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser)
            if (parsed.state && parsed.state.user) {
                return parsed.state.user
            }
        }

        // Fallback to user_data or doctor_data
        const userData = localStorage.getItem('user_data') || localStorage.getItem('doctor_data')
        if (userData) {
            return JSON.parse(userData)
        }

        return null
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        return null
    }
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
        console.log('SocketContext - useEffect triggered with user:', user)

        // Get user data from multiple sources
        let userId = user?.userId
        let userAuthority = user?.authority

        // If not available from auth context, try localStorage
        if (!userId) {
            const storageUser = getUserDataFromStorage()
            console.log('SocketContext - Retrieved from localStorage:', storageUser)
            
            if (storageUser) {
                userId = storageUser.userId || storageUser.patientId || storageUser.id
                userAuthority = storageUser.authority || ['user']
            }
        }

        if (!userId) {
            console.log('SocketContext - No valid user ID found:', {
                user,
                userId,
                storageUser: getUserDataFromStorage()
            })
            return
        }

        // Ensure userId is a number (backend expects Number)
        const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId
        if (isNaN(numericUserId)) {
            console.error('SocketContext - Invalid user ID:', userId)
            return
        }

        // Determine if user is a doctor
        const isDoctor = userAuthority?.includes('doctor') || false
        console.log(
            'SocketContext - Connecting socket:',
            'Type:', isDoctor ? 'doctor' : 'patient',
            'UserID:', numericUserId,
            'Authority:', userAuthority
        )

        // Initialize socket with appropriate user type
        const newSocket = io(API_URL, {
            query: {
                userType: isDoctor ? 'doctor' : 'patient',
                userId: numericUserId.toString(), // Send as string but ensure it's a valid number
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
            console.log('Socket connected successfully:', {
                socketId: newSocket.id,
                userType: isDoctor ? 'doctor' : 'patient',
                userId: numericUserId
            })
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            // Don't automatically reconnect on client-initiated disconnects
            if (reason === 'io client disconnect') {
                console.log('Client initiated disconnect, not auto-reconnecting')
                return
            }
            // For other disconnect reasons, the socket will auto-reconnect due to reconnection settings
        })

        // Add debug event listeners
        newSocket.on('ERROR', (error) => {
            console.error('Socket received ERROR event:', error)
        })

        // Store socket in state
        setSocket(newSocket)

        // Cleanup on unmount
        return () => {
            console.log('SocketContext - Cleaning up socket connection')
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
