import { useState } from 'react'
import Button from '@/components/ui/Button'
import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiVideoCameraSlash,
    HiPresentationChartBar,
} from 'react-icons/hi2'

interface VideoCallInterfaceProps {
    children?: React.ReactNode
}

const VideoCallInterface = ({ children }: VideoCallInterfaceProps) => {
    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)

    const toggleMic = () => setIsMicOn(!isMicOn)
    const toggleVideo = () => setIsVideoOn(!isVideoOn)
    const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing)

    return (
        <div className="flex h-full">
            {/* Main video area */}
            <div className="flex-1 flex flex-col bg-gray-900">
                {/* Video display area */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Main video stream placeholder */}
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400">
                                Video stream will appear here
                            </span>
                        </div>
                    </div>
                    {/* Self video preview */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                                Your video
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video controls */}
                <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 px-4">
                    <Button
                        variant={isMicOn ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${!isMicOn ? 'bg-red-500' : ''}`}
                        onClick={toggleMic}
                    >
                        {isMicOn ? (
                            <HiMicrophone className="text-xl" />
                        ) : (
                            <HiMicrophone className="text-xl" />
                        )}
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
                        variant={isScreenSharing ? 'solid' : 'solid'}
                        className={`rounded-full p-4 ${isScreenSharing ? 'bg-green-500' : ''}`}
                        onClick={toggleScreenShare}
                    >
                        <HiPresentationChartBar className="text-xl" />
                    </Button>
                    <Button
                        variant="solid"
                        className="rounded-full p-4 bg-red-500"
                    >
                        <HiPhone className="text-xl rotate-[135deg]" />
                    </Button>
                </div>
            </div>

            {/* Right sidebar */}
            <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
                {children}
            </div>
        </div>
    )
}

export default VideoCallInterface
