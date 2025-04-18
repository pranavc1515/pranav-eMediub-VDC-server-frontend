import { useState, useEffect } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Drawer, 
    Input, 
    FormItem, 
    FormContainer, 
    Select, 
    Spinner, 
    Notification 
} from '@/components/ui'
import toast from '@/components/ui/toast'
import UserService from '@/services/UserService'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import type { UserProfileDetailsResponse } from '@/services/UserService'

// Define option type for Select components
interface SelectOption {
    value: string
    label: string
}

const Profile = () => {
    const [profileData, setProfileData] = useState<UserProfileDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [formVisible, setFormVisible] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        dob: '',
        gender: '',
        marital_status: '',
        height: '',
        weight: '',
        diet: '',
        profession: '',
        image: ''
    })

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            const response = await UserService.getProfileDetails()
            setProfileData(response)
            
            // Pre-fill form data
            if (response?.data) {
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    age: response.data.age || '',
                    dob: response.data.dob ? response.data.dob.split('T')[0] : '',
                    gender: response.data.gender || '',
                    marital_status: response.data.marital_status || '',
                    height: response.data.height || '',
                    weight: response.data.weight || '',
                    diet: response.data.diet || '',
                    profession: response.data.profession || '',
                    image: response.data.image || ''
                })
            }
        } catch (error) {
            console.error('Error fetching profile data:', error)
            toast.push(
                <Notification type="danger">
                    Failed to load profile data
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            const response = await UserService.updatePersonalDetails(formData)
            
            if (response.status) {
                toast.push(
                    <Notification type="success">
                        Profile updated successfully
                    </Notification>
                )
                setFormVisible(false)
                fetchProfileData() // Refresh data
            } else {
                toast.push(
                    <Notification type="danger">
                        {response.message || 'Failed to update profile'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.push(
                <Notification type="danger">
                    An error occurred while updating your profile
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner size={40} />
            </div>
        )
    }

    const profileInfo = profileData?.data

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Profile Information</h4>
                    <Button 
                        size="sm" 
                        icon={<HiOutlinePencilAlt />} 
                        onClick={() => setFormVisible(true)}
                    >
                        Edit Profile
                    </Button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                        <Avatar 
                            size={100} 
                            src={profileInfo?.image || undefined} 
                            className="mb-2"
                            icon={!profileInfo?.image ? <span className="text-2xl">
                                {profileInfo?.name?.charAt(0) || 'U'}
                            </span> : undefined}
                        />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 text-sm">Name</p>
                            <p className="font-medium">{profileInfo?.name || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Email</p>
                            <p className="font-medium">{profileInfo?.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Phone</p>
                            <p className="font-medium">{profileInfo?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Age</p>
                            <p className="font-medium">{profileInfo?.age || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Date of Birth</p>
                            <p className="font-medium">
                                {profileInfo?.dob 
                                    ? new Date(profileInfo.dob).toLocaleDateString() 
                                    : 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Gender</p>
                            <p className="font-medium">{profileInfo?.gender || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Marital Status</p>
                            <p className="font-medium">{profileInfo?.marital_status || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Height</p>
                            <p className="font-medium">{profileInfo?.height || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Weight</p>
                            <p className="font-medium">{profileInfo?.weight || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Diet</p>
                            <p className="font-medium">{profileInfo?.diet || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Profession</p>
                            <p className="font-medium">{profileInfo?.profession || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Drawer
                title="Edit Profile"
                isOpen={formVisible}
                onClose={() => setFormVisible(false)}
                onRequestClose={() => setFormVisible(false)}
                width={500}
            >
                <div className="p-4">
                    <FormContainer>
                        <FormItem label="Name">
                            <Input 
                                value={formData.name}
                                onChange={e => handleInputChange('name', e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Email">
                            <Input 
                                value={formData.email}
                                onChange={e => handleInputChange('email', e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Age">
                            <Input 
                                value={formData.age}
                                onChange={e => handleInputChange('age', e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Date of Birth">
                            <Input 
                                type="date"
                                value={formData.dob}
                                onChange={e => handleInputChange('dob', e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Gender">
                            <Select<SelectOption>
                                value={
                                    formData.gender ? 
                                    { value: formData.gender, label: formData.gender } : 
                                    undefined
                                }
                                onChange={option => handleInputChange('gender', (option as SelectOption)?.value || '')}
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                            />
                        </FormItem>
                        <FormItem label="Marital Status">
                            <Select<SelectOption>
                                value={
                                    formData.marital_status ? 
                                    { value: formData.marital_status, label: formData.marital_status } : 
                                    undefined
                                }
                                onChange={option => handleInputChange('marital_status', (option as SelectOption)?.value || '')}
                                options={[
                                    { value: 'Single', label: 'Single' },
                                    { value: 'Married', label: 'Married' },
                                   
                                ]}
                            />
                        </FormItem>
                        <FormItem label="Height">
                            <Input 
                                value={formData.height}
                                onChange={e => handleInputChange('height', e.target.value)}
                                placeholder="e.g. 5.8"
                            />
                        </FormItem>
                        <FormItem label="Weight">
                            <Input 
                                value={formData.weight}
                                onChange={e => handleInputChange('weight', e.target.value)}
                                placeholder="e.g. 65"
                            />
                        </FormItem>
                        <FormItem label="Diet">
                            <Input 
                                value={formData.diet}
                                onChange={e => handleInputChange('diet', e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Profession">
                            <Input 
                                value={formData.profession}
                                onChange={e => handleInputChange('profession', e.target.value)}
                            />
                        </FormItem>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="plain"
                                onClick={() => setFormVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={handleSubmit}
                                loading={submitting}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </FormContainer>
                </div>
            </Drawer>
        </div>
    )
}

export default Profile 