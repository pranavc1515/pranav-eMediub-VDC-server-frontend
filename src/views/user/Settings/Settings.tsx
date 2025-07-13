import { useState } from 'react'
import { 
    Card, 
    Button, 
    Tabs,
    Input, 
    FormItem, 
    FormContainer, 
    Alert,
    Dialog
} from '@/components/ui'
import Container from '@/components/shared/Container'
import { HiOutlineKey, HiOutlineBell, HiOutlineShieldCheck, HiOutlineTrash } from 'react-icons/hi'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    PasswordChangeSchema,
    type PasswordChangeFormData
} from '@/utils/validationSchemas'

const Settings = () => {
    const { user, deleteAccount } = useAuth()
    const [activeTab, setActiveTab] = useState('account')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    
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
                    <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                    
                    <Tabs value={activeTab} onChange={(val) => setActiveTab(val as string)}>
                        
                        <Tabs.TabContent value="account">
                            <div className="mt-6">
                                

                                {/* Delete Account Section */}
                                <div className="mt-8 pt-4 border-t">
                                    <h4 className="mb-4 flex items-center text-red-500">
                                        <HiOutlineTrash className="text-lg mr-2" /> 
                                        Delete Account
                                    </h4>
                                    <p className="mb-4 text-gray-500">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <Button 
                                        variant="solid"
                                        color="red-500"
                                        onClick={() => setDeleteDialogOpen(true)}
                                        icon={<HiOutlineTrash />}
                                    >
                                        Delete Account
                                    </Button>
                                </div>
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
                title="Delete Account"
            >
                <div className="px-6 pb-6">
                    <h5 className="mb-4">Are you sure you want to delete your account?</h5>
                    <p className="mb-6 text-gray-500">
                        This action will permanently delete your account and all of your data. 
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            color="red-500"
                            onClick={handleDeleteAccount}
                            loading={deleteLoading}
                            icon={<HiOutlineTrash />}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Container>
    )
}

export default Settings 