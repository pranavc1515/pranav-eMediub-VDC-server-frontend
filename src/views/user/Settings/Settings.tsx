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

const Settings = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('account')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    
    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    
    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        appNotifications: true
    })
    
    const handlePasswordChange = (name: string, value: string) => {
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }))
    }
    
    const handleNotificationChange = (name: string, checked: boolean) => {
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }))
    }
    
    const handlePasswordSubmit = () => {
        // Validate passwords
        if (!passwordForm.currentPassword) {
            setError('Current password is required')
            return
        }
        
        if (!passwordForm.newPassword) {
            setError('New password is required')
            return
        }
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match')
            return
        }
        
        // Password strength validation
        if (passwordForm.newPassword.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }
        
        // TODO: Implement actual password change API call
        
        // Mock success
        setSuccess('Password updated successfully!')
        setError('')
        
        // Reset form
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
    }
    
    const handleSaveNotifications = () => {
        // TODO: Implement notification settings API call
        
        // Mock success
        setSuccess('Notification preferences saved successfully!')
        setError('')
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
                                <FormContainer>
                                    <FormItem label="Current Password">
                                        <Input 
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={e => handlePasswordChange('currentPassword', e.target.value)}
                                            placeholder="Enter your current password"
                                        />
                                    </FormItem>
                                    <FormItem label="New Password">
                                        <Input 
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={e => handlePasswordChange('newPassword', e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <small className="text-gray-500">Password must be at least 8 characters long</small>
                                    </FormItem>
                                    <FormItem label="Confirm New Password">
                                        <Input 
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                    </FormItem>
                                    <div className="mt-4">
                                        <Button 
                                            variant="solid"
                                            onClick={handlePasswordSubmit}
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </FormContainer>
                                
                                <div className="mt-8 pt-4 border-t">
                                    <h4 className="mb-4 flex items-center">
                                        <HiOutlineShieldCheck className="text-lg mr-2" /> 
                                        Security Settings
                                    </h4>
                                    <FormContainer>
                                        <FormItem>
                                            <div className="flex items-center">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-checkbox" 
                                                        checked
                                                        disabled
                                                    />
                                                    <span className="ml-2">Two-factor authentication</span>
                                                </label>
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Coming Soon</span>
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
                                        <div className="flex items-center mb-3">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.emailNotifications}
                                                    onChange={e => handleNotificationChange('emailNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">Email Notifications</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center mb-3">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.smsNotifications}
                                                    onChange={e => handleNotificationChange('smsNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">SMS Notifications</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox" 
                                                    checked={notifications.appNotifications}
                                                    onChange={e => handleNotificationChange('appNotifications', e.target.checked)}
                                                />
                                                <span className="ml-2">In-app Notifications</span>
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