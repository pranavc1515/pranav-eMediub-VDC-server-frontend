import { useState } from 'react'
import { HiVideoCamera } from 'react-icons/hi2'
import { Button, Spinner } from '@/components/ui'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { useAuth } from '@/auth'

interface VideoCallButtonProps {
    recipientId: string
    className?: string
    variant?: 'solid' | 'twoTone' | 'plain' | 'default'
    size?: 'xs' | 'sm' | 'md' | 'lg'
}

const VideoCallButton = ({ 
    recipientId, 
    className = '',
    variant = 'solid',
    size = 'md'
}: VideoCallButtonProps) => {
    const { initiateCall, isLoading } = useVideoCall()
    const { user } = useAuth()
    const [localLoading, setLocalLoading] = useState(false)

    const handleCall = async () => {
        if (isLoading || localLoading) return

        setLocalLoading(true)
        
        try {
            // Create a unique room name using caller and recipient IDs
            // Format: call_{doctor-id}_{patient-id}
            const isDoctor = user.authority?.includes('doctor') || false
            const callerId = user.id || 'unknown'
            
            // Generate a room name based on who is calling who
            let roomName = 'call_'
            if (isDoctor) {
                roomName += `${callerId}_${recipientId}`
            } else {
                roomName += `${recipientId}_${callerId}`
            }
            
            // Initiate the call
            await initiateCall(roomName)
        } catch (error) {
            console.error('Error initiating call:', error)
        } finally {
            setLocalLoading(false)
        }
    }
    
    return (
        <Button
            variant={variant}
            size={size}
            className={`flex items-center justify-center ${className}`}
            icon={<HiVideoCamera />}
            onClick={handleCall}
            disabled={isLoading || localLoading}
        >
            {isLoading || localLoading ? (
                <>
                    <Spinner size={20} className="mr-2" />
                    Connecting...
                </>
            ) : (
                'Video Call'
            )}
        </Button>
    )
}

export default VideoCallButton 