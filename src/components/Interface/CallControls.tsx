import {
    HiMicrophone,
    HiVideoCamera,
    HiPhone,
    HiVideoCameraSlash,
} from 'react-icons/hi2'

interface CallControlsProps {
    isMicOn: boolean
    isVideoOn: boolean
    isConnecting: boolean
    onToggleMic: () => void
    onToggleVideo: () => void
    onEndCall: () => void
}

const CallControls = ({
    isMicOn,
    isVideoOn,
    isConnecting,
    onToggleMic,
    onToggleVideo,
    onEndCall,
}: CallControlsProps) => {
    return (
        <div className="h-20 bg-gray-800 flex items-center justify-center gap-6 px-6 shadow-inner border-t border-gray-700">
            {/* Mic toggle */}
            <button
                aria-label={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                onClick={onToggleMic}
                disabled={isConnecting}
                className={`
                    relative rounded-full p-4 transition-colors duration-200
                    ${isMicOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
                <HiMicrophone className="text-2xl text-white" />
            </button>

            {/* Video toggle */}
            <button
                aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                onClick={onToggleVideo}
                disabled={isConnecting}
                className={`
                    relative rounded-full p-4 transition-colors duration-200
                    ${isVideoOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
                {isVideoOn ? (
                    <HiVideoCamera className="text-2xl text-white" />
                ) : (
                    <HiVideoCameraSlash className="text-2xl text-white" />
                )}
            </button>

            {/* End call */}
            <button
                aria-label="End call"
                onClick={onEndCall}
                disabled={isConnecting}
                className="
                    relative rounded-full p-4 bg-red-700 hover:bg-red-800 focus:outline-none
                    focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="End call"
            >
                <HiPhone className="text-2xl text-white rotate-[135deg]" />
                <span className="sr-only">End Call</span>
            </button>
        </div>
    )
}

export default CallControls 