import { useState, useEffect } from 'react'
import { 
    Card, 
    Button, 
    Tabs,
    Alert,
    Dialog,
    Select,
    FormItem
} from '@/components/ui'
import Container from '@/components/shared/Container'
import EmailVerificationDrawer from '@/components/shared/EmailVerificationDrawer'
import { HiOutlineGlobeAlt, HiOutlineTrash, HiOutlineMail, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { useAuth } from '@/auth'
import { useLocaleStore } from '@/store/localeStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import DoctorService from '@/services/DoctorService'

// Language options for the doctor interface
const languageOptions = [
    { value: 'en', label: 'English', nativeLabel: 'English' },
    { value: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { value: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
]

const DoctorSettings = () => {
    const { user } = useAuth()
    const { t } = useTranslation()
    const { currentLang, setLang } = useLocaleStore()
    const [activeTab, setActiveTab] = useState('account')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [languageLoading, setLanguageLoading] = useState(false)
    const [currentDoctorLanguage, setCurrentDoctorLanguage] = useState('en')
    const [emailVerificationDrawerOpen, setEmailVerificationDrawerOpen] = useState(false)
    const [emailVerificationStatus, setEmailVerificationStatus] = useState({
        isVerified: false,
        email: '',
        loading: true
    })

    // Load current language preference and email verification status from server
    useEffect(() => {
        const loadDoctorLanguage = async () => {
            try {
                const response = await DoctorService.getLanguage()
                if (response.success) {
                    setCurrentDoctorLanguage(response.data.uiLanguage)
                    // Sync with local store if different
                    if (response.data.uiLanguage !== currentLang) {
                        setLang(response.data.uiLanguage)
                    }
                }
            } catch (err) {
                console.error('Error loading doctor language preference:', err)
            }
        }

        const loadEmailVerificationStatus = async () => {
            // Try to get user ID from multiple sources
            let userId = user?.id
            
            // If user.id is not available, try to get it from localStorage
            if (!userId) {
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser)
                        userId = parsedUser.id || parsedUser.userId
                    } catch (e) {
                        console.error('Error parsing stored user:', e)
                    }
                }
            }
            
            // If still no user ID, try to get it from the auth token
            if (!userId) {
                const token = localStorage.getItem('token')
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        userId = payload.id
                    } catch (e) {
                        console.error('Error parsing token:', e)
                    }
                }
            }
            
            if (!userId) {
                console.log('No user ID found from any source')
                return
            }
            
            console.log('Loading email verification status for user:', userId)
            
            try {
                setEmailVerificationStatus(prev => ({ ...prev, loading: true }))
                
                // Get the doctor's profile to get their email
                const profileResponse = await DoctorService.getProfile(Number(userId))
                let doctorEmail = ''
                
                console.log('Profile response:', profileResponse)
                
                // Get email and verification status from profile response
                if (profileResponse.success && profileResponse.data) {
                    doctorEmail = profileResponse.data.email || ''
                    const isEmailVerified = profileResponse.data.emailVerified || false
                    
                    console.log('Found email in profile:', doctorEmail)
                    console.log('Email verification status:', isEmailVerified)
                    
                    setEmailVerificationStatus({
                        isVerified: isEmailVerified,
                        email: doctorEmail,
                        loading: false
                    })
                    
                    console.log('Set verification status from profile:', {
                        isVerified: isEmailVerified,
                        email: doctorEmail
                    })
                } else {
                    // If profile doesn't have email, try other sources
                    if (!doctorEmail && user?.email) {
                        doctorEmail = user.email
                        console.log('Found email in user object:', doctorEmail)
                    }
                    
                    if (!doctorEmail) {
                        const storedUser = localStorage.getItem('user')
                        if (storedUser) {
                            try {
                                const parsedUser = JSON.parse(storedUser)
                                if (parsedUser.email) {
                                    doctorEmail = parsedUser.email
                                    console.log('Found email in localStorage:', doctorEmail)
                                }
                            } catch (e) {
                                console.error('Error parsing stored user:', e)
                            }
                        }
                    }
                    
                    setEmailVerificationStatus({
                        isVerified: false,
                        email: doctorEmail || `${user?.fullName || 'doctor'}@example.com`,
                        loading: false
                    })
                    
                    console.log('Set fallback verification status:', {
                        isVerified: false,
                        email: doctorEmail
                    })
                }
            } catch (err) {
                console.error('Error loading email verification status:', err)
                            // Set a default state if everything fails
            setEmailVerificationStatus({
                isVerified: false,
                email: `${user?.fullName || 'doctor'}@example.com`, // Default email for testing
                loading: false
            })
            }
        }

        loadDoctorLanguage()
        loadEmailVerificationStatus()
    }, [currentLang, setLang, user?.id])

    const handleLanguageChange = async (selectedOption: any) => {
        if (!selectedOption) return
        
        setLanguageLoading(true)
        setError('')
        setSuccess('')
        
        try {
            // Update language on server
            await DoctorService.updateLanguage(selectedOption.value)
            
            // Update local language state
            setLang(selectedOption.value)
            setCurrentDoctorLanguage(selectedOption.value)
            
            setSuccess(t('settings.updateSuccess'))
        } catch (err) {
            console.error('Error updating language:', err)
            setError(t('settings.updateError'))
        } finally {
            setLanguageLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleteLoading(true)
        try {
            const response = await DoctorService.deleteAccount()
            if (response.success) {
                // Clear auth state and redirect
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // Force redirect to sign-in page
                window.location.href = '/auth/sign-in'
            } else {
                setError(response.message || 'Failed to delete account. Please try again later.')
                setDeleteDialogOpen(false)
            }
        } catch (err: any) {
            console.error('Delete account error:', err)
            setError('An error occurred while deleting your account.')
            setDeleteDialogOpen(false)
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleEmailVerificationSuccess = () => {
        // Reload email verification status
        if (user?.id) {
            DoctorService.getEmailVerificationStatus(Number(user.id))
                .then(response => {
                    if (response.success) {
                        setEmailVerificationStatus({
                            isVerified: response.data.emailVerified,
                            email: response.data.email,
                            loading: false
                        })
                        setSuccess(t('settings.emailVerifiedSuccess'))
                    }
                })
                .catch(err => {
                    console.error('Error reloading email verification status:', err)
                })
        }
    }
    
    return (
        <Container className="py-6">
            {success && (
                <Alert type="success" showIcon className="mb-4" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert type="danger" showIcon className="mb-4" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            
            <Card className="max-w-4xl mx-auto">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
                    
                    <Tabs value={activeTab} onChange={(val) => setActiveTab(val as string)}>
                        <Tabs.TabList>
                            <Tabs.TabNav value="account">
                                {t('settings.accountSettings')}
                            </Tabs.TabNav>
                            <Tabs.TabNav value="language">
                                <HiOutlineGlobeAlt className="text-lg mr-2" />
                                {t('settings.language')}
                            </Tabs.TabNav>
                        </Tabs.TabList>
                        
                        <Tabs.TabContent value="account">
                            <div className="mt-6">
                                {/* Email Verification Section */}
                                <div className="mb-8">
                                    <h4 className="mb-4 flex items-center">
                                        <HiOutlineMail className="text-lg mr-2" />
                                        {t('settings.emailVerification')}
                                    </h4>
                                    <p className="mb-6 text-gray-600">
                                        {t('settings.emailVerificationDesc')}
                                    </p>

                                    {emailVerificationStatus.loading ? (
                                        <div className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    ) : emailVerificationStatus.email ? (
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {emailVerificationStatus.email}
                                                </div>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    emailVerificationStatus.isVerified 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {emailVerificationStatus.isVerified ? (
                                                        <>
                                                            <HiOutlineCheckCircle className="h-3 w-3" />
                                                            {t('settings.emailVerified')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiOutlineExclamationCircle className="h-3 w-3" />
                                                            {t('settings.emailNotVerified')}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {!emailVerificationStatus.isVerified ? (
                                                <Button
                                                    size="sm"
                                                    variant="solid"
                                                    onClick={() => setEmailVerificationDrawerOpen(true)}
                                                    icon={<HiOutlineMail />}
                                                >
                                                    {t('settings.verifyEmail')}
                                                </Button>
                                            ) : (
                                                <div className="text-sm text-green-600 font-medium">
                                                    {t('settings.emailVerified')}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 border rounded-lg bg-gray-50">
                                            <div className="text-center">
                                                <HiOutlineMail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500 mb-3">No email address found</p>
                                                <p className="text-sm text-gray-400">
                                                    Please update your profile with an email address to enable verification.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Account Section */}
                                <div className="mt-8 pt-4 border-t">
                                    <h4 className="mb-4 flex items-center text-red-500">
                                        <HiOutlineTrash className="text-lg mr-2" /> 
                                        {t('settings.deleteAccount')}
                                    </h4>
                                    <p className="mb-4 text-gray-500">
                                        {t('settings.deleteAccountWarning')}
                                    </p>
                                    <Button 
                                        variant="solid"
                                        color="red-500"
                                        onClick={() => setDeleteDialogOpen(true)}
                                        icon={<HiOutlineTrash />}
                                    >
                                        {t('settings.deleteAccount')}
                                    </Button>
                                </div>
                            </div>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="language">
                            <div className="mt-6">
                                <h4 className="mb-4 flex items-center">
                                    <HiOutlineGlobeAlt className="text-lg mr-2" />
                                    {t('settings.language')}
                                </h4>
                                <p className="mb-6 text-gray-600">
                                    {t('settings.languageSelection')}
                                </p>
                                
                                <FormItem label={t('settings.language')} className="max-w-md">
                                    <Select
                                        value={languageOptions.find(option => option.value === currentDoctorLanguage)}
                                        options={languageOptions}
                                        onChange={handleLanguageChange}
                                        isLoading={languageLoading}
                                        placeholder={t('settings.languageSelection')}
                                        getOptionLabel={(option: any) => `${option.label} (${option.nativeLabel})`}
                                        getOptionValue={(option: any) => option.value}
                                    />
                                </FormItem>

                                {languageLoading && (
                                    <div className="mt-4 text-sm text-gray-500">
                                        {t('common.loading')}
                                    </div>
                                )}
                            </div>
                        </Tabs.TabContent>
                       
                    </Tabs>
                </div>
            </Card>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <div className="px-6 pb-6">
                    <h5 className="mb-4 text-lg font-semibold">{t('settings.deleteAccount')}</h5>
                    <h6 className="mb-4">{t('settings.deleteAccountConfirm')}</h6>
                    <p className="mb-6 text-gray-500">
                        {t('settings.deleteAccountPermanent')}
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteLoading}
                        >
                            {t('settings.cancel')}
                        </Button>
                        <Button
                            variant="solid"
                            color="red-500"
                            onClick={handleDeleteAccount}
                            loading={deleteLoading}
                            icon={<HiOutlineTrash />}
                        >
                            {t('settings.deleteAccount')}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Email Verification Drawer */}
            <EmailVerificationDrawer
                isOpen={emailVerificationDrawerOpen}
                onClose={() => setEmailVerificationDrawerOpen(false)}
                onVerificationSuccess={handleEmailVerificationSuccess}
                doctorEmail={emailVerificationStatus.email}
                isEmailVerified={emailVerificationStatus.isVerified}
            />
        </Container>
    )
}

export default DoctorSettings 