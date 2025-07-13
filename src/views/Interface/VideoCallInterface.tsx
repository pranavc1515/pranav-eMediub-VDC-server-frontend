import {
    useState,
    useEffect,
    useRef,
    Component,
    ErrorInfo,
    ReactNode,
} from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
    connect,
    createLocalVideoTrack,
    createLocalAudioTrack,
    Room,
    LocalVideoTrack,
    LocalAudioTrack,
    RemoteParticipant,
    RemoteVideoTrack,
    RemoteAudioTrack,
} from 'twilio-video'
import VideoService from '@/services/VideoService'
import ConsultationService from '@/services/ConsultationService'
import { useAuth } from '@/auth'
import { useSocketContext } from '@/contexts/SocketContext'
import { useVideoCall } from '@/contexts/VideoCallContext'
import useConsultation from '@/hooks/useConsultation'
import usePatientQueue from '@/hooks/usePatientQueue'
import { toast } from '@/components/ui/toast'
import { Notification } from '@/components/ui'

import WaitingRoom from '@/components/Interface/WaitingRoom'
import CallControls from '@/components/Interface/CallControls'
import PrescriptionDrawer from '@/components/Interface/PrescriptionDrawer'
import EndConsultationModal from '@/components/Interface/EndConsultationModal'
import ConsultationComplete from '@/components/Interface/ConsultationComplete'
import { FaUsers, FaClock, FaSignal } from 'react-icons/fa'

