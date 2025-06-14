import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import usePatientQueue from '@/hooks/usePatientQueue'
import useConsultation from '@/hooks/useConsultation'
import VideoService from '@/services/VideoService'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { useSocketContext } from '@/contexts/SocketContext'
import ReactMuiTableListView, {
    Column,
} from '@/components/shared/ReactMuiTableListView'

interface QueueData extends Record<string, unknown> {
    id: number
    doctorId: number
    patientId: number
    status: 'waiting' | 'in_consultation' | 'left'
    position: number
    roomName: string
    joinedAt: string
    patient: {
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

function debounce<T extends (...args: any[]) => void>(
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

const DoctorHomePage = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [isAvailable, setIsAvailable] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const navigate = useNavigate()
    const { socket } = useSocketContext()
    const user = useSessionUser((state) => state.user)
    const { setDoctorId, setPatientId, setRoomName } = useVideoCall()

    // Use patient queue hook for doctors
    const { queue: patientQueueData, fetchQueue } = usePatientQueue({
        doctorId: parseInt(user.userId),
    })

    console.log('patientQueueData', typeof patientQueueData)

    const { startConsultation } = useConsultation({
        doctorId: parseInt(user.userId),
    })

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
            setDoctorId(parseInt(user.userId))
            setPatientId(patientId)
            setRoomName(roomName)
            createRoom(patientId, roomName)

            navigate(`/doctor/video-consultation/${patientId}`)
        } catch (error) {
            console.error('Failed to start consultation:', error)
        }
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

    const patientQueueColumns = useMemo<Array<Column<QueueData>>>(
        () => [
            {
                Header: 'Position',
                accessor: (row) => row.position,
                Cell: ({ value }) => (
                    <div className="text-center">
                        <span className="font-semibold">{value}</span>
                    </div>
                ),
            },
            {
                Header: 'Patient',
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
                        <span className="text-sm font-mono">{value}</span>
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
                        <div className="flex justify-center">
                            {original.status === 'waiting' && (
                                <Button
                                    variant="solid"
                                    size="sm"
                                    onClick={() =>
                                        handleStartConsultation(
                                            original.patientId,
                                            original.roomName,
                                        )
                                    }
                                >
                                    Start Consultation
                                </Button>
                            )}
                        </div>
                    )
                },
            },
        ],
        [handleStartConsultation],
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
                    {patient.status === 'waiting' && (
                        <Button
                            variant="solid"
                            size="sm"
                            className="w-full"
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
                </div>
            </Card>
        ),
        [handleStartConsultation],
    )

    return (
        <Container className="h-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="mb-2">Doctor Dashboard</h3>
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
                <Card className="hover:shadow-lg transition-shadow">
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
                </Card>
            </div>

            {/* Patient Queue */}
            <Card className="mb-6">
                {/* <h4 className="mb-4">Patients Queue</h4> */}
                <ReactMuiTableListView<QueueData>
                    tableTitle="Patients Queue"
                    columns={patientQueueColumns}
                    data={patientQueueData}
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
        </Container>
    )
}

export default DoctorHomePage
