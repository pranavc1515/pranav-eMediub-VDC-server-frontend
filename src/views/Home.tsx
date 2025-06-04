import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { memo } from 'react'
import {
    Card,
    Input,
    Button,
    Badge,
    Avatar,
    Table,
    Switcher,
    Pagination,
} from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { Link, useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import useDoctors from '@/hooks/useDoctors'
import usePatientQueue from '@/hooks/usePatientQueue'
import useConsultation from '@/hooks/useConsultation'
import { io, Socket } from 'socket.io-client'
import PaymentService from '@/services/PaymentService'
import VideoService from '@/services/VideoService'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { useSocketContext } from '@/contexts/SocketContext'
import ReactMuiTableListView from '@/components/shared/ReactMuiTableListView'
import type { DoctorProfile } from '@/services/DoctorService'
import type {
    JoinQueueResponse,
    PatientQueueEntry,
} from '@/services/PatientQueue'

// Define the API URL using Vite's import.meta.env instead of process.env
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const problemCategories = [
    { value: 'general', label: 'General Health Concerns' },
    { value: 'cardiology', label: 'Heart & Cardiovascular Issues' },
    { value: 'pediatrics', label: "Children's Health" },
    { value: 'dermatology', label: 'Skin Problems & Disorders' },
    { value: 'orthopedics', label: 'Bone, Joint & Muscle Pain' },
    { value: 'mental', label: 'Mental Health & Well-being' },
    { value: 'neurology', label: 'Neurological Disorders' },
    { value: 'endodontics', label: 'Dental & Root Canal Problems' },
    { value: 'gynecology', label: "Women's Health" },
    { value: 'urology', label: 'Urological Issues' },
    { value: 'ophthalmology', label: 'Eye Problems & Vision' },
    { value: 'ent', label: 'Ear, Nose & Throat Issues' },
    { value: 'pulmonology', label: 'Respiratory Problems' },
    { value: 'gastroenterology', label: 'Digestive System Issues' },
    { value: 'other', label: 'Other Health Concerns' },
]

const statsData = [
    {
        title: 'Available Doctors',
        value: 0,
        // growth: 12.5,
        icon: 'user-md',
    },
    // {
    //     title: 'Active Consultations',
    //     value: 17,
    //     growth: 3.7,
    //     icon: 'video'
    // },
    // {
    //     title: 'Avg. Wait Time',
    //     value: '3 min',
    //     growth: -8.2,
    //     icon: 'clock'
    // },
    // {
    //     title: 'Patient Satisfaction',
    //     value: '96%',
    //     growth: 2.3,
    //     icon: 'smile'
    // }
]
function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>
    return function executedFunction(...args: any[]) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}

interface Column<T = any> {
    Header: string
    accessor: keyof T | string
    Cell?: (props: { value: any; row: T }) => JSX.Element
}

interface ExtendedPatientQueueEntry {
    id: number
    position: number
    patientId: number
    status: string
    roomName: string
    patient: {
        firstName: string
        lastName: string
    }
}

interface DoctorWithProfessional {
    id: string
    fullName: string
    profilePhoto?: string
    isOnline: string
    DoctorProfessional?: {
        specialization?: string
        yearsOfExperience?: number
    }
}

