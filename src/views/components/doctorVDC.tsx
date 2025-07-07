import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import usePatientQueue from '@/hooks/usePatientQueue'
import useConsultation from '@/hooks/useConsultation'
import VideoService from '@/services/VideoService'
import ConsultationService from '@/services/ConsultationService'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { usePrescriptionStore } from '@/store/prescriptionStore'
import ReactMuiTableListView, {
    Column,
} from '@/components/shared/ReactMuiTableListView'
import { HiVideoCamera, HiDownload, HiPlus } from 'react-icons/hi'
import type { ConsultationRecord } from '@/services/ConsultationService'
import type { PatientQueueEntry } from '@/services/PatientQueue'

interface QueueData extends PatientQueueEntry {
    roomName: string
    joinedAt: string
    patient: PatientQueueEntry['patient'] & {
        name: string
        phone?: string
        email?: string
        details?: {
            height?: number
            weight?: number
            diet?: string
            blood_group?: string | null
        }
    }
}

interface ConsultationWithPatient
    extends Omit<ConsultationRecord, 'patientId' | 'status'> {
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

function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>
    return function executedFunction(...args: Parameters<T>) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}

const DoctorVDC = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [consultationCurrentPage, setConsultationCurrentPage] = useState(1)
    const [consultationPageSize, setConsultationPageSize] = useState(15)
    const [consultationSearchTerm, setConsultationSearchTerm] = useState('')
    const [isAvailable, setIsAvailable] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [checkingStatus, setCheckingStatus] = useState(false)

    const navigate = useNavigate()
    const { socket } = useSocketContext()
    const user = useSessionUser((state) => state.user)
    const { setDoctorId, setPatientId, setRoomName } = useVideoCall()
    const { setPrescriptionDetails } = usePrescriptionStore()
    const doctorId = user?.userId ? Number(user.userId) : 0

    // Use patient queue hook for doctors
    const { queue: patientQueueData, fetchQueue } = usePatientQueue({
        doctorId: parseInt(user.userId),
    })

    console.log('patientQueueData', typeof patientQueueData)

    const { consultationHistory, pagination, isLoading, getDoctorHistory } =
        useConsultation({ doctorId })

    // Effect to handle doctor's queue updates
    useEffect(() => {
        if (socket) {
            // Listen for queue updates
            socket.on('QUEUE_CHANGED', () => {
                // Fetch latest queue when socket event is received
                fetchQueue()
            })

            // Initial queue fetch
            fetchQueue()

            return () => {
                socket.off('QUEUE_CHANGED')
            }
        }
    }, [user.userId, fetchQueue, socket])

    useEffect(() => {
        if (doctorId) {
            getDoctorHistory(consultationCurrentPage, consultationPageSize)
        }
    }, [
        getDoctorHistory,
        consultationCurrentPage,
        consultationPageSize,
        doctorId,
    ])

    // Separate ongoing and completed consultations
    const ongoingConsultations = (
        consultationHistory as unknown as ConsultationWithPatient[]
    ).filter((consultation) => consultation.status === 'ongoing')
    const completedConsultations = (
        consultationHistory as unknown as ConsultationWithPatient[]
    ).filter((consultation) => consultation.status === 'completed')

    const availabilityRef = useRef(isAvailable)
    availabilityRef.current = isAvailable

    const emitAvailabilityChange = debounce((available: boolean) => {
        if (socket) {
            socket.emit('SWITCH_DOCTOR_AVAILABILITY', {
                doctorId: user.userId,
                isAvailable: available,
            })
        }
    }, 500)

    const createRoom = async (patientId: number, roomName: string) => {
        try {
            try {
                await VideoService.createRoom({
                    roomName: roomName || '',
                })
            } catch (error) {
                console.log('Room may already exist:', error)
            }
        } catch (error) {
            console.error('Failed to create room:', error)
        }
    }

    const handleStartConsultation = async (
        patientId: number,
        roomName: string,
    ) => {
        try {
            console.log(
                `Starting consultation for patient ${patientId} with room ${roomName}`,
            )

            const doctorId = parseInt(user.userId)

            // Call the REST API to start consultation
            const response = await ConsultationService.startConsultation(
                doctorId,
                patientId,
            )

            console.log('Start consultation response:', response)

            if (response.success) {
                // Set video call context
                setDoctorId(doctorId)
                setPatientId(patientId)
                setRoomName(response.roomName || roomName)

                // Create room for video call
                await createRoom(patientId, response.roomName || roomName)

                // Navigate to video consultation
                navigate(`/doctor/video-consultation/${patientId}`)

                console.log(
                    `Successfully started consultation ${response.consultationId}`,
                )
            } else {
                console.error(
                    'Failed to start consultation:',
                    response.message || response.error,
                )
                alert(
                    `Failed to start consultation: ${response.message || response.error}`,
                )
            }
        } catch (error) {
            console.error('Error starting consultation:', error)
            alert('Failed to start consultation. Please try again.')
        }
    }

    const handleJoinCall = async (patientId: number) => {
        setCheckingStatus(true)
        try {
            const doctorId = parseInt(user.userId)

            // Check consultation status for this specific doctor-patient pair
            // Pass autoJoin: false to prevent doctor from auto-joining patient queue
            const statusResponse =
                await ConsultationService.checkConsultationStatus(
                    doctorId,
                    patientId,
                    false, // autoJoin = false for doctor requests
                )

            console.log(
                'Doctor checking status for:',
                { doctorId, patientId },
                'Response:',
                statusResponse,
            )

            if (statusResponse.success) {
                switch (statusResponse.action) {
                    case 'rejoin':
                        // Existing ongoing consultation - rejoin directly
                        console.log(
                            'Rejoining existing consultation:',
                            statusResponse.consultationId,
                        )
                        navigate(
                            `/doctor/video-consultation/${patientId}?rejoin=true&consultationId=${statusResponse.consultationId}`,
                        )
                        break

                    case 'ended':
                        // Consultation has ended
                        alert('This consultation has already ended')
                        // Refresh the queue and consultation history
                        fetchQueue()
                        getDoctorHistory(
                            consultationCurrentPage,
                            consultationPageSize,
                        )
                        break

                    case 'none':
                    default: {
                        // Normal flow - start new consultation
                        const queueEntry = patientQueueData.find(
                            (p) => p.patientId === patientId,
                        )
                        if (queueEntry) {
                            console.log(
                                'Starting new consultation for patient:',
                                patientId,
                                'Room:',
                                `room-${queueEntry.id}`,
                            )
                            handleStartConsultation(
                                patientId,
                                `room-${queueEntry.id}`,
                            )
                        } else {
                            console.error(
                                'Queue entry not found for patient:',
                                patientId,
                            )
                            alert('Unable to find patient in queue')
                        }
                        break
                    }
                }
            } else {
                // Fallback to normal flow
                const queueEntry = patientQueueData.find(
                    (p) => p.patientId === patientId,
                )
                if (queueEntry) {
                    handleStartConsultation(patientId, `room-${queueEntry.id}`)
                } else {
                    console.error(
                        'Queue entry not found for patient:',
                        patientId,
                    )
                    alert('Unable to find patient in queue')
                }
            }
        } catch (error) {
            console.error('Error checking consultation status:', error)
            // Fallback to normal flow
            const queueEntry = patientQueueData.find(
                (p) => p.patientId === patientId,
            )
            if (queueEntry) {
                handleStartConsultation(patientId, `room-${queueEntry.id}`)
            } else {
                console.error('Queue entry not found for patient:', patientId)
                alert('Unable to find patient in queue')
            }
        } finally {
            setCheckingStatus(false)
        }
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

    const handleAddReport = (consultationId: string, patientId: number) => {
        setPrescriptionDetails(consultationId, patientId.toString())
        navigate('/doctor/reports?patientId=' + patientId)
    }

    const handleToggleAvailability = () => {
        setIsAvailable((prev) => {
            const newAvailability = !prev
            emitAvailabilityChange(newAvailability)
            return newAvailability
        })
    }

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }, [])

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value)
    }, [])

    const handleConsultationPageChange = useCallback((page: number) => {
        setConsultationCurrentPage(page)
    }, [])

    const handleConsultationPageSizeChange = useCallback(
        (newPageSize: number) => {
            setConsultationPageSize(newPageSize)
            setConsultationCurrentPage(1)
        },
        [],
    )

    const handleConsultationSearchChange = useCallback((value: string) => {
        setConsultationSearchTerm(value)
        setConsultationCurrentPage(1)
    }, [])

    const patientQueueColumns = useMemo<Array<Column<QueueData>>>(
        () => [
            {
                Header: 'Position',
                accessor: (row) => row.position,
                Cell: ({ value }) => (
                    <div className="text-center">
                        <span className="font-semibold">{String(value)}</span>
                    </div>
                ),
            },
            {
                Header: 'User',
                accessor: (row) => row.patient?.name || '',
                Cell: ({ row: { original } }) => {
                    const patient = original.patient
                    return (
                        <div>
                            <div className="font-semibold">{patient?.name}</div>
                            <div className="text-sm text-gray-500">
                                {patient?.phone}
                            </div>
                            <div className="text-xs text-gray-400">
                                {patient?.email}
                            </div>
                        </div>
                    )
                },
            },
            {
                Header: 'Joined At',
                accessor: (row) => row.joinedAt,
                Cell: ({ value }) => {
                    const date = new Date(String(value))
                    return (
                        <div className="text-center">
                            <div>{date.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">
                                {date.toLocaleTimeString()}
                            </div>
                        </div>
                    )
                },
            },
            {
                Header: 'Room',
                accessor: (row) => row.roomName,
                Cell: ({ value }) => (
                    <div className="text-center">
                        <span className="text-sm font-mono">
                            {String(value)}
                        </span>
                    </div>
                ),
            },
            {
                Header: 'Status',
                accessor: (row) => row.status,
                Cell: ({ value }) => (
                    <div className="flex justify-center">
                        <Badge
                            className={
                                value === 'waiting'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : value === 'in_consultation'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                            }
                        >
                            {String(value).replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                ),
            },
            {
                Header: 'Action',
                accessor: (row) => row.id,
                Cell: ({ row: { original } }) => {
                    return (
                        <div className="flex justify-center gap-2">
                            {original.status === 'waiting' && (
                                <Button
                                    variant="solid"
                                    size="sm"
                                    onClick={() =>
                                        handleStartConsultation(
                                            original.patientId,
                                            original.roomName || '',
                                        )
                                    }
                                >
                                    Start Consultation
                                </Button>
                            )}
                            {original.status === 'in_consultation' && (
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() =>
                                        handleJoinCall(original.patientId)
                                    }
                                    loading={checkingStatus}
                                    disabled={checkingStatus}
                                >
                                    {checkingStatus
                                        ? 'Checking...'
                                        : 'Join Call'}
                                </Button>
                            )}
                        </div>
                    )
                },
            },
        ],
        [handleStartConsultation, checkingStatus],
    )

    const consultationColumns = useMemo<Array<Column<Record<string, unknown>>>>(
        () => [
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
                accessor: (row) =>
                    (row as ConsultationWithPatient).patient?.name || '',
                Cell: ({ row: { original } }) => {
                    const data = original as ConsultationWithPatient
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
                accessor: (row) =>
                    (row as ConsultationWithPatient).scheduledDate,
                Cell: ({ row: { original } }) => {
                    const data = original as ConsultationWithPatient
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
                Cell: ({ row: { original } }) => {
                    const data = original as ConsultationWithPatient
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
                                            window.open(
                                                data.prescription as string,
                                                '_blank',
                                            )
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
                                            handleAddReport(
                                                data.id as string,
                                                data.patientId as number,
                                            )
                                        }
                                    >
                                        Add Report
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                },
            },
        ],
        [handleDownloadPrescription, handleAddReport],
    )

    const renderPatientQueueCard = useCallback(
        (patient: QueueData) => (
            <Card className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {patient.patient?.name}
                            </h3>
                            <div className="text-sm text-gray-500">
                                {patient.patient?.phone}
                            </div>
                            <div className="text-xs text-gray-400">
                                {patient.patient?.email}
                            </div>
                        </div>
                        <Badge
                            className={
                                patient.status === 'waiting'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : patient.status === 'in_consultation'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                            }
                        >
                            {patient.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                    <div className="mb-4">
                        <div className="text-sm">
                            <span className="font-medium">Position:</span>{' '}
                            {patient.position}
                        </div>
                        <div className="text-sm">
                            <span className="font-medium">Joined:</span>{' '}
                            {new Date(
                                String(patient.joinedAt),
                            ).toLocaleString()}
                        </div>
                        <div className="text-sm font-mono">
                            <span className="font-medium">Room:</span>{' '}
                            {patient.roomName}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {patient.status === 'waiting' && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                    handleStartConsultation(
                                        patient.patientId,
                                        patient.roomName,
                                    )
                                }
                            >
                                Start Consultation
                            </Button>
                        )}
                        {patient.status === 'in_consultation' && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="flex-1 bg-green-500 hover:bg-green-600"
                                onClick={() =>
                                    handleJoinCall(patient.patientId)
                                }
                                loading={checkingStatus}
                                disabled={checkingStatus}
                            >
                                {checkingStatus ? 'Checking...' : 'Join Call'}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        ),
        [handleStartConsultation, checkingStatus],
    )

    const renderOngoingConsultationCard = useCallback(
        (consultation: ConsultationWithPatient) => (
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
                    onClick={() =>
                        handleJoinCall(consultation.patientId as number)
                    }
                    loading={checkingStatus}
                    disabled={checkingStatus}
                >
                    {checkingStatus ? 'Checking...' : 'Join Call'}
                </Button>
            </Card>
        ),
        [handleJoinCall, checkingStatus],
    )

    return (
        <Container className="h-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="mb-2">Video Doctor Consultation</h3>
                    <p className="text-gray-500">
                        Welcome back, {user.userName}
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-700 mb-1">
                        {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <input
                        type="checkbox"
                        id="availability-toggle"
                        checked={isAvailable}
                        onChange={handleToggleAvailability}
                        className="toggle-checkbox hidden"
                    />
                    <label
                        htmlFor="availability-toggle"
                        className={`toggle-label block w-12 h-6 rounded-full cursor-pointer relative ${
                            isAvailable ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`dot absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition ${
                                isAvailable ? 'transform translate-x-6' : ''
                            }`}
                        ></span>
                    </label>
                </div>
            </div>

            {/* Doctor Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                            <span className="text-2xl icon-users"></span>
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm">
                                Patients in Queue
                            </h5>
                            <div className="text-xl font-bold">
                                {
                                    patientQueueData.filter(
                                        (p) => p.status === 'waiting',
                                    ).length
                                }
                            </div>
                        </div>
                    </div>
                </Card>
                {/* <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                            <span className="text-2xl icon-video"></span>
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm">
                                Active Consultation
                            </h5>
                            <div className="text-xl font-bold">
                                {
                                    patientQueueData.filter(
                                        (p) => p.status === 'in_consultation',
                                    ).length
                                }
                            </div>
                        </div>
                    </div>
                </Card> */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                            <span className="text-2xl icon-file-text"></span>
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm">
                                Ongoing Consultations
                            </h5>
                            <div className="text-xl font-bold">
                                {ongoingConsultations.length}
                            </div>
                        </div>
                    </div>
                </Card>
                {/* <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                            <span className="text-2xl icon-check-circle"></span>
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm">
                                Completed Today
                            </h5>
                            <div className="text-xl font-bold">
                                {completedConsultations.length}
                            </div>
                        </div>
                    </div>
                </Card> */}
            </div>

            {/* Ongoing Consultations Section */}
            {/* {ongoingConsultations.length > 0 && (
                <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold">
                        Ongoing Consultations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ongoingConsultations.map((consultation, index) => (
                            <div key={index}>
                                {renderOngoingConsultationCard(consultation)}
                            </div>
                        ))}
                    </div>
                </div>
            )} */}

            {/* Patient Queue */}
            <Card className="mb-6">
                <ReactMuiTableListView<QueueData>
                    tableTitle="Patients Queue"
                    columns={patientQueueColumns}
                    data={patientQueueData.map(
                        (queue) =>
                            ({
                                ...queue,
                                roomName: `${queue.roomName}`,
                                joinedAt: new Date().toISOString(),
                                patient: {
                                    ...queue.patient,
                                    name: queue.patient.name,
                                },
                            }) as QueueData,
                    )}
                    enablePagination={true}
                    enableSearch={false}
                    enableCardView={false}
                    enableTableListview={true}
                    totalItems={patientQueueData.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    loading={false}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    cardTemplate={renderPatientQueueCard}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                />
            </Card>

            {/* Consultation History */}
            {completedConsultations.length > 0 && (
                <div className="mt-8">
                    <ReactMuiTableListView
                        tableTitle="Consultation History"
                        columns={consultationColumns}
                        data={
                            completedConsultations as unknown as Record<
                                string,
                                unknown
                            >[]
                        }
                        enablePagination={true}
                        enableSearch={false}
                        enableCardView={false}
                        totalItems={pagination.totalCount}
                        currentPage={consultationCurrentPage}
                        pageSize={consultationPageSize}
                        onPageChange={handleConsultationPageChange}
                        onPageSizeChange={handleConsultationPageSizeChange}
                        loading={isLoading}
                        searchTerm={consultationSearchTerm}
                        onSearchChange={handleConsultationSearchChange}
                        viewTypeProp="table"
                        rowsPerPageOptions={[10, 15, 25, 50]}
                    />
                </div>
            )}
        </Container>
    )
}

export default DoctorVDC
