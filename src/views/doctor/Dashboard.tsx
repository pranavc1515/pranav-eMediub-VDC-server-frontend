import { useState, useEffect } from 'react'
import { Card, Input, Button, Avatar, Switcher } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import {
    HiOutlineVideoCamera,
    HiOutlineCalendar,
    HiOutlineClipboardCheck,
    HiOutlineUsers,
    HiOutlineDocumentReport,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlineCog,
    HiOutlineUserGroup,
    HiOutlineClock,
    HiOutlineInformationCircle,
} from 'react-icons/hi'
import DoctorService from '@/services/DoctorService'
import VDCConfigurationDrawer from '@/components/shared/VDCConfigurationDrawer'
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
    comingSoon?: boolean
}

const DoctorDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [isAvailable, setIsAvailable] = useState(false)
    const [isToggling, setIsToggling] = useState(false)
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [profilePhoto, setProfilePhoto] = useState('')
    const { t } = useTranslation()
    
    // VDC related state
    const [vdcStatus, setVdcStatus] = useState<{
        vdcEnabled: boolean
        hasOptedVDC: boolean
    } | null>(null)
    const [vdcSettings, setVdcSettings] = useState<any>(null)
    const [isVdcDrawerOpen, setIsVdcDrawerOpen] = useState(false)
    const [isLoadingVdcStatus, setIsLoadingVdcStatus] = useState(true)

    // Initialize with default availability status
    useEffect(() => {
        // In a real implementation, we would fetch the doctor's availability status from the API
        const savedStatus = localStorage.getItem('doctor-availability')
        setIsAvailable(savedStatus === 'true')
    }, [])

    useEffect(() => {
        DoctorService.getProfile().then(res => {
            setName(res?.data?.fullName || '')
            setProfilePhoto(res?.data?.profilePhoto || '')
        })
        
        // Fetch VDC status
        fetchVdcStatus()
    }, [])

    const fetchVdcStatus = async () => {
        try {
            setIsLoadingVdcStatus(true)
            const statusResponse = await DoctorService.getVDCStatus()
            setVdcStatus(statusResponse.data)
            
            // If VDC is enabled, fetch settings
            if (statusResponse.data.hasOptedVDC) {
                const settingsResponse = await DoctorService.getVDCSettings()
                setVdcSettings(settingsResponse.data)
            }
        } catch (error) {
            console.error('Error fetching VDC status:', error)
        } finally {
            setIsLoadingVdcStatus(false)
        }
    }

    const handleToggleAvailability = async () => {
        setIsToggling(true)
        try {
            // In a real implementation, we would call an API to update the doctor's availability status
            const newStatus = !isAvailable
            localStorage.setItem('doctor-availability', String(newStatus))
            setIsAvailable(newStatus)
            
            // Simulate API delay
            setTimeout(() => {
                setIsToggling(false)
            }, 500)
        } catch (error) {
            console.error('Error toggling availability:', error)
            setIsToggling(false)
        }
    }

    const handleVdcConfigurationSuccess = async (enabled: boolean) => {
        // Refresh VDC status after successful configuration
        await fetchVdcStatus()
    }

    const handleVdcCardClick = () => {
        if (!vdcStatus?.hasOptedVDC) {
            // Open configuration drawer for new setup
            setIsVdcDrawerOpen(true)
        } else {
            // Navigate to VDC interface if already configured
            navigate('/vdc')
        }
    }

    const handleVdcSettingsClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsVdcDrawerOpen(true)
    }

    const services: ServiceCard[] = [
        {
            id: 'vdc',
            titleKey: 'vdc.virtualDoctorConsultation',
            descriptionKey: 'dashboard.virtualConsultationDesc',
            icon: HiOutlineVideoCamera,
            route: '/vdc',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            disabled: false,
        },
        {
            id: 'ipc',
            titleKey: 'dashboard.inPersonConsultation',
            descriptionKey: 'dashboard.inPersonConsultationDesc',
            icon: HiOutlineUserGroup,
            route: '/doctor/ipc',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            disabled: true,
            comingSoon: true,
        },
    ]

    const quickActions = [
        {
            id: 'profile',
            titleKey: 'dashboard.myProfile',
            icon: HiOutlineCog,
            route: '/doctor/profile',
            color: 'text-gray-600',
        },
        {
            id: 'reports',
            titleKey: 'dashboard.patientReports',
            icon: HiOutlineDocumentText,
            route: '/doctor/reports',
            color: 'text-teal-600',
        },
    ]

    const handleServiceClick = (route: string, disabled: boolean = false, serviceId?: string) => {
        if (disabled) return
        
        if (serviceId === 'vdc') {
            handleVdcCardClick()
        } else {
            navigate(route)
        }
    }

    const handleSearch = () => {
        if (searchTerm.trim()) {
            // Navigate to patients search with the search term
            navigate(`/doctor/dashboard?search=${encodeURIComponent(searchTerm)}`)
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
            {/* Header with Greeting and Availability Toggle */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            size={50}
                            src={profilePhoto}
                            className="ring-2 ring-blue-100"
                            icon={!profilePhoto ? <span>👨‍⚕️</span> : undefined}
                        />
                        <div>
                            <p className="text-gray-600 text-sm">{getGreeting()}, Dr.</p>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {name || t('common.doctor')}
                            </h2>
                        </div>
                    </div>
                    
                </div>

               
            </div>

           

            {/* Services */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('dashboard.services')}
                </h3>
                <p className="text-gray-600 mb-6">{t('dashboard.servicesDescription')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                        <Card
                            key={service.id}
                            className={`p-6 transition-all duration-200 ${
                                service.disabled 
                                    ? 'opacity-90 cursor-not-allowed' 
                                    : 'cursor-pointer hover:shadow-lg'
                            }`}
                            clickable={!service.disabled}
                            onClick={() => handleServiceClick(service.route, service.disabled, service.id)}
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center mb-4`}
                                >
                                    <service.icon
                                        className={`h-8 w-8 ${service.color}`}
                                    />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-xl mb-2">
                                    {t(service.titleKey)}
                                </h4>
                                <p className="text-gray-700 text-center mb-4">
                                    {t(service.descriptionKey)}
                                </p>
                                
                                {/* VDC specific content */}
                                {service.id === 'vdc' ? (
                                    <div className="w-full">
                                        {isLoadingVdcStatus ? (
                                            <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                <span className="ml-2 text-sm text-gray-600">{t('common.loading')}</span>
                                            </div>
                                        ) : vdcStatus?.hasOptedVDC ? (
                                            <div className="space-y-3">
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm font-medium text-green-800">{t('vdc.vdcEnabled')}</span>
                                                        </div>
                                                        <Button
                                                            size="xs"
                                                            variant="solid"
                                                            className="bg-green-600 hover:bg-green-700 flex items-center"
                                                            onClick={handleVdcSettingsClick}
                                                        >
                                                            <HiOutlineCog className="h-3 w-3 mr-1" />
                                                            {t('common.settings')}
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {vdcSettings && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-blue-800 font-medium">{t('vdc.consultationFees')}:</span>
                                                            <span className="text-blue-900 font-semibold">₹{vdcSettings.consultationFees}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-blue-700">
                                                            <HiOutlineClock className="h-4 w-4" />
                                                            <span>{vdcSettings.availableDays?.length || 0} {t('dashboard.daysAvailable')}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="text-center">
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {t('dashboard.startAcceptingConsultations')}
                                                    </p>
                                                    <Button 
                                                        variant="solid" 
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {t('dashboard.accessVDCInterface')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-gray-600 text-sm text-center">
                                                    {t('dashboard.vdcDescription')}
                                                </p>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <HiOutlineInformationCircle className="h-4 w-4 text-yellow-600" />
                                                        <span className="text-sm font-medium text-yellow-800">{t('dashboard.setupRequired')}</span>
                                                    </div>
                                                    <p className="text-xs text-yellow-700">
                                                        {t('dashboard.vdcSetupDescription')}
                                                    </p>
                                                </div>
                                                <Button 
                                                    variant="solid" 
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                >
                                                    {t('vdc.setupVDC')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-600 text-sm text-center mb-4">
                                            {service.id === 'ipc' ? 
                                                t('dashboard.ipcDescription') :
                                                t('dashboard.serviceDescription')
                                            }
                                        </p>
                                        
                                        {service.id === 'ipc' && (
                                            <div className="mt-4 w-full h-12 relative flex items-center justify-center">
                                                <div className="bg-gray-800 bg-opacity-70 text-white px-4 py-2 rounded-full font-medium">
                                                    {t('dashboard.comingSoon')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>


            {/* Tips or Banner */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                        💡 {t('dashboard.tipForDoctors')}
                    </h4>
                    <p className="text-gray-600 text-sm">
                        {t('dashboard.doctorTipText')}
                    </p>
                </div>
            </Card>

            {/* VDC Configuration Drawer */}
            <VDCConfigurationDrawer
                isOpen={isVdcDrawerOpen}
                onClose={() => setIsVdcDrawerOpen(false)}
                onSuccess={handleVdcConfigurationSuccess}
                initialData={vdcSettings}
            />
        </Container>
    )
}

export default DoctorDashboard 