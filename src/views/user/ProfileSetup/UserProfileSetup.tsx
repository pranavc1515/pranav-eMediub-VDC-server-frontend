import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
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

    // Personal details form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '', // This will be pre-filled from the auth and disabled
        age: '',
        dob: '',
        gender: '',
        marital_status: '',
        height: '',
        weight: '',
        diet: '',
        profession: '',
        image: '',
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
                    setFormData((prev) => ({
                        ...prev,
                        phone: user.phoneNumber,
                    }))
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
                    const formValues = {
                        name: userProfile.fullName || '',
                        email: userProfile.email || '',
                        phone: userProfile.phoneNumber || userPhone,
                        dob: '',
                        gender: userProfile.gender || '',
                        marital_status: userProfile.maritalStatus || '',
                        height: userProfile.height || '',
                        weight: userProfile.weight || '',
                        diet: userProfile.diet || '',
                        profession: userProfile.profession || '',
                        image: userProfile.image || '',
                        age: ''
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
                    
                    setFormData(formValues)
                }
            } catch (err) {
                console.error('Error loading user profile:', err)
                // Don't show error here, just continue with the form
            } finally {
                setLoading(false)
            }
        }

        loadUserProfile()
    }, [])

    const handleInputChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target
        
        // Special handling for date of birth to ensure proper format
        if (name === 'dob' && value) {
            console.log('DOB input changed to:', value)
            setFormData(prev => {
                const updatedData = {
                    ...prev,
                    [name]: value
                }
                
                // Calculate age immediately on DOB change
                const calculatedAge = calculateAge(value)
                console.log('Updated age to:', calculatedAge)
                
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

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            // Ensure phone number is set
            if (!formData.phone) {
                setFormData((prev) => ({
                    ...prev,
                    phone: userPhone,
                }))
            }

            const response = await UserService.updatePersonalDetails(formData)

            if (response.status) {
                setSuccess(response.message || 'Profile updated successfully!')

                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/home')
                }, 1500)
            } else {
                setError('Failed to update profile. Please try again.')
            }
        } catch (err) {
            console.error('Error updating user profile:', err)
            setError(
                'An error occurred while updating your profile. Please try again.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Container className="h-full flex items-center justify-center">
                <Loading loading={true} />
            </Container>
        )
    }

    if (error && !success) {
        return (
            <Container className="h-full flex items-center justify-center">
                <div className="w-full max-w-md">
                    <Alert type="danger" showIcon className="mb-4">
                        {error}
                    </Alert>
                    <Button
                        variant="solid"
                        onClick={() => navigate('/sign-in')}
                    >
                        Back to Login
                    </Button>
                </div>
            </Container>
        )
    }

    return (
        <Container className="py-8">
            <Card className="max-w-3xl mx-auto">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        Complete Your User Profile
                    </h1>

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

                    <form onSubmit={handleFormSubmit}>
                        <div className="space-y-4">
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
                                    required
                                />
                                <small className="text-gray-500">
                                    Format: YYYY-MM-DD
                                </small>
                            </FormItem>

                            <FormItem label="Age">
                                <Input
                                    name="age"
                                    value={formData.age}
                                    disabled={true}
                                    className="bg-gray-100"
                                />
                                <small className="text-gray-500">
                                    Age is automatically calculated based on date of birth
                                </small>
                            </FormItem>

                            <FormItem label="Gender" asterisk={true}>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </FormItem>

                            <FormItem label="Marital Status">
                                <select
                                    name="marital_status"
                                    value={formData.marital_status}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                >
                                    <option value="">
                                        Select Marital Status
                                    </option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                </select>
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

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    Complete Profile Setup
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Card>
        </Container>
    )
}

export default UserProfileSetup
