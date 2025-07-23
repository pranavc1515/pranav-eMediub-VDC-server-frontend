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
import { useTranslation } from '@/utils/hooks/useTranslation'

interface ServiceCard {
    id: string
    titleKey: string
    descriptionKey: string
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
    const [userImage, setUserImage] = useState('')
    const { t } = useTranslation()

    useEffect(() => {
        UserService.getProfileDetails().then(res => {
            setName(res?.data?.name || '')
            setUserImage(res?.data?.image || '')
        })
    }, [])

    const services: ServiceCard[] = [
        {
            id: 'virtual-consultation',
            titleKey: 'dashboard.virtualConsultation',
            descriptionKey: 'dashboard.virtualConsultationDesc',
            icon: HiOutlineVideoCamera,
            route: '/vdc',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            disabled: false,
        },
        {
            id: 'appointment',
            titleKey: 'dashboard.bookAppointment',
            descriptionKey: 'dashboard.comingSoon',
            icon: HiOutlineCalendar,
            route: '/user/appointments',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            disabled: true,
        },
        {
            id: 'wellness',
            titleKey: 'dashboard.wellnessPrograms',
            descriptionKey: 'dashboard.comingSoon',
            icon: HiOutlineHeart,
            route: '/user/wellness',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            disabled: true,
        },
        {
            id: 'medicines',
            titleKey: 'dashboard.orderMedicines',
            descriptionKey: 'dashboard.comingSoon',
            icon: HiOutlineCube,
            route: '/user/medicines',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            disabled: true,
        },
        {
            id: 'lab-test',
            titleKey: 'dashboard.bookLabTest',
            descriptionKey: 'dashboard.comingSoon',
            icon: HiOutlineBeaker,
            route: '/user/lab-tests',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            disabled: true,
        },
        {
            id: 'insurance',
            titleKey: 'dashboard.healthInsurance',
            descriptionKey: 'dashboard.comingSoon',
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
            titleKey: 'dashboard.myPrescriptions',
            icon: HiOutlineDocumentText,
            route: '/user/prescriptions',
            color: 'text-teal-600',
        },
        {
            id: 'profile',
            titleKey: 'dashboard.profileSettings',
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
        if (hour < 12) return t('dashboard.goodMorning')
        if (hour < 17) return t('dashboard.goodAfternoon')
        return t('dashboard.goodEvening')
    }

    return (
        <Container className="py-6">
            {/* Header with Greeting */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar
                        size={50}
                        src={userImage}
                        className="ring-2 ring-blue-100"
                    >
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <div>
                        <p className="text-gray-600 text-sm">{getGreeting()}</p>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {name || t('common.user')}
                        </h2>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Input
                        placeholder={t('dashboard.searchPlaceholder')}
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
                        {t('dashboard.search')}
                    </Button>
                </div>
            </div>

           

            {/* Main Services */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('dashboard.services')}
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
                                    {t(service.titleKey)}
                                </h4>
                                <p className="text-gray-500 text-xs">
                                    {t(service.descriptionKey)}
                                </p>
                                {service.disabled && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                        {t('dashboard.comingSoon')}
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
                        💡 {t('dashboard.healthTipOfTheDay')}
                    </h4>
                    <p className="text-gray-600 text-sm">
                        {t('dashboard.healthTipText')}
                    </p>
                </div>
            </Card>
        </Container>
    )
}

export default UserDashboard