const Home = () => {
    const { setDoctorId, setPatientId, setRoomName } = useVideoCall()
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [isAvailable, setIsAvailable] = useState(true)

    const navigate = useNavigate()
    const { socket } = useSocketContext()
    const user = useSessionUser((state) => state.user)
    const isDoctor = user.authority?.includes('doctor') || false

    // Memoize specialization value
    const specialization = useMemo(
        () => (selectedCategory !== 'all' ? selectedCategory : undefined),
        [selectedCategory],
    )

    const {
        doctors,
        count,
        loading,
        fetchDoctors,
        totalPages,
        changePage,
        search,
    } = useDoctors({
        specialization,
        autoFetch: !isDoctor,
        showOnlyAvailable,
        initialPage: currentPage,
        pageSize,
    })

    // Memoize handlers
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category)
        setCurrentPage(1) // Reset to first page when changing category
    }, [])

    const debouncedSearch = useRef(
        debounce((value: string) => {
            search(value)
        }, 300),
    ).current

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value)
            debouncedSearch(value)
        },
        [debouncedSearch],
    )

    const handleAvailabilityToggle = useCallback((checked: boolean) => {
        setShowOnlyAvailable(checked)
        setCurrentPage(1) // Reset to first page when toggling availability
    }, [])

    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page)
            changePage(page)
        },
        [changePage],
    )

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // Reset to first page when changing page size
    }, [])

    // Effect for doctor availability
    useEffect(() => {
        if (isDoctor && socket) {
            socket.emit('SWITCH_DOCTOR_AVAILABILITY', {
                doctorId: user.userId,
                isAvailable: true,
            })
        }
    }, [isDoctor, socket, user.userId])

    // Use patient queue hook for doctors
    const { queue: patientQueue, fetchQueue } = usePatientQueue({
        doctorId: isDoctor ? parseInt(user.userId) : 0,
    })

    const { startConsultation } = useConsultation({
        doctorId: isDoctor ? parseInt(user.userId) : 0,
    })

    // Effect to handle doctor's queue updates
    useEffect(() => {
        if (isDoctor && socket) {
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
    }, [isDoctor, user.userId, fetchQueue, socket])

    const availabilityRef = useRef(isAvailable)
    availabilityRef.current = isAvailable

    const emitAvailabilityChange = debounce((available: boolean) => {
        if (socket && isDoctor) {
            socket.emit('SWITCH_DOCTOR_AVAILABILITY', {
                doctorId: user.userId,
                isAvailable: available,
            })
        }
    }, 500)

    // Update stats count
    statsData[0].value = count

    const createRoom = async (patientId: number, roomName: string) => {
        try {
            if (isDoctor) {
                try {
                    await VideoService.createRoom({
                        roomName: roomName || '',
                    })
                } catch (error) {
                    console.log('Room may already exist:', error)
                }
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
            if (isDoctor) {
                setDoctorId(parseInt(user.userId)) // set current doctor user ID
                setPatientId(patientId) // set selected patient ID
                setRoomName(roomName)
                createRoom(patientId, roomName)

                navigate(`/doctor/video-consultation/${patientId}`) // no params needed here
            }
        } catch (error) {
            console.error('Failed to start consultation:', error)
        }
    }

    const handleConsultNow = (doctor: any) => {
        const handleCreateOrder = async () => {
            try {
                const response = await PaymentService.createOrder({
                    amount: 1,
                    currency: 'INR',
                })

                if (response.success && response.order) {
                    initializeRazorpay(response.order, doctor.id)
                } else {
                    console.error('Failed to create payment order')
                }
            } catch (err) {
                console.error('Payment order creation error:', err)
            }
        }

        const initializeRazorpay = (order: any, doctorId: string) => {
            if (!(window as any).Razorpay) {
                console.error('Razorpay SDK failed to load.')
                return
            }

            const options = {
                key: 'rzp_test_6pdNA8n5Gcoe3D', // Razorpay test key
                amount: order.amount,
                currency: order.currency,
                name: 'eMediub',
                description: 'Doctor Consultation',
                order_id: order.id,
                handler: function (response: any) {
                    // Verify payment
                    const verifyPayment = async () => {
                        try {
                            const verifyResponse =
                                await PaymentService.verifyPayment({
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature,
                                })

                            if (verifyResponse.success) {
                                // Redirect to consultation page after successful payment
                                navigate(`/user/video-consultation/${doctorId}`)
                            } else {
                                console.error('Payment verification failed')
                            }
                        } catch (err) {
                            console.error('Payment verification error:', err)
                        }
                    }

                    verifyPayment()
                },
                prefill: {
                    name: user.userName || 'Patient',
                    email: user.email || '',
                    contact: '',
                },
                theme: {
                    color: '#3399cc',
                },
            }

            const razorpayInstance = new (window as any).Razorpay(options)
            razorpayInstance.open()
        }

        // Start the payment process
        handleCreateOrder()
    }

    const handleToggleAvailability = () => {
        setIsAvailable((prev) => {
            const newAvailability = !prev
            emitAvailabilityChange(newAvailability) // emit after state change with new value
            return newAvailability
        })
    }

    const renderDoctorDashboard = useCallback(() => {
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
                                        patientQueue.filter(
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
                                        patientQueue.filter(
                                            (p) =>
                                                p.status === 'in_consultation',
                                        ).length
                                    }
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Patient Queue */}
                <Card className="mb-6">
                    <h4 className="mb-4">Patients Queue</h4>
                    <Table>
                        <thead>
                            <tr>
                                <th>Position</th>
                                <th>Patient Name</th>
                                <th>Joined At</th>
                                <th>Room name</th>
                                <th
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    Status
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientQueue.map((patient) => (
                                <tr key={patient.id}>
                                    <td>{patient.position}</td>
                                    <td>{patient.patient.name}</td>{' '}
                                    {/* dont make it firstName and lastName */}
                                    <td>{new Date().toLocaleTimeString()}</td>
                                    <td>{patient.roomName}</td>
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            className={'bg-primary-500'}
                                        >
                                            {patient.status}
                                        </div>
                                    </td>
                                    <td>
                                        {patient.status === 'waiting' && (
                                            <Button
                                                variant="solid"
                                                size="sm"
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
                                    </td>
                                </tr>
                            ))}
                            {patientQueue.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-4"
                                    >
                                        No patients in queue
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            </Container>
        )
    }, [
        user.userName,
        isAvailable,
        handleToggleAvailability,
        patientQueue,
        handleStartConsultation,
    ])

    // Memoize table columns
    const columns = useMemo<Column<DoctorWithProfessional>[]>(
        () => [
            {
                Header: 'Doctor',
                accessor: 'fullName',
                Cell: ({ row }) => (
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={60}
                            src={
                                row.profilePhoto ||
                                '/img/avatars/default-avatar.jpg'
                            }
                        />
                        <div>
                            <h5 className="font-semibold">{row.fullName}</h5>
                            <p className="text-gray-500">
                                {row.DoctorProfessional?.specialization}
                            </p>
                            <div className="flex items-center gap-1">
                                <span>
                                    {row.DoctorProfessional
                                        ?.yearsOfExperience ?? 0}{' '}
                                    years experience
                                </span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                Header: 'Status',
                accessor: 'isOnline',
                Cell: ({ value }) => (
                    <div className="flex justify-center">
                        <Badge
                            style={{
                                borderRadius: '50px',
                                padding: '4px 8px',
                            }}
                            className={
                                value === 'available'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-300 text-white'
                            }
                        >
                            {value === 'available'
                                ? 'Available now'
                                : 'Offline'}
                        </Badge>
                    </div>
                ),
            },
            {
                Header: 'Action',
                accessor: 'id',
                Cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Button
                            variant="solid"
                            size="sm"
                            disabled={row.isOnline !== 'available'}
                            className={
                                row.isOnline !== 'available'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }
                            onClick={() => handleConsultNow(row)}
                        >
                            <span className="icon-video mr-1"></span>
                            Consult Now
                        </Button>
                    </div>
                ),
            },
        ],
        [handleConsultNow],
    )

    const renderPatientDashboard = useCallback(() => {
        return (
            <Container className="h-full">
                <div className="mb-8">
                    <h3 className="mb-2">Video Doctor Consultation</h3>
                    <p className="text-gray-500">
                        Welcome back, {user.userName}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                    {statsData.map((stat, index) => (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                    <span
                                        className={`text-2xl icon-${stat.icon}`}
                                    ></span>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-sm">
                                        {stat.title}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">
                                            {stat.value}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Search and Problem Selection */}
                <Card className="mb-6">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h6 className="text-sm text-gray-500 mb-2 md:mb-0">
                                Select your health concern:
                            </h6>
                            <div className="flex items-center">
                                <span className="text-sm mr-2">
                                    Show only available doctors
                                </span>
                                <Switcher
                                    checked={showOnlyAvailable}
                                    onChange={handleAvailabilityToggle}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full">
                            <Button
                                className={`${selectedCategory === 'all' ? 'bg-primary-500 text-dark' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
                                variant={
                                    selectedCategory === 'all'
                                        ? 'solid'
                                        : 'default'
                                }
                                onClick={() => handleCategoryChange('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            {problemCategories.map((category) => (
                                <Button
                                    key={category.value}
                                    className={`${selectedCategory === category.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-500 hover:text-white'} rounded-full text-sm px-3 py-1`}
                                    variant={
                                        selectedCategory === category.value
                                            ? 'solid'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        handleCategoryChange(category.value)
                                    }
                                    size="sm"
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Doctors List View */}
                <ReactMuiTableListView
                    tableTitle="Doctors List"
                    columns={columns}
                    data={doctors}
                    loading={loading}
                    enablePagination={true}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={count}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    viewTypeProp="card"
                />
            </Container>
        )
    }, [
        columns,
        doctors,
        loading,
        currentPage,
        pageSize,
        count,
        handlePageChange,
        handlePageSizeChange,
        searchTerm,
        handleSearchChange,
    ])

    return isDoctor ? renderDoctorDashboard() : renderPatientDashboard()
}

export default memo(Home)
