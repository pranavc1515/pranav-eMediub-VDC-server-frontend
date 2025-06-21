import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import Card from '@/components/shared/Card'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import UserService from '@/services/UserService'
import { useToken } from '@/store/authStore'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    UserPersonalDetailsSchema,
    type UserPersonalDetailsFormData
} from '@/utils/validationSchemas'
import { getTodayDateString } from '@/utils/dateUtils'

// Helper function to calculate age from date of birth
const calculateAge = (dob: string): string => {
    if (!dob) return ''
    
    console.log('Calculating age from DOB:', dob)
    
    try {
        const birthDate = new Date(dob)
        
        // Check if date is valid
        if (isNaN(birthDate.getTime())) {
            console.error('Invalid date format:', dob)
            return ''
        }
        
        console.log('Birth date parsed as:', birthDate.toISOString())
        
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        
        console.log('Calculated age:', age)
        return age > 0 ? age.toString() : ''
    } catch (error) {
        console.error('Error calculating age:', error)
        return ''
    }
}

const UserProfileSetup = () => {
    const navigate = useNavigate()
    const { token } = useToken()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [userPhone, setUserPhone] = useState<string>('')

    // React Hook Form setup
    const form = useForm<UserPersonalDetailsFormData>({
        resolver: zodResolver(UserPersonalDetailsSchema),
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

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!token) {
                setError('Authentication token missing. Please login again.')
                setLoading(false)
                return
            }

            try {
                // Get the phone number from the authenticated user
                if (user && user.phoneNumber) {
                    setUserPhone(user.phoneNumber)
                    form.setValue('phone', user.phoneNumber)
                }

                // Try to fetch user profile to check if already completed
                const profileResponse = await UserService.getProfile()
                console.log('Profile Response', profileResponse)
                if (profileResponse.success && profileResponse.data) {
                    const userProfile = profileResponse.data
                    // Check if profile is already complete
                    if (userProfile.isProfileComplete) {
                        navigate('/home')
                        return
                    }

                    // Pre-fill form with existing data if available
                    const formValues: Partial<UserPersonalDetailsFormData> = {
                        name: userProfile.fullName || '',
                        email: userProfile.email || '',
                        phone: userProfile.phoneNumber || userPhone,
                        gender: (userProfile.gender as 'Male' | 'Female' | 'Other') || 'Male',
                        marital_status: (userProfile.maritalStatus as 'Single' | 'Married' | 'Divorced' | 'Widowed') || 'Single',
                        height: userProfile.height || '',
                        weight: userProfile.weight || '',
                        diet: (userProfile.diet as 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Other') || 'Vegetarian',
                        profession: userProfile.profession || '',
                        image: userProfile.image || '',
                    }
                    
                    // Format and set date of birth if available
                    if (userProfile.dob) {
                        try {
                            // Format date as YYYY-MM-DD for the input
                            const dobDate = new Date(userProfile.dob)
                            
                            if (!isNaN(dobDate.getTime())) {
                                const formattedDob = dobDate.toISOString().split('T')[0]
                                console.log('Formatting DOB from API:', userProfile.dob, 'to:', formattedDob)
                                formValues.dob = formattedDob
                                
                                // Calculate age
                                formValues.age = calculateAge(formattedDob)
                                console.log('Initial age calculation:', formValues.age)
                            } else {
                                console.error('Invalid DOB from API:', userProfile.dob)
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
            } catch (err) {
                console.error('Error loading user profile:', err)
                // Don't show error here, just continue with the form
            } finally {
                setLoading(false)
            }
        }

        loadUserProfile()
    }, [token, user, navigate, form])

    // Watch DOB field to automatically calculate age
    const watchedDob = form.watch('dob')
    useEffect(() => {
        if (watchedDob) {
            const calculatedAge = calculateAge(watchedDob)
            form.setValue('age', calculatedAge)
        }
    }, [watchedDob, form])

    const handleFormSubmit = async (data: UserPersonalDetailsFormData) => {
        setSubmitting(true)
        setError('')

        try {
            // Ensure phone number is set
            if (!data.phone) {
                data.phone = userPhone
            }

            const response = await UserService.updatePersonalDetails(data)
            
            if (response.status) {
                setSuccess('Profile setup completed successfully!')
                
                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/home')
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

    if (loading) {
        return (
            <Container>
                <Loading loading={loading} />
            </Container>
        )
    }

    return (
        <Container className="py-6">
            <Card className="max-w-4xl mx-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600">Please provide your details to get started</p>
                    </div>

                    {error && (
                        <Alert type="danger" showIcon className="mb-4" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert type="success" showIcon className="mb-4" onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <Form onSubmit={form.handleSubmit(handleFormSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Email"
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
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Phone Number"
                                asterisk={true}
                                invalid={!!form.formState.errors.phone}
                                errorMessage={form.formState.errors.phone?.message}
                            >
                                <Controller
                                    name="phone"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter your phone number"
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    )}
                                />
                                <small className="text-gray-500">Your phone number cannot be changed</small>
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
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Age"
                                invalid={!!form.formState.errors.age}
                                errorMessage={form.formState.errors.age?.message}
                            >
                                <Controller
                                    name="age"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Age will be calculated automatically"
                                            disabled
                                            className="bg-gray-100"
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
                                            className="w-full rounded-md border border-gray-300 p-2"
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
                                            className="w-full rounded-md border border-gray-300 p-2"
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
                                            {...field}
                                            type="number"
                                            min="50"
                                            max="300"
                                            placeholder="Enter your height in cm"
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
                                            {...field}
                                            type="number"
                                            min="20"
                                            max="500"
                                            placeholder="Enter your weight in kg"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Diet Preference"
                                invalid={!!form.formState.errors.diet}
                                errorMessage={form.formState.errors.diet?.message}
                            >
                                <Controller
                                    name="diet"
                                    control={form.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full rounded-md border border-gray-300 p-2"
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
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button
                                type="submit"
                                variant="solid"
                                loading={submitting}
                                disabled={submitting}
                                size="lg"
                            >
                                Complete Profile Setup
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </Container>
    )
}

export default UserProfileSetup
