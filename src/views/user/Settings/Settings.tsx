import { useState } from 'react'
import { 
    Card, 
    Button, 
    Tabs,
    Input, 
    FormItem, 
    FormContainer, 
    Alert
} from '@/components/ui'
import Container from '@/components/shared/Container'
import { HiOutlineKey, HiOutlineBell, HiOutlineShieldCheck } from 'react-icons/hi'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    PasswordChangeSchema,
    type PasswordChangeFormData
} from '@/utils/validationSchemas'

const Settings = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('account')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    
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
                    <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                    
                    <Tabs value={activeTab} onChange={(val) => setActiveTab(val as string)}>
                        <Tabs.TabList>
                            <Tabs.TabNav value="account">Account</Tabs.TabNav>
                            <Tabs.TabNav value="security">Security</Tabs.TabNav>
                            <Tabs.TabNav value="notifications">Notifications</Tabs.TabNav>
                        </Tabs.TabList>
                        <Tabs.TabContent value="account">
                            <div className="mt-6">
                                <FormContainer>
                                    <FormItem label="Username/Email">
                                        <Input 
                                            value={user?.email || ''}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                        <small className="text-gray-500">Your email cannot be changed</small>
                                    </FormItem>
                                    <FormItem label="Phone Number">
                                        <Input 
                                            value={user?.phoneNumber || ''}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                        <small className="text-gray-500">Your phone number cannot be changed</small>
                                    </FormItem>
                                    <FormItem label="Account Type">
                                        <Input 
                                            value="User Account"
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </FormItem>
                                </FormContainer>
                            </div>
                        </Tabs.TabContent>
                        <Tabs.TabContent value="security">
                            <div className="mt-6">
                                <h4 className="mb-4 flex items-center">
                                    <HiOutlineKey className="text-lg mr-2" /> 
                                    Change Password
                                </h4>
                                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                                    <FormContainer>
                                        <FormItem 
                                            label="Current Password"
                                            asterisk={true}
                                            invalid={!!passwordForm.formState.errors.currentPassword}
                                            errorMessage={passwordForm.formState.errors.currentPassword?.message}
                                        >
                                            <Controller
                                                name="currentPassword"
                                                control={passwordForm.control}
                                                render={({ field }) => (
                                                    <Input 
                                                        {...field}
                                                        type="password"
                                                        placeholder="Enter your current password"
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                        <FormItem 
                                            label="New Password"
                                            asterisk={true}
                                            invalid={!!passwordForm.formState.errors.newPassword}
                                            errorMessage={passwordForm.formState.errors.newPassword?.message}
                                        >
                                            <Controller
                                                name="newPassword"
                                                control={passwordForm.control}
                                                render={({ field }) => (
                                                    <Input 
                                                        {...field}
                                                        type="password"
                                                        placeholder="Enter new password"
                                                    />
                                                )}
                                            />
                                            <small className="text-gray-500">
                                                Password must be at least 8 characters with uppercase, lowercase, number, and special character
                                            </small>
                                        </FormItem>
                                        <FormItem 
                                            label="Confirm New Password"
                                            asterisk={true}
                                            invalid={!!passwordForm.formState.errors.confirmPassword}
                                            errorMessage={passwordForm.formState.errors.confirmPassword?.message}
                                        >
                                            <Controller
                                                name="confirmPassword"
                                                control={passwordForm.control}
                                                render={({ field }) => (
                                                    <Input 
                                                        {...field}
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                        <div className="mt-4">
                                            <Button 
                                                type="submit"
                                                variant="solid"
                                                loading={passwordForm.formState.isSubmitting}
                                                disabled={passwordForm.formState.isSubmitting}
                                            >
                                                Update Password
                                            </Button>
                                        </div>
                                    </FormContainer>
                                </form>
                                
                                <div className="mt-8 pt-4 border-t">
                                    <h4 className="mb-4 flex items-center">
                                        <HiOutlineShieldCheck className="text-lg mr-2" /> 
                                        Security Settings
                                    </h4>
                                    <FormContainer>
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="font-medium">Two-Factor Authentication</label>
                                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                                </div>
                                                <Button variant="default" size="sm">
                                                    Enable 2FA
                                                </Button>
                                            </div>
                                        </FormItem>
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="font-medium">Login Activity</label>
                                                    <p className="text-sm text-gray-500">View recent login activity for your account</p>
                                                </div>
                                                <Button variant="default" size="sm">
                                                    View Activity
                                                </Button>
                                            </div>
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </div>
                        </Tabs.TabContent>
                        <Tabs.TabContent value="notifications">
                            <div className="mt-6">
                                <h4 className="mb-4 flex items-center">
                                    <HiOutlineBell className="text-lg mr-2" /> 
                                    Notification Preferences
                                </h4>
                                <FormContainer>
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="font-medium">Email Notifications</label>
                                                <p className="text-sm text-gray-500">Receive notifications via email</p>
                                            </div>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.emailNotifications}
                                                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">Enable</span>
                                            </label>
                                        </div>
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="font-medium">SMS Notifications</label>
                                                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                                            </div>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.smsNotifications}
                                                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">Enable</span>
                                            </label>
                                        </div>
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="font-medium">Push Notifications</label>
                                                <p className="text-sm text-gray-500">Receive push notifications in the app</p>
                                            </div>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.appNotifications}
                                                    onChange={(e) => handleNotificationChange('appNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">Enable</span>
                                            </label>
                                        </div>
                                    </FormItem>
                                    <div className="mt-4">
                                        <Button 
                                            variant="solid"
                                            onClick={handleSaveNotifications}
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>
                                </FormContainer>
                            </div>
                        </Tabs.TabContent>
                    </Tabs>
                </div>
            </Card>
        </Container>
    )
}

export default Settings 