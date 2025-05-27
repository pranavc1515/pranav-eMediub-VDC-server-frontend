import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useSessionUser } from '@/store/authStore'
import usePatientQueue from '@/hooks/usePatientQueue'
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
import { useSocketContext } from '@/contexts/SocketContext'
import { useVideoCall } from '@/contexts/VideoCallContext'
import useConsultation from '@/hooks/useConsultation'
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
}

const VideoCallInterface = ({ onCallEnd }: VideoCallInterfaceProps) => {
    const { doctorId: docId, patientId, roomName } = useVideoCall()
    const { id } = useParams<{ doctorId: string }>()
    const doctorId = parseInt(docId) || parseInt(id)
    // useEffect(() => {
    //     if (id) {
    //         setRoomIdParam(id)
    //     }
    // }, [])

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
    const [consultationId, setConsultationId] = useState<string | null>(null)
    const [actualRoomName, setActualRoomName] = useState<string | null>(null)
    const [isWaiting, setIsWaiting] = useState(true)

    const { socket } = useSocketContext()
    const { startConsultation } = useConsultation({
        doctorId: doctorId ? parseInt(doctorId) : 0,
    })
    const { leaveQueue, joinQueue } = usePatientQueue({
        doctorId: doctorId ? parseInt(doctorId) : 0,
    })

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const sessionUser = useSessionUser((state) => state.user)
    const isDoctor = user.authority?.includes('doctor') || false

    // useEffect(() => {
    //     if (id) {
    //         setRoomIdParam(id)
    //     }
    // }, [id, setRoomIdParam])

    useEffect(() => {
        console.log('lobby effect in VC interface')

        if (!socket) return

        if (isDoctor) {
            console.log('DOCTOR_IS_READY_XXX', doctorId)
            console.log('doctor ID', doctorId)
            startConsultation(patientId).then(() => {
                joinRoom(roomName, doctorId, patientId)
            })
        } else {
            // Patient joining queue
            handleJoinQueue()
        }

        // Listen for queue updates
        socket.on('POSITION_UPDATE', (status: QueueStatus) => {
            console.log('POSITION_UPDATE', status)
            setQueueStatus(status)
        })

        if (!isDoctor) {
            socket.on('CONSULTATION_STARTED', async (data) => {
                console.log('CONSULTATION_STARTED', data)
                setConsultationId(data.consultationId)
                setIsWaiting(false)
                await joinRoom(data.roomName, data.doctorId, data.patientId)
            })
        }

        socket.on('CONSULTATION_ENDED', () => {
            cleanup()
            onCallEnd?.()
        })

        return () => {
            if (socket) {
                socket.disconnect()
            }
        }
    }, [])

    const handleJoinQueue = async () => {
        try {
            console.log('handleJoinQueue')
            if (!doctorId || !user.userId) return

            const response = await joinQueue({
                patientId: Number(user.userId),
            })

            if (response && response.success) {
                setActualRoomName(response.roomName)
                setQueueStatus({
                    position: response.position,
                    estimatedWait: response.estimatedWait,
                })

                // Emit socket event to join the room
                // if (socket) {
                //     socket.emit('JOIN_QUEUE', {
                //         patientId: user.userId,
                //         doctorId,
                //         roomName: response.roomName,
                //     })
                // }
            }
        } catch (err) {
            console.error('Error joining queue:', err)
            setError('Failed to join queue')
        }
    }

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

    const getToken = async (
        roomName: string,
        doctorId: number,
        patientId: number,
    ) => {
        try {
            console.log('getToken', roomName, doctorId, patientId)
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
        // if (isConnecting || (isWaiting && !isDoctor)) return
        // setIsConnecting(true)
        // setError(null)

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
                videoElement.style.objectFit = 'cover'
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
                    } catch {
                        console.warn(
                            'Could not remove existing video, may already be detached',
                        )
                    }
                })
            }

            // Add the new element
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

            // Safely detach the track elements
            const elements = track.detach()
            elements.forEach((element) => {
                try {
                    // Verify the element is still in the DOM before removing
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

    const HandleExitQueue = async () => {
        try {
            if (!doctorId || !user.userId) return

            // Convert patientId to number explicitly
            const patientIdNum = Number(user.userId)

            await leaveQueue({
                patientId: patientIdNum, // ensure this is a number
            })

            // Optionally emit socket event as needed

            onCallEnd?.()
        } catch (err) {
            console.error('Error leaving queue:', err)
            setError('Failed to leave queue')
        }
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
                        Please don&apos;t close this window. You&apos;ll be
                        connected with the doctor shortly.
                    </p>
                    <Button
                        variant="solid"
                        className="mt-4 bg-red-500"
                        onClick={HandleExitQueue}
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
