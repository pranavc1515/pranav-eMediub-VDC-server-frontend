import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import VideoCallButton from './VideoCallButton'
import VideoService from '@/services/VideoService'
import { useAuth } from '@/auth'
import { useVideoCall } from '@/contexts/VideoCallContext'

interface Room {
    sid: string
    uniqueName: string
    status: string
    dateCreated: string
}

const VideoChatDemo = () => {
    const [activeRooms, setActiveRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const { acceptCall } = useVideoCall()
    
    const isDoctor = user.authority?.includes('doctor') || false
    
    // Fetch active rooms
    const fetchActiveRooms = async () => {
        setLoading(true)
        try {
            const response = await VideoService.listRooms('in-progress')
            setActiveRooms(response.rooms)
        } catch (error) {
            console.error('Failed to fetch rooms:', error)
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchActiveRooms()
        
        // Refresh rooms every 10 seconds
        const interval = setInterval(fetchActiveRooms, 10000)
        return () => clearInterval(interval)
    }, [])
    
    // Extract user type and ID from room name
    // Format: call_doctorId_patientId
    const extractRoomInfo = (roomName: string) => {
        try {
            const parts = roomName.split('_')
            if (parts.length === 3 && parts[0] === 'call') {
                return {
                    doctorId: parts[1],
                    patientId: parts[2]
                }
            }
        } catch (e) {
            console.error('Invalid room name format:', roomName)
        }
        return null
    }
    
    // Check if this room is meant for the current user
    const isRoomForCurrentUser = (roomName: string) => {
        const info = extractRoomInfo(roomName)
        if (!info) return false
        
        const userId = user.id || 'unknown'
        
        if (isDoctor) {
            return info.doctorId === userId
        } else {
            return info.patientId === userId
        }
    }
    
    // Join an existing call
    const joinCall = (roomName: string) => {
        acceptCall(roomName)
    }
    
    return (
        <Card className="mt-4">
            <div className="p-4">
                <h4 className="mb-4">Video Chat Demo</h4>
                
                <div className="mb-4">
                    <p className="text-sm mb-1">You are logged in as:</p>
                    <div className="font-semibold">
                        {isDoctor ? 'Doctor' : 'Patient'} (ID: {user.id || 'unknown'})
                    </div>
                </div>
                
                {/* Start a new call */}
                <div className="mb-6 border-b pb-4">
                    <h6 className="mb-2">Start a new call</h6>
                    <div className="flex items-center gap-4">
                        <input 
                            type="text" 
                            placeholder="Recipient ID" 
                            className="input input-sm"
                            id="recipientId"
                        />
                        <VideoCallButton 
                            recipientId="demo-recipient-id" 
                            size="sm"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Enter the {isDoctor ? 'patient' : 'doctor'}'s ID to start a call
                    </p>
                </div>
                
                {/* Active calls */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h6>Active calls</h6>
                        <Button 
                            size="xs" 
                            onClick={fetchActiveRooms}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                    
                    {activeRooms.length === 0 ? (
                        <p className="text-sm text-gray-500">No active calls</p>
                    ) : (
                        <div className="space-y-2">
                            {activeRooms.map(room => (
                                <div 
                                    key={room.sid} 
                                    className="p-3 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium">{room.uniqueName}</p>
                                        <p className="text-xs text-gray-500">
                                            Created: {new Date(room.dateCreated).toLocaleString()}
                                        </p>
                                    </div>
                                    {isRoomForCurrentUser(room.uniqueName) && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => joinCall(room.uniqueName)}
                                        >
                                            Join Call
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default VideoChatDemo 