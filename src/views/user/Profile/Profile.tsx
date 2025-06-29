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
import type { UserPersonalDetails } from '@/services/UserService'
import { HiOutlinePencilAlt, HiOutlineCamera } from 'react-icons/hi'
import type { UserProfileDetailsResponse } from '@/services/UserService'
import Container from '@/components/shared/Container'
import { useAuth } from '@/auth'
import { useSessionUser } from '@/store/authStore'
import { getTodayDateString } from '@/utils/dateUtils'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    UserPersonalDetailsSchema,
    type UserPersonalDetailsFormData
} from '@/utils/validationSchemas'

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
    const setUser = useSessionUser((state) => state.setUser)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [profileData, setProfileData] = useState<UserProfileDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [formVisible, setFormVisible] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [userPhone, setUserPhone] = useState<string>('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form setup
    const form = useForm<UserPersonalDetailsFormData>({
        resolver: zodResolver(UserPersonalDetailsSchema),
        mode: 'onChange', // Enable real-time validation
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            age: '',
            dob: '',
            gender: 'Male',
            marital_status: 'Single',
            height: '',
            weight: '',
            diet: 'Vegetarian',
            profession: '',
            image: '',
        }
    })

    // Watch DOB field to automatically calculate age
    const watchedDob = form.watch('dob')
    useEffect(() => {
        if (watchedDob) {
            const calculatedAge = calculateAge(watchedDob)
            form.setValue('age', calculatedAge)
        }
    }, [watchedDob, form])

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            
            // Get the phone number from the authenticated user
            if (user && user.phoneNumber) {
                setUserPhone(user.phoneNumber)
                form.setValue('phone', user.phoneNumber)
            }
            
            const response = await UserService.getProfileDetails()
            setProfileData(response)
            
            // Update auth store with profile data
            if (response?.data) {
                const profileInfo = response.data
                
                // Update user object in auth store with the image
                setUser({
                    ...user,
                    userName: profileInfo.name || user?.userName,
                    email: profileInfo.email || user?.email,
                    image: profileInfo.image || user?.image,
                })
            }
            
            // Pre-fill form data
            if (response?.data) {
                const profileInfo = response.data
                
                const formValues: Partial<UserPersonalDetailsFormData> = {
                    name: profileInfo.name || '',
                    email: profileInfo.email || '',
                    phone: profileInfo.phone || userPhone,
                    gender: (profileInfo.gender as 'Male' | 'Female' | 'Other') || 'Male',
                    marital_status: (profileInfo.marital_status as 'Single' | 'Married' | 'Divorced' | 'Widowed') || 'Single',
                    height: profileInfo.height || '',
                    weight: profileInfo.weight || '',
                    diet: (profileInfo.diet as 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Other') || 'Vegetarian',
                    profession: profileInfo.profession || '',
                    image: profileInfo.image || '',
                }
                
                // Handle date of birth
                if (profileInfo.dob) {
                    try {
                        const dobDate = new Date(profileInfo.dob)
                        if (!isNaN(dobDate.getTime())) {
                            const formattedDob = dobDate.toISOString().split('T')[0]
                            formValues.dob = formattedDob
                            formValues.age = calculateAge(formattedDob)
                        }
                    } catch (error) {
                        console.error('Error formatting DOB:', error)
                    }
                }
                
                // Set form values
                Object.entries(formValues).forEach(([key, value]) => {
                    if (value !== undefined) {
                        form.setValue(key as keyof UserPersonalDetailsFormData, value)
                    }
                })
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
            form.setValue('dob', value)
        } else {
            form.setValue(name as keyof UserPersonalDetailsFormData, value)
        }
    }

    const handleSubmit = async (data: UserPersonalDetailsFormData) => {
        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            // Ensure phone number is set
            if (!data.phone) {
                data.phone = userPhone
            }

            // Transform form data to match UserPersonalDetails interface
            const transformedData: UserPersonalDetails = {
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                dob: data.dob || '',
                gender: data.gender || 'Male',
                marital_status: data.marital_status || 'Single',
                height: data.height || '',
                weight: data.weight || '',
                diet: data.diet || 'Vegetarian',
                profession: data.profession || '',
                image: data.image || '',
            }

            const response = await UserService.updatePersonalDetails(transformedData)
            
            if (response.status) {
                // Show success message inside the drawer first
                setSuccess(response.message || 'Profile updated successfully!')
                
                // Update auth store immediately with the submitted data
                setUser({
                    ...user,
                    userName: transformedData.name || user?.userName,
                    email: transformedData.email || user?.email,
                    image: transformedData.image || user?.image,
                })
                
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
                    form.setValue('image', base64Image)
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
        if (!visible) {
            // Reset error and success messages when closing drawer
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
                                <p className="font-medium">{profileInfo?.height ? `${profileInfo.height} cm` : 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Weight</p>
                                <p className="font-medium">{profileInfo?.weight ? `${profileInfo.weight} kg` : 'Not provided'}</p>
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
                                    src={(imagePreview || form.watch('image')) || undefined} 
                                    className="mb-2"
                                    icon={!(imagePreview || form.watch('image')) ? <span className="text-2xl">
                                        {form.watch('name')?.charAt(0)?.toUpperCase() || 'U'}
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
                            <FormItem 
                                label="Full Name" 
                                asterisk={true}
                                invalid={!!form.formState.errors.name}
                                errorMessage={form.formState.errors.name?.message}
                            >
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter your full name"
                                            invalid={!!form.formState.errors.name}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Email" 
                                asterisk={false}
                                invalid={!!form.formState.errors.email}
                                errorMessage={form.formState.errors.email?.message}
                            >
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter your email"
                                            invalid={!!form.formState.errors.email}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Phone Number">
                                <Controller
                                    name="phone"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    )}
                                />
                                <small className="text-gray-500">
                                    Phone number cannot be changed
                                </small>
                            </FormItem>

                            <FormItem 
                                label="Date of Birth" 
                                asterisk={true}
                                invalid={!!form.formState.errors.dob}
                                errorMessage={form.formState.errors.dob?.message}
                            >
                                <Controller
                                    name="dob"
                                    control={form.control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="date"
                                            max={getTodayDateString()}
                                            className={`w-full rounded-md border p-2 ${
                                                form.formState.errors.dob 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Age">
                                <Controller
                                    name="age"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            disabled
                                            className="bg-gray-100"
                                            placeholder="Age will be calculated automatically"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Gender" 
                                asterisk={true}
                                invalid={!!form.formState.errors.gender}
                                errorMessage={form.formState.errors.gender?.message}
                            >
                                <Controller
                                    name="gender"
                                    control={form.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className={`w-full rounded-md border p-2 ${
                                                form.formState.errors.gender 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Marital Status"
                                invalid={!!form.formState.errors.marital_status}
                                errorMessage={form.formState.errors.marital_status?.message}
                            >
                                <Controller
                                    name="marital_status"
                                    control={form.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className={`w-full rounded-md border p-2 ${
                                                form.formState.errors.marital_status 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Select Marital Status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Height (cm)"
                                invalid={!!form.formState.errors.height}
                                errorMessage={form.formState.errors.height?.message}
                            >
                                <Controller
                                    name="height"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            min="50"
                                            max="300"
                                            step="0.1"
                                            placeholder="Enter your height in cm"
                                            invalid={!!form.formState.errors.height}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (value === '') {
                                                    field.onChange('')
                                                } else {
                                                    const numValue = parseFloat(value)
                                                    if (!isNaN(numValue)) {
                                                        field.onChange(numValue)
                                                    }
                                                }
                                            }}
                                            onBlur={field.onBlur}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Weight (kg)"
                                invalid={!!form.formState.errors.weight}
                                errorMessage={form.formState.errors.weight?.message}
                            >
                                <Controller
                                    name="weight"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            min="20"
                                            max="500"
                                            step="0.1"
                                            placeholder="Enter your weight in kg"
                                            invalid={!!form.formState.errors.weight}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (value === '') {
                                                    field.onChange('')
                                                } else {
                                                    const numValue = parseFloat(value)
                                                    if (!isNaN(numValue)) {
                                                        field.onChange(numValue)
                                                    }
                                                }
                                            }}
                                            onBlur={field.onBlur}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Diet"
                                invalid={!!form.formState.errors.diet}
                                errorMessage={form.formState.errors.diet?.message}
                            >
                                <Controller
                                    name="diet"
                                    control={form.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className={`w-full rounded-md border p-2 ${
                                                form.formState.errors.diet 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Select Diet Preference</option>
                                            <option value="Vegetarian">Vegetarian</option>
                                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem 
                                label="Profession"
                                invalid={!!form.formState.errors.profession}
                                errorMessage={form.formState.errors.profession?.message}
                            >
                                <Controller
                                    name="profession"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter your profession"
                                            invalid={!!form.formState.errors.profession}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-2 mt-8">
                            <Button
                                variant="plain"
                                onClick={() => toggleDrawer(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={form.handleSubmit(handleSubmit)}
                                loading={submitting}
                                disabled={submitting}
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