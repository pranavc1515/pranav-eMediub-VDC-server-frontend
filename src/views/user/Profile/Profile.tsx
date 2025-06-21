import { useState, useEffect, ChangeEvent, useRef } from 'react'
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
    Notification,
    Alert
} from '@/components/ui'
import toast from '@/components/ui/toast'
import UserService from '@/services/UserService'
import { HiOutlinePencilAlt, HiOutlineCamera } from 'react-icons/hi'
import type { UserProfileDetailsResponse } from '@/services/UserService'
import Container from '@/components/shared/Container'
import { useAuth } from '@/auth'
import { getTodayDateString } from '@/utils/dateUtils'

// Helper function to calculate age from date of birth
const calculateAge = (dob: string): string => {
    if (!dob) return ''
    
    try {
        const birthDate = new Date(dob)
        
        // Check if date is valid
        if (isNaN(birthDate.getTime())) {
            console.error('Invalid date format:', dob)
            return ''
        }
        
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        
        return age > 0 ? age.toString() : ''
    } catch (error) {
        console.error('Error calculating age:', error)
        return ''
    }
}

// Define option type for Select components
interface SelectOption {
    value: string
    label: string
}

const Profile = () => {
    const { user } = useAuth()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [profileData, setProfileData] = useState<UserProfileDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [formVisible, setFormVisible] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [userPhone, setUserPhone] = useState<string>('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form state
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
            
            // Get the phone number from the authenticated user
            if (user && user.phoneNumber) {
                setUserPhone(user.phoneNumber)
                setFormData((prev) => ({
                    ...prev,
                    phone: user.phoneNumber,
                }))
            }
            
            const response = await UserService.getProfileDetails()
            setProfileData(response)
            
            // Pre-fill form data
            if (response?.data) {
                const profileInfo = response.data
                
                const formValues = {
                    name: profileInfo.name || '',
                    email: profileInfo.email || '',
                    phone: profileInfo.phone || userPhone,
                    dob: profileInfo.dob ? profileInfo.dob.split('T')[0] : '',
                    gender: profileInfo.gender || '',
                    marital_status: profileInfo.marital_status || '',
                    height: profileInfo.height || '',
                    weight: profileInfo.weight || '',
                    diet: profileInfo.diet || '',
                    profession: profileInfo.profession || '',
                    image: profileInfo.image || '',
                    age: profileInfo.age || ''
                }
                
                // Calculate age if dob is available but age isn't
                if (formValues.dob && !formValues.age) {
                    formValues.age = calculateAge(formValues.dob)
                }
                
                setFormData(formValues)
            }
        } catch (error) {
            console.error('Error fetching profile data:', error)
            setError('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { name: string, value: string }
    ) => {
        const name = 'name' in e ? e.name : e.target.name
        const value = 'value' in e ? e.value : e.target.value
        
        // Special handling for date of birth to calculate age
        if (name === 'dob' && value) {
            setFormData(prev => {
                const updatedData = {
                    ...prev,
                    [name]: value
                }
                
                // Calculate age immediately on DOB change
                const calculatedAge = calculateAge(value)
                
                return {
                    ...updatedData,
                    age: calculatedAge
                }
            })
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleSubmit = async () => {
        // Basic form validation
        if (!formData.name.trim()) {
            setError('Full name is required')
            return
        }
        
        if (!formData.email.trim()) {
            setError('Email is required')
            return
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return
        }
        
        if (!formData.dob) {
            setError('Date of birth is required')
            return
        }
        
        if (!formData.gender) {
            setError('Gender is required')
            return
        }
        
        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            // Ensure phone number is set
            if (!formData.phone) {
                setFormData((prev) => ({
                    ...prev,
                    phone: userPhone,
                }))
            }

            const response = await UserService.updatePersonalDetails(formData)
            
            if (response.status) {
                // Show success message inside the drawer first
                setSuccess(response.message || 'Profile updated successfully!')
                
                // Refresh profile data
                await fetchProfileData()
                
                // Close the drawer after a short delay to show the success message
                setTimeout(() => {
                    toggleDrawer(false)
                }, 1500)
            } else {
                setError(response.message || 'Failed to update profile. Please try again.')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setError('An error occurred while updating your profile. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            
            // File size validation (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB')
                return
            }
            
            const reader = new FileReader()
            
            reader.onload = (event) => {
                if (event.target) {
                    const base64Image = event.target.result as string
                    setImagePreview(base64Image)
                    setFormData(prev => ({
                        ...prev,
                        image: base64Image
                    }))
                }
            }
            
            reader.readAsDataURL(file)
        }
    }
    
    const triggerImageUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    // Toggle drawer visibility and reset error/success messages
    const toggleDrawer = (visible: boolean) => {
        setFormVisible(visible)
        if (visible) {
            // Reset error and success messages when opening drawer
            setError('')
            setSuccess('')
            // Reset image preview to use the saved image
            setImagePreview(null)
        }
    }

    if (loading) {
        return (
            <Container className="h-full flex items-center justify-center">
                <Spinner size={40} />
            </Container>
        )
    }

    const profileInfo = profileData?.data

    return (
        <Container className="py-6">
            {success && (
                <Alert type="success" showIcon className="mb-4">
                    {success}
                </Alert>
            )}

            {error && (
                <Alert type="danger" showIcon className="mb-4">
                    {error}
                </Alert>
            )}
            
            <Card className="max-w-4xl mx-auto mb-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Profile Information</h1>
                        <Button 
                            variant="solid"
                            icon={<HiOutlinePencilAlt />} 
                            onClick={() => toggleDrawer(true)}
                        >
                            Edit Profile
                        </Button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center">
                            <Avatar 
                                size={120} 
                                src={profileInfo?.image || undefined} 
                                className="mb-3"
                                icon={!profileInfo?.image ? <span className="text-3xl">
                                    {profileInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span> : undefined}
                            />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-500 text-sm">Name</p>
                                <p className="font-medium text-lg">{profileInfo?.name || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className="font-medium">{profileInfo?.email || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Phone</p>
                                <p className="font-medium">
                                    {profileInfo?.phone ? (profileInfo.phone.startsWith('+') ? 
                                        `+${profileInfo.phone.substring(1, 3)} ${profileInfo.phone.substring(3)}` : 
                                        `+${profileInfo.phone.substring(0, 2)} ${profileInfo.phone.substring(2)}`) : 'Not provided'}
                                </p>
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
                </div>
            </Card>

            <Drawer
                title="Edit Profile"
                isOpen={formVisible}
                onClose={() => toggleDrawer(false)}
                onRequestClose={() => toggleDrawer(false)}
                width={600}
            >
                <div className="p-6">
                    {error && (
                        <Alert type="danger" showIcon className="mb-4">
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert type="success" showIcon className="mb-4">
                            {success}
                        </Alert>
                    )}
                    
                    <FormContainer>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Avatar 
                                    size={100} 
                                    src={(imagePreview || formData.image) || undefined} 
                                    className="mb-2"
                                    icon={!(imagePreview || formData.image) ? <span className="text-2xl">
                                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span> : undefined}
                                />
                                <Button 
                                    className="absolute -bottom-2 -right-2" 
                                    size="sm" 
                                    variant="solid" 
                                    shape="circle"
                                    icon={<HiOutlineCamera />}
                                    onClick={triggerImageUpload}
                                >
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>
                        <div className="text-center mb-4">
                            <small className="text-gray-500">
                                Click the camera icon to upload a profile photo
                            </small>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="Full Name" asterisk={true}>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </FormItem>

                            <FormItem label="Email" asterisk={true}>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </FormItem>

                            <FormItem label="Phone Number">
                                <Input
                                    name="phone"
                                    value={formData.phone ? (formData.phone.startsWith('+') ? 
                                        `+${formData.phone.substring(1, 3)} ${formData.phone.substring(3)}` : 
                                        `+${formData.phone.substring(0, 2)} ${formData.phone.substring(2)}`) : ''}
                                    disabled={true}
                                    className="bg-gray-100"
                                />
                                <small className="text-gray-500">
                                    Phone number cannot be changed
                                </small>
                            </FormItem>

                            <FormItem label="Date of Birth" asterisk={true}>
                                <Input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    max={getTodayDateString()}
                                    required
                                />
                            </FormItem>

                            <FormItem label="Age">
                                <Input
                                    name="age"
                                    value={formData.age}
                                    disabled={true}
                                    className="bg-gray-100"
                                />
                                <small className="text-gray-500">
                                    Age is calculated based on date of birth
                                </small>
                            </FormItem>

                            <FormItem label="Gender" asterisk={true}>
                                <Select<SelectOption>
                                    value={
                                        formData.gender ? 
                                        { value: formData.gender, label: formData.gender } : 
                                        undefined
                                    }
                                    onChange={option => handleInputChange({ 
                                        name: 'gender', 
                                        value: (option as SelectOption)?.value || '' 
                                    })}
                                    options={[
                                        { value: 'Male', label: 'Male' },
                                        { value: 'Female', label: 'Female' },
                                        { value: 'Other', label: 'Other' }
                                    ]}
                                    placeholder="Select Gender"
                                />
                            </FormItem>

                            <FormItem label="Marital Status">
                                <Select<SelectOption>
                                    value={
                                        formData.marital_status ? 
                                        { value: formData.marital_status, label: formData.marital_status } : 
                                        undefined
                                    }
                                    onChange={option => handleInputChange({ 
                                        name: 'marital_status', 
                                        value: (option as SelectOption)?.value || '' 
                                    })}
                                    options={[
                                        { value: 'Single', label: 'Single' },
                                        { value: 'Married', label: 'Married' },
                                    ]}
                                    placeholder="Select Marital Status"
                                />
                            </FormItem>

                            <FormItem label="Height">
                                <Input
                                    name="height"
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 5.5-cm"
                                />
                            </FormItem>

                            <FormItem label="Weight">
                                <Input
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 55-kg"
                                />
                            </FormItem>

                            <FormItem label="Diet">
                                <Input
                                    name="diet"
                                    value={formData.diet}
                                    onChange={handleInputChange}
                                    placeholder="Any dietary preferences"
                                />
                            </FormItem>

                            <FormItem label="Profession">
                                <Input
                                    name="profession"
                                    value={formData.profession}
                                    onChange={handleInputChange}
                                    placeholder="Your occupation"
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-2 mt-8">
                            <Button
                                variant="plain"
                                onClick={() => toggleDrawer(false)}
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
        </Container>
    )
}

export default Profile 