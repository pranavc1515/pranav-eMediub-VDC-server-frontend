import { useState } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Tag, 
    Badge, 
    Tabs,
    Input
} from '@/components/ui'
import Container from '@/components/shared/Container'

interface Patient {
    id: number
    name: string
    age: number
    gender: string
    appointmentTime: string
    reason: string
    waitTime: number
    status: 'waiting' | 'in-progress' | 'completed' | 'cancelled'
}

interface ChatMessage {
    id: number
    sender: 'doctor' | 'patient'
    text: string
    timestamp: string
}

const VideoConsultation = () => {
    const [activeTab, setActiveTab] = useState('queue')
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [activeChatTab, setActiveChatTab] = useState('chat')
    const [message, setMessage] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: 'patient',
            text: 'Hello doctor, I'm here for my appointment.',
            timestamp: '10:01 AM'
        },
        {
            id: 2,
            sender: 'doctor',
            text: 'Hello! I'll be with you in just a moment. How are you feeling today?',
            timestamp: '10:02 AM'
        },
        {
            id: 3,
            sender: 'patient',
            text: 'I've been experiencing headaches for the past week, mainly in the afternoons.',
            timestamp: '10:03 AM'
        }
    ])

    // Mock patient queue data
    const patientQueue: Patient[] = [
        {
            id: 1,
            name: 'John Smith',
            age: 45,
            gender: 'Male',
            appointmentTime: '10:00 AM',
            reason: 'Follow-up on blood pressure medication',
            waitTime: 5,
            status: 'in-progress'
        },
        {
            id: 2,
            name: 'Anna Johnson',
            age: 35,
            gender: 'Female',
            appointmentTime: '10:30 AM',
            reason: 'Migraine consultation',
            waitTime: 0,
            status: 'waiting'
        },
        {
            id: 3,
            name: 'Michael Brown',
            age: 60,
            gender: 'Male',
            appointmentTime: '11:00 AM',
            reason: 'Diabetes management review',
            waitTime: 0,
            status: 'waiting'
        },
        {
            id: 4,
            name: 'Sarah Williams',
            age: 28,
            gender: 'Female',
            appointmentTime: '11:30 AM',
            reason: 'Anxiety follow-up',
            waitTime: 0,
            status: 'waiting'
        }
    ]

    const handleSendMessage = () => {
        if (message.trim() === '') return

        const newMessage: ChatMessage = {
            id: chatMessages.length + 1,
            sender: 'doctor',
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setChatMessages([...chatMessages, newMessage])
        setMessage('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleEndSession = () => {
        setIsSessionActive(false)
        // In a real app, you would also end the video call connection
    }

    const handleStartSession = () => {
        setIsSessionActive(true)
        // In a real app, you would also initiate the video call connection
    }

    const handleToggleCamera = () => {
        setIsCameraOn(!isCameraOn)
        // In a real app, you would also toggle the camera stream
    }

    const handleToggleMic = () => {
        setIsMicOn(!isMicOn)
        // In a real app, you would also toggle the microphone stream
    }

    const handleToggleScreenShare = () => {
        setIsScreenSharing(!isScreenSharing)
        // In a real app, you would also toggle screen sharing
    }

    return (
        <Container className="h-full">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3>Video Consultation</h3>
                    <div className="flex space-x-2">
                        <Button 
                            color={isSessionActive ? 'red' : 'emerald'} 
                            variant="solid"
                            onClick={isSessionActive ? handleEndSession : handleStartSession}
                        >
                            {isSessionActive ? 'End Session' : 'Start Session'}
                        </Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                    <div className="lg:col-span-3">
                        <Card className="h-full flex flex-col">
                            <div className="p-4 flex-grow">
                                {isSessionActive ? (
                                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                                        {/* This would be replaced with actual video feeds */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <div className="mb-2">
                                                    <Avatar shape="circle" size={80} />
                                                </div>
                                                <h4 className="text-white">John Smith</h4>
                                                <p className="text-gray-400">Connected</p>
                                            </div>
                                        </div>
                                        
                                        {/* Doctor's video (self view) */}
                                        <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg border-2 border-white shadow-lg">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <div className="mb-1">
                                                        <Avatar shape="circle" size={30} />
                                                    </div>
                                                    <p className="text-xs">You</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                        <div className="text-center">
                                            <h4 className="text-gray-500 mb-3">No Active Session</h4>
                                            <p className="text-gray-400 mb-4">
                                                Start a session with a patient from the queue to begin a video consultation
                                            </p>
                                            <Button 
                                                variant="solid" 
                                                onClick={handleStartSession}
                                            >
                                                Start Session with Next Patient
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex justify-center space-x-4">
                                    <Button 
                                        icon={isMicOn ? 'mic' : 'mic-off'} 
                                        variant={isMicOn ? 'default' : 'solid'} 
                                        onClick={handleToggleMic}
                                    >
                                        {isMicOn ? 'Mute' : 'Unmute'}
                                    </Button>
                                    <Button 
                                        icon={isCameraOn ? 'video' : 'video-off'} 
                                        variant={isCameraOn ? 'default' : 'solid'}
                                        onClick={handleToggleCamera}
                                    >
                                        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                                    </Button>
                                    <Button 
                                        icon="monitor" 
                                        variant={isScreenSharing ? 'solid' : 'default'}
                                        onClick={handleToggleScreenShare}
                                    >
                                        {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                                    </Button>
                                    <Button 
                                        icon="phone-off" 
                                        variant="solid" 
                                        color="red"
                                        onClick={handleEndSession}
                                        disabled={!isSessionActive}
                                    >
                                        End Call
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <Card className="h-full flex flex-col">
                            <div className="flex-grow">
                                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                                    <Tabs.TabList>
                                        <Tabs.TabNav value="queue">Patient Queue</Tabs.TabNav>
                                        <Tabs.TabNav value="communication">Chat</Tabs.TabNav>
                                        <Tabs.TabNav value="notes">Notes</Tabs.TabNav>
                                    </Tabs.TabList>
                                    <div className="p-4">
                                        {activeTab === 'queue' && (
                                            <div className="space-y-3">
                                                {patientQueue.map(patient => (
                                                    <div 
                                                        key={patient.id} 
                                                        className={`border rounded-lg p-3 ${
                                                            patient.status === 'in-progress' ? 'border-blue-300 bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex justify-between">
                                                            <div className="flex items-center">
                                                                <Avatar shape="circle" size={35} />
                                                                <div className="ml-2">
                                                                    <div className="font-medium">{patient.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {patient.age} yrs, {patient.gender}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Tag className={
                                                                patient.status === 'waiting' ? 'bg-amber-100 text-amber-600' :
                                                                patient.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                                                patient.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-red-100 text-red-600'
                                                            }>
                                                                {patient.status === 'waiting' ? 'Waiting' :
                                                                 patient.status === 'in-progress' ? 'In Progress' :
                                                                 patient.status === 'completed' ? 'Completed' :
                                                                 'Cancelled'}
                                                            </Tag>
                                                        </div>
                                                        
                                                        <div className="mt-2 text-sm">
                                                            <div><span className="text-gray-500">Time:</span> {patient.appointmentTime}</div>
                                                            <div><span className="text-gray-500">Reason:</span> {patient.reason}</div>
                                                            {patient.status === 'waiting' && (
                                                                <div className="mt-2">
                                                                    {patient.waitTime > 0 ? (
                                                                        <span className="text-amber-600">
                                                                            Waiting for {patient.waitTime} min
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-emerald-600">On time</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {patient.status === 'waiting' && (
                                                            <div className="mt-3">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="solid"
                                                                    block
                                                                >
                                                                    Start Consultation
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {activeTab === 'communication' && (
                                            <div className="h-full flex flex-col">
                                                <Tabs value={activeChatTab} onChange={(val) => setActiveChatTab(val)}>
                                                    <Tabs.TabList>
                                                        <Tabs.TabNav value="chat">Chat</Tabs.TabNav>
                                                        <Tabs.TabNav value="history">History</Tabs.TabNav>
                                                    </Tabs.TabList>
                                                </Tabs>
                                                
                                                <div className="flex-grow overflow-y-auto mt-4 pr-2" style={{ maxHeight: '400px' }}>
                                                    {chatMessages.map(msg => (
                                                        <div 
                                                            key={msg.id} 
                                                            className={`mb-3 flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-[80%] rounded-lg p-3 ${
                                                                msg.sender === 'doctor' 
                                                                    ? 'bg-blue-100 text-blue-900' 
                                                                    : 'bg-gray-100 text-gray-900'
                                                            }`}>
                                                                <div>{msg.text}</div>
                                                                <div className="text-xs mt-1 text-right opacity-70">
                                                                    {msg.timestamp}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="mt-4 border-t pt-4">
                                                    <div className="flex">
                                                        <Input 
                                                            textArea
                                                            placeholder="Type your message..."
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                        <Button 
                                                            className="ml-2" 
                                                            variant="solid"
                                                            disabled={!message.trim()}
                                                            onClick={handleSendMessage}
                                                        >
                                                            Send
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeTab === 'notes' && (
                                            <div>
                                                <Input 
                                                    textArea
                                                    placeholder="Add notes about this consultation..."
                                                    style={{ minHeight: '200px' }}
                                                />
                                                <div className="mt-3 flex justify-end">
                                                    <Button variant="solid">Save Notes</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Tabs>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default VideoConsultation 