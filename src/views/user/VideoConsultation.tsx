import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiVideoCamera } from 'react-icons/hi'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const VideoConsultation = () => {
    const navigate = useNavigate()
    const [upcomingCalls] = useState([
        {
            id: 1,
            doctorName: 'Dr. John Doe',
            specialization: 'Cardiologist',
            date: '2024-03-25',
            time: '10:00 AM',
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/abc-defg-hij'
        },
        {
            id: 2,
            doctorName: 'Dr. Jane Smith',
            specialization: 'Pediatrician',
            date: '2024-03-26',
            time: '2:30 PM',
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/xyz-uvwx-yz'
        }
    ])

    const handleJoinCall = (id: number) => {
        navigate(`/user/video-consultation/${id}`)
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Video Consultations History</h1>
                <p className="text-gray-500">Your scheduled video consultations with doctors</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCalls.map((call) => (
                    <Card key={call.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{call.doctorName}</h3>
                                <p className="text-sm text-gray-500">{call.specialization}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{format(new Date(call.date), 'MMM dd, yyyy')}</p>
                                <p className="text-sm text-gray-500">{call.time}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                call.status === 'scheduled' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => handleJoinCall(call.id)}
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

export default VideoConsultation 