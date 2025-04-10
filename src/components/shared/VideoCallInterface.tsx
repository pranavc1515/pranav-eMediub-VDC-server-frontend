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
import VideoService from '@/services/VideoService'
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
        try {
            // Add small delay for testing purposes
            setTimeout(() => {
                try {
                    if (localTracks.video) {
                        localTracks.video.stop()
                    }
                    if (localTracks.audio) {
                        localTracks.audio.stop()
                    }
                    
                    // Disconnect room last
                    if (room) {
                        room.disconnect()
                    }

                    // Clean up video elements
                    if (remoteVideoRef.current) {
                        const mediaElements = remoteVideoRef.current.querySelectorAll('video, audio')
                        mediaElements.forEach(element => {
                            try {
                                if (element && element.parentNode) {
                                    element.parentNode.removeChild(element)
                                }
                            } catch (err) {
                                console.warn('Error removing remote media element:', err)
                            }
                        })
                        remoteVideoRef.current.innerHTML = ''
                    }

                    if (localVideoRef.current) {
                        const mediaElements = localVideoRef.current.querySelectorAll('video, audio')
                        mediaElements.forEach(element => {
                            try {
                                if (element && element.parentNode) {
                                    element.parentNode.removeChild(element)
                                }
                            } catch (err) {
                                console.warn('Error removing local media element:', err)
                            }
                        })
                        localVideoRef.current.innerHTML = ''
                    }
                } catch (err) {
                    console.error('Error in delayed cleanup:', err)
                }
            }, 100) // Small delay for testing
        } catch (err) {
            console.error('Error initiating cleanup:', err)
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
            // Create a unique identity format that includes user type and user ID
            const identity = isDoctor ? `doctor-1234` : `patient-1234`

            const response = await VideoService.generateToken({
                identity,
                roomName,
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
        if (isConnecting && roomName === undefined) return
        setIsConnecting(true)
        setError(null)

        try {
            // Ensure the room exists or create it
            try {
                await VideoService.createRoom({
                    roomName: 'room-1234',
                    type: 'group',
                })
                console.log('Room created or already exists:', roomName)
            } catch (error) {
                // Ignore error if room already exists (409 Conflict)
                console.log('Room may already exist:', error)
            }

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
                name: 'room-1234',
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

        try {
            const element = track.attach()
            if (track.kind === 'video') {
                element.style.width = '100%'
                element.style.height = '100%'
                element.style.objectFit = 'cover'
                
                // Safely remove existing video elements
                const existingVideos = remoteVideoRef.current.querySelectorAll('video')
                existingVideos.forEach(video => {
                    try {
                        if (video && video.parentNode) {
                            video.parentNode.removeChild(video)
                        }
                    } catch (err) {
                        console.warn('Error removing existing video:', err)
                    }
                })
            }
            
            // Add data attribute to track elements for easier cleanup
            element.setAttribute('data-track-id', track.sid)
            remoteVideoRef.current.appendChild(element)
        } catch (err) {
            console.error('Error in handleTrackSubscribed:', err)
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteVideoTrack | RemoteAudioTrack,
    ) => {
        try {
            // First try to find and remove elements by track ID
            if (remoteVideoRef.current) {
                const elements = remoteVideoRef.current.querySelectorAll(`[data-track-id="${track.sid}"]`)
                elements.forEach(element => {
                    try {
                        if (element && element.parentNode) {
                            element.parentNode.removeChild(element)
                        }
                    } catch (err) {
                        console.warn('Error removing track element:', err)
                    }
                })
            }

            // Then try the normal detach as backup
            try {
                const elements = track.detach()
                elements.forEach((element: HTMLElement) => {
                    try {
                        if (element && element.parentNode) {
                            element.parentNode.removeChild(element)
                        }
                    } catch (err) {
                        console.warn('Error in track detach cleanup:', err)
                    }
                })
            } catch (err) {
                console.warn('Error in track detach:', err)
            }
        } catch (err) {
            console.error('Error in handleTrackUnsubscribed:', err)
        }
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log(`Participant ${participant.identity} disconnected`)
        
        // Add small delay before cleanup for testing purposes
        setTimeout(() => {
            try {
                if (remoteVideoRef.current) {
                    // First try to cleanup participant's tracks
                    participant.tracks.forEach(publication => {
                        if (publication.track) {
                            try {
                                const elements = publication.track.detach()
                                elements.forEach(element => {
                                    if (element && element.parentNode) {
                                        element.parentNode.removeChild(element)
                                    }
                                })
                            } catch (err) {
                                console.warn('Error cleaning up participant track:', err)
                            }
                        }
                    })

                    // Then clean up any remaining media elements
                    const mediaElements = remoteVideoRef.current.querySelectorAll('video, audio')
                    mediaElements.forEach(element => {
                        try {
                            if (element && element.parentNode) {
                                element.parentNode.removeChild(element)
                            }
                        } catch (err) {
                            console.warn('Error removing media element:', err)
                        }
                    })
                }
            } catch (err) {
                console.error('Error in handleParticipantDisconnected:', err)
            } finally {
                setRemoteParticipantIdentity(null)
            }
        }, 100) // Small delay for testing
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
        cleanup()

        // If we have the room SID and it's the doctor ending the call,
        // try to complete the room on the server side
        if (room && isDoctor) {
            try {
                const roomSid = room.sid
                await VideoService.completeRoom(roomSid)
                console.log('Room completed successfully:', roomSid)
            } catch (error) {
                console.error('Error completing room:', error)
            }
        }

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
