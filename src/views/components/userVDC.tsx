import { useState, useCallback, useMemo, useEffect } from 'react'
import { Card, Button, Badge, Avatar, Switcher } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import useDoctors from '@/hooks/useDoctors'
import useConsultation from '@/hooks/useConsultation'
import PaymentService from '@/services/PaymentService'
import ConsultationService from '@/services/ConsultationService'
import { ENV } from '@/configs/environment'
import ReactMuiTableListView, {
    Column,
} from '@/components/shared/ReactMuiTableListView'
import { HiVideoCamera, HiDownload } from 'react-icons/hi'
import type { ConsultationRecord } from '@/services/ConsultationService'

interface ExtendedDoctor extends Record<string, unknown> {
    id: number
    fullName: string
    profilePhoto?: string | null
    isOnline?: string
    email?: string | null
    phoneNumber?: string
    gender?: string | null
    dob?: string | null
    status?: string
    emailVerified?: boolean
    DoctorProfessional?: {
        specialization?: string | null
        yearsOfExperience?: number | null
        consultationFees?: number | string | null
        qualification?: string | null
        registrationNumber?: string | null
        certificates?: Array<{
            key: string
            url: string
            name: string
            type: string
            uploadedAt: string
        }>
    }
}

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

const UserVDC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [consultationCurrentPage, setConsultationCurrentPage] = useState(1)
    const [consultationPageSize, setConsultationPageSize] = useState(15)
    const [consultationSearchTerm, setConsultationSearchTerm] = useState('')
    const [checkingStatus, setCheckingStatus] = useState(false)

    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const patientId = user?.userId ? Number(user.userId) : 0

    // Memoize specialization value
    const specialization = useMemo(
        () => (selectedCategory !== 'all' ? selectedCategory : undefined),
        [selectedCategory],
    )

    const { doctors, count, loading, changePage, search } = useDoctors({
        specialization,
        autoFetch: true,
        showOnlyAvailable,
        initialPage: currentPage,
        pageSize,
    })

    const { consultationHistory, pagination, isLoading, getPatientHistory } =
        useConsultation({
            doctorId: 0, // Not needed for patient view
        })

    useEffect(() => {
        if (patientId) {
            getPatientHistory(
                patientId,
                consultationCurrentPage,
                consultationPageSize,
            )
        }
    }, [
        getPatientHistory,
        consultationCurrentPage,
        consultationPageSize,
        patientId,
    ])

    // Separate ongoing and completed consultations
    const ongoingConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'ongoing',
    )
    const completedConsultations = consultationHistory.filter(
        (consultation) => consultation.status === 'completed',
    )

    // Memoize handlers
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category)
        setCurrentPage(1)
    }, [])

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value)
            search(value)
        },
        [search],
    )

    const handleAvailabilityToggle = useCallback((checked: boolean) => {
        setShowOnlyAvailable(checked)
        setCurrentPage(1)
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
        setCurrentPage(1)
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

    const checkConsultationStatusAndRedirect = async (doctorId: number) => {
        try {
            const patientId = user?.userId ? Number(user.userId) : 0

            if (!patientId) {
                console.error('Patient ID not found')
                return
            }

            // Check consultation status
            const statusResponse =
                await ConsultationService.checkConsultationStatus(
                    doctorId,
                    patientId,
                )

            if (statusResponse.success) {
                switch (statusResponse.action) {
                    case 'rejoin':
                        // Already in ongoing consultation - rejoin directly
                        navigate(
                            `/user/video-consultation/${doctorId}?rejoin=true&consultationId=${statusResponse.consultationId}`,
                        )
                        break

                    case 'ended':
                        // Previous consultation has ended, proceed normally
                        navigate(`/user/video-consultation/${doctorId}`)
                        break

                    case 'wait':
                        // Already in queue - go to waiting room
                        navigate(`/user/video-consultation/${doctorId}`)
                        break

                    default:
                        // No existing consultation or queue - proceed normally
                        navigate(`/user/video-consultation/${doctorId}`)
                }
            } else {
                // Fallback - proceed normally
                navigate(`/user/video-consultation/${doctorId}`)
            }
        } catch (error) {
            console.error('Error checking consultation status:', error)
            // Fallback - proceed normally
            navigate(`/user/video-consultation/${doctorId}`)
        }
    }

    const handleJoinCall = async (doctorId: number) => {
        setCheckingStatus(true)
        try {
            // Check consultation status before joining
            const statusResponse =
                await ConsultationService.checkConsultationStatus(
                    doctorId,
                    patientId,
                )

            if (statusResponse.success) {
                switch (statusResponse.action) {
                    case 'rejoin':
                        // Existing ongoing consultation - rejoin directly
                        navigate(
                            `/user/video-consultation/${doctorId}?rejoin=true&consultationId=${statusResponse.consultationId}`,
                        )
                        break

                    case 'ended':
                        // Consultation has ended
                        alert('This consultation has already ended')
                        // Refresh the consultation history
                        getPatientHistory(
                            patientId,
                            consultationCurrentPage,
                            consultationPageSize,
                        )
                        break

                    case 'wait':
                        // Patient is in queue - continue to waiting room
                        navigate(`/user/video-consultation/${doctorId}`)
                        break

                    default:
                        // Normal flow - join or queue
                        navigate(`/user/video-consultation/${doctorId}`)
                }
            } else {
                // Fallback to normal flow
                navigate(`/user/video-consultation/${doctorId}`)
            }
        } catch (error) {
            console.error('Error checking consultation status:', error)
            // Fallback to normal flow
            navigate(`/user/video-consultation/${doctorId}`)
        } finally {
            setCheckingStatus(false)
        }
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

    const handleConsultNow = (doctor: ExtendedDoctor) => {
        const handleCreateOrder = async () => {
            try {
                // Get consultation fee from doctor's professional details
                const consultationFees = doctor.DoctorProfessional?.consultationFees
                if (!consultationFees) {
                    console.error('Consultation fees not available for this doctor')
                    return
                }

                // Convert fee to number and then to paisa (multiply by 100 for Razorpay)
                const feeInRupees = typeof consultationFees === 'string' 
                    ? parseFloat(consultationFees) 
                    : consultationFees
                
                const response = await PaymentService.initiatePayment({
                    doctor_id: doctor.id,
                    transaction_type: 'VDC',
                    amount: feeInRupees
                })

                if (response.success) {
                    initializeRazorpay(response, String(doctor.id))
                } else {
                    console.error('Failed to initiate payment')
                }
            } catch (err) {
                console.error('Payment initiation error:', err)
            }
        }

        const initializeRazorpay = (paymentData: any, doctorId: string) => {
            if (!(window as any).Razorpay) {
                console.error('Razorpay SDK failed to load.')
                return
            }

            const options = {
                key: ENV.RAZORPAY_KEY,
                amount: paymentData.amount, // Amount in paisa from API
                currency: paymentData.currency,
                name: 'eMediHub',
                description: 'Doctor Consultation',
                order_id: paymentData.order_id,
                handler: function (response: any) {
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
                                // Check consultation status before redirecting
                                await checkConsultationStatusAndRedirect(
                                    Number(doctorId),
                                )
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

        handleCreateOrder()
    }

    // Stats data with ongoing consultations count
    const statsData = [
        {
            title: 'Available Doctors',
            value: count,
            icon: 'user-md',
        },
        {
            title: 'Ongoing Consultations',
            value: ongoingConsultations.length,
            icon: 'video',
        },
    ]

    // Memoize table columns for doctors
    const doctorColumns = useMemo<Array<Column<ExtendedDoctor>>>(
        () => [
            {
                Header: 'Doctor',
                accessor: (row) => row.fullName,
                Cell: ({ row: { original } }) => (
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={60}
                            src={
                                original.profilePhoto ||
                                '/img/avatars/default-avatar.jpg'
                            }
                        />
                        <div>
                            <h5 className="font-semibold">
                                {original.fullName}
                            </h5>
                            <p className="text-gray-500">
                                {original.DoctorProfessional?.specialization}
                            </p>
                            <div className="flex items-center gap-1">
                                <span>
                                    {original.DoctorProfessional
                                        ?.yearsOfExperience ?? 0}{' '}
                                    years experience
                                </span>
                                {original.DoctorProfessional
                                    ?.consultationFees && (
                                    <span className="text-primary-500">
                                        ₹
                                        {
                                            original.DoctorProfessional
                                                .consultationFees
                                        }
                                    </span>
                                )}
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
                Cell: ({ row: { original } }) => (
                    <div className="flex justify-center">
                        <Button
                            variant="solid"
                            size="sm"
                            disabled={original.isOnline !== 'available'}
                            className={
                                original.isOnline !== 'available'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }
                            onClick={() => handleConsultNow(original)}
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

    // Memoize table columns for consultation history
    const consultationColumns = useMemo<Column<ConsultationWithDoctor>[]>(
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
                                loading={checkingStatus}
                                disabled={checkingStatus}
                            >
                                {checkingStatus ? 'Checking...' : 'Join'}
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
                                        handleDownloadPrescription(original.id)
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
                                No report added
                            </span>
                        ) : null}
                    </div>
                ),
            },
        ],
        [checkingStatus],
    )

    const renderDoctorCard = useCallback(
        (doctor: ExtendedDoctor) => (
            <Card className="hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                <div className="flex flex-col p-4 gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={60}
                            src={
                                doctor.profilePhoto ||
                                '/img/avatars/default-avatar.jpg'
                            }
                        />
                        <div>
                            <h5 className="font-semibold">{doctor.fullName}</h5>
                            <p className="text-gray-500">
                                {doctor.DoctorProfessional?.specialization}
                            </p>
                            <div className="flex items-center gap-1">
                                <span>
                                    {doctor.DoctorProfessional
                                        ?.yearsOfExperience ?? 0}{' '}
                                    years experience
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <Badge
                                style={{
                                    borderRadius: '50px',
                                    padding: '4px 8px',
                                }}
                                className={
                                    doctor.isOnline === 'available'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-300 text-white'
                                }
                            >
                                {doctor.isOnline === 'available'
                                    ? 'Available now'
                                    : 'Offline'}
                            </Badge>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            disabled={doctor.isOnline !== 'available'}
                            className={
                                doctor.isOnline !== 'available'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }
                            onClick={() => handleConsultNow(doctor)}
                        >
                            <span className="icon-video mr-1"></span>
                            Consult Now
                        </Button>
                    </div>
                </div>
            </Card>
        ),
        [handleConsultNow],
    )

    const renderOngoingConsultationCard = useCallback(
        (consultation: ConsultationWithDoctor) => (
            <Card className="hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                <div className="flex flex-col p-4 gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={60}
                            src={
                                consultation.doctor?.profilePhoto ||
                                '/img/avatars/default-avatar.jpg'
                            }
                        />
                        <div>
                            <h5 className="font-semibold">
                                {consultation.doctor?.fullName ||
                                    'Unknown Doctor'}
                            </h5>
                            <p className="text-gray-500">
                                {consultation.doctor?.DoctorProfessional
                                    ?.specialization || 'No specialization'}
                            </p>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">
                                    {consultation.scheduledDate} at{' '}
                                    {consultation.startTime}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <Badge
                                style={{
                                    borderRadius: '50px',
                                    padding: '4px 8px',
                                }}
                                className="bg-blue-100 text-blue-800"
                            >
                                Ongoing
                            </Badge>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() =>
                                handleJoinCall(Number(consultation.doctor.id))
                            }
                            loading={checkingStatus}
                            disabled={checkingStatus}
                        >
                            <span className="icon-video mr-1"></span>
                            {checkingStatus ? 'Checking...' : 'Join Call'}
                        </Button>
                    </div>
                </div>
            </Card>
        ),
        [handleJoinCall, checkingStatus],
    )

    return (
        <Container className="h-full">
            <div className="mb-8">
                <h3 className="mb-2">Video Doctor Consultation</h3>
                <p className="text-gray-500">Welcome back, {user.userName}</p>
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

            {/* Ongoing Consultations Section */}
            {ongoingConsultations.length > 0 && (
                <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold">
                        Ongoing Consultations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ongoingConsultations.map((consultation, index) => (
                            <div key={index}>
                                {renderOngoingConsultationCard(
                                    consultation as ConsultationWithDoctor,
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                selectedCategory === 'all' ? 'solid' : 'default'
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
                tableTitle="eMedihub Doctor's Team"
                columns={doctorColumns}
                data={doctors.map((doctor) => ({
                    ...doctor,
                    isOnline: doctor.isOnline || 'offline',
                }))}
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
                cardTemplate={renderDoctorCard}
                enableTableListview={true}
                enableCardView={true}
                enableSearch={true}
            />

            {/* Consultation History */}
            {completedConsultations.length > 0 && (
                <div className="mt-8">
                    <ReactMuiTableListView
                        tableTitle="Consultation History"
                        columns={consultationColumns}
                        data={
                            completedConsultations as ConsultationWithDoctor[]
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

export default UserVDC
