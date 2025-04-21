import { useState, useEffect } from 'react'
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
import { Link } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import useDoctors from '@/hooks/useDoctors'

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

// Add mock appointments data for doctor dashboard
const appointmentsData = [
    {
        id: 1,
        patientName: 'API Tester',
        time: '-',
        date: '2025-04-19',
        status: ' waiting',
        problem: 'General Checkup',
    },
    // Add more appointments as needed
]

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    // Get user from auth store
    const user = useSessionUser((state) => state.user)

    // Determine if user is doctor based on authority
    const isDoctor = user.authority?.includes('doctor') || false

    // Use custom hook to get doctors data with the updated props
    const specialization =
        selectedCategory !== 'all' ? selectedCategory : undefined
    const {
        doctors,
        count,
        loading,
        error,
        fetchDoctors,
        filterDoctors,
        totalPages = 1,
        currentPage: remotePage = 1,
        changePage,
        search,
    } = useDoctors({
        specialization,
        autoFetch: !isDoctor,
        showOnlyAvailable,
        initialPage: 1,
        pageSize: 15,
    })

    // Effect to refetch data when availability toggle changes
    useEffect(() => {
        if (!isDoctor) {
            fetchDoctors(currentPage)
        }
    }, [])

    // Update stats count
    statsData[0].value = count

    // Handle category change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value
        setSearchTerm(term)
        search(term)
    }

    // Handle availability toggle
    const handleAvailabilityToggle = (checked: boolean) => {
        setShowOnlyAvailable(checked)
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        changePage?.(page)
    }

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
                    <h4 className="mb-4">Patients in Queue</h4>
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
                                        <Badge
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50px',
                                                padding: '4px 8px',
                                            }}
                                            className="bg-yellow-400 text-white"
                                        >
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
                                placeholder="Search doctor"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                prefix={
                                    <span className="text-lg icon-search"></span>
                                }
                            />
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="flex justify-between items-center mb-2">
                                <h6 className="text-sm text-gray-500">
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
                        <span className="text-primary-500">
                            Loading doctors...
                        </span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-600 p-4 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {!loading && doctors && doctors.length > 0
                        ? doctors.map((doctor) => (
                              <Card
                                  key={doctor.id}
                                  className="hover:shadow-lg transition-shadow"
                              >
                                  <div className="flex items-center gap-4 mb-4">
                                      <Avatar
                                          size={60}
                                          src={
                                              doctor.profilePhoto ||
                                              '/img/avatars/default-avatar.jpg'
                                          }
                                      />
                                      <div>
                                          <h5 className="font-semibold">
                                              {doctor.fullName}
                                          </h5>
                                          <p className="text-gray-500">
                                              {
                                                  doctor.DoctorProfessional
                                                      ?.specialization
                                              }
                                          </p>
                                          <div className="flex items-center gap-1">
                                              <span>
                                                  {
                                                      doctor.DoctorProfessional
                                                          ?.yearsOfExperience
                                                  }{' '}
                                                  years experience
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <Badge
                                          style={{
                                              borderRadius: '50px',
                                              padding: '4px 8px',
                                          }}
                                          className={
                                              doctor.isOnline === 'available'
                                                  ? 'bg-emerald-500 text-white'
                                                  : 'bg-gray-500 text-white'
                                          }
                                      >
                                          {doctor.isOnline === 'available'
                                              ? 'Available now'
                                              : 'Offline'}
                                      </Badge>
                                      <Button
                                          variant="solid"
                                          size="sm"
                                          disabled={
                                              doctor.isOnline !== 'available'
                                          }
                                          className={
                                              doctor.isOnline !== 'available'
                                                  ? 'opacity-50 cursor-not-allowed'
                                                  : ''
                                          }
                                      >
                                          <span className="icon-video mr-1"></span>
                                          <Link
                                              to={
                                                  doctor.isOnline ===
                                                  'available'
                                                      ? `/user/video-consultation/${doctor.id}`
                                                      : '#'
                                              }
                                              className="text-white"
                                              onClick={(e) =>
                                                  doctor.isOnline !==
                                                      'available' &&
                                                  e.preventDefault()
                                              }
                                          >
                                              Consult Now
                                          </Link>
                                      </Button>
                                  </div>
                              </Card>
                          ))
                        : !loading && (
                              <div className="col-span-full text-center p-8">
                                  <div className="text-gray-400 text-xl mb-2">
                                      No doctors available for the selected
                                      category
                                  </div>
                                  <Button
                                      variant="plain"
                                      onClick={() =>
                                          handleCategoryChange('all')
                                      }
                                  >
                                      Show all doctors
                                  </Button>
                              </div>
                          )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mb-6">
                        <Pagination
                            currentPage={currentPage}
                            total={totalPages}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </Container>
        )
    }

    return isDoctor ? renderDoctorDashboard() : renderPatientDashboard()
}

export default Home
