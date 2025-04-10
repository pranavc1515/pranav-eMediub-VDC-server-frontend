import { useState } from 'react'
import {
    Card,
    Input,
    Button,
    Badge,
    Avatar,
    Table,
} from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { Link } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import useDoctors from '@/hooks/useDoctors'

const problemCategories = [
    { value: 'general', label: 'General Health' },
    { value: 'cardiology', label: 'Heart & Cardiology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'dermatology', label: 'Skin Problems' },
    { value: 'orthopedics', label: 'Bone & Joint Pain' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'other', label: 'Other Problems' },
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

// Add mock appointments data for doctor dashboard
const appointmentsData = [
    {
        id: 1,
        patientName: 'John Doe',
        time: '10:00 AM',
        date: '2024-03-20',
        status: 'upcoming',
        problem: 'General Checkup',
    },
    // Add more appointments as needed
]

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Get user from auth store
    const user = useSessionUser((state) => state.user)

    // Determine if user is doctor based on authority
    const isDoctor = user.authority?.includes('doctor') || false

    // Use custom hook to get doctors data
    const specialization = selectedCategory !== 'all' ? selectedCategory : undefined
    const { doctors, count, loading, error, filterDoctors } = useDoctors({
        specialization,
        autoFetch: !isDoctor
    })

    // Update stats count
    statsData[0].value = count

    // Handle category change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
    }

    // Filter doctors by search term
    const filteredDoctors = filterDoctors(searchTerm)

    const renderDoctorDashboard = () => {
        return (
            <Container className="h-full">
                <div className="mb-8">
                    <h3 className="mb-2">Doctor Dashboard</h3>
                    <p className="text-gray-500">
                        Welcome back, {user.userName}
                    </p>
                </div>

                {/* Doctor Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                <span className="text-2xl icon-calendar"></span>
                            </div>
                            <div>
                                <h5 className="font-semibold text-sm">
                                    Today&apos;s Appointments
                                </h5>
                                <div className="text-xl font-bold">8</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                <span className="text-2xl icon-users"></span>
                            </div>
                            <div>
                                <h5 className="font-semibold text-sm">
                                    Total Patients
                                </h5>
                                <div className="text-xl font-bold">124</div>
                            </div>
                        </div>
                    </Card>
                    {/* Add more stats cards as needed */}
                </div>

                {/* Upcoming Appointments */}
                <Card className="mb-6">
                    <h4 className="mb-4">Upcoming Appointments</h4>
                    <Table>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Problem</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointmentsData.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.patientName}</td>
                                    <td>{appointment.date}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.problem}</td>
                                    <td>
                                        <Badge className="bg-emerald-500">
                                            {appointment.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button variant="solid" size="sm">
                                            Start Consultation
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Container>
        )
    }

    const renderPatientDashboard = () => {
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
                                        {/* <span
                                            className={`text-xs ${stat.growth > 0 ? 'text-emerald-500' : 'text-red-500'}`}
                                        >
                                            {stat.growth > 0 ? '+' : ''}
                                            {stat.growth}%
                                        </span> */}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Search and Problem Selection */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-1/3">
                            <Input
                                placeholder="Search doctor or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                prefix={
                                    <span className="text-lg icon-search"></span>
                                }
                            />
                        </div>
                        <div className="w-full md:w-2/3">
                            <h6 className="mb-2 text-sm text-gray-500">
                                Select your health concern:
                            </h6>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    className={`${selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
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
                                        className={`${selectedCategory === category.value ? 'bg-primary-500 text-white' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
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
                    </div>
                </Card>

                {/* Banner */}
                <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-2/3 p-4">
                            <h4 className="text-xl font-bold mb-2">
                                Start Your Video Consultation Now
                            </h4>
                            <p className="mb-4">
                                Connect with a doctor instantly and get medical
                                advice from the comfort of your home.
                            </p>
                            {/* <Link to="/video-consultation">
                                <Button
                                    variant="solid"
                                    className="bg-white text-blue-600 hover:bg-gray-100"
                                >
                                    <span className="icon-video mr-2"></span>
                                    Start Consultation
                                </Button>
                            </Link> */}
                        </div>
                        <div className="md:w-1/3 flex justify-end">
                            <DoubleSidedImage
                                src="/img/others/doctor-consultation.png"
                                darkModeSrc="/img/others/doctor-consultation-dark.png"
                                alt="Video consultation"
                                className="h-40 object-contain"
                            />
                        </div>
                    </div>
                </Card>

                {/* Loading and Error States */}
                {loading && (
                    <div className="flex justify-center p-4">
                        <span className="text-primary-500">Loading doctors...</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 text-red-600 p-4 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {!loading && filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar 
                                        size={60} 
                                        src={doctor.profilePhoto || '/img/avatars/default-avatar.jpg'} 
                                    />
                                    <div>
                                        <h5 className="font-semibold">
                                            {doctor.fullName}
                                        </h5>
                                        <p className="text-gray-500">
                                            {doctor.DoctorProfessional?.specialization}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="mx-1">•</span>
                                            <span>{doctor.DoctorProfessional?.yearsOfExperience} years exp.</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Badge className="bg-emerald-500">
                                        Available now
                                    </Badge>
                                    <Button variant="solid" size="sm">
                                        <span className="icon-video mr-1"></span>
                                        <Link
                                            to={`/user/video-consultation/${doctor.id}`}
                                            className="text-white"
                                        >
                                            Consult Now
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : !loading && (
                        <div className="col-span-full text-center p-8">
                            <div className="text-gray-400 text-xl mb-2">
                                No doctors available for the selected category
                            </div>
                            <Button
                                variant="plain"
                                onClick={() => handleCategoryChange('all')}
                            >
                                Show all doctors
                            </Button>
                        </div>
                    )}
                </div>
            </Container>
        )
    }

    return isDoctor ? renderDoctorDashboard() : renderPatientDashboard()
}

export default Home
