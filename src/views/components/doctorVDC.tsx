import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, Button, Badge, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
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
import { useTranslation } from '@/utils/hooks/useTranslation'

interface QueueData extends PatientQueueEntry {
    roomName: string
    joinedAt: string
    userId: number // Add userId field for family member validation
    patient: PatientQueueEntry['patient'] & {
        name: string
        phone?: string
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
    const { t } = useTranslation()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [consultationCurrentPage, setConsultationCurrentPage] = useState(1)
    const [consultationPageSize, setConsultationPageSize] = useState(15)
    const [consultationSearchTerm, setConsultationSearchTerm] = useState('')
    const [isAvailable, setIsAvailable] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [checkingStatus, setCheckingStatus] = useState(false)
    const [previousQueueData, setPreviousQueueData] = useState<
        PatientQueueEntry[]
    >([])

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

    // Debug log for queue updates
    useEffect(() => {
        console.log('Queue Data Updated:', patientQueueData)
    }, [patientQueueData])

    const { consultationHistory, pagination, isLoading, getDoctorHistory } =
        useConsultation({ doctorId })

    // Enhanced queue monitoring with notifications
    const monitorQueueChanges = useCallback(
        (newQueueData: PatientQueueEntry[]) => {
            console.log('Monitoring Queue Changes:', {
                previous: previousQueueData,
                new: newQueueData,
            })

            // Only process if we have previous data to compare against
            // For first load, just save the data
            if (previousQueueData.length === 0) {
                console.log('Initial queue data set')
                setPreviousQueueData(newQueueData)
                return
            }

            // Check for new patients joining
            const newPatients = newQueueData.filter(
                (newPatient) =>
                    !previousQueueData.some(
                        (prevPatient) =>
                            prevPatient.patientId === newPatient.patientId,
                    ),
            )

            // Check for patients leaving
            const leftPatients = previousQueueData.filter(
                (prevPatient) =>
                    !newQueueData.some(
                        (newPatient) =>
                            newPatient.patientId === prevPatient.patientId,
                    ),
            )

            console.log('Queue Changes Detected:', {
                newPatients,
                leftPatients,
            })

            // Notify about new patients joining
            newPatients.forEach((patient) => {
                console.log('New patient notification:', patient)
                toast.push(
                    <Notification type="info" title={t('videoCall.newPatientInQueue')}>
                        {patient.patient?.name || t('videoCall.aPatient')} {t('videoCall.patientJoinedQueue')} #{patient.position}
                    </Notification>,
                )
            })

            // Notify about patients leaving
            leftPatients.forEach((patient) => {
                console.log('Patient left notification:', patient)
                toast.push(
                    <Notification type="warning" title={t('videoCall.patientLeftQueue')}>
                        {patient.patient?.name || t('videoCall.aPatient')} {t('videoCall.patientLeftQueueMessage')}
                    </Notification>,
                )
            })

            // Update previous queue data
            setPreviousQueueData(newQueueData)
        },
        [previousQueueData],
    )

    // Effect to handle doctor's queue updates with improved socket handling
    useEffect(() => {
        if (socket) {
            console.log('Setting up socket listeners for queue changes')

            // Listen for queue updates
            socket.on('QUEUE_CHANGED', () => {
                console.log('QUEUE_CHANGED event received')
                fetchQueue()
            })

            // Listen for patient join events specifically
            socket.on('PATIENT_JOINED_QUEUE', (data) => {
                console.log('PATIENT_JOINED_QUEUE event received:', data)
                fetchQueue()
            })

            // Listen for patient leave events
            socket.on('PATIENT_LEFT_QUEUE', (data) => {
                console.log('PATIENT_LEFT_QUEUE event received:', data)
                fetchQueue()
            })

            // Initial queue fetch
            fetchQueue()

            return () => {
                console.log('Cleaning up socket listeners')
                socket.off('QUEUE_CHANGED')
                socket.off('PATIENT_JOINED_QUEUE')
                socket.off('PATIENT_LEFT_QUEUE')
            }
        }
    }, [user.userId, fetchQueue, socket])

    // Monitor queue changes and trigger notifications
    useEffect(() => {
        if (patientQueueData && Array.isArray(patientQueueData)) {
            monitorQueueChanges(patientQueueData)
        }
    }, [patientQueueData, monitorQueueChanges])

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
        userId: number, // Add userId parameter for family member validation
    ) => {
        try {
            console.log(
                `Starting consultation for patient ${patientId} with room ${roomName}`,
            )

            const doctorId = parseInt(user.userId)

            // Call the REST API to start consultation
            // Include userId for family member validation
            const response = await ConsultationService.startConsultation(
                doctorId,
                patientId,
                userId, // Pass userId for family member validation
            )

            console.log('Start consultation response:', response)

            if (response.success) {
                // Set video call context
                setDoctorId(doctorId)
                setPatientId(patientId)
                setRoomName(response.roomName || roomName)

                // Show success notification
                toast.push(
                    <Notification type="success" title="Consultation Started">
                        Successfully started consultation with patient.
                        Redirecting to video call...
                    </Notification>,
                )

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
                toast.push(
                    <Notification type="danger" title="Consultation Error">
                        Failed to start consultation:{' '}
                        {response.message || response.error}
                    </Notification>,
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
                        toast.push(
                            <Notification
                                type="info"
                                title="Rejoining Consultation"
                            >
                                Reconnecting to ongoing consultation with
                                patient...
                            </Notification>,
                        )
                        navigate(
                            `/doctor/video-consultation/${patientId}?rejoin=true&consultationId=${statusResponse.consultationId}`,
                        )
                        break

                    case 'ended':
                        // Consultation has ended
                        toast.push(
                            <Notification
                                type="warning"
                                title="Consultation Ended"
                            >
                                This consultation has already been completed.
                            </Notification>,
                        )
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
                                queueEntry.userId || queueEntry.patientId // Use userId if available, fallback to patientId
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
            toast.push(
                <Notification type="warning" title="Status Check Failed">
                    Could not verify consultation status. Attempting to start
                    new consultation...
                </Notification>,
            )
            // Fallback to normal flow
            const queueEntry = patientQueueData.find(
                (p) => p.patientId === patientId,
            )
            if (queueEntry) {
                handleStartConsultation(patientId, `room-${queueEntry.id}`)
            } else {
                console.error('Queue entry not found for patient:', patientId)
                toast.push(
                    <Notification type="danger" title="Patient Not Found">
                        Unable to find patient in queue. Please refresh and try
                        again.
                    </Notification>,
                )
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

        // Show success notification
        toast.push(
            <Notification type="success" title="Download Started">
                Prescription download has been initiated
            </Notification>,
        )
    }

    const handleAddReport = (consultationId: string, patientId: number) => {
        setPrescriptionDetails(consultationId, patientId.toString())
        toast.push(
            <Notification type="info" title="Creating Report">
                Redirecting to create consultation report...
            </Notification>,
        )
        navigate('/doctor/reports?patientId=' + patientId)
    }

    const handleToggleAvailability = () => {
        setIsAvailable((prev) => {
            const newAvailability = !prev
            emitAvailabilityChange(newAvailability)

            // Show notification for availability change
            toast.push(
                <Notification type="success" title="Availability Updated">
                    You are now {newAvailability ? 'available' : 'unavailable'}{' '}
                    for consultations
                </Notification>,
            )

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
                Header: t('videoCall.position'),
                accessor: (row) => row.position,
                Cell: ({ value }) => (
                    <div className="text-center">
                        <span className="font-semibold">{String(value)}</span>
                    </div>
                ),
            },
            {
                Header: t('common.user'),
                accessor: (row) => row.patient?.name || '',
                Cell: ({ row: { original } }) => {
                    const patient = original.patient
                    return (
                        <div>
                            <div className="font-semibold">{patient?.name}</div>
                            <div className="text-sm text-gray-500">
                                {patient?.phone}
                            </div>
                        </div>
                    )
                },
            },
            {
                Header: t('videoCall.joinedAt'),
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
                Header: t('videoCall.room'),
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
                Header: t('common.status'),
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
                Header: t('common.action'),
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
                                            original.userId // Pass userId for family member validation
                                        )
                                    }
                                >
                                    {t('videoCall.startConsultation')}
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
                                        ? t('videoCall.checkingStatus')
                                        : t('videoCall.joinCall')}
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
                Header: t('videoCall.consultationId'),
                accessor: 'id',
            },
            {
                Header: t('videoCall.patientId'),
                accessor: 'patientId',
            },
            {
                Header: t('common.patient'),
                accessor: (row) =>
                    (row as ConsultationWithPatient).patient?.name || '',
                Cell: ({ row: { original } }) => {
                    const data = original as ConsultationWithPatient
                    return (
                        <div>
                            <div>{data.patient?.name ?? 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                                {data.patient?.phone ?? 'No phone'}
                            </div>
                        </div>
                    )
                },
            },
            {
                Header: t('videoCall.dateAndTime'),
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
                Header: t('common.actions'),
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
                                        {t('common.download')}
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
                                        patient.userId // Pass userId for family member validation
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
                    <h3 className="mb-2">{t('videoCall.videoDoctorConsultation')}</h3>
                    <p className="text-gray-500">
                        {t('dashboard.welcomeBack')}, {user.userName}
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-700 mb-1">
                        {isAvailable ? t('videoCall.available') : t('videoCall.unavailable')}
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
                                {t('dashboard.patientsInQueue')}
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
                                {t('dashboard.ongoingConsultations')}
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
                    tableTitle={t('videoCall.patientsQueue')}
                    columns={patientQueueColumns}
                    data={patientQueueData.map(
                        (queue) =>
                            ({
                                ...queue,
                                roomName: `${queue.roomName}`,
                                joinedAt: new Date().toISOString(),
                                userId: queue.userId, // Use patientId as userId for family member validation
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
                        tableTitle={t('videoCall.consultationHistory')}
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
