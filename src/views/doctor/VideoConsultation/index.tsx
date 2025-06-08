import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { HiVideoCamera, HiDownload } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import VideoCallInterface from '@/views/Interface/VideoCallInterface'
import ReactMuiTableListView, {
    Column,
} from '@/components/shared/ReactMuiTableListView'
import useConsultation from '@/hooks/useConsultation'
// import { useAuth } from '@/hooks/useAuth'
import { useSessionUser } from '@/store/authStore'
import type { ConsultationRecord } from '@/services/ConsultationService'
import { Console } from 'console'

interface TableRowData extends ConsultationRecord {
    patient?: {
        firstName: string
        lastName: string
        email: string
    }
}

interface TableColumn {
    Header: string
    accessor: string
    Cell?: (
        props: { row: { original: TableRowData } } | { value: string },
    ) => JSX.Element
}

interface ConsultationWithPatient extends ConsultationRecord {
    patient: {
        name: string
        email: string
        phone: string
    }
    prescription?: string
    patientId: number
    scheduledDate: string
    startTime: string
    status: string
}

// List view component
const PatientQueueList = () => {
    const navigate = useNavigate()
    // const { session } = useAuth()
    const user = useSessionUser((state) => state.user)
    console.log('user', user)
    const doctorId = user?.userId ? Number(user.userId) : 0
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [searchTerm, setSearchTerm] = useState('')

    const { consultationHistory, pagination, isLoading, getDoctorHistory } =
        useConsultation({ doctorId })

    useEffect(() => {
        if (doctorId) {
            getDoctorHistory(currentPage, pageSize)
        }
    }, [getDoctorHistory, currentPage, pageSize, doctorId])

    const [patientQueue] = useState([
        {
            id: 1,
            name: 'Ajit',
            age: 45,
            gender: 'Male',
            appointmentTime: '10:00 AM',
            reason: '',
            status: 'in call',
        },
    ])

    const handleJoinCall = (id: number) => {
        navigate(`/doctor/video-consultation/${id}`)
    }

    const handleDownloadPrescription = (prescriptionUrl: string) => {
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = prescriptionUrl
        // Extract filename from URL or use a default name
        const fileName = prescriptionUrl.split('/').pop() || 'prescription.png'
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Separate ongoing and completed consultations
    const ongoingConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'ongoing',
    )
    const completedConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'completed',
    )

    const columns = [
        {
            Header: 'Consultation ID',
            accessor: 'id',
        },
        {
            Header: 'Patient ID',
            accessor: 'patientId',
        },
        {
            Header: 'Patient',
            accessor: (row: ConsultationWithPatient) => row.patient?.name || '',
            Cell: ({
                row: { original },
            }: {
                row: { original: ConsultationWithPatient }
            }) => (
                <div>
                    <div>{original.patient?.name ?? 'Unknown'}</div>
                    <div className="text-sm text-gray-500">
                        {original.patient?.email ?? 'No email'}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Date & Time',
            accessor: (row: ConsultationWithPatient) => row.scheduledDate,
            Cell: ({
                row: { original },
            }: {
                row: { original: ConsultationWithPatient }
            }) => (
                <div>
                    <div>{original.scheduledDate}</div>
                    <div className="text-sm text-gray-500">
                        {original.startTime}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({
                row: { original },
            }: {
                row: { original: ConsultationWithPatient }
            }) => (
                <div className="flex gap-2 justify-center">
                    {original.prescription ? (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<HiDownload />}
                                onClick={() =>
                                    handleDownloadPrescription(
                                        original.prescription,
                                    )
                                }
                            >
                                Download
                            </Button>
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() =>
                                    window.open(original.prescription, '_blank')
                                }
                            >
                                View
                            </Button>
                        </div>
                    ) : (
                        <span className="text-gray-500">
                            No prescription added
                        </span>
                    )}
                </div>
            ),
        },
    ]

    const cardTemplate = (consultation: ConsultationWithPatient) => (
        <Card className="p-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold">
                        {consultation.patient?.name || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {consultation.patient?.email || 'No email'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">
                        {consultation.scheduledDate}
                    </p>
                    <p className="text-sm text-gray-500">
                        {consultation.startTime}
                    </p>
                </div>
            </div>
            <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ongoing
                </span>
            </div>
            <Button
                size="sm"
                variant="solid"
                className="w-full flex items-center justify-center gap-2"
                icon={<HiVideoCamera />}
                onClick={() => handleJoinCall(consultation.patientId)}
            >
                Join Call
            </Button>
        </Card>
    )

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Video Consultations</h1>
                <p className="text-gray-500">All your consultations</p>
            </div>

            {/* Ongoing Consultations as Cards */}
            <div className="mb-8">
                <ReactMuiTableListView
                    tableTitle="Active Consultations"
                    data={ongoingConsultations}
                    columns={columns}
                    cardTemplate={cardTemplate}
                    viewTypeProp="card"
                    enableTableListview={false}
                    enableCardView={true}
                    enablePagination={false}
                    enableSearch={false}
                />
            </div>

            {/* Completed Consultations as List */}
            <div className="mb-6">
                {/* <h2 className="text-xl font-bold mb-4">Consultation History</h2> */}
                <ReactMuiTableListView
                    tableTitle="Consultation History"
                    columns={columns}
                    data={completedConsultations}
                    enablePagination={true}
                    enableSearch={true}
                    enableCardView={false}
                    totalItems={pagination.totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    loading={isLoading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    viewTypeProp="table"
                />
            </div>
        </div>
    )
}

// Main component
const VideoConsultation = () => {
    const { pathname } = window.location
    const isVideoCall = pathname.includes('/video-consultation/') // Check if we're in a video call

    if (isVideoCall) {
        return <VideoCallInterface />
    }

    return <PatientQueueList />
}

export default VideoConsultation
