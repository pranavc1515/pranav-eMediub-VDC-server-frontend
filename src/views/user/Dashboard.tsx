import { useState, useEffect } from 'react'
import { Card, Input, Button, Avatar } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import {
    HiOutlineVideoCamera,
    HiOutlineCalendar,
    HiOutlineHeart,
    HiOutlineCube,
    HiOutlineBeaker,
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiOutlineCog,
    HiOutlineUserGroup,
} from 'react-icons/hi'
import UserService from '@/services/UserService'

interface ServiceCard {
    id: string
    title: string
    description: string
    icon: React.ComponentType<any>
    route: string
    color: string
    bgColor: string
    disabled?: boolean
}

const UserDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const [name, setName] = useState('')

    useEffect(() => {
        UserService.getProfileDetails().then(res => {
            setName(res?.data?.name || '')
        })
    }, [])

    const services: ServiceCard[] = [
        {
            id: 'virtual-consultation',
            title: 'Virtual Doctor Consultation',
            description: 'Connect with doctors online',
            icon: HiOutlineVideoCamera,
            route: '/vdc',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            disabled: false,
        },
        {
            id: 'appointment',
            title: 'Book Appointment',
            description: 'Coming Soon',
            icon: HiOutlineCalendar,
            route: '/user/appointments',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            disabled: true,
        },
        {
            id: 'wellness',
            title: 'Wellness Programs',
            description: 'Coming Soon',
            icon: HiOutlineHeart,
            route: '/user/wellness',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            disabled: true,
        },
        {
            id: 'medicines',
            title: 'Order Medicines',
            description: 'Coming Soon',
            icon: HiOutlineCube,
            route: '/user/medicines',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            disabled: true,
        },
        {
            id: 'lab-test',
            title: 'Book Lab Test',
            description: 'Coming Soon',
            icon: HiOutlineBeaker,
            route: '/user/lab-tests',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            disabled: true,
        },
        {
            id: 'insurance',
            title: 'Health Insurance',
            description: 'Coming Soon',
            icon: HiOutlineShieldCheck,
            route: '/user/insurance',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            disabled: true,
        },
    ]

    const quickActions = [
        {
            id: 'prescriptions',
            title: 'My Prescriptions',
            icon: HiOutlineDocumentText,
            route: '/user/prescriptions',
            color: 'text-teal-600',
        },
        {
            id: 'profile',
            title: 'Profile Settings',
            icon: HiOutlineCog,
            route: '/user/profile',
            color: 'text-gray-600',
        },
    ]

    const handleServiceClick = (route: string, disabled: boolean = false) => {
        if (!disabled) {
            navigate(route)
        }
    }

    const handleSearch = () => {
        if (searchTerm.trim()) {
            // Navigate to doctors search with the search term
            navigate(`/home?search=${encodeURIComponent(searchTerm)}`)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Hi there!'
        if (hour < 17) return 'Hi there!'
        return 'Hi there!'
    }

    return (
        <Container className="py-6">
            {/* Header with Greeting */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar
                        size={50}
                        src={''} // You can fetch and use image if needed
                        className="ring-2 ring-blue-100"
                    />
                    <div>
                        <p className="text-gray-600 text-sm">Hi there!</p>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {name || 'User'}
                        </h2>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Input
                        placeholder="Search doctors, specialists or clinics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pr-12"
                    />
                    <Button
                        size="sm"
                        className="absolute right-1 top-1 h-8 px-3"
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </div>
            </div>

           

            {/* Main Services */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Our Services
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => (
                        <Card
                            key={service.id}
                            className={`p-4 transition-all duration-200 ${
                                service.disabled 
                                    ? 'opacity-70 cursor-not-allowed' 
                                    : 'cursor-pointer hover:shadow-lg hover:scale-105'
                            }`}
                            clickable={!service.disabled}
                            onClick={() => handleServiceClick(service.route, service.disabled)}
                        >
                            <div className="text-center">
                                <div
                                    className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}
                                >
                                    <service.icon
                                        className={`h-8 w-8 ${service.color}`}
                                    />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                    {service.title}
                                </h4>
                                <p className="text-gray-500 text-xs">
                                    {service.description}
                                </p>
                                {service.disabled && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Health Tips or Banner */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                        💡 Health Tip of the Day
                    </h4>
                    <p className="text-gray-600 text-sm">
                        Stay hydrated! Drinking enough water helps maintain your
                        body temperature, lubricates joints, and helps transport
                        nutrients to cells.
                    </p>
                </div>
            </Card>
        </Container>
    )
}

export default UserDashboard
