import { useState, useCallback } from 'react'
import VideoService from '@/services/VideoService'

interface Participant {
    sid: string
    identity: string
    status: string
    dateCreated: string
    dateUpdated: string
}

interface Room {
    sid: string
    uniqueName: string
    status: string
    dateCreated?: string
    dateUpdated?: string
}

interface UseVideoReturn {
    participants: Participant[]
    participantCount: number
    room: Room | null
    loading: boolean
    error: string | null
    generateToken: (identity: string, roomName: string) => Promise<string | null>
    createRoom: (roomName: string) => Promise<Room | null>
    getRoom: (roomSid: string) => Promise<Room | null>
    listParticipants: (roomSid: string) => Promise<void>
    disconnectParticipant: (roomSid: string, participantSid: string) => Promise<boolean>
    completeRoom: (roomSid: string) => Promise<boolean>
    refreshParticipants: (roomSid: string) => Promise<void>
}

const useVideo = (): UseVideoReturn => {
    const [participants, setParticipants] = useState<Participant[]>([])
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateToken = useCallback(async (identity: string, roomName: string): Promise<string | null> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.generateToken({ identity, roomName })
            if (response.success) {
                return response.token
            } else {
                setError('Failed to generate token')
                return null
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate token'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const createRoom = useCallback(async (roomName: string): Promise<Room | null> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.createRoom({ roomName })
            if (response.success) {
                setRoom(response.room)
                return response.room
            } else {
                setError('Failed to create room')
                return null
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create room'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const getRoom = useCallback(async (roomSid: string): Promise<Room | null> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.getRoom(roomSid)
            if (response.success) {
                setRoom(response.room)
                return response.room
            } else {
                setError('Failed to get room details')
                return null
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get room details'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const listParticipants = useCallback(async (roomSid: string): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.listParticipants(roomSid)
            if (response.success) {
                setParticipants(response.participants)
            } else {
                setError('Failed to list participants')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to list participants'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshParticipants = useCallback(async (roomSid: string): Promise<void> => {
        await listParticipants(roomSid)
    }, [listParticipants])

    const disconnectParticipant = useCallback(async (roomSid: string, participantSid: string): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.disconnectParticipant(roomSid, participantSid)
            if (response.success) {
                // Refresh participants list
                await refreshParticipants(roomSid)
                return true
            } else {
                setError('Failed to disconnect participant')
                return false
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect participant'
            setError(errorMessage)
            return false
        } finally {
            setLoading(false)
        }
    }, [refreshParticipants])

    const completeRoom = useCallback(async (roomSid: string): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)
            const response = await VideoService.completeRoom(roomSid)
            if (response.success) {
                setRoom(response.room)
                return true
            } else {
                setError('Failed to complete room')
                return false
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to complete room'
            setError(errorMessage)
            return false
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        participants,
        participantCount: participants.length,
        room,
        loading,
        error,
        generateToken,
        createRoom,
        getRoom,
        listParticipants,
        disconnectParticipant,
        completeRoom,
        refreshParticipants,
    }
}

export default useVideo 