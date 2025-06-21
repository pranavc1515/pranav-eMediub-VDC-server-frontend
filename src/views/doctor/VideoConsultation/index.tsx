import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { HiVideoCamera, HiDownload, HiPlus } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import VideoCallInterface from '@/views/Interface/VideoCallInterface'
import ReactMuiTableListView, { Column } from '@/components/shared/ReactMuiTableListView'
import useConsultation from '@/hooks/useConsultation'
import { useSessionUser } from '@/store/authStore'
import { usePrescriptionStore } from '@/store/prescriptionStore'
import type { ConsultationRecord } from '@/services/ConsultationService'

interface ConsultationWithPatient extends Omit<ConsultationRecord, 'patientId' | 'status'> {
    patient: {
        name: string
        email: string
        phone: string
    }
    patientId: number
    scheduledDate: string
    startTime: string
    status: 'ongoing' | 'completed' | 'cancelled'
}

type TableData = Record<string, unknown> & ConsultationWithPatient

// List view component
const PatientQueueList = () => {
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const { setPrescriptionDetails } = usePrescriptionStore()
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

    const handleAddPrescription = (consultationId: string, patientId: number) => {
        setPrescriptionDetails(consultationId, patientId.toString())
        navigate('/doctor/upload-prescription')
    }

    // Separate ongoing and completed consultations
    const ongoingConsultations = (consultationHistory as unknown as ConsultationWithPatient[]).filter(
        (consultation) => consultation.status === 'ongoing',
    )
    const completedConsultations = (consultationHistory as unknown as ConsultationWithPatient[]).filter(
        (consultation) => consultation.status === 'completed',
    )

    const columns: Column<Record<string, unknown>>[] = [
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
            accessor: (row) => (row as TableData).patient?.name || '',
            Cell: ({
                row: { original },
            }) => {
                const data = original as TableData
                return (
                    <div>
                        <div>{data.patient?.name ?? 'Unknown'}</div>
                        <div className="text-sm text-gray-500">
                            {data.patient?.email ?? 'No email'}
                        </div>
                    </div>
                )
            },
        },
        {
            Header: 'Date & Time',
            accessor: (row) => (row as TableData).scheduledDate,
            Cell: ({
                row: { original },
            }) => {
                const data = original as TableData
                return (
                    <div>
                        <div>{data.scheduledDate}</div>
                        <div className="text-sm text-gray-500">
                            {data.startTime}
                        </div>
                    </div>
                )
            },
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({
                row: { original },
            }) => {
                const data = original as TableData
                return (
                    <div className="flex gap-2 justify-center">
                        {data.prescription ? (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<HiDownload />}
                                    onClick={() =>
                                        handleDownloadPrescription(
                                            data.prescription as string,
                                        )
                                    }
                                >
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={() =>
                                        window.open(data.prescription as string, '_blank')
                                    }
                                >
                                    View
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center ">
                                <span className="text-gray-500 text-sm"></span>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<HiPlus />}
                                    onClick={() =>
                                        handleAddPrescription(data.id as string, data.patientId as number)
                                    }
                                >
                                    Add Now
                                </Button>
                            </div>
                        )}
                    </div>
                )
            },
        },
    ]

    const cardTemplate = (consultation: TableData) => (
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
                onClick={() => handleJoinCall(consultation.patientId as number)}
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
            {ongoingConsultations.length > 0 && (
                <div className="mb-8">
                    <ReactMuiTableListView
                        tableTitle="On going call"
                        data={ongoingConsultations as unknown as Record<string, unknown>[]}
                        columns={columns}
                        cardTemplate={cardTemplate}
                        viewTypeProp="card"
                        enableTableListview={false}
                        enableCardView={true}
                        enablePagination={false}
                        enableSearch={false}
                    />
                </div>
            )}

            {/* Completed Consultations as List */}
            <div className="mb-6">
                {/* <h2 className="text-xl font-bold mb-4">Consultation History</h2> */}
                <ReactMuiTableListView
                    tableTitle="Consultation History"
                    columns={columns}
                    data={completedConsultations as unknown as Record<string, unknown>[]}
                    enablePagination={true}
                    enableSearch={false}
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
