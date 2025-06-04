import { useState, useEffect } from 'react'
import { Card, Button, Tabs, Input } from '@/components/ui'
import {
    HiVideoCamera,
    HiCalendar,
    HiChat,
    HiDocumentText,
} from 'react-icons/hi'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import VideoCallInterface from '@/views/Interface/VideoCallInterface'

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
            status: 'waiting in lobby',
        },
    ])

    const [consultations, setConsultations] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch consultation history
    useEffect(() => {
        const fetchConsultations = async () => {
            setLoading(true)
            try {
                const response = await fetch(
                    'http://localhost:3000/api/consultation/doctor?doctorId=69&page=1&limit=10&status=completed&consultationType=video&sortBy=scheduledDate&sortOrder=DESC',
                    {
                        headers: {
                            accept: 'application/json',
                            Authorization:
                                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjksInBob25lTnVtYmVyIjoiKzkxODgwNTA0Nzk2OCIsInR5cGUiOiJkb2N0b3IiLCJpYXQiOjE3NDkwNjU1NDcsImV4cCI6MTc0OTE1MTk0N30.M0HfCowbVaqUifaZr2c2MK0HhpX5qoRj87PIdsx_Sis',
                        },
                    },
                )
                const data = await response.json()
                if (data.success && data.data && data.data.consultations) {
                    setConsultations(data.data.consultations)
                }
            } catch (error) {
                console.error('Error fetching consultations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchConsultations()
    }, [])

    const handleJoinCall = (id: number) => {
        navigate(`/doctor/video-consultation/${id}`)
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Patient Queue</h1>
                <p className="text-gray-500">
                    Patients waiting for video consultation
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {patientQueue.map((patient) => (
                    <Card key={patient.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {patient.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {patient.age} years, {patient.gender}
                                </p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                {patient.reason}
                            </p>
                        </div>
                        <div className="mb-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    patient.status === 'scheduled'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {patient.status.charAt(0).toUpperCase() +
                                    patient.status.slice(1)}
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

            {/* Consultation History Section */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Consultation History</h2>
                {loading ? (
                    <div className="text-center py-4">
                        Loading consultation history...
                    </div>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Symptoms
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Diagnosis
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {consultations.length > 0 ? (
                                        consultations.map((consultation) => (
                                            <tr key={consultation.id}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {consultation
                                                                .patient
                                                                ?.fullName ||
                                                                'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                consultation
                                                                    .patient
                                                                    ?.age
                                                            }{' '}
                                                            years,{' '}
                                                            {
                                                                consultation
                                                                    .patient
                                                                    ?.gender
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div>
                                                            {
                                                                consultation.scheduledDate
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                consultation.startTime
                                                            }{' '}
                                                            -{' '}
                                                            {
                                                                consultation.endTime
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {
                                                            consultation.consultationType
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            consultation.status ===
                                                            'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : consultation.status ===
                                                                    'scheduled'
                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {consultation.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs truncate">
                                                        {consultation.symptoms ||
                                                            'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs truncate">
                                                        {consultation.diagnosis ||
                                                            'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-4 text-center text-gray-500"
                                            >
                                                No consultation history found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
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
            reason: 'Anxiety follow-up',
        },
        {
            id: 2,
            name: 'Michael Brown',
            age: 60,
            appointmentTime: '12:00 PM',
            reason: 'Diabetes management review',
        },
    ]

    return (
        <div className="p-4">
            {consultations.map((consultation) => (
                <Card key={consultation.id} className="mb-4 p-4">
                    <h4 className="font-semibold">{consultation.name}</h4>
                    <p className="text-sm text-gray-500">
                        {consultation.age} years
                    </p>
                    <p className="text-sm mt-2">{consultation.reason}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {consultation.appointmentTime}
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
        return <VideoCallInterface></VideoCallInterface>
    }

    return <PatientQueueList />
}

export default VideoConsultation
