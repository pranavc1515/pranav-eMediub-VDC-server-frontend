import { useState } from 'react'
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

interface ServiceCard {
    id: string
    title: string
    description: string
    icon: React.ComponentType<any>
    route: string
    color: string
    bgColor: string
}

const UserDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)

    const services: ServiceCard[] = [
        {
            id: 'virtual-consultation',
            title: 'Virtual Doctor Consultation',
            description: 'Connect with doctors online',
            icon: HiOutlineVideoCamera,
            route: '/vdc',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            id: 'appointment',
            title: 'Book Appointment',
            description: 'Schedule in-person visit',
            icon: HiOutlineCalendar,
            route: '/user/appointments',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            id: 'wellness',
            title: 'Wellness Programs',
            description: 'Health & wellness plans',
            icon: HiOutlineHeart,
            route: '/user/wellness',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            id: 'medicines',
            title: 'Order Medicines',
            description: 'Get medicines delivered',
            icon: HiOutlineCube,
            route: '/user/medicines',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            id: 'lab-test',
            title: 'Book Lab Test',
            description: 'Schedule diagnostic tests',
            icon: HiOutlineBeaker,
            route: '/user/lab-tests',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
        {
            id: 'insurance',
            title: 'Health Insurance',
            description: 'Manage your coverage',
            icon: HiOutlineShieldCheck,
            route: '/user/insurance',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
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
            id: 'family',
            title: 'Family Tree',
            icon: HiOutlineUserGroup,
            route: '/user/family',
            color: 'text-blue-600',
        },
        {
            id: 'profile',
            title: 'Profile Settings',
            icon: HiOutlineCog,
            route: '/user/profile',
            color: 'text-gray-600',
        },
    ]

    const handleServiceClick = (route: string) => {
        navigate(route)
    }

    const handleSearch = () => {
        if (searchTerm.trim()) {
            // Navigate to doctors search with the search term
            navigate(`/home?search=${encodeURIComponent(searchTerm)}`)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <Container className="py-6">
            {/* Header with Greeting */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar
                        size={50}
                        src={user.avatar || '/img/avatars/default-avatar.jpg'}
                        className="ring-2 ring-blue-100"
                    />
                    <div>
                        <p className="text-gray-600 text-sm">
                            {getGreeting()}!
                        </p>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {user.userName || 'User'}
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

            {/* Quick Actions */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quick Access
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Card
                            key={action.id}
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                            clickable
                            onClick={() => handleServiceClick(action.route)}
                        >
                            <div className="text-center">
                                <action.icon
                                    className={`h-6 w-6 mx-auto mb-2 ${action.color}`}
                                />
                                <p className="text-xs font-medium text-gray-700">
                                    {action.title}
                                </p>
                            </div>
                        </Card>
                    ))}
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
                            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                            clickable
                            onClick={() => handleServiceClick(service.route)}
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
