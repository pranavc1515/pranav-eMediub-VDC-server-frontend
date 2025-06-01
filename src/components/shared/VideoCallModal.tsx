import { useState, useEffect } from 'react'
import VideoCallInterface from '@/views/Interface/VideoCallInterface'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { Dialog } from '@/components/ui'

interface VideoCallModalProps {
    children?: React.ReactNode
}

const VideoCallModal = ({ children }: VideoCallModalProps) => {
    const { isCallActive, currentRoomName, endCall } = useVideoCall()
    const [isOpen, setIsOpen] = useState(false)

    // Open modal when call becomes active
    useEffect(() => {
        if (isCallActive && currentRoomName) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [isCallActive, currentRoomName])

    const handleCallEnd = async () => {
        await endCall()
        setIsOpen(false)
    }

    return (
        <Dialog
            isOpen={isOpen}
            className="p-0 max-w-4xl w-full h-[80vh] overflow-hidden"
            onClose={() => {}} // Prevent closing by escape key or outside click
            onRequestClose={() => {}} // Prevent closing by escape key or outside click
        >
            {/* {currentRoomName && (
                <VideoCallInterface
                    roomName={currentRoomName}
                    onCallEnd={handleCallEnd}
                >
                    {children}
                </VideoCallInterface>
            )} */}
        </Dialog>
    )
}

export default VideoCallModal
