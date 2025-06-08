import { useState, useCallback, useMemo } from 'react'
import { Card, Button, Badge, Avatar, Switcher } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import useDoctors from '@/hooks/useDoctors'
import PaymentService from '@/services/PaymentService'
import ReactMuiTableListView, { Column } from '@/components/shared/ReactMuiTableListView'

interface ExtendedDoctor extends Record<string, unknown> {
    id: number
    fullName: string
    profilePhoto?: string
    isOnline: string
    DoctorProfessional?: {
        specialization?: string
        yearsOfExperience?: number
        consultationFees?: string
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

const statsData = [
    {
        title: 'Available Doctors',
        value: 0,
        icon: 'user-md',
    },
]

const UserHomePage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)

    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)

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

    // Memoize handlers
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category)
        setCurrentPage(1)
    }, [])

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value)
        search(value)
    }, [search])

    const handleAvailabilityToggle = useCallback((checked: boolean) => {
        setShowOnlyAvailable(checked)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        changePage(page)
    }, [changePage])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }, [])

    const handleConsultNow = (doctor: ExtendedDoctor) => {
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
                key: 'rzp_test_6pdNA8n5Gcoe3D',
                amount: order.amount,
                currency: order.currency,
                name: 'eMediub',
                description: 'Doctor Consultation',
                order_id: order.id,
                handler: function (response: any) {
                    const verifyPayment = async () => {
                        try {
                            const verifyResponse = await PaymentService.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })

                            if (verifyResponse.success) {
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

        handleCreateOrder()
    }

    // Memoize table columns
    const columns = useMemo<Array<Column<ExtendedDoctor>>>(
        () => [
            {
                Header: 'Doctor',
                accessor: (row) => row.fullName,
                Cell: ({ row: { original } }) => (
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={60}
                            src={original.profilePhoto || '/img/avatars/default-avatar.jpg'}
                        />
                        <div>
                            <h5 className="font-semibold">{original.fullName}</h5>
                            <p className="text-gray-500">
                                {original.DoctorProfessional?.specialization}
                            </p>
                            <div className="flex items-center gap-1">
                                <span>
                                    {original.DoctorProfessional?.yearsOfExperience ?? 0} years
                                    experience
                                </span>
                                {original.DoctorProfessional?.consultationFees && (
                                    <span className="text-primary-500">
                                        ₹{original.DoctorProfessional.consultationFees}
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
                            {value === 'available' ? 'Available now' : 'Offline'}
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

    const renderDoctorCard = useCallback((doctor: ExtendedDoctor) => (
        <Card className="hover:shadow-md transition-shadow rounded-xl overflow-hidden">
            <div className="flex flex-col p-4 gap-4">
                <div className="flex items-center gap-4">
                    <Avatar
                        size={60}
                        src={doctor.profilePhoto || '/img/avatars/default-avatar.jpg'}
                    />
                    <div>
                        <h5 className="font-semibold">{doctor.fullName}</h5>
                        <p className="text-gray-500">
                            {doctor.DoctorProfessional?.specialization}
                        </p>
                        <div className="flex items-center gap-1">
                            <span>
                                {doctor.DoctorProfessional?.yearsOfExperience ?? 0} years
                                experience
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
                            {doctor.isOnline === 'available' ? 'Available now' : 'Offline'}
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
    ), [handleConsultNow])

    // Update stats count
    statsData[0].value = count

    return (
        <Container className="h-full">
            <div className="mb-8">
                <h3 className="mb-2">Video Doctor Consultation</h3>
                <p className="text-gray-500">Welcome back, {user.userName}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                {statsData.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                <span className={`text-2xl icon-${stat.icon}`}></span>
                            </div>
                            <div>
                                <h5 className="font-semibold text-sm">{stat.title}</h5>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold">{stat.value}</span>
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
                            <span className="text-sm mr-2">Show only available doctors</span>
                            <Switcher
                                checked={showOnlyAvailable}
                                onChange={handleAvailabilityToggle}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full">
                        <Button
                            className={`${selectedCategory === 'all' ? 'bg-primary-500 text-dark' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
                            variant={selectedCategory === 'all' ? 'solid' : 'default'}
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
                                    selectedCategory === category.value ? 'solid' : 'default'
                                }
                                onClick={() => handleCategoryChange(category.value)}
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
                cardTemplate={renderDoctorCard}
                enableTableListview={true}
                enableCardView={true}
                enableSearch={true}
            />
        </Container>
    )
}

export default UserHomePage 