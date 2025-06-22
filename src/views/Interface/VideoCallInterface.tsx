import { useState, useEffect, useRef } from 'react'
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

import WaitingRoom from '@/components/Interface/WaitingRoom'
import CallControls from '@/components/Interface/CallControls'
import PrescriptionDrawer from '@/components/Interface/PrescriptionDrawer'
import EndConsultationModal from '@/components/Interface/EndConsultationModal'
import ConsultationComplete from '@/components/Interface/ConsultationComplete'
import { FaNotesMedical, FaUsers, FaClock, FaSignal } from 'react-icons/fa'
import { Button } from '@/components/ui'

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

const VideoCallInterface = ({ onCallEnd }: VideoCallInterfaceProps) => {
    const {
        doctorId: docId,
        patientId,
        roomName,
        consultationId,
        setConsultationId,
    } = useVideoCall()
    const { id } = useParams<{ doctorId?: string }>()
    const doctorId = parseInt(docId || id || '0')
    const navigate = useNavigate()

    // Get URL parameters
    const location = useLocation()
    const urlParams = new URLSearchParams(location.search)
    const shouldRejoin = urlParams.get('rejoin') === 'true'
    const urlConsultationId = urlParams.get('consultationId')

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
    const [roomSid, setRoomSid] = useState<string | null>(null)
    const [participantCount, setParticipantCount] = useState(0)

    const { socket } = useSocketContext()
    const { startConsultation } = useConsultation({
        doctorId: doctorId,
    })
    const { leaveQueue } = usePatientQueue({
        doctorId: doctorId,
    })

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const isDoctor = user.authority?.includes('doctor') || false

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

    // Participant count effect
    useEffect(() => {
        if (room && roomSid) {
            console.log(
                'Setting up participant count monitoring for room SID:',
                roomSid,
            )

            const updateParticipantCount = async () => {
                try {
                    console.log('Fetching participants for room SID:', roomSid)
                    const response =
                        await VideoService.listParticipants(roomSid)
                    if (response.success) {
                        // Count only connected participants from API (don't add local participant here)
                        const connectedParticipants =
                            response.participants.filter(
                                (p) => p.status === 'connected',
                            ).length
                        console.log(
                            'API participants count:',
                            connectedParticipants,
                            'room participants:',
                            room.participants.size,
                        )
                        setParticipantCount(connectedParticipants)
                    } else {
                        console.warn(
                            'Failed to fetch participants:',
                            response.message,
                        )
                        // Fallback: count based on room participants (remote only)
                        const roomParticipants = room.participants.size
                        console.log(
                            'Using fallback participant count:',
                            roomParticipants,
                        )
                        setParticipantCount(roomParticipants)
                    }
                } catch (error) {
                    console.error('Error fetching participant count:', error)
                    // Fallback: count based on room participants (remote only)
                    const roomParticipants = room.participants.size
                    console.log(
                        'Using error fallback participant count:',
                        roomParticipants,
                    )
                    setParticipantCount(roomParticipants)
                }
            }

            // Initial count
            updateParticipantCount()

            // Update count every 10 seconds (reduced frequency to avoid API overload)
            const interval = setInterval(updateParticipantCount, 10000)

            return () => clearInterval(interval)
        } else {
            console.log(
                'Room or roomSid not available for participant monitoring:',
                { room: !!room, roomSid },
            )
        }
    }, [room, roomSid])

    useEffect(() => {
        if (!socket) return

        // Check if we should directly rejoin from URL parameters
        if (shouldRejoin && urlConsultationId) {
            handleDirectRejoin(urlConsultationId)
        } else {
            // Check consultation status first
            checkConsultationStatusAndConnect()
        }

        socket.on('POSITION_UPDATE', (status: QueueStatus) => {
            setQueueStatus(status)
        })

        if (!isDoctor) {
            socket.on('CONSULTATION_STARTED', async (data) => {
                setIsWaiting(false)
                setConsultationId(data.consultationId)
                setCallStartTime(new Date()) // Start call timer
                await joinRoom(data.roomName, data.doctorId, data.patientId)
            })
        }

        socket.on('CONSULTATION_ENDED', () => {
            setConsultationStatus('ended')
            if (isDoctor) {
                // Doctor sees ended message and redirects to /vdc
                setError('Consultation has ended')
                cleanup()
                setTimeout(() => {
                    navigate('/vdc')
                }, 2000)
            } else {
                // Patient sees consultation complete screen
                setShowConsultationComplete(true)
                cleanup()
            }
        })

        socket.on('PARTICIPANT_REJOINED', (data) => {
            console.log('Participant rejoined:', data)
            // Handle participant reconnection notification
        })

        return () => {
            if (socket) {
                socket.disconnect()
            }
        }
    }, [shouldRejoin, urlConsultationId, socket, isDoctor, navigate])

    const handleDirectRejoin = async (consultationId: string) => {
        try {
            console.log(
                'Direct rejoin requested for consultation:',
                consultationId,
            )
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
            if (!doctorId || !user?.userId) {
                console.log('Missing doctorId or userId:', {
                    doctorId,
                    userId: user?.userId,
                })
                return
            }

            console.log(
                'Checking consultation status for doctor:',
                doctorId,
                'patient:',
                user.userId,
            )

            // For patients, pass autoJoin: true (default behavior)
            // For doctors, this should not be called from VideoCallInterface
            const response = await ConsultationService.checkConsultationStatus(
                doctorId,
                parseInt(user.userId.toString()),
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
                        setIsWaiting(false)
                        setConsultationId(response.consultationId!)
                        setActualRoomName(response.roomName!)
                        setCallStartTime(new Date()) // Start call timer
                        await handleRejoinConsultation(response.consultationId!)
                        break

                    case 'ended':
                        // Consultation has ended
                        console.log('Action: ended - consultation has ended')
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
                        setIsWaiting(true)
                        break

                    case 'in_consultation':
                        // Patient is already in consultation
                        console.log(
                            'Action: in_consultation - patient is in consultation',
                        )
                        setIsWaiting(false)
                        setConsultationId(response.consultationId!)
                        setActualRoomName(response.roomName!)
                        setCallStartTime(new Date()) // Start call timer
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
                user.userId,
                'type:',
                isDoctor ? 'doctor' : 'patient',
            )

            const rejoinResponse = await ConsultationService.rejoinConsultation(
                consultationId,
                String(user.userId!),
                isDoctor ? 'doctor' : 'patient',
            )

            console.log('Rejoin response:', rejoinResponse)

            if (rejoinResponse.success) {
                console.log(
                    'Successfully rejoined, joining room:',
                    rejoinResponse.roomName,
                )
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
                await joinRoom(res.roomName, doctorId, patientId)
            } else {
                // New consultation started
                setConsultationId(res.consultationId)
                setActualRoomName(res.roomName || roomName)
                setCallStartTime(new Date()) // Start call timer
                await joinRoom(res.roomName || roomName, doctorId, patientId)
            }
            setIsWaiting(false)
        } catch (error) {
            console.error('Error in doctor flow:', error)
            setError('Failed to start consultation')
        }
    }

    const cleanup = () => {
        try {
            if (localTracks.video) {
                localTracks.video.stop()
            }
            if (localTracks.audio) {
                localTracks.audio.stop()
            }
            if (room) {
                room.disconnect()
            }
            setCallStartTime(null) // Reset call timer
            setTimeout(() => {
                try {
                    if (localVideoRef.current) {
                        localVideoRef.current.innerHTML = ''
                    }
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.innerHTML = ''
                    }
                } catch (err) {
                    console.error('Error clearing video containers:', err)
                }
            }, 200)
        } catch (err) {
            console.error('Error in cleanup:', err)
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

            if (localVideoRef.current) {
                const videoElement = videoTrack.attach()
                videoElement.style.width = '100%'
                videoElement.style.height = '100%'
                videoElement.style.objectFit = 'contain'
                videoElement.style.position = 'relative'
                localVideoRef.current.innerHTML = ''
                localVideoRef.current.appendChild(videoElement)
            }

            const room = await connect(token, {
                name: actualRoomName || '',
                tracks: [videoTrack, audioTrack],
                dominantSpeaker: true,
                maxAudioBitrate: 16000,
                preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            })

            console.log('Connected to room:', room.name, 'SID:', room.sid)
            setRoom(room)
            setRoomSid(room.sid) // Store room SID for participant count
            handleRoomEvents(room)
        } catch (error) {
            console.error('Error joining room:', error)
            setError('Failed to join video call')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRoomEvents = (room: Room) => {
        room.participants.forEach(handleParticipantConnected)
        room.on('participantConnected', handleParticipantConnected)
        room.on('participantDisconnected', handleParticipantDisconnected)
        room.on('disconnected', handleRoomDisconnected)
        room.on('dominantSpeakerChanged', handleDominantSpeakerChanged)
    }

    const handleParticipantConnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} connected`)
        setRemoteParticipantIdentity(participant.identity)

        participant.tracks.forEach((publication) => {
            if (publication.isSubscribed && publication.track) {
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
        })

        participant.on('trackSubscribed', (track) => {
            if (track.kind === 'video' || track.kind === 'audio') {
                handleTrackSubscribed(
                    track as RemoteVideoTrack | RemoteAudioTrack,
                )
            }
        })

        participant.on('trackUnsubscribed', (track) => {
            if (track.kind === 'video' || track.kind === 'audio') {
                handleTrackUnsubscribed(
                    track as RemoteVideoTrack | RemoteAudioTrack,
                )
            }
        })
    }

    const handleTrackSubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        if (!remoteVideoRef.current) return

        try {
            const element = track.attach()
            element.setAttribute('data-track-id', track.sid)

            if (track.kind === 'video') {
                element.style.width = '100%'
                element.style.height = '100%'
                element.style.objectFit = 'cover'

                const existingVideos =
                    remoteVideoRef.current.querySelectorAll('video')
                existingVideos.forEach((video) => {
                    try {
                        remoteVideoRef.current?.removeChild(video)
                    } catch {
                        console.warn(
                            'Could not remove existing video, may already be detached',
                        )
                    }
                })
            }

            remoteVideoRef.current.appendChild(element)
            console.log(`Track ${track.kind} attached with ID: ${track.sid}`)
        } catch (error) {
            console.error('Error in handleTrackSubscribed:', error)
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        try {
            console.log(
                `Unsubscribing from track ${track.kind} with ID: ${track.sid}`,
            )
            const elements = track.detach()
            elements.forEach((element) => {
                try {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element)
                    }
                } catch {
                    console.warn(
                        'Error removing track element, may already be detached',
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
        setTimeout(() => {
            try {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.innerHTML = ''
                }
            } catch (err) {
                console.error('Error in handleParticipantDisconnected:', err)
            }
        }, 200)
    }

    const handleRoomDisconnected = (room: Room) => {
        console.log('Disconnected from room:', room.name)
        cleanup()
        if (isDoctor) {
            navigate('/vdc')
        } else if (!showConsultationComplete) {
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
                onRedirectToPrescriptions={() =>
                    navigate('/user/prescriptions')
                }
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
                {isDoctor && (
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
                )}
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

export default VideoCallInterface
