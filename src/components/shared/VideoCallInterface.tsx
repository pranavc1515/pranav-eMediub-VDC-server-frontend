import { useState, useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiVideoCameraSlash,
    HiPresentationChartBar,
} from 'react-icons/hi2'
import { connect, createLocalVideoTrack, Room, LocalVideoTrack, RemoteParticipant } from 'twilio-video'
import axios from 'axios'

interface VideoCallInterfaceProps {
    roomName: string;
    identity: string;
    children?: React.ReactNode;
}

const VideoCallInterface = ({ roomName, identity, children }: VideoCallInterfaceProps) => {
    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [room, setRoom] = useState<Room | null>(null)
    const [localTrack, setLocalTrack] = useState<LocalVideoTrack | null>(null)
    
    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        joinRoom()
        return () => {
            if (room) {
                room.disconnect()
            }
        }
    }, [])

    const getToken = async () => {
        try {
            const response = await axios.post('/api/video/token', {
                identity,
                roomName
            })
            return response.data.token
        } catch (error) {
            console.error('Error getting token:', error)
            return null
        }
    }

    const joinRoom = async () => {
        const token = await getToken()
        if (!token) return

        try {
            const localTrack = await createLocalVideoTrack()
            setLocalTrack(localTrack)
            
            if (localVideoRef.current) {
                const videoElement = localTrack.attach()
                localVideoRef.current.appendChild(videoElement)
            }

            const room = await connect(token, {
                name: roomName,
                tracks: [localTrack]
            })
            
            setRoom(room)
            handleRemoteParticipants(room)
        } catch (error) {
            console.error('Error joining room:', error)
        }
    }

    const handleRemoteParticipants = (room: Room) => {
        room.participants.forEach(participantConnected)
        room.on('participantConnected', participantConnected)
        room.on('participantDisconnected', participantDisconnected)
    }

    const participantConnected = (participant: RemoteParticipant) => {
        participant.tracks.forEach(publication => {
            if (publication.track) {
                const videoElement = publication.track.attach()
                remoteVideoRef.current?.appendChild(videoElement)
            }
        })
    }

    const participantDisconnected = (participant: RemoteParticipant) => {
        participant.tracks.forEach(publication => {
            if (publication.track) {
                const elements = publication.track.detach()
                elements.forEach(element => element.remove())
            }
        })
    }

    const toggleMic = () => {
        if (room) {
            room.localParticipant.audioTracks.forEach(publication => {
                if (publication.track) {
                    publication.track.enable(!isMicOn)
                }
            })
            setIsMicOn(!isMicOn)
        }
    }

    const toggleVideo = () => {
        if (localTrack) {
            localTrack.enable(!isVideoOn)
            setIsVideoOn(!isVideoOn)
        }
    }

    const endCall = () => {
        if (room) {
            room.disconnect()
        }
        if (localTrack) {
            localTrack.stop()
        }
    }

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col bg-gray-900">
                <div className="flex-1 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div ref={remoteVideoRef} className="w-full h-full bg-gray-800">
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
                        <div ref={localVideoRef} className="w-full h-full">
                        </div>
                    </div>
                </div>

                <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 px-4">
                    <Button
                        variant={isMicOn ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${!isMicOn ? 'bg-red-500' : ''}`}
                        onClick={toggleMic}
                    >
                        <HiMicrophone className="text-xl" />
                    </Button>
                    <Button
                        variant={isVideoOn ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${!isVideoOn ? 'bg-red-500' : ''}`}
                        onClick={toggleVideo}
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
                    >
                        <HiPhone className="text-xl rotate-[135deg]" />
                    </Button>
                </div>
            </div>

            <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
                {children}
            </div>
        </div>
    )
}

export default VideoCallInterface
