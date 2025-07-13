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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
    DoctorPersonalDetailsSchema, 
    DoctorProfessionalDetailsSchema,
    type DoctorPersonalDetailsFormData,
    type DoctorProfessionalDetailsFormData
} from '@/utils/validationSchemas'
import { getTodayDateString } from '@/utils/dateUtils'
import SPECIALIZATIONS from '@/constants/specializations.constant'
import { INDIAN_STATES } from '@/constants/indianStates.constant'

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
    
    // React Hook Form for personal details
    const personalForm = useForm<DoctorPersonalDetailsFormData>({
        resolver: zodResolver(DoctorPersonalDetailsSchema),
        defaultValues: {
            fullName: '',
            email: '',
            gender: 'Male',
            dob: '',
            profilePhoto: ''
        }
    })

    // React Hook Form for professional details
    const professionalForm = useForm<DoctorProfessionalDetailsFormData>({
        resolver: zodResolver(DoctorProfessionalDetailsSchema),
        defaultValues: {
            qualification: '',
            specialization: '',
            registrationNumber: '',
            registrationState: '',
            expiryDate: '',
            clinicName: '',
            yearsOfExperience: undefined, // Changed from 0 to undefined
            communicationLanguages: ['English'],
            consultationFees: undefined, // Changed from 0 to undefined
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
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
    
    const handlePersonalDetailsSubmit = async (data: DoctorPersonalDetailsFormData) => {
        setPersonalFormLoading(true)
        setError('')
        
        try {
            if (!doctorId) {
                throw new Error('Doctor ID not found')
            }
            
            const response = await DoctorService.updatePersonalDetails(
                doctorId,
                data
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
    
    const handleProfessionalDetailsSubmit = async (data: DoctorProfessionalDetailsFormData) => {
        setProfessionalFormLoading(true)
        setError('')
        
        try {
            if (!doctorId) {
                throw new Error('Doctor ID not found')
            }
            
            const response = await DoctorService.updateProfessionalDetails(
                doctorId,
                data
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
                        <h1 className="text-2xl font-bold mb-2">Doctor Profile Setup</h1>
                        <p className="text-gray-600">Complete your profile to start providing consultations</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <Steps current={currentStep}>
                            <Steps.Item title="Personal Details" />
                            <Steps.Item title="Professional Details" />
                        </Steps>
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

                    {/* Step 1: Personal Details */}
                    {currentStep === 0 && (
                        <Form onSubmit={personalForm.handleSubmit(handlePersonalDetailsSubmit)}>
                            <div className="space-y-4">
                                <FormItem
                                    label="Full Name"
                                    asterisk={true}
                                    invalid={!!personalForm.formState.errors.fullName}
                                    errorMessage={personalForm.formState.errors.fullName?.message}
                                >
                                    <Controller
                                        name="fullName"
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Dr. John Doe"
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Email"
                                    invalid={!!personalForm.formState.errors.email}
                                    errorMessage={personalForm.formState.errors.email?.message}
                                >
                                    <Controller
                                        name="email"
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="doctor@example.com"
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Gender"
                                    asterisk={true}
                                    invalid={!!personalForm.formState.errors.gender}
                                    errorMessage={personalForm.formState.errors.gender?.message}
                                >
                                    <Controller
                                        name="gender"
                                        control={personalForm.control}
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
                                    label="Date of Birth"
                                    asterisk={true}
                                    invalid={!!personalForm.formState.errors.dob}
                                    errorMessage={personalForm.formState.errors.dob?.message}
                                >
                                    <Controller
                                        name="dob"
                                        control={personalForm.control}
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
                                
                                <div className="flex gap-4 mt-6">
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={personalFormLoading}
                                        disabled={personalFormLoading}
                                    >
                                        Next: Professional Details
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}

                    {/* Step 2: Professional Details */}
                    {currentStep === 1 && (
                        <Form onSubmit={professionalForm.handleSubmit(handleProfessionalDetailsSubmit)}>
                            <div className="space-y-4">
                                <FormItem
                                    label="Qualification"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.qualification}
                                    errorMessage={professionalForm.formState.errors.qualification?.message}
                                >
                                    <Controller
                                        name="qualification"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="MBBS, MD, etc."
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Specialization"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.specialization}
                                    errorMessage={professionalForm.formState.errors.specialization?.message}
                                >
                                    <Controller
                                        name="specialization"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Select your specialization"
                                                options={SPECIALIZATIONS}
                                                value={SPECIALIZATIONS.find(option => option.value === field.value)}
                                                onChange={(selectedOption) => {
                                                    field.onChange(selectedOption?.value || '')
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration Number"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.registrationNumber}
                                    errorMessage={professionalForm.formState.errors.registrationNumber?.message}
                                >
                                    <Controller
                                        name="registrationNumber"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Medical Council Registration Number"
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration State"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.registrationState}
                                    errorMessage={professionalForm.formState.errors.registrationState?.message}
                                >
                                    <Controller
                                        name="registrationState"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Select registration state"
                                                options={INDIAN_STATES}
                                                value={INDIAN_STATES.find(option => 
                                                    option.value === field.value
                                                )}
                                                onChange={(selectedOption) => {
                                                    field.onChange(selectedOption?.value || '')
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Registration Expiry Date"
                                    invalid={!!professionalForm.formState.errors.expiryDate}
                                    errorMessage={professionalForm.formState.errors.expiryDate?.message}
                                >
                                    <Controller
                                        name="expiryDate"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="date"
                                                className="w-full rounded-md border border-gray-300 p-2"
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Clinic Name"
                                    invalid={!!professionalForm.formState.errors.clinicName}
                                    errorMessage={professionalForm.formState.errors.clinicName?.message}
                                >
                                    <Controller
                                        name="clinicName"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Name of your clinic or hospital"
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Years of Experience"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.yearsOfExperience}
                                    errorMessage={professionalForm.formState.errors.yearsOfExperience?.message}
                                >
                                    <Controller
                                        name="yearsOfExperience"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                min="0"
                                                max="60"
                                                placeholder="Years of experience"
                                                value={field.value === undefined ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Consultation Fees (₹)"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.consultationFees}
                                    errorMessage={professionalForm.formState.errors.consultationFees?.message}
                                >
                                    <Controller
                                        name="consultationFees"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                min="0"
                                                max="10000"
                                                placeholder="Consultation fees"
                                                value={field.value === undefined ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Communication Languages"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.communicationLanguages}
                                    errorMessage={professionalForm.formState.errors.communicationLanguages?.message}
                                >
                                    <Controller
                                        name="communicationLanguages"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                isMulti
                                                placeholder="Select languages you can communicate in"
                                                options={languageOptions}
                                                value={languageOptions.filter(option => 
                                                    field.value?.includes(option.value)
                                                )}
                                                onChange={(selectedOptions) => {
                                                    const values = selectedOptions?.map(opt => opt.value) || []
                                                    field.onChange(values)
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Available Days"
                                    asterisk={true}
                                    invalid={!!professionalForm.formState.errors.availableDays}
                                    errorMessage={professionalForm.formState.errors.availableDays?.message}
                                >
                                    <Controller
                                        name="availableDays"
                                        control={professionalForm.control}
                                        render={({ field }) => {
                                            const daysOptions = [
                                                { value: 'Monday', label: 'Monday' },
                                                { value: 'Tuesday', label: 'Tuesday' },
                                                { value: 'Wednesday', label: 'Wednesday' },
                                                { value: 'Thursday', label: 'Thursday' },
                                                { value: 'Friday', label: 'Friday' },
                                                { value: 'Saturday', label: 'Saturday' },
                                                { value: 'Sunday', label: 'Sunday' },
                                            ]
                                            return (
                                                <Select
                                                    {...field}
                                                    isMulti
                                                    placeholder="Select available days"
                                                    options={daysOptions}
                                                    value={daysOptions.filter(option => 
                                                        field.value?.includes(option.value)
                                                    )}
                                                    onChange={(selectedOptions) => {
                                                        const values = selectedOptions?.map(opt => opt.value) || []
                                                        field.onChange(values)
                                                    }}
                                                />
                                            )
                                        }}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Certificates (PDF, JPG, JPEG, PNG - Max 5MB each)"
                                    invalid={!!professionalForm.formState.errors.certificates}
                                    errorMessage={professionalForm.formState.errors.certificates?.message}
                                >
                                    <Controller
                                        name="certificates"
                                        control={professionalForm.control}
                                        render={({ field }) => (
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || [])
                                                    field.onChange(files)
                                                }}
                                                className="w-full rounded-md border border-gray-300 p-2"
                                            />
                                        )}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload medical certificates, qualifications, or registration documents. Maximum 10 files allowed.
                                    </p>
                                </FormItem>
                                
                                <div className="flex gap-4 mt-6">
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() => setCurrentStep(0)}
                                    >
                                        Back: Personal Details
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={professionalFormLoading}
                                        disabled={professionalFormLoading}
                                    >
                                        Complete Profile Setup
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </div>
            </Card>
        </Container>
    )
}

export default ProfileSetup 