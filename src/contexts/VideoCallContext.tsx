import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useMemo,
    // useEffect,
} from 'react'
import VideoService from '@/services/VideoService'

interface Participant {
    sid: string
    identity: string
}

interface VideoCallContextType {
    isCallActive: boolean
    currentRoomName: string | null
    currentRoomSid: string | null

    doctorId: number | null
    patientId: number | null
    consultationId: string | null
    roomName: string | null
    // roomIdParam: string | null

    setDoctorId: (id: number | null) => void
    setPatientId: (id: number | null) => void
    setConsultationId: (id: string | null) => void
    setRoomName: (name: string | null) => void
    // setRoomIdParam: (id: string | null) => void

    initiateCall: (roomName: string) => Promise<void>
    acceptCall: (roomName: string) => void
    endCall: () => Promise<void>
    participants: Participant[]
    isLoading: boolean
    error: string | null
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(
    undefined,
)

interface VideoCallProviderProps {
    children: ReactNode
    // roomIdParam?: string // <-- new prop for param string
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({
    children,
}) => {
    const [isCallActive, setIsCallActive] = useState(false)
    const [currentRoomName, setCurrentRoomName] = useState<string | null>(null)
    const [currentRoomSid, setCurrentRoomSid] = useState<string | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [doctorId, setDoctorId] = useState<number | null>(null)
    const [patientId, setPatientId] = useState<number | null>(null)
    const [roomName, setRoomName] = useState<string | null>(null)
    const [consultationId, setConsultationId] = useState<string | null>(null)

    // Parse doctorId and patientId from roomIdParam when it changes
    // useEffect(() => {
    //     if (roomIdParam) {
    //         console.log('roomIdParam', roomIdParam)
    //         // Expecting format: p{patientId}_d{doctorId} e.g. p186_d445
    //         const match = roomIdParam.match(/^p(\d+)_d(\d+)$/)
    //         if (match) {
    //             setPatientId(parseInt(match[1], 10))
    //             setDoctorId(parseInt(match[2], 10))
    //         } else {
    //             setPatientId(null)
    //             setDoctorId(null)
    //         }
    //     } else {
    //         setPatientId(null)
    //         setDoctorId(null)
    //     }
    // }, [roomIdParam])

    const fetchParticipants = useCallback(
        async (roomSid: string): Promise<void> => {
            try {
                const response = await VideoService.listParticipants(roomSid)
                setParticipants(response.participants)
            } catch (error) {
                console.error('Error fetching participants:', error)
            }
        },
        [],
    )

    const initiateCall = useCallback(
        async (roomName: string): Promise<void> => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await VideoService.createRoom({ roomName })
                setCurrentRoomName(roomName)
                setCurrentRoomSid(response.room.sid)
                setIsCallActive(true)
                await fetchParticipants(response.room.sid)
            } catch (err: unknown) {
                console.error('Error initiating call:', err)
                setError('Failed to initiate call. Please try again.')
            } finally {
                setIsLoading(false)
            }
        },
        [fetchParticipants],
    )

    const acceptCall = useCallback((roomName: string): void => {
        setCurrentRoomName(roomName)
        setIsCallActive(true)
    }, [])

    const endCall = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        try {
            if (currentRoomSid) {
                await VideoService.completeRoom(currentRoomSid)
            }
        } catch (error) {
            console.error('Error ending call:', error)
        } finally {
            setIsCallActive(false)
            setCurrentRoomName(null)
            setCurrentRoomSid(null)
            setParticipants([])
            setIsLoading(false)
        }
    }, [currentRoomSid])

    const value = useMemo(
        () => ({
            isCallActive,
            currentRoomName,
            currentRoomSid,
            doctorId,
            patientId,
            setDoctorId,
            setPatientId,
            // roomIdParam,
            // setRoomIdParam,
            initiateCall,
            acceptCall,
            endCall,
            participants,
            isLoading,
            error,
            roomName,
            setRoomName,
            consultationId,
            setConsultationId,
        }),
        [
            isCallActive,
            currentRoomName,
            currentRoomSid,
            doctorId,
            patientId,
            setDoctorId,
            setPatientId,
            initiateCall,
            acceptCall,
            endCall,
            participants,
            isLoading,
            error,
            roomName,
            setRoomName,
            consultationId,
            setConsultationId,
        ],
    )

    return (
        <VideoCallContext.Provider value={value}>
            {children}
        </VideoCallContext.Provider>
    )
}

export const useVideoCall = (): VideoCallContextType => {
    const context = useContext(VideoCallContext)
    if (!context) {
        throw new Error('useVideoCall must be used within a VideoCallProvider')
    }
    return context
}
