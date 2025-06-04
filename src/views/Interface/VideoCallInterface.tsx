import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
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
import usePatientQueue from '@/hooks/usePatientQueue'
import WaitingRoom from '@/components/Interface/WaitingRoom'
import CallControls from '@/components/Interface/CallControls'
import PrescriptionDrawer from '@/components/Interface/PrescriptionDrawer'
import { FaNotesMedical } from 'react-icons/fa'
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
}

const VideoCallInterface = ({ onCallEnd }: VideoCallInterfaceProps) => {
    const {
        doctorId: docId,
        patientId,
        roomName,
        consultationId,
        setConsultationId,
    } = useVideoCall()
    const { id } = useParams<{ doctorId: string }>()
    const doctorId = parseInt(docId || id || '0')

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

    const { socket } = useSocketContext()
    const { startConsultation } = useConsultation({
        doctorId: doctorId,
    })
    const { leaveQueue, joinQueue } = usePatientQueue({
        doctorId: doctorId,
    })

    const localVideoRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const isDoctor = user.authority?.includes('doctor') || false

    useEffect(() => {
        if (!socket) return

        if (isDoctor) {
            startConsultation(patientId).then((res) => {
                setConsultationId(res.consultationId)
                joinRoom(roomName, doctorId, patientId)
            })
        } else {
            handleJoinQueue()
        }

        socket.on('POSITION_UPDATE', (status: QueueStatus) => {
            setQueueStatus(status)
        })

        if (!isDoctor) {
            socket.on('CONSULTATION_STARTED', async (data) => {
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

    const handleJoinQueue = async () => {
        try {
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
            }
        } catch (err) {
            console.error('Error joining queue:', err)
            setError('Failed to join queue')
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

                {/* Remote Video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-full h-full flex items-center justify-center">
                        <div
                            ref={remoteVideoRef}
                            className="relative bg-black rounded-md shadow-inner"
                            style={{
                                width: '100%',
                                maxWidth: '960px', // Responsive maximum width
                                aspectRatio: '16 / 9', // Maintain 16:9 ratio
                            }}
                        >
                            {!remoteParticipantIdentity && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium">
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
                {/* && remoteParticipantIdentity */}
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
