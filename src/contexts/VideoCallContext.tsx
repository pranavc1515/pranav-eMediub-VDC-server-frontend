import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import VideoService from '@/services/VideoService'

interface VideoCallContextType {
    isCallActive: boolean
    currentRoomName: string | null
    currentRoomSid: string | null
    initiateCall: (roomName: string) => Promise<void>
    acceptCall: (roomName: string) => void
    endCall: () => Promise<void>
    participants: Array<{ sid: string, identity: string }> 
    isLoading: boolean
    error: string | null
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined)

interface VideoCallProviderProps {
    children: ReactNode
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
    const [isCallActive, setIsCallActive] = useState(false)
    const [currentRoomName, setCurrentRoomName] = useState<string | null>(null)
    const [currentRoomSid, setCurrentRoomSid] = useState<string | null>(null)
    const [participants, setParticipants] = useState<Array<{ sid: string, identity: string }>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initialize a new call as the caller
    const initiateCall = useCallback(async (roomName: string) => {
        setIsLoading(true)
        setError(null)
        
        try {
            // Create a new room
            const response = await VideoService.createRoom({ roomName })
            
            setCurrentRoomName(roomName)
            setCurrentRoomSid(response.room.sid)
            setIsCallActive(true)
            
            // Fetch initial participants (should be empty at first)
            fetchParticipants(response.room.sid)
        } catch (error) {
            console.error('Error initiating call:', error)
            setError('Failed to initiate call. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Accept an incoming call as the receiver
    const acceptCall = useCallback((roomName: string) => {
        setCurrentRoomName(roomName)
        setIsCallActive(true)
    }, [])

    // Fetch participants in a room
    const fetchParticipants = async (roomSid: string) => {
        try {
            const response = await VideoService.listParticipants(roomSid)
            setParticipants(response.participants)
        } catch (error) {
            console.error('Error fetching participants:', error)
        }
    }

    // End the current call
    const endCall = useCallback(async () => {
        setIsLoading(true)
        
        try {
            // If we have a room SID, try to complete the room
            if (currentRoomSid) {
                await VideoService.completeRoom(currentRoomSid)
            }
        } catch (error) {
            console.error('Error ending call:', error)
        } finally {
            // Reset state regardless of API call success
            setIsCallActive(false)
            setCurrentRoomName(null)
            setCurrentRoomSid(null)
            setParticipants([])
            setIsLoading(false)
        }
    }, [currentRoomSid])

    const value = {
        isCallActive,
        currentRoomName,
        currentRoomSid,
        initiateCall,
        acceptCall,
        endCall,
        participants,
        isLoading,
        error
    }

    return (
        <VideoCallContext.Provider value={value}>
            {children}
        </VideoCallContext.Provider>
    )
}

export const useVideoCall = (): VideoCallContextType => {
    const context = useContext(VideoCallContext)
    if (context === undefined) {
        throw new Error('useVideoCall must be used within a VideoCallProvider')
    }
    return context
} 