// Error Boundary Component
class VideoCallErrorBoundary extends Component<
    { children: ReactNode; onError?: (error: Error) => void },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: {
        children: ReactNode
        onError?: (error: Error) => void
    }) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(
            'VideoCall Error Boundary caught an error:',
            error,
            errorInfo,
        )

        // Check if it's a DOM manipulation error
        if (
            error.message?.includes('removeChild') ||
            error.message?.includes('Node')
        ) {
            console.log('DOM manipulation error caught by error boundary')
            this.props.onError?.(error)
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-[30]">
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">
                            Connection Issue
                        </h2>
                        <p className="text-gray-300 mb-4">
                            There was a temporary connection issue. Please
                            refresh to continue.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

interface VideoCallInterfaceProps {
    onCallEnd?: () => void
}

interface LocalTracks {
    video: LocalVideoTrack | null
    audio: LocalAudioTrack | null
}

interface QueueStatus {
    position: number
    estimatedWait: string
    status?: string
    queueLength?: number
    totalInQueue?: number
}

const VideoCallInterfaceInner = ({ onCallEnd }: VideoCallInterfaceProps) => {
    const {
        doctorId: contextDoctorId,
        patientId: contextPatientId,
        roomName,
        consultationId,
        setConsultationId,
        setDoctorId,
        setPatientId,
        setRoomName,
    } = useVideoCall()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Get URL parameters
    const location = useLocation()
    const urlParams = new URLSearchParams(location.search)
    const shouldRejoin = urlParams.get('rejoin') === 'true'
    const urlConsultationId = urlParams.get('consultationId')

    const { user } = useAuth()
    const isDoctor = user.authority?.includes('doctor') || false

    // Extract correct IDs based on user type
    // For doctors: URL param 'id' is patientId, doctorId comes from user context
    // For patients: URL param 'id' is doctorId, patientId comes from user context
    const doctorId = isDoctor
        ? contextDoctorId || parseInt(user.userId?.toString() || '0')
        : contextDoctorId || parseInt(id || '0')
    const patientId = isDoctor
        ? contextPatientId || parseInt(id || '0')
        : contextPatientId || parseInt(user.userId?.toString() || '0')

    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [room, setRoom] = useState<Room | null>(null)
    const [localTracks, setLocalTracks] = useState<LocalTracks>({
        video: null,
        audio: null,
    })
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [remoteParticipantIdentity, setRemoteParticipantIdentity] = useState<
        string | null
    >(null)
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
    const [actualRoomName, setActualRoomName] = useState<string | null>(null)
    const [isWaiting, setIsWaiting] = useState(true)
    const [isPrescriptionDrawerOpen, setIsPrescriptionDrawerOpen] =
        useState(false)
    const [consultationStatus, setConsultationStatus] = useState<string | null>(
        null,
    )

    // Enhanced states for new features
    const [callStartTime, setCallStartTime] = useState<Date | null>(null)
    const [callDuration, setCallDuration] = useState('00:00')
    const [showEndConsultationModal, setShowEndConsultationModal] =
        useState(false)
    const [showConsultationComplete, setShowConsultationComplete] =
        useState(false)
    const [isEndingConsultation, setIsEndingConsultation] = useState(false)
    const [participantCount, setParticipantCount] = useState(0)

    // Enhanced cleanup state management to prevent race conditions
    const [isCleaningUp, setIsCleaningUp] = useState(false)
    const [isComponentActive, setIsComponentActive] = useState(true)
    const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isMountedRef = useRef(true)

    // Track attached elements to prevent React conflicts
    const attachedElementsRef = useRef<Set<HTMLElement>>(new Set())
    const twilioTracksRef = useRef<
        Map<
            string,
            | LocalVideoTrack
            | LocalAudioTrack
            | RemoteVideoTrack
            | RemoteAudioTrack
        >
    >(new Map())

    const { socket } = useSocketContext()
    const { startConsultation } = useConsultation({
        doctorId: doctorId,
    })
    const { leaveQueue } = usePatientQueue({
        doctorId: doctorId,
    })

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)

    // Component lifecycle management with enhanced safety
    useEffect(() => {
        isMountedRef.current = true
        setIsComponentActive(true)

        return () => {
            console.log('VideoCallInterface component unmounting...')
            isMountedRef.current = false
            setIsComponentActive(false)

            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current)
            }

            // Immediate cleanup to prevent React conflicts
            performImmediateCleanup()
        }
    }, [])

    // Immediate cleanup function for unmount scenarios
    const performImmediateCleanup = () => {
        try {
            console.log('Performing immediate cleanup...')

            // Stop all Twilio tracks immediately
            twilioTracksRef.current.forEach((track, trackId) => {
                try {
                    if (track && 'stop' in track && typeof track.stop === 'function') {
                        track.stop()
                        console.log(`Stopped track ${trackId}`)
                    }
                } catch (error) {
                    console.warn(`Error stopping track ${trackId}:`, error)
                }
            })
            twilioTracksRef.current.clear()

            // Disconnect room immediately
            if (room && typeof room.disconnect === 'function') {
                try {
                    room.disconnect()
                    console.log('Room disconnected immediately')
                } catch (error) {
                    console.warn('Error disconnecting room:', error)
                }
            }

            // Clear attached elements tracking
            attachedElementsRef.current.clear()
        } catch (error) {
            console.error('Error in immediate cleanup:', error)
        }
    }

    // Reset state function for fresh starts
    const resetComponentState = () => {
        if (!isMountedRef.current || !isComponentActive) return

        try {
            console.log('Resetting component state for fresh start...')

            // Clear all tracking
            twilioTracksRef.current.clear()
            attachedElementsRef.current.clear()

            // Reset states
            setRemoteParticipantIdentity(null)
            setParticipantCount(0)
            setError(null)
            setIsCleaningUp(false)

            console.log('Component state reset complete')
        } catch (error) {
            console.error('Error resetting component state:', error)
        }
    }

    // Update context with correct IDs when component mounts
    useEffect(() => {
        // Only set if context values are not already set
        if ((!contextDoctorId || !contextPatientId) && doctorId && patientId) {
            setDoctorId(doctorId)
            setPatientId(patientId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorId, patientId])

    // Call timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (callStartTime && !isWaiting && !showConsultationComplete) {
            interval = setInterval(() => {
                const now = new Date()
                const diff = now.getTime() - callStartTime.getTime()
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setCallDuration(
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                )
            }, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [callStartTime, isWaiting, showConsultationComplete])

    // Update participant count based on actual Twilio room data
    useEffect(() => {
        if (room) {
            // Initial count: remote participants + local participant
            const count = room.participants.size + 1
            setParticipantCount(count)
            console.log(`Updated participant count from room data: ${count}`)
        }
    }, [room])

    // Socket-based participant count monitoring (backup)
    useEffect(() => {
        if (!socket || !actualRoomName) return

        console.log(
            'Setting up socket-based participant monitoring for room:',
            actualRoomName,
        )

        // Listen for participant count updates
        const handleParticipantCountUpdate = (data: {
            roomName: string
            participantCount: number
            consultationId?: string
            participantJoined?: string
            participantLeft?: string
        }) => {
            if (data.roomName === actualRoomName) {
                console.log(
                    `Participant count updated for room ${data.roomName}: ${data.participantCount}`,
                )
                // Only update if we don't have room data or if socket count is higher
                if (!room || data.participantCount > participantCount) {
                    setParticipantCount(data.participantCount)
                }

                if (data.participantJoined) {
                    console.log(`Participant joined: ${data.participantJoined}`)
                }
                if (data.participantLeft) {
                    console.log(`Participant left: ${data.participantLeft}`)
                }
            }
        }

        try {
            socket.on('PARTICIPANT_COUNT_UPDATE', handleParticipantCountUpdate)

            // Request initial participant count
            if (socket.emit) {
                socket.emit('GET_PARTICIPANT_COUNT', {
                    roomName: actualRoomName,
                    consultationId: consultationId,
                })
                console.log(
                    'Requested initial participant count for room:',
                    actualRoomName,
                )
            }
        } catch (socketError) {
            console.warn(
                'Error setting up participant count monitoring:',
                socketError,
            )
        }

        return () => {
            try {
                if (socket && socket.off) {
                    socket.off(
                        'PARTICIPANT_COUNT_UPDATE',
                        handleParticipantCountUpdate,
                    )
                }
            } catch (error) {
                console.warn('Error removing socket listener:', error)
            }
        }
    }, [socket, actualRoomName, consultationId, room, participantCount])

    const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

    useEffect(() => {
        if (!socket) return;
        if (!doctorId || !patientId) return;
        if (hasCheckedStatus) return;

        setHasCheckedStatus(true);

        if (shouldRejoin && urlConsultationId) {
            handleDirectRejoin(urlConsultationId)
        } else {
            checkConsultationStatusAndConnect()
        }

        try {
            socket.on('POSITION_UPDATE', (status: QueueStatus) => {
                try {
                    setQueueStatus(status)
                } catch (error) {
                    console.warn('Error handling position update:', error)
                }
            })

            if (!isDoctor) {
                socket.on('CONSULTATION_STARTED', async (data) => {
                    try {
                        setIsWaiting(false)
                        setConsultationId(data.consultationId)
                        setCallStartTime(new Date()) // Start call timer
                        await joinRoom(
                            data.roomName,
                            data.doctorId,
                            data.patientId,
                        )
                    } catch (error) {
                        console.error(
                            'Error handling consultation started:',
                            error,
                        )
                        setError('Failed to join consultation room')
                    }
                })
            }

            socket.on('CONSULTATION_ENDED', () => {
                try {
                    setConsultationStatus('ended')
                    
                    // Show notification for consultation end
                    toast.push(
                        <Notification type="info" title="Consultation Ended">
                            {isDoctor 
                                ? 'You have successfully completed the consultation.'
                                : 'Your consultation has been completed. Thank you!'
                            }
                        </Notification>
                    )

                    if (isDoctor) {
                        // Doctor sees ended message and redirects to /vdc
                        setError('Consultation has ended')
                        cleanup()
                        setTimeout(() => {
                            if (isMountedRef.current) {
                                navigate('/vdc')
                            }
                        }, 2000)
                    } else {
                        // Patient sees consultation complete screen
                        setShowConsultationComplete(true)
                        cleanup()
                    }
                } catch (error) {
                    console.error('Error handling consultation ended:', error)
                }
            })

            socket.on('PARTICIPANT_REJOINED', (data) => {
                try {
                    console.log('Participant rejoined:', data)
                    // Handle participant reconnection notification
                } catch (error) {
                    console.warn('Error handling participant rejoined:', error)
                }
            })
        } catch (socketError) {
            console.error('Error setting up socket listeners:', socketError)
        }

        return () => {
            try {
                if (socket && socket.disconnect) {
                    socket.disconnect()
                }
            } catch (error) {
                console.warn('Error disconnecting socket:', error)
            }
        }
    }, [
        shouldRejoin,
        urlConsultationId,
        socket,
        isDoctor,
        navigate,
        doctorId,
        patientId,
        hasCheckedStatus,
    ])

    const handleDirectRejoin = async (consultationId: string) => {
        try {
            console.log(
                'Direct rejoin requested for consultation:',
                consultationId,
            )

            // Reset state for fresh start
            resetComponentState()

            setIsWaiting(false)
            setConsultationId(consultationId)
            setCallStartTime(new Date()) // Start call timer for rejoined calls
            await handleRejoinConsultation(consultationId)
        } catch (error) {
            console.error('Error in direct rejoin:', error)
            setError('Failed to rejoin consultation')
        }
    }

    const checkConsultationStatusAndConnect = async () => {
        try {
            if (!doctorId || !patientId || !user?.userId) {
                console.log('Missing required IDs:', {
                    doctorId,
                    patientId,
                    userId: user?.userId,
                })
                toast.push(
                    <Notification type="danger" title="Connection Error">
                        Missing required user information. Please refresh and try again.
                    </Notification>
                )
                return
            }

            console.log(
                'Checking consultation status for doctor:',
                doctorId,
                'patient:',
                patientId,
                'user type:',
                isDoctor ? 'doctor' : 'patient',
            )

            // Use the correct patient ID for the consultation check
            const response = await ConsultationService.checkConsultationStatus(
                doctorId,
                patientId,
                !isDoctor, // autoJoin only for patients, not doctors
            )

            console.log('Status check response:', response)

            if (response.success) {
                setConsultationStatus(response.status)

                switch (response.action) {
                    case 'rejoin':
                        // Ongoing consultation found - rejoin directly
                        console.log(
                            'Action: rejoin - ongoing consultation found',
                        )
                        toast.push(
                            <Notification type="info" title="Rejoining Call">
                                Reconnecting to ongoing consultation...
                            </Notification>
                        )
                        setIsWaiting(false)
                        setConsultationId(response.consultationId!)
                        setActualRoomName(response.roomName!)
                        setCallStartTime(new Date()) // Start call timer

                        // Update context with the room name
                        if (response.roomName) {
                            setRoomName(response.roomName)
                        }

                        await handleRejoinConsultation(response.consultationId!)
                        break

                    case 'ended':
                        // Consultation has ended
                        console.log('Action: ended - consultation has ended')
                        toast.push(
                            <Notification type="warning" title="Consultation Ended">
                                {isDoctor 
                                    ? 'This consultation has already been completed.'
                                    : 'Your consultation has been completed successfully.'
                                }
                            </Notification>
                        )
                        if (isDoctor) {
                            setError('Consultation has ended')
                            setTimeout(() => {
                                navigate('/vdc')
                            }, 3000)
                        } else {
                            setShowConsultationComplete(true)
                        }
                        break

                    case 'wait':
                        // Patient is already in queue or automatically joined - show waiting room
                        console.log(
                            'Action: wait - patient is in queue, position:',
                            response.position,
                        )
                        setQueueStatus({
                            position: response.position!,
                            estimatedWait: response.estimatedWait!,
                            status: response.status,
                            queueLength: response.queueLength,
                        })
                        setActualRoomName(response.roomName!)

                        // Update context with the room name
                        if (response.roomName) {
                            setRoomName(response.roomName)
                        }

                        setIsWaiting(true)
                        break

                    case 'joined':
                        // Patient just joined the queue
                        console.log(
                            'Action: joined - patient joined queue at position:',
                            response.position,
                        )
                        setQueueStatus({
                            position: response.position!,
                            estimatedWait: response.estimatedWait!,
                            status: 'waiting',
                            queueLength: response.queueLength,
                        })
                        setActualRoomName(response.roomName!)

                        // Update context with the room name
                        if (response.roomName) {
                            setRoomName(response.roomName)
                        }

                        setIsWaiting(true)
                        break

                    case 'in_consultation':
                        // Participant is already in consultation
                        console.log(
                            'Action: in_consultation - participant is in consultation',
                        )
                        setIsWaiting(false)
                        setConsultationId(response.consultationId!)
                        setActualRoomName(response.roomName!)
                        setCallStartTime(new Date()) // Start call timer

                        // Update context with the room name
                        if (response.roomName) {
                            setRoomName(response.roomName)
                        }

                        await handleRejoinConsultation(response.consultationId!)
                        break

                    default:
                        // Handle other cases
                        console.log(
                            'Action: default - proceeding with fallback flow',
                        )
                        if (isDoctor) {
                            handleDoctorFlow()
                        } else {
                            // For patients, if no specific action, show error
                            setError('Unable to determine consultation status')
                        }
                }
            } else {
                console.error('Status check failed:', response)
                setError(
                    response.message || 'Failed to check consultation status',
                )
            }
        } catch (error) {
            console.error('Error checking consultation status:', error)
            setError('Failed to check consultation status')
        }
    }

    const handleRejoinConsultation = async (consultationId: string) => {
        try {
            console.log(
                'Rejoining consultation:',
                consultationId,
                'for user:',
                isDoctor ? `doctor-${doctorId}` : `patient-${patientId}`,
                'type:',
                isDoctor ? 'doctor' : 'patient',
            )

            const rejoinResponse = await ConsultationService.rejoinConsultation(
                consultationId,
                isDoctor ? String(doctorId) : String(patientId),
                isDoctor ? 'doctor' : 'patient',
            )

            console.log('Rejoin response:', rejoinResponse)

            if (rejoinResponse.success) {
                console.log(
                    'Successfully rejoined, joining room:',
                    rejoinResponse.roomName,
                )

                // Update context with the room name from rejoin response
                if (rejoinResponse.roomName) {
                    setRoomName(rejoinResponse.roomName)
                }

                await joinRoom(
                    rejoinResponse.roomName!,
                    rejoinResponse.doctorId!,
                    rejoinResponse.patientId!,
                )
            } else if (rejoinResponse.message?.includes('ended')) {
                if (isDoctor) {
                    setError('Consultation has ended')
                    setTimeout(() => {
                        navigate('/vdc')
                    }, 3000)
                } else {
                    setShowConsultationComplete(true)
                }
            } else {
                console.error('Rejoin failed:', rejoinResponse.message)
                setError(
                    rejoinResponse.message || 'Failed to rejoin consultation',
                )
            }
        } catch (error) {
            console.error('Error rejoining consultation:', error)
            setError('Failed to rejoin consultation')
        }
    }

    const handleDoctorFlow = async () => {
        try {
            const res = await startConsultation(patientId)
            if (res?.message === 'Consultation already exists') {
                // Existing consultation found
                setConsultationId(res.consultationId)
                setActualRoomName(res.roomName)
                setCallStartTime(new Date()) // Start call timer

                // Update context with the room name
                if (res.roomName) {
                    setRoomName(res.roomName)
                }

                await joinRoom(res.roomName, doctorId, patientId)
            } else {
                // New consultation started
                setConsultationId(res.consultationId)
                const finalRoomName = res.roomName || roomName
                setActualRoomName(finalRoomName)
                setCallStartTime(new Date()) // Start call timer

                // Update context with the room name
                if (finalRoomName) {
                    setRoomName(finalRoomName)
                }

                await joinRoom(finalRoomName, doctorId, patientId)
            }
            setIsWaiting(false)
        } catch (error) {
            console.error('Error in doctor flow:', error)
            setError('Failed to start consultation')
        }
    }

    const cleanup = () => {
        // Prevent multiple cleanup calls
        if (isCleaningUp) {
            console.log('Cleanup already in progress, skipping...')
            return
        }

        if (!isComponentActive) {
            console.log('Component not active, skipping cleanup...')
            return
        }

        setIsCleaningUp(true)

        try {
            console.log('Starting cleanup process...')

            // Clear any pending cleanup timeout
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current)
                cleanupTimeoutRef.current = null
            }

            // Notify backend about participant leaving before cleanup
            try {
                if (
                    socket &&
                    socket.emit &&
                    room?.name &&
                    consultationId &&
                    isMountedRef.current
                ) {
                    const participantIdentity = isDoctor
                        ? `D-${doctorId}`
                        : `P-${patientId}`
                    socket.emit('PARTICIPANT_LEFT_ROOM', {
                        roomName: room.name,
                        participantIdentity: participantIdentity,
                        consultationId: consultationId,
                    })
                    console.log('Participant left room event emitted')
                }
            } catch (socketError) {
                console.warn(
                    'Error emitting participant left event:',
                    socketError,
                )
            }

            // Stop all tracked Twilio tracks
            twilioTracksRef.current.forEach((track, trackId) => {
                try {
                    if (track && 'stop' in track && typeof track.stop === 'function') {
                        track.stop()
                        console.log(`Stopped tracked track ${trackId}`)
                    }
                } catch (error) {
                    console.warn(
                        `Error stopping tracked track ${trackId}:`,
                        error,
                    )
                }
            })
            twilioTracksRef.current.clear()

            // Stop local tracks as backup
            try {
                if (
                    localTracks.video &&
                    typeof localTracks.video.stop === 'function'
                ) {
                    localTracks.video.stop()
                    console.log('Local video track stopped')
                }
            } catch (error) {
                console.warn('Error stopping video track:', error)
            }

            try {
                if (
                    localTracks.audio &&
                    typeof localTracks.audio.stop === 'function'
                ) {
                    localTracks.audio.stop()
                    console.log('Local audio track stopped')
                }
            } catch (error) {
                console.warn('Error stopping audio track:', error)
            }

            // Reset local tracks state
            setLocalTracks({ video: null, audio: null })

            // Safely disconnect room
            try {
                if (room && typeof room.disconnect === 'function') {
                    room.disconnect()
                    console.log('Room disconnected')
                }
            } catch (error) {
                console.warn('Error disconnecting room:', error)
            }

            setRoom(null)
            setCallStartTime(null) // Reset call timer

            // Use React-safe DOM cleanup with longer delay
            cleanupTimeoutRef.current = setTimeout(() => {
                if (!isMountedRef.current || !isComponentActive) {
                    console.log(
                        'Component unmounted or inactive, skipping DOM cleanup',
                    )
                    return
                }

                try {
                    // Use React-safe cleanup approach
                    clearVideoContainersReactSafe()
                } catch (err) {
                    console.warn('Error clearing video containers:', err)
                } finally {
                    setIsCleaningUp(false)
                }
            }, 200) // Longer delay to let React complete its operations
        } catch (err) {
            console.error('Error in cleanup:', err)
            setIsCleaningUp(false)
        }
    }

    // React-safe video container cleanup
    const clearVideoContainersReactSafe = () => {
        if (!isMountedRef.current || !isComponentActive) return

        try {
            console.log('Performing React-safe video cleanup...')

            // Instead of manually removing elements, let React handle the DOM
            // We just ensure all Twilio tracks are properly detached

            // Clear local video container
            if (localVideoRef.current) {
                clearVideoContainerReactSafe(localVideoRef.current, 'local')
            }

            // Clear remote video container
            if (remoteVideoRef.current) {
                clearVideoContainerReactSafe(remoteVideoRef.current, 'remote')
            }

            // Clear our tracking
            attachedElementsRef.current.clear()
        } catch (error) {
            console.error('Error in React-safe cleanup:', error)
        }
    }

    // Helper function for React-safe container cleanup
    const clearVideoContainerReactSafe = (
        container: HTMLDivElement,
        type: 'local' | 'remote',
    ) => {
        if (!container || !isMountedRef.current || !isComponentActive) return

        try {
            console.log(`Cleaning ${type} video container React-safe...`)

            // Find all media elements
            const mediaElements = container.querySelectorAll('video, audio')

            mediaElements.forEach((element) => {
                try {
                    // Only clean up elements we know we attached
                    if (
                        attachedElementsRef.current.has(element as HTMLElement)
                    ) {
                        // Pause and clean up media resources
                        if (
                            element.tagName === 'VIDEO' ||
                            element.tagName === 'AUDIO'
                        ) {
                            const mediaElement = element as HTMLMediaElement
                            mediaElement.pause()
                            mediaElement.removeAttribute('src')
                            mediaElement.load()
                        }

                        // Remove from our tracking but let React handle DOM removal
                        attachedElementsRef.current.delete(
                            element as HTMLElement,
                        )
                        console.log(
                            `Cleaned ${type} ${element.tagName.toLowerCase()} element`,
                        )
                    }
                } catch (error) {
                    console.warn(`Error cleaning ${type} element:`, error)
                }
            })

            // If no child elements remain and container is still mounted, it's safe to clear
            if (
                container.children.length === 0 &&
                isMountedRef.current &&
                isComponentActive
            ) {
                // Let React handle this in the next render cycle
                setTimeout(() => {
                    if (
                        container &&
                        container.children.length === 0 &&
                        isMountedRef.current
                    ) {
                        console.log(`${type} container is already clean`)
                    }
                }, 50)
            }
        } catch (error) {
            console.error(`Error in React-safe cleanup for ${type}:`, error)
        }
    }

    const getToken = async (
        roomName: string,
        doctorId: number,
        patientId: number,
    ) => {
        try {
            const identity = isDoctor ? `D-${doctorId}` : `P-${patientId}`
            const roomNameToUse = roomName || ''

            const response = await VideoService.generateToken({
                identity,
                roomName: roomNameToUse,
            })

            // Handle consultation data from token response
            if (response.consultationData && !callStartTime) {
                console.log(
                    'Setting call start time from consultation data:',
                    response.consultationData.startTime,
                )
                setCallStartTime(new Date(response.consultationData.startTime))
                setConsultationId(response.consultationData.consultationId)
            }

            return response.token
        } catch (error) {
            console.error('Error getting token:', error)
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to get access token',
            )
            return null
        }
    }

    const joinRoom = async (
        roomName: string,
        doctorId: number,
        patientId: number,
    ) => {
        try {
            console.log(`Joining room: ${roomName}`)

            // Reset state before joining new room
            resetComponentState()

            const token = await getToken(roomName, doctorId, patientId)
            if (!token) {
                setError('Failed to get access token')
                return
            }

            const videoTrack = await createLocalVideoTrack({
                width: 640,
                height: 480,
                frameRate: 24,
            })
            const audioTrack = await createLocalAudioTrack()

            setLocalTracks({ video: videoTrack, audio: audioTrack })

            // Safely attach local video with tracking
            if (
                localVideoRef.current &&
                videoTrack &&
                isMountedRef.current &&
                isComponentActive
            ) {
                try {
                    const videoElement = videoTrack.attach()
                    if (
                        videoElement &&
                        isMountedRef.current &&
                        isComponentActive
                    ) {
                        videoElement.style.width = '100%'
                        videoElement.style.height = '100%'
                        videoElement.style.objectFit = 'contain'
                        videoElement.style.position = 'relative'

                        // Track this video track
                        const trackId = 'sid' in videoTrack ? videoTrack.sid : `video-${Date.now()}`
                        twilioTracksRef.current.set(
                            `local-video-${trackId}`,
                            videoTrack,
                        )

                        // Clear existing content React-safe
                        clearVideoContainerReactSafe(
                            localVideoRef.current,
                            'local',
                        )

                        // Append new video element if component is still active
                        if (
                            localVideoRef.current &&
                            isMountedRef.current &&
                            isComponentActive
                        ) {
                            localVideoRef.current.appendChild(videoElement)
                            // Track the attached element
                            attachedElementsRef.current.add(videoElement)
                            console.log(
                                'Local video attached and tracked successfully',
                            )
                        }
                    }
                } catch (error) {
                    console.error('Error attaching local video:', error)
                }
            }

            // Track audio track
            if (audioTrack) {
                const audioTrackId = 'sid' in audioTrack ? audioTrack.sid : `audio-${Date.now()}`
                twilioTracksRef.current.set(
                    `local-audio-${audioTrackId}`,
                    audioTrack,
                )
            }

            const participantIdentity = isDoctor
                ? `D-${doctorId}`
                : `P-${patientId}`

            const room = await connect(token, {
                name: actualRoomName || '',
                tracks: [videoTrack, audioTrack],
                dominantSpeaker: true,
                maxAudioBitrate: 16000,
                preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            })

            console.log('Connected to room:', room.name, 'SID:', room.sid)
            setRoom(room)
            handleRoomEvents(room)

            // Show success notification for room connection
            toast.push(
                <Notification type="success" title="Connected">
                    Successfully connected to video consultation
                </Notification>
            )

            // Notify backend about participant joining
            try {
                if (socket && socket.emit && room?.name) {
                    socket.emit('PARTICIPANT_JOINED_ROOM', {
                        roomName: room.name,
                        participantIdentity: participantIdentity,
                        consultationId: consultationId,
                    })
                    console.log('Participant joined room event emitted')
                }
            } catch (socketError) {
                console.warn(
                    'Error emitting participant joined event:',
                    socketError,
                )
            }
        } catch (error) {
            console.error('Error joining room:', error)
            setError('Failed to join video call')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRoomEvents = (room: Room) => {
        try {
            if (!room) {
                console.warn('Room is null, cannot setup event handlers')
                return
            }

            // Safely iterate through existing participants
            if (
                room.participants &&
                typeof room.participants.forEach === 'function'
            ) {
                room.participants.forEach(handleParticipantConnected)
            }

            // Safely add event listeners
            room.on('participantConnected', handleParticipantConnected)
            room.on('participantDisconnected', handleParticipantDisconnected)
            room.on('disconnected', handleRoomDisconnected)
            room.on('dominantSpeakerChanged', handleDominantSpeakerChanged)

            console.log('Room event handlers setup successfully')
        } catch (error) {
            console.error('Error setting up room events:', error)
        }
    }

    const handleParticipantConnected = (participant: RemoteParticipant) => {
        try {
            if (!participant) {
                console.warn(
                    'Participant is null in handleParticipantConnected',
                )
                return
            }

            console.log(`Participant ${participant.identity} connected`)
            setRemoteParticipantIdentity(participant.identity)

            // Show notification when participant joins
            const participantType = participant.identity?.startsWith('D-') ? 'Doctor' : 'Patient'
            toast.push(
                <Notification type="success" title="Participant Joined">
                    {participantType} has joined the consultation
                </Notification>
            )

            // Update participant count when a participant connects
            if (room) {
                const count = room.participants.size + 1
                setParticipantCount(count)
                console.log(
                    `Updated participant count after connection: ${count}`,
                )
            }

            // Safely handle existing tracks
            if (
                participant.tracks &&
                typeof participant.tracks.forEach === 'function'
            ) {
                participant.tracks.forEach((publication) => {
                    try {
                        if (publication?.isSubscribed && publication?.track) {
                            if (
                                publication.track.kind === 'video' ||
                                publication.track.kind === 'audio'
                            ) {
                                handleTrackSubscribed(
                                    publication.track as
                                        | RemoteVideoTrack
                                        | RemoteAudioTrack,
                                )
                            }
                        }
                    } catch (trackError) {
                        console.warn(
                            'Error handling existing track:',
                            trackError,
                        )
                    }
                })
            }

            // Safely add track event listeners
            try {
                participant.on('trackSubscribed', (track) => {
                    try {
                        if (
                            track &&
                            (track.kind === 'video' || track.kind === 'audio')
                        ) {
                            handleTrackSubscribed(
                                track as RemoteVideoTrack | RemoteAudioTrack,
                            )
                        }
                    } catch (trackError) {
                        console.warn(
                            'Error in trackSubscribed handler:',
                            trackError,
                        )
                    }
                })

                participant.on('trackUnsubscribed', (track) => {
                    try {
                        if (
                            track &&
                            (track.kind === 'video' || track.kind === 'audio')
                        ) {
                            handleTrackUnsubscribed(
                                track as RemoteVideoTrack | RemoteAudioTrack,
                            )
                        }
                    } catch (trackError) {
                        console.warn(
                            'Error in trackUnsubscribed handler:',
                            trackError,
                        )
                    }
                })
            } catch (eventError) {
                console.error(
                    'Error setting up participant event listeners:',
                    eventError,
                )
            }
        } catch (error) {
            console.error('Error in handleParticipantConnected:', error)
        }
    }

    const handleTrackSubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        if (
            !remoteVideoRef.current ||
            !isMountedRef.current ||
            !isComponentActive
        )
            return

        try {
            console.log(`Subscribing to ${track.kind} track: ${track.sid}`)

            const element = track.attach()
            if (!element) {
                console.warn('Failed to attach track element')
                return
            }

            // Track this remote track
            twilioTracksRef.current.set(
                `remote-${track.kind}-${track.sid}`,
                track,
            )
            element.setAttribute('data-track-id', track.sid)

            if (track.kind === 'video') {
                element.style.width = '100%'
                element.style.height = '100%'
                element.style.objectFit = 'cover'

                // Clear existing remote video React-safe
                clearVideoContainerReactSafe(remoteVideoRef.current, 'remote')
            }

            // Safely append new element with tracking
            if (
                remoteVideoRef.current &&
                element &&
                isMountedRef.current &&
                isComponentActive
            ) {
                remoteVideoRef.current.appendChild(element)
                // Track the attached element
                attachedElementsRef.current.add(element)
                console.log(
                    `Track ${track.kind} attached and tracked with ID: ${track.sid}`,
                )
            }
        } catch (error) {
            console.error('Error in handleTrackSubscribed:', error)
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        if (!isMountedRef.current || !isComponentActive) return

        try {
            console.log(
                `Unsubscribing from track ${track.kind} with ID: ${track.sid}`,
            )

            // Remove from our tracking first
            const trackKey = `remote-${track.kind}-${track.sid}`
            twilioTracksRef.current.delete(trackKey)

            if (!track || typeof track.detach !== 'function') {
                console.warn('Invalid track or detach method not available')
                return
            }

            const elements = track.detach()
            if (!elements || !Array.isArray(elements)) {
                console.warn('No elements returned from track.detach()')
                return
            }

            elements.forEach((element) => {
                try {
                    if (element && isMountedRef.current && isComponentActive) {
                        // Clean up media element properly
                        if (
                            element.tagName === 'VIDEO' ||
                            element.tagName === 'AUDIO'
                        ) {
                            const mediaElement = element as HTMLMediaElement
                            mediaElement.pause()
                            mediaElement.removeAttribute('src')
                            mediaElement.load()
                        }

                        // Remove from our tracking
                        attachedElementsRef.current.delete(element)

                        // Only remove from DOM if it's actually attached and we're still active
                        if (
                            element.parentNode &&
                            element.parentNode.contains(element)
                        ) {
                            // Let React handle this in the next cycle to avoid conflicts
                            setTimeout(() => {
                                try {
                                    if (
                                        element.parentNode &&
                                        element.parentNode.contains(element) &&
                                        isMountedRef.current &&
                                        isComponentActive
                                    ) {
                                        element.parentNode.removeChild(element)
                                        console.log(
                                            `Successfully removed ${track.kind} element`,
                                        )
                                    }
                                } catch (removeError) {
                                    console.warn(
                                        'Error removing track element (delayed):',
                                        removeError,
                                    )
                                }
                            }, 10)
                        }
                    }
                } catch (error) {
                    console.warn(
                        'Error processing track element removal:',
                        error,
                    )
                }
            })
        } catch (error) {
            console.error('Error in handleTrackUnsubscribed:', error)
        }
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} disconnected`)
        setRemoteParticipantIdentity(null)

        // Show notification when participant leaves
        const participantType = participant.identity?.startsWith('D-') ? 'Doctor' : 'Patient'
        toast.push(
            <Notification type="warning" title="Participant Left">
                {participantType} has left the consultation
            </Notification>
        )

        // Update participant count when a participant disconnects
        if (room) {
            const count = room.participants.size + 1
            setParticipantCount(count)
            console.log(
                `Updated participant count after disconnection: ${count}`,
            )
        }

        // Safely clear remote video container using React-safe method
        setTimeout(() => {
            if (
                isMountedRef.current &&
                isComponentActive &&
                remoteVideoRef.current
            ) {
                clearVideoContainerReactSafe(remoteVideoRef.current, 'remote')
            }
        }, 150)
    }

    const handleRoomDisconnected = (room: Room) => {
        console.log('Disconnected from room:', room.name)
        cleanup()
        if (isDoctor && isMountedRef.current) {
            navigate('/vdc')
        } else if (!showConsultationComplete && isMountedRef.current) {
            setShowConsultationComplete(true)
        }
    }

    const handleDominantSpeakerChanged = (
        participant: RemoteParticipant | null,
    ) => {
        if (participant) {
            console.log(`Dominant speaker is: ${participant.identity}`)
        }
    }

    const toggleMic = () => {
        if (localTracks.audio) {
            localTracks.audio.enable(!isMicOn)
            setIsMicOn(!isMicOn)
        }
    }

    const toggleVideo = () => {
        if (localTracks.video) {
            localTracks.video.enable(!isVideoOn)
            setIsVideoOn(!isVideoOn)
        }
    }

    const endCall = async () => {
        if (isDoctor) {
            // Doctor wants to end consultation - show confirmation modal
            setShowEndConsultationModal(true)
        } else {
            // Patient leaves call - just disconnect them
            cleanup()
            setShowConsultationComplete(true)
        }
    }

    const handleConfirmEndConsultation = async () => {
        if (!consultationId || !isDoctor) return

        try {
            setIsEndingConsultation(true)

            // Call API to end consultation
            const response = await ConsultationService.endConsultationByDoctor(
                consultationId,
                doctorId,
                'Consultation completed by doctor',
            )

            if (response.success) {
                console.log('Consultation ended successfully')
                setShowEndConsultationModal(false)
                cleanup()
                // Socket event will be emitted from backend to notify patient
                // Doctor will be redirected to /vdc via socket event handler
            } else {
                console.error('API response error:', response)
                setError(response.message || 'Failed to end consultation')
            }
        } catch (error) {
            console.error('Error ending consultation:', error)
            // Check if it's a network error or API error
            if (error.response) {
                // API returned an error status
                const apiError = error.response.data
                setError(
                    apiError.message ||
                        `Server error: ${error.response.status}`,
                )
            } else if (error.request) {
                // Network error
                setError('Network error: Unable to connect to server')
            } else {
                // Other error
                setError('Failed to end consultation')
            }
        } finally {
            setIsEndingConsultation(false)
        }
    }

    const handleExitQueue = async () => {
        try {
            if (!doctorId || !user.userId) return
            await leaveQueue({
                patientId: Number(user.userId),
            })
            onCallEnd?.()
        } catch (err) {
            console.error('Error leaving queue:', err)
            setError('Failed to leave queue')
        }
    }

    // Show consultation complete screen for patients
    if (showConsultationComplete && !isDoctor) {
        return (
            <ConsultationComplete
                onRedirectToReport={() => navigate('/user/reports')}
            />
        )
    }

    // Show consultation ended message for doctors
    if (consultationStatus === 'ended' && isDoctor) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-[30]">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">
                        Consultation Ended
                    </h2>
                    <p className="text-gray-300 mb-4">
                        The consultation has been completed successfully.
                    </p>
                    <p className="text-sm text-gray-400">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        )
    }

    if (!isDoctor && isWaiting) {
        return (
            <WaitingRoom
                queueStatus={queueStatus}
                onExitQueue={handleExitQueue}
            />
        )
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-900 z-[30] select-none">
            <div className="flex-1 flex flex-col bg-gray-900 relative">
                {error && (
                    <div
                        role="alert"
                        className="absolute top-4 left-4 right-4 bg-red-600 text-white p-3 rounded-md shadow-lg z-50 font-semibold text-center"
                    >
                        {error}
                    </div>
                )}

                {/* Call Information Bar */}
                {!isWaiting && callStartTime && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg shadow-lg z-40 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FaClock className="text-green-400" />
                            <span className="font-mono text-sm">
                                {callDuration}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-blue-400" />
                            <span className="text-sm">{participantCount}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaSignal className="text-green-400" />
                            <span className="text-sm">Connected</span>
                        </div>
                    </div>
                )}

                {/* Remote Video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="flex-1 flex items-center justify-center overflow-hidden bg-gray-800">
                        <div
                            ref={remoteVideoRef}
                            className="relative bg-black shadow-inner rounded-md"
                            style={{
                                width: '100%',
                                maxWidth: '1000px',
                                maxHeight: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {!remoteParticipantIdentity && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium z-10">
                                    Waiting for other participant to join...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Local Video Preview */}
                <div className="absolute bottom-5 right-5 w-52 h-40 bg-gray-700 rounded-lg overflow-hidden shadow-2xl border border-gray-600">
                    <div ref={localVideoRef} className="w-full h-full" />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded select-text">
                        You ({isDoctor ? 'Doctor' : 'Patient'})
                    </div>
                </div>

                {/* Prescription Button (Only for doctors) */}
                {/* {isDoctor && (
                    <div className="absolute top-4 right-4 z-10">
                        <Button
                            variant="solid"
                            icon={<FaNotesMedical />}
                            onClick={() => {
                                console.log('Creating prescription')
                                setIsPrescriptionDrawerOpen(true)
                            }}
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                            Create Prescription
                        </Button>
                    </div>
                )} */}
            </div>

            <CallControls
                isMicOn={isMicOn}
                isVideoOn={isVideoOn}
                isConnecting={isConnecting}
                onToggleMic={toggleMic}
                onToggleVideo={toggleVideo}
                onEndCall={endCall}
            />

            {/* End Consultation Confirmation Modal (Doctor Only) */}
            {isDoctor && (
                <EndConsultationModal
                    isOpen={showEndConsultationModal}
                    onClose={() => setShowEndConsultationModal(false)}
                    onConfirm={handleConfirmEndConsultation}
                    isLoading={isEndingConsultation}
                />
            )}

            {/* Prescription Drawer */}
            {isDoctor && (
                <PrescriptionDrawer
                    isOpen={isPrescriptionDrawerOpen}
                    onClose={() => setIsPrescriptionDrawerOpen(false)}
                    consultationId={consultationId}
                    doctorId={doctorId}
                    userId={patientId}
                />
            )}
        </div>
    )
}

// Main component wrapped with error boundary
const VideoCallInterface = ({ onCallEnd }: VideoCallInterfaceProps) => {
    const handleError = (error: Error) => {
        console.error('VideoCall component error:', error)
        // Additional error handling can be added here
    }

    return (
        <VideoCallErrorBoundary onError={handleError}>
            <VideoCallInterfaceInner onCallEnd={onCallEnd} />
        </VideoCallErrorBoundary>
    )
}

export default VideoCallInterface
