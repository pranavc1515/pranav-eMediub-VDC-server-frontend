import { useState } from 'react'
import { 
    Card, 
    Button, 
    Tabs,
    Input, 
    FormItem, 
    FormContainer, 
    Alert,
    Dialog,
    Select
} from '@/components/ui'
import Container from '@/components/shared/Container'
import { HiOutlineKey, HiOutlineBell, HiOutlineShieldCheck, HiOutlineTrash, HiOutlineGlobeAlt } from 'react-icons/hi'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    PasswordChangeSchema,
    type PasswordChangeFormData
} from '@/utils/validationSchemas'
import { useLocaleStore } from '@/store/localeStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import UserService from '@/services/UserService'

// Language options for the user interface
const languageOptions = [
    { value: 'en_US', label: 'English', nativeLabel: 'English' },
    { value: 'hi_IN', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { value: 'kn_IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
]

const Settings = () => {
    const { user, deleteAccount } = useAuth()
    const { t } = useTranslation()
    const { currentLang, setLang } = useLocaleStore()
    const [activeTab, setActiveTab] = useState('account')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [languageLoading, setLanguageLoading] = useState(false)
    
    // Password change form
    const passwordForm = useForm<PasswordChangeFormData>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })
    
    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        appNotifications: true
    })
    
    const handleNotificationChange = (name: string, checked: boolean) => {
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }))
    }
    
    const handlePasswordSubmit = async (data: PasswordChangeFormData) => {
        try {
            setError('')
            setSuccess('')
            
            // TODO: Implement actual password change API call
            // const response = await UserService.changePassword(data)
            
            // Mock success for now
            setSuccess('Password updated successfully!')
            
            // Reset form
            passwordForm.reset()
        } catch (err) {
            setError('Failed to update password. Please try again.')
        }
    }
    
    const handleSaveNotifications = async () => {
        try {
            setError('')
            setSuccess('')
            
            // TODO: Implement notification settings API call
            // const response = await UserService.updateNotificationSettings(notifications)
            
            // Mock success
            setSuccess('Notification preferences saved successfully!')
        } catch (err) {
            setError('Failed to save notification preferences. Please try again.')
        }
    }

    const handleLanguageChange = async (selectedOption: any) => {
        if (!selectedOption) return
        
        setLanguageLoading(true)
        setError('')
        setSuccess('')
        
        try {
            // Update language on server
            await UserService.updateLanguage(selectedOption.value)
            
            // Map API language codes to locale store format
            const localeMap: { [key: string]: string } = {
                'en_US': 'en',
                'hi_IN': 'hi',
                'kn_IN': 'kn'
            }
            
            const newLocale = localeMap[selectedOption.value] || 'en'
            
            // Update local language state
            setLang(newLocale)
            
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
            const success = await deleteAccount()
            if (!success) {
                setError('Failed to delete account. Please try again later.')
                setDeleteDialogOpen(false)
            }
        } catch (err) {
            setError('An error occurred while deleting your account.')
            setDeleteDialogOpen(false)
        } finally {
            setDeleteLoading(false)
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
                    <h1 className="text-2xl font-bold mb-6">{t('settings.accountSettings')}</h1>
                    
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
                                        value={languageOptions.find(option => {
                                            const currentApiLang = currentLang === 'en' ? 'en_US' : 
                                                                   currentLang === 'hi' ? 'hi_IN' : 
                                                                   currentLang === 'kn' ? 'kn_IN' : 'en_US'
                                            return option.value === currentApiLang
                                        })}
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
        </Container>
    )
}

export default Settings 