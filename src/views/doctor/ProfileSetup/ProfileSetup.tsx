import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import Card from '@/components/shared/Card'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DoctorService from '@/services/DoctorService'
import type { CheckDoctorExistsResponse } from '@/services/DoctorService'
import Alert from '@/components/ui/Alert'
import Steps from '@/components/ui/Steps'
import { useToken } from '@/store/authStore'
import type { ChangeEvent } from 'react'
import { getTodayDateString } from '@/utils/dateUtils'

// Common languages in India
const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Odia', label: 'Odia' },
    { value: 'Assamese', label: 'Assamese' },
]

const ProfileSetup = () => {
    const navigate = useNavigate()
    const { token } = useToken()
    
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [doctorId, setDoctorId] = useState<number | null>(null)
    const [doctorPhone, setDoctorPhone] = useState<string>('')
    
    // Personal details form state
    const [personalFormData, setPersonalFormData] = useState({
        fullName: '',
        email: '',
        gender: '',
        dob: '',
        profilePhoto: ''
    })
    
    // Professional details form state
    const [professionalFormData, setProfessionalFormData] = useState({
        qualification: '',
        specialization: '',
        registrationNumber: '',
        registrationState: '',
        expiryDate: '',
        clinicName: '',
        yearsOfExperience: 0,
        communicationLanguages: ['English'],
        consultationFees: 0,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    })
    
    // Loading states for each form
    const [personalFormLoading, setPersonalFormLoading] = useState(false)
    const [professionalFormLoading, setProfessionalFormLoading] = useState(false)
    
    useEffect(() => {
        const checkDoctorStatus = async () => {
            if (!token) {
                setError('Authentication token missing. Please login again.')
                setLoading(false)
                return
            }
            
            try {
                // Fetch doctor profile to get phone number
                const profileResponse = await DoctorService.getProfile()
                
                if (profileResponse.success && profileResponse.data) {
                    const doctor = profileResponse.data
                    setDoctorId(doctor.id)
                    setDoctorPhone(doctor.phoneNumber)
                    
                    // Check if profile is already complete
                    if (doctor.isProfileComplete) {
                        navigate('/doctor/profile')
                        return
                    }
                    
                    // Check if doctor exists by phone number
                    const checkResponse = await DoctorService.checkDoctorExists(doctor.phoneNumber)
                    
                    if (checkResponse.success && checkResponse.exists && checkResponse.data) {
                        // Doctor exists, but profile is not complete
                        setDoctorId(checkResponse.data.id)
                    } else {
                        // Something went wrong
                        setError('Unable to verify doctor account. Please contact support.')
                    }
                } else {
                    setError('Failed to load doctor profile. Please login again.')
                }
            } catch (err) {
                console.error('Error during profile setup initialization:', err)
                setError('An error occurred while setting up your profile. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        
        checkDoctorStatus()
    }, [token, navigate])
    
    const handlePersonalDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPersonalFormLoading(true)
        setError('')
        
        try {
            if (!doctorId) {
                throw new Error('Doctor ID not found')
            }
            
            const response = await DoctorService.updatePersonalDetails(
                doctorId,
                personalFormData
            )
            
            if (response.success) {
                setSuccess('Personal details saved successfully!')
                setCurrentStep(1) // Move to professional details
            } else {
                setError('Failed to save personal details. Please try again.')
            }
        } catch (err) {
            console.error('Error updating personal details:', err)
            setError('An error occurred while saving your personal details. Please try again.')
        } finally {
            setPersonalFormLoading(false)
        }
    }
    
    const handleProfessionalDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfessionalFormLoading(true)
        setError('')
        
        try {
            if (!doctorId) {
                throw new Error('Doctor ID not found')
            }
            
            const response = await DoctorService.updateProfessionalDetails(
                doctorId,
                professionalFormData
            )
            
            if (response.success) {
                setSuccess('Profile setup completed successfully!')
                // Redirect to doctor dashboard after a short delay
                setTimeout(() => {
                    navigate('/doctor/profile')
                }, 1500)
            } else {
                setError('Failed to save professional details. Please try again.')
            }
        } catch (err) {
            console.error('Error updating professional details:', err)
            setError('An error occurred while saving your professional details. Please try again.')
        } finally {
            setProfessionalFormLoading(false)
        }
    }
    
    const handlePersonalInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPersonalFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    
    const handleProfessionalInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        
        if (name === 'yearsOfExperience' || name === 'consultationFees') {
            setProfessionalFormData(prev => ({
                ...prev,
                [name]: Number(value)
            }))
        } else if (name === 'communicationLanguages') {
            // Handle comma-separated string for languages
            setProfessionalFormData(prev => ({
                ...prev,
                [name]: value.split(',').map(lang => lang.trim())
            }))
        } else {
            setProfessionalFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }
    
    const handleLanguageChange = (selectedOptions: any) => {
        const languages = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setProfessionalFormData(prev => ({
            ...prev,
            communicationLanguages: languages
        }));
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
                    <Button variant="solid" onClick={() => navigate('/sign-in')}>
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
                    <h1 className="text-2xl font-bold mb-6">Complete Your Doctor Profile</h1>
                    
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
                    
                    <Steps current={currentStep} className="mb-8">
                        <Steps.Item title="Personal Details" />
                        <Steps.Item title="Professional Details" />
                    </Steps>
                    
                    {currentStep === 0 && (
                        <form onSubmit={handlePersonalDetailsSubmit}>
                            <div className="space-y-4">
                                <FormItem
                                    label="Full Name"
                                    asterisk={true}
                                >
                                    <Input
                                        name="fullName"
                                        value={personalFormData.fullName}
                                        onChange={handlePersonalInputChange}
                                        placeholder="Dr. John Doe"
                                        required
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Email"
                                >
                                    <Input
                                        name="email"
                                        type="email"
                                        value={personalFormData.email}
                                        onChange={handlePersonalInputChange}
                                        placeholder="doctor@example.com"
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Gender"
                                    asterisk={true}
                                >
                                    <select
                                        name="gender"
                                        value={personalFormData.gender}
                                        onChange={handlePersonalInputChange}
                                        className="w-full rounded-md border border-gray-300 p-2"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormItem>
                                
                                <FormItem
                                    label="Date of Birth"
                                    asterisk={true}
                                >
                                    <input
                                        type="date"
                                        name="dob"
                                        value={personalFormData.dob}
                                        onChange={handlePersonalInputChange}
                                        max={getTodayDateString()}
                                        className="w-full rounded-md border border-gray-300 p-2"
                                        required
                                    />
                                </FormItem>
                                
                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={personalFormLoading}
                                        disabled={personalFormLoading}
                                    >
                                        Next: Professional Details
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                    
                    {currentStep === 1 && (
                        <form onSubmit={handleProfessionalDetailsSubmit}>
                            <div className="space-y-4">
                                <FormItem
                                    label="Qualification"
                                    asterisk={true}
                                >
                                    <Input
                                        name="qualification"
                                        value={professionalFormData.qualification}
                                        onChange={handleProfessionalInputChange}
                                        placeholder="MBBS, MD"
                                        required
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Specialization"
                                    asterisk={true}
                                >
                                    <Input
                                        name="specialization"
                                        value={professionalFormData.specialization}
                                        onChange={handleProfessionalInputChange}
                                        placeholder="Cardiology, Pediatrics, etc."
                                        required
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration Number"
                                    asterisk={true}
                                >
                                    <Input
                                        name="registrationNumber"
                                        value={professionalFormData.registrationNumber}
                                        onChange={handleProfessionalInputChange}
                                        placeholder="Medical Council Registration Number"
                                        required
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration State"
                                    asterisk={true}
                                >
                                    <Input
                                        name="registrationState"
                                        value={professionalFormData.registrationState}
                                        onChange={handleProfessionalInputChange}
                                        placeholder="State of Medical Council Registration"
                                        required
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration Expiry Date"
                                >
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={professionalFormData.expiryDate}
                                        onChange={handleProfessionalInputChange}
                                        className="w-full rounded-md border border-gray-300 p-2"
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Clinic Name"
                                >
                                    <Input
                                        name="clinicName"
                                        value={professionalFormData.clinicName}
                                        onChange={handleProfessionalInputChange}
                                        placeholder="Name of your clinic or hospital"
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Years of Experience"
                                >
                                    <Input
                                        name="yearsOfExperience"
                                        type="number"
                                        value={professionalFormData.yearsOfExperience.toString()}
                                        onChange={handleProfessionalInputChange}
                                        min="0"
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Communication Languages"
                                >
                                    <Select
                                        name="communicationLanguages"
                                        isMulti
                                        options={languageOptions}
                                        value={languageOptions.filter(option => 
                                            professionalFormData.communicationLanguages.includes(option.value)
                                        )}
                                        onChange={handleLanguageChange}
                                        placeholder="Select languages"
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Consultation Fees (in INR)"
                                >
                                    <Input
                                        name="consultationFees"
                                        type="number"
                                        value={professionalFormData.consultationFees.toString()}
                                        onChange={handleProfessionalInputChange}
                                        min="0"
                                    />
                                </FormItem>
                                
                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="default"
                                        onClick={() => setCurrentStep(0)}
                                        disabled={professionalFormLoading}
                                    >
                                        Back to Personal Details
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={professionalFormLoading}
                                        disabled={professionalFormLoading}
                                    >
                                        Complete Profile Setup
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </Container>
    )
}

export default ProfileSetup 