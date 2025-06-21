import { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { HiVideoCamera, HiDownload } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import useConsultation from '@/hooks/useConsultation'
import { useSessionUser } from '@/store/authStore'
import ReactMuiTableListView, {
    Column,
} from '@/components/shared/ReactMuiTableListView'
import type { ConsultationRecord } from '@/services/ConsultationService'

type ConsultationWithDoctor = ConsultationRecord & {
    [key: string]: unknown
    doctor: {
        id: string
        fullName: string
        email: string
        profilePhoto: string
        isOnline: string
        DoctorProfessional: {
            specialization: string
            yearsOfExperience: number
        }
    }
}

const VideoConsultation = () => {
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const patientId = user?.userId ? Number(user.userId) : 0
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [searchTerm, setSearchTerm] = useState('')
    const [upcomingCalls] = useState([])

    const { consultationHistory, pagination, isLoading, getPatientHistory } =
        useConsultation({
            doctorId: 0, // Not needed for patient view
        })

    useEffect(() => {
        if (patientId) {
            getPatientHistory(patientId, currentPage, pageSize)
        }
    }, [getPatientHistory, currentPage, pageSize, patientId])

    // Separate ongoing and completed consultations
    const ongoingConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'ongoing',
    )
    const completedConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'completed',
    )

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // Reset to first page when changing page size
    }, [])

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset to first page when searching
    }, [])

    const handleJoinCall = (doctorId: number) => {
        navigate(`/user/video-consultation/${doctorId}`)
    }

    const handleDownloadPrescription = (consultationId: string) => {
        const consultation = consultationHistory.find(
            (c) => c.id === consultationId,
        )
        if (consultation?.prescription) {
            // Create a temporary link element
            const link = document.createElement('a')
            link.href = consultation.prescription
            // Extract filename from URL or use a default name
            const fileName =
                consultation.prescription.split('/').pop() || 'prescription.png'
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const columns = useMemo<Column<ConsultationWithDoctor>[]>(
        () => [
            {
                Header: 'Consultation ID',
                accessor: (row) => `${row.id}`,
            },
            {
                Header: 'Doctor',
                accessor: (row) => row.doctor?.fullName || '',
                Cell: ({ row: { original } }) => (
                    <div>
                        <div className="font-bold">
                            {original.doctor?.fullName || 'Unknown Doctor'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {original.doctor?.DoctorProfessional
                                ?.specialization || 'No specialization'}
                        </div>
                    </div>
                ),
            },
            {
                Header: 'Date & Time',
                accessor: (row) => row.scheduledDate,
                Cell: ({ row: { original } }) => (
                    <div>
                        <div>{original.scheduledDate}</div>
                        <div className="text-sm text-gray-500">
                            {original.startTime}
                        </div>
                    </div>
                ),
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ value }) => (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            value === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : value === 'ongoing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : value === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {String(value).charAt(0).toUpperCase() +
                            String(value).slice(1)}
                    </span>
                ),
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({ row: { original } }) => (
                    <div className="flex gap-2 justify-center">
                        {original.status === 'ongoing' && (
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<HiVideoCamera />}
                                onClick={() =>
                                    handleJoinCall(Number(original.doctor.id))
                                }
                            >
                                Join
                            </Button>
                        )}
                        {original.status === 'completed' &&
                        original.prescription ? (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<HiDownload />}
                                    onClick={() =>
                                        handleDownloadPrescription(
                                            original.id,
                                        )
                                    }
                                >
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={() =>
                                        window.open(
                                            original.prescription as string,
                                            '_blank',
                                        )
                                    }
                                >
                                    View
                                </Button>
                            </div>
                        ) : original.status === 'completed' ? (
                            <span className="text-gray-500">
                                No prescription added
                            </span>
                        ) : null}
                    </div>
                ),
            },
        ],
        [],
    )

    const cardTemplate = (consultation: ConsultationWithDoctor) => (
        <Card className="p-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold">
                        {consultation.doctor?.fullName || 'Unknown Doctor'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {consultation.doctor?.DoctorProfessional
                            ?.specialization || 'No specialization'}
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
                onClick={() => handleJoinCall(Number(consultation.doctor.id))}
            >
                Join Call
            </Button>
        </Card>
    )

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Video Consultations</h1>
                <p className="text-gray-500">
                    Your familiar video consultations with doctors
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {upcomingCalls.map((call) => (
                    <Card key={call.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {call.doctorName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {call.specialization}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">
                                    {new Date(call.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {call.time}
                                </p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    call.status === 'scheduled'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {call.status.charAt(0).toUpperCase() +
                                    call.status.slice(1)}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => handleJoinCall(call.doctorId)}
                        >
                            <HiVideoCamera />
                            <span>Join Call</span>
                        </Button>
                    </Card>
                ))}
            </div>

            {/* Ongoing Consultations as Cards */}
            {ongoingConsultations.length > 0 && (
                <div className="mb-8">
                    <ReactMuiTableListView
                        tableTitle="On going call"
                        data={ongoingConsultations as ConsultationWithDoctor[]}
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
                    data={completedConsultations as ConsultationWithDoctor[]}
                    enablePagination={true}
                    enableSearch={false}
                    enableCardView={false}
                    totalItems={pagination.totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    loading={isLoading}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    viewTypeProp="table"
                    rowsPerPageOptions={[10, 15, 25, 50]}
                />
            </div>
        </div>
    )
}

export default VideoConsultation
