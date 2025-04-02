import { useState, useEffect, useRef } from 'react'
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
    RemoteTrack,
    RemoteVideoTrack,
    RemoteAudioTrack,
} from 'twilio-video'
import axios from 'axios'
import { useAuth } from '@/auth'

interface VideoCallInterfaceProps {
    roomName: string
    onCallEnd?: () => void
    children?: React.ReactNode
}

interface LocalTracks {
    video: LocalVideoTrack | null
    audio: LocalAudioTrack | null
}

const VideoCallInterface = ({
    roomName,
    onCallEnd,
    children,
}: VideoCallInterfaceProps) => {
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

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const isDoctor = user.authority?.includes('doctor') || false

    // Cleanup function
    const cleanup = () => {
        if (localTracks.video) {
            localTracks.video.stop()
        }
        if (localTracks.audio) {
            localTracks.audio.stop()
        }
        if (room) {
            room.disconnect()
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = ''
        }
        if (localVideoRef.current) {
            localVideoRef.current.innerHTML = ''
        }
    }

    useEffect(() => {
        joinRoom()
        return () => {
            cleanup()
        }
    }, [])

    const getToken = async () => {
        try {
            // Get the auth token from localStorage
            // const authToken = localStorage.getItem('auth-token');

            // if (!authToken) {
            //     throw new Error('No authentication token found');
            // }

            const response = await axios.post(
                '/api/video/token',
                {
                    identity: isDoctor ? `doctor-12345` : `patient-12345`,
                    roomName: 'room-12345',
                },
                // {
                //     headers: {
                //         Authorization: `Bearer ${user.token}`,
                //     },
                // },
            )
            return response.data.token
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
        if (isConnecting) return
        setIsConnecting(true)
        setError(null)

        try {
            const token = await getToken()
            if (!token) {
                setError('Failed to get access token')
                return
            }

            // Create local tracks
            const videoTrack = await createLocalVideoTrack({
                width: 640,
                height: 480,
                frameRate: 24,
            })
            const audioTrack = await createLocalAudioTrack()

            setLocalTracks({ video: videoTrack, audio: audioTrack })

            // Attach local video
            if (localVideoRef.current) {
                const videoElement = videoTrack.attach()
                videoElement.style.width = '100%'
                videoElement.style.height = '100%'
                videoElement.style.objectFit = 'cover'
                localVideoRef.current.innerHTML = ''
                localVideoRef.current.appendChild(videoElement)
            }

            // Connect to room
            const room = await connect(token, {
                name: roomName,
                tracks: [videoTrack, audioTrack],
                dominantSpeaker: true,
                maxAudioBitrate: 16000, // For better audio quality
                preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }], // For better video quality
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
                handleTrackSubscribed(publication.track)
            }
        })

        // Handle track subscription
        participant.on('trackSubscribed', handleTrackSubscribed)
        participant.on('trackUnsubscribed', handleTrackUnsubscribed)
    }

    const handleTrackSubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        if (!remoteVideoRef.current) return

        if (track.kind === 'video' || track.kind === 'audio') {
            const element = track.attach()
            if (track.kind === 'video') {
                element.style.width = '100%'
                element.style.height = '100%'
                element.style.objectFit = 'cover'
            }
            remoteVideoRef.current.appendChild(element)
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        if (track.kind === 'video' || track.kind === 'audio') {
            track.detach().forEach((element: HTMLElement) => element.remove())
        }
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} disconnected`)
        setRemoteParticipantIdentity(null)
        if (remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = ''
        }
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

    const endCall = () => {
        cleanup()
        onCallEnd?.()
    }

    return (
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
            <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
                {children}
            </div>
        </div>
    )
}

export default VideoCallInterface
