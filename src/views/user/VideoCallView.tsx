import { useState } from 'react'
import VideoCallInterface from '@/components/shared/VideoCallInterface'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import { format } from 'date-fns'
import { HiCalendar, HiChat, HiDocumentText } from 'react-icons/hi'

const { TabNav, TabList, TabContent } = Tabs

const UpcomingConsultations = () => {
    const consultations = [
        {
            id: 1,
            doctorName: 'Dr. Sarah Wilson',
            specialization: 'Neurologist',
            date: '2024-03-28',
            time: '11:30 AM',
        },
        {
            id: 2,
            doctorName: 'Dr. Michael Brown',
            specialization: 'Dermatologist',
            date: '2024-03-30',
            time: '2:00 PM',
        },
    ]

    return (
        <div className="p-4">
            {consultations.map((consultation) => (
                <Card key={consultation.id} className="mb-4 p-4">
                    <h4 className="font-semibold">{consultation.doctorName}</h4>
                    <p className="text-sm text-gray-500">
                        {consultation.specialization}
                    </p>
                    <div className="mt-2 text-sm">
                        <p>
                            {format(
                                new Date(consultation.date),
                                'MMM dd, yyyy',
                            )}
                        </p>
                        <p>{consultation.time}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}

const ChatSection = () => {
    const [messages] = useState([
        {
            id: 1,
            sender: 'Dr. John Doe',
            message: 'How are you feeling today?',
            time: '10:30 AM',
        },
        {
            id: 2,
            sender: 'You',
            message: 'Much better, thank you.',
            time: '10:31 AM',
        },
    ])

    return (
        <div className="p-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`mb-4 ${message.sender === 'You' ? 'text-right' : ''}`}
                >
                    <p className="text-sm text-gray-500">{message.sender}</p>
                    <div
                        className={`inline-block p-3 rounded-lg ${
                            message.sender === 'You'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                        {message.message}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
            ))}
        </div>
    )
}

const VideoCallView = () => {
    return (
        <VideoCallInterface>
            <Tabs defaultValue="upcoming">
                <TabList>
                    <TabNav value="chat" icon={<HiChat />}>
                        Chat
                    </TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="upcoming">
                        <UpcomingConsultations />
                    </TabContent>
                    <TabContent value="chat">
                        <ChatSection />
                    </TabContent>
                </div>
            </Tabs>
        </VideoCallInterface>
    )
}

export default VideoCallView
