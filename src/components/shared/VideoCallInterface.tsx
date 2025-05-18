import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useSessionUser } from '@/store/authStore'
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiVideoCameraSlash,
} from 'react-icons/hi2'
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
import { useAuth } from '@/auth'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { initializeSocket } from '@/utils/socket'
// import { initializeSocket, disconnectSocket } from '@/utils/socket'

interface VideoCallInterfaceProps {
    roomName?: string
    doctorId?: string
    onCallEnd?: () => void
    children?: React.ReactNode
}

interface LocalTracks {
    video: LocalVideoTrack | null
    audio: LocalAudioTrack | null
}

interface QueueStatus {
    position: number
    estimatedWait: string
}

const VideoCallInterface = ({
    roomName: initialRoomName,
    // doctorId,
    onCallEnd,
    children,
}: VideoCallInterfaceProps) => {
    const API_URL = 'http://localhost:3000'
    const { id } = useParams<{ doctorId: string }>()
    const doctorId = id || null
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
    const [socket, setSocket] = useState<Socket | null>(null)
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
    const [consultationId, setConsultationId] = useState<string | null>(null)
    const [actualRoomName, setActualRoomName] = useState<string>(
        initialRoomName || `room-${uuidv4()}`,
    )
    const [isWaiting, setIsWaiting] = useState(true)

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const sessionUser = useSessionUser((state) => state.user)
    const isDoctor = user.authority?.includes('doctor') || false

    useEffect(() => {
        // Initialize socket connection
        console.log('lobby effect in VC interface')
        console.log('doctor ID', doctorId)
        // console.log(isBoolean(doctorId))
        const newSocket = initializeSocket()

        io(API_URL, {
            query: {
                userType: 'patient',
                userId: user.userId,
            },
        })
        setSocket(newSocket)

        if (isDoctor) {
            newSocket.emit('JOIN_DOCTOR_ROOM', { doctorId: user.userId })
        } else if (doctorId) {
            // Patient joining queue
            newSocket.emit('PATIENT_JOIN_QUEUE', {
                doctorId,
                patientId: user.userId,
                roomName: actualRoomName,
            })
        }

        // Socket event listeners
        newSocket.on('QUEUE_POSITION_UPDATE', (status: QueueStatus) => {
            setQueueStatus(status)
        })

        newSocket.on('INVITE_PATIENT', async (data) => {
            setConsultationId(data.consultationId)
            setIsWaiting(false)
            await joinRoom()
        })

        newSocket.on('CONSULTATION_ENDED', () => {
            cleanup()
            onCallEnd?.()
        })

        return () => {
            disconnectSocket()
        }
    }, [])

    // Cleanup function
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

    const getToken = async () => {
        try {
            const userId = sessionUser.userId || '0'
            const identity = isDoctor ? `doctor-${userId}` : `patient-${userId}`

            const response = await VideoService.generateToken({
                identity,
                roomName: actualRoomName,
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

    const joinRoom = async () => {
        if (isConnecting || (isWaiting && !isDoctor)) return
        setIsConnecting(true)
        setError(null)

        try {
            // Create room if doctor
            if (isDoctor) {
                try {
                    await VideoService.createRoom({
                        roomName: actualRoomName,
                    })
                } catch (error) {
                    console.log('Room may already exist:', error)
                }
            }

            const token = await getToken()
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
                videoElement.style.objectFit = 'cover'
                localVideoRef.current.innerHTML = ''
                localVideoRef.current.appendChild(videoElement)
            }

            const room = await connect(token, {
                name: actualRoomName,
                tracks: [videoTrack, audioTrack],
                dominantSpeaker: true,
                maxAudioBitrate: 16000,
                preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            })

            console.log('Connected to room:', room.name)
            setRoom(room)
            handleRoomEvents(room)
        } catch (error) {
            console.error('Error joining room:', error)
            setError('Failed to join video call')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRoomEvents = (room: Room) => {
        // Handle existing participants
        room.participants.forEach(handleParticipantConnected)

        // Handle participant connections
        room.on('participantConnected', handleParticipantConnected)
        room.on('participantDisconnected', handleParticipantDisconnected)
        room.on('disconnected', handleRoomDisconnected)
        room.on('dominantSpeakerChanged', handleDominantSpeakerChanged)
    }

    const handleParticipantConnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} connected`)
        setRemoteParticipantIdentity(participant.identity)

        // Handle participant's existing tracks
        participant.tracks.forEach((publication) => {
            if (publication.isSubscribed && publication.track) {
                // Check track type before handling
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

        // Handle track subscription
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

            // Add track ID to the element for later reference
            element.setAttribute('data-track-id', track.sid)

            if (track.kind === 'video') {
                element.style.width = '100%'
                element.style.height = '100%'
                element.style.objectFit = 'cover'

                // Remove any existing video elements to prevent duplicates
                const existingVideos =
                    remoteVideoRef.current.querySelectorAll('video')
                existingVideos.forEach((video) => {
                    try {
                        remoteVideoRef.current?.removeChild(video)
                    } catch (err) {
                        console.warn(
                            'Could not remove existing video, may already be detached',
                        )
                    }
                })
            }

            // Add the new element
            remoteVideoRef.current.appendChild(element)
            console.log(`Track ${track.kind} attached with ID: ${track.sid}`)
        } catch (err) {
            console.error('Error in handleTrackSubscribed:', err)
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        try {
            console.log(
                `Unsubscribing from track ${track.kind} with ID: ${track.sid}`,
            )

            // Safely detach the track elements
            const elements = track.detach()
            elements.forEach((element) => {
                try {
                    // Verify the element is still in the DOM before removing
                    if (element.parentNode) {
                        element.parentNode.removeChild(element)
                    }
                } catch (err) {
                    console.warn(
                        'Error removing track element, may already be detached',
                    )
                }
            })
        } catch (err) {
            console.error('Error in handleTrackUnsubscribed:', err)
        }
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} disconnected`)

        // Set identity to null first
        setRemoteParticipantIdentity(null)

        // Add delay before cleanup to ensure React has processed state changes
        setTimeout(() => {
            try {
                if (remoteVideoRef.current) {
                    // Clear the remote video container instead of trying to remove individual elements
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
        onCallEnd?.()
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
        if (isDoctor && consultationId && socket) {
            socket.emit('END_CONSULTATION', { consultationId })
        } else if (!isDoctor && socket) {
            socket.emit('LEAVE_QUEUE', {
                patientId: user.userId,
                doctorId,
            })
        }

        cleanup()
        onCallEnd?.()
    }

    // Render waiting room for patients
    const renderWaitingRoom = () => {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white p-8">
                    <h2 className="text-2xl text-white font-bold mb-4">
                        Waiting for your consultation
                    </h2>
                    {queueStatus && (
                        <div className="mb-4">
                            <p className="text-lg">
                                Your position in queue:{' '}
                                <span className="font-bold">
                                    {queueStatus.position}
                                </span>
                            </p>
                            <p className="text-lg">
                                Estimated wait time:{' '}
                                <span className="font-bold">
                                    {queueStatus.estimatedWait}
                                </span>
                            </p>
                        </div>
                    )}
                    <p className="text-gray-400">
                        Please don't close this window. You'll be connected with
                        the doctor shortly.
                    </p>
                    <Button
                        variant="solid"
                        className="mt-4 bg-red-500"
                        onClick={endCall}
                    >
                        Leave Queue
                    </Button>
                </div>
            </div>
        )
    }

    return !isDoctor && isWaiting ? (
        renderWaitingRoom()
    ) : (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col bg-gray-900">
                {error && (
                    <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded z-50">
                        {error}
                    </div>
                )}

                <div className="flex-1 relative">
                    {/* Remote Video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            ref={remoteVideoRef}
                            className="w-full h-full bg-gray-800 relative"
                        >
                            {!remoteParticipantIdentity && (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    Waiting for other participant to join...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Local Video */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                        <div
                            ref={localVideoRef}
                            className="w-full h-full"
                        ></div>
                        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                            You ({isDoctor ? 'Doctor' : 'Patient'})
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 px-4">
                    <Button
                        variant={isMicOn ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${!isMicOn ? 'bg-red-500' : ''}`}
                        onClick={toggleMic}
                        disabled={isConnecting}
                    >
                        <HiMicrophone className="text-xl" />
                    </Button>
                    <Button
                        variant={isVideoOn ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${!isVideoOn ? 'bg-red-500' : ''}`}
                        onClick={toggleVideo}
                        disabled={isConnecting}
                    >
                        {isVideoOn ? (
                            <HiVideoCamera className="text-xl" />
                        ) : (
                            <HiVideoCameraSlash className="text-xl" />
                        )}
                    </Button>
                    <Button
                        variant="solid"
                        className="rounded-full p-4 bg-red-500"
                        onClick={endCall}
                        disabled={isConnecting}
                    >
                        <HiPhone className="text-xl rotate-[135deg]" />
                    </Button>
                </div>
            </div>

            {/* Side Panel */}
            {/* <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
                {children}
            </div> */}
        </div>
    )
}

export default VideoCallInterface
