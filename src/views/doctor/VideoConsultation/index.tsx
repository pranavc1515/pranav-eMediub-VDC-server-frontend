import { useState } from 'react'
import { Card, Button, Tabs, Input } from '@/components/ui'
import { HiVideoCamera, HiCalendar, HiChat, HiDocumentText } from 'react-icons/hi'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import VideoCallInterface from '@/components/shared/VideoCallInterface'

const { TabNav, TabList, TabContent } = Tabs

// List view component
const PatientQueueList = () => {
    const navigate = useNavigate()
    const [patientQueue] = useState([
        {
            id: 1,
            name: 'Ajit',
            age: 45,
            gender: 'Male',
            appointmentTime: '10:00 AM',
            reason: '',
            status: 'waiting in lobby'
        },
        
    ])

    const handleJoinCall = (id: number) => {
        navigate(`/doctor/video-consultation/${id}`)
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Patient Queue</h1>
                <p className="text-gray-500">Patients waiting for video consultation</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientQueue.map((patient) => (
                    <Card key={patient.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{patient.name}</h3>
                                <p className="text-sm text-gray-500">{patient.age} years, {patient.gender}</p>
                            </div>
                            
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">{patient.reason}</p>
                        </div>
                        <div className="mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.status === 'scheduled' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => handleJoinCall(patient.id)}
                        >
                            <HiVideoCamera />
                            <span>Join Call</span>
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// Video call view components
const UpcomingConsultations = () => {
    const consultations = [
        {
            id: 1,
            name: 'Sarah Williams',
            age: 28,
            appointmentTime: '11:30 AM',
            reason: 'Anxiety follow-up'
        },
        {
            id: 2,
            name: 'Michael Brown',
            age: 60,
            appointmentTime: '12:00 PM',
            reason: 'Diabetes management review'
        }
    ]

    return (
        <div className="p-4">
            {consultations.map(consultation => (
                <Card key={consultation.id} className="mb-4 p-4">
                    <h4 className="font-semibold">{consultation.name}</h4>
                    <p className="text-sm text-gray-500">{consultation.age} years</p>
                    <p className="text-sm mt-2">{consultation.reason}</p>
                    <p className="text-sm text-gray-500 mt-2">{consultation.appointmentTime}</p>
                </Card>
            ))}
        </div>
    )
}

const ChatSection = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Patient', message: 'Hello doctor, I\'m here for my appointment.', time: '10:30 AM' },
        { id: 2, sender: 'Doctor', message: 'Hello! How are you feeling today?', time: '10:31 AM' }
    ])
    const [newMessage, setNewMessage] = useState('')

    const handleSendMessage = () => {
        if (!newMessage.trim()) return

        const message = {
            id: messages.length + 1,
            sender: 'Doctor',
            message: newMessage,
            time: format(new Date(), 'hh:mm a')
        }

        setMessages([...messages, message])
        setNewMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map(message => (
                    <div key={message.id} className={`mb-4 ${message.sender === 'Doctor' ? 'text-right' : ''}`}>
                        <p className="text-sm text-gray-500">{message.sender}</p>
                        <div className={`inline-block p-3 rounded-lg ${
                            message.sender === 'Doctor' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                            {message.message}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t dark:border-gray-700">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    suffix={
                        <Button size="sm" onClick={handleSendMessage}>
                            Send
                        </Button>
                    }
                />
            </div>
        </div>
    )
}

const NotesSection = () => {
    const [notes] = useState([
        {
            id: 1,
            title: 'Patient History',
            content: 'Previous visits: Hypertension, prescribed Amlodipine 5mg',
            date: '2024-03-25'
        }
    ])

    return (
        <div className="p-4">
            {notes.map(note => (
                <Card key={note.id} className="mb-4 p-4">
                    <h4 className="font-semibold">{note.title}</h4>
                    <p className="text-sm mt-2">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(note.date), 'MMM dd, yyyy')}
                    </p>
                </Card>
            ))}
        </div>
    )
}

// Main component
const VideoConsultation = () => {
    const { pathname } = window.location
    const isVideoCall = pathname.includes('/video-consultation/') // Check if we're in a video call

    if (isVideoCall) {
        return (
            <VideoCallInterface>
                
            </VideoCallInterface>
        )
    }

    return <PatientQueueList />
}

export default VideoConsultation 