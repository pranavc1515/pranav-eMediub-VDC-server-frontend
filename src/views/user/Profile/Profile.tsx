import { useState, useEffect, ChangeEvent, useRef } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Drawer, 
    Input, 
    FormItem, 
    FormContainer, 
    Spinner, 
    Notification,
    Alert,
    Badge
} from '@/components/ui'
import toast from '@/components/ui/toast'
import UserService from '@/services/UserService'
import MedicalDetailsService from '@/services/MedicalDetailsService'
import FamilyService from '@/services/FamilyService'
import type { UserPersonalDetails } from '@/services/UserService'
import type { MedicalDetails, UpdateMedicalDetailsRequest } from '@/services/MedicalDetailsService'
import type { FamilyMember, FamilyTreeResponse, AddFamilyMemberRequest, UpdateFamilyMemberRequest, RemoveFamilyMemberRequest } from '@/services/FamilyService'
import { HiOutlinePencilAlt, HiOutlineCamera, HiOutlineClipboardList, HiPlus, HiEye, HiPencil, HiTrash, HiUsers } from 'react-icons/hi'
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
import AddFamilyMemberForm from '@/views/user/Family/components/AddFamilyMemberForm'
import EditFamilyMemberForm from '@/views/user/Family/components/EditFamilyMemberForm'
import FamilyTreeCard from '@/views/user/Family/components/FamilyTreeCard'
import { useTranslation } from '@/utils/hooks/useTranslation'

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
    const { t } = useTranslation()
    const [profileData, setProfileData] = useState<UserProfileDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [formVisible, setFormVisible] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [userPhone, setUserPhone] = useState<string>('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Medical Information States
    const [medicalData, setMedicalData] = useState<MedicalDetails | null>(null)
    const [medicalFormVisible, setMedicalFormVisible] = useState(false)
    const [medicalSubmitting, setMedicalSubmitting] = useState(false)
    const [medicalError, setMedicalError] = useState('')
    const [medicalSuccess, setMedicalSuccess] = useState('')

    // Family Information States
    const [familyData, setFamilyData] = useState<FamilyTreeResponse | null>(null)
    const [familyLoading, setFamilyLoading] = useState(false)
    const [addFamilyDrawerOpen, setAddFamilyDrawerOpen] = useState(false)
    const [editFamilyDrawerOpen, setEditFamilyDrawerOpen] = useState(false)
    const [viewFamilyDrawerOpen, setViewFamilyDrawerOpen] = useState(false)
    const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)

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

    // Medical form setup
    const medicalForm = useForm<UpdateMedicalDetailsRequest>({
        mode: 'onChange',
        defaultValues: {
            blood_group: '',
            food_allergies: '',
            drug_allergies: '',
            implants: '',
            surgeries: '',
            family_medical_history: '',
            smoking_habits: '',
            alcohol_consumption: '',
            physical_activity: '',
        }
    })

    // Blood group options
    const bloodGroupOptions: SelectOption[] = [
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
    ]

    const smokingHabitsOptions: SelectOption[] = [
        { value: 'Never', label: 'Never' },
        { value: 'Occasionally', label: 'Occasionally' },
        { value: 'Regularly', label: 'Regularly' },
        { value: 'Quit', label: 'Quit' },
    ]

    const alcoholConsumptionOptions: SelectOption[] = [
        { value: 'Never', label: 'Never' },
        { value: 'Occasionally', label: 'Occasionally' },
        { value: 'Regularly', label: 'Regularly' },
        { value: 'Socially', label: 'Socially' },
    ]

    const physicalActivityOptions: SelectOption[] = [
        { value: 'Sedentary', label: 'Sedentary' },
        { value: 'Light exercise', label: 'Light exercise' },
        { value: 'Moderate exercise', label: 'Moderate exercise' },
        { value: 'Regular exercise', label: 'Regular exercise' },
        { value: 'Intense exercise', label: 'Intense exercise' },
    ]

    useEffect(() => {
        fetchProfileData()
        fetchMedicalData()
        fetchFamilyData()
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
            setError(t('profile.profileLoadError'))
        } finally {
            setLoading(false)
        }
    }

    const fetchMedicalData = async () => {
        try {
            const response = await MedicalDetailsService.getMedicalDetails()
            if (response.status && response.data) {
                setMedicalData(response.data)
                
                // Populate medical form with existing data
                medicalForm.reset({
                    blood_group: response.data.blood_group || '',
                    food_allergies: response.data.food_allergies || '',
                    drug_allergies: response.data.drug_allergies || '',
                    implants: response.data.implants || '',
                    surgeries: response.data.surgeries || '',
                    family_medical_history: response.data.family_medical_history || '',
                    smoking_habits: response.data.smoking_habits || '',
                    alcohol_consumption: response.data.alcohol_consumption || '',
                    physical_activity: response.data.physical_activity || '',
                })
            }
        } catch (error) {
            console.error('Error fetching medical data:', error)
            // Don't show error if medical data doesn't exist yet (404)
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } }
                if (axiosError.response?.status !== 404) {
                    setMedicalError('Failed to load medical information')
                }
            }
        }
    }

    const fetchFamilyData = async () => {
        try {
            setFamilyLoading(true)
            const response = await FamilyService.getFamilyTree()
            setFamilyData(response)
        } catch (error) {
            console.error('Error fetching family data:', error)
            // Don't show error for family data as it's optional
        } finally {
            setFamilyLoading(false)
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
                setSuccess(response.message || t('profile.profileUpdateSuccess'))
                
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
                setError(response.message || t('profile.profileUpdateFailed'))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setError(t('profile.profileLoadFailed'))
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

    // Medical form handlers
    const handleMedicalSubmit = async (data: UpdateMedicalDetailsRequest) => {
        try {
            setMedicalSubmitting(true)
            setMedicalError('')
            setMedicalSuccess('')

            const response = await MedicalDetailsService.updateMedicalDetails(data)
            
            if (response.status) {
                setMedicalSuccess(response.message || 'Medical information updated successfully!')
                
                // Refresh medical data
                await fetchMedicalData()
                
                // Close the drawer after a short delay to show the success message
                setTimeout(() => {
                    toggleMedicalDrawer(false)
                }, 1500)
            } else {
                setMedicalError(response.message || 'Failed to update medical information. Please try again.')
            }
        } catch (error) {
            console.error('Error updating medical information:', error)
            setMedicalError('An error occurred while updating your medical information. Please try again.')
        } finally {
            setMedicalSubmitting(false)
        }
    }

    const toggleMedicalDrawer = (visible: boolean) => {
        setMedicalFormVisible(visible)
        if (!visible) {
            setMedicalError('')
            setMedicalSuccess('')
        }
    }

    // Family form handlers
    const handleAddFamilyMember = async (memberData: AddFamilyMemberRequest) => {
        try {
            await FamilyService.addFamilyMember(memberData)
            toast.push(
                <Notification type="success" title="Success">
                    Family member added successfully
                </Notification>,
            )
            setAddFamilyDrawerOpen(false)
            await fetchFamilyData()
        } catch (error) {
            console.error('Error adding family member:', error)
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to add family member
                </Notification>,
            )
        }
    }

    const handleUpdateFamilyMember = async (memberData: UpdateFamilyMemberRequest) => {
        if (!selectedFamilyMember) return

        try {
            await FamilyService.updateFamilyMember(selectedFamilyMember.id, memberData)
            toast.push(
                <Notification type="success" title="Success">
                    Family member updated successfully
                </Notification>,
            )
            setEditFamilyDrawerOpen(false)
            setSelectedFamilyMember(null)
            await fetchFamilyData()
        } catch (error) {
            console.error('Error updating family member:', error)
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to update family member
                </Notification>,
            )
        }
    }

    const handleRemoveFamilyMember = async (relatedUserId: number) => {
        try {
            const requestData: RemoveFamilyMemberRequest = {
                userId: relatedUserId,
            }
            await FamilyService.removeFamilyMember(relatedUserId, requestData)
            toast.push(
                <Notification type="success" title="Success">
                    Family member removed successfully
                </Notification>,
            )
            await fetchFamilyData()
        } catch (error) {
            console.error('Error removing family member:', error)
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to remove family member
                </Notification>,
            )
        }
    }

    const openEditFamilyDrawer = (member: FamilyMember) => {
        setSelectedFamilyMember(member)
        setEditFamilyDrawerOpen(true)
    }

    const openViewFamilyDrawer = (member: FamilyMember) => {
        setSelectedFamilyMember(member)
        setViewFamilyDrawerOpen(true)
    }

    const openAddFamilyDrawer = (nodeUserId?: number) => {
        // Get user ID from auth store or localStorage as fallback
        const authUserId = user.userId ? parseInt(user.userId, 10) : null
        const storedUserId = localStorage.getItem('userId')
        const userIdFromStorage = storedUserId ? parseInt(storedUserId, 10) : null

        const finalNodeUserId = nodeUserId || authUserId || userIdFromStorage

        if (!finalNodeUserId) {
            toast.push(
                <Notification type="danger" title="Authentication Required">
                    Please log in to add family members.
                </Notification>,
            )
            return
        }

        setSelectedNodeId(finalNodeUserId)
        setAddFamilyDrawerOpen(true)
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
                        <h1 className="text-2xl font-bold">{t('profile.profileInformation')}</h1>
                        <Button 
                            variant="solid"
                            icon={<HiOutlinePencilAlt />} 
                            onClick={() => toggleDrawer(true)}
                        >
                            {t('profile.editProfile')}
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
                                <p className="font-medium text-lg">{profileInfo?.name || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className="font-medium">{profileInfo?.email || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Phone</p>
                                <p className="font-medium">
                                    {profileInfo?.phone ? (profileInfo.phone.startsWith('+') ? 
                                        `+${profileInfo.phone.substring(1, 3)} ${profileInfo.phone.substring(3)}` : 
                                        `+${profileInfo.phone.substring(0, 2)} ${profileInfo.phone.substring(2)}`) : t('profile.notProvided')}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Age</p>
                                <p className="font-medium">{profileInfo?.age || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Date of Birth</p>
                                <p className="font-medium">
                                    {profileInfo?.dob 
                                        ? new Date(profileInfo.dob).toLocaleDateString() 
                                        : t('profile.notProvided')}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Gender</p>
                                <p className="font-medium">{profileInfo?.gender || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Marital Status</p>
                                <p className="font-medium">{profileInfo?.marital_status || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Height</p>
                                <p className="font-medium">{profileInfo?.height ? `${profileInfo.height} cm` : t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Weight</p>
                                <p className="font-medium">{profileInfo?.weight ? `${profileInfo.weight} kg` : t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Diet</p>
                                <p className="font-medium">{profileInfo?.diet || t('profile.notProvided')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Profession</p>
                                <p className="font-medium">{profileInfo?.profession || t('profile.notProvided')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Medical Information Card */}
            <Card className="max-w-4xl mx-auto mb-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Medical Information</h1>
                        <Button 
                            variant="solid"
                            icon={<HiOutlineClipboardList />} 
                            onClick={() => toggleMedicalDrawer(true)}
                        >
                            {medicalData ? 'Edit Medical Info' : 'Add Medical Info'}
                        </Button>
                    </div>
                    
                    {medicalData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-500 text-sm">Blood Group</p>
                                <p className="font-medium">{medicalData.blood_group || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Food Allergies</p>
                                <p className="font-medium">{medicalData.food_allergies || 'None reported'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Drug Allergies</p>
                                <p className="font-medium">{medicalData.drug_allergies || 'None reported'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Implants</p>
                                <p className="font-medium">{medicalData.implants || 'None reported'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Surgeries</p>
                                <p className="font-medium">{medicalData.surgeries || 'None reported'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Family Medical History</p>
                                <p className="font-medium">{medicalData.family_medical_history || 'None reported'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Smoking Habits</p>
                                <p className="font-medium">{medicalData.smoking_habits || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Alcohol Consumption</p>
                                <p className="font-medium">{medicalData.alcohol_consumption || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Physical Activity</p>
                                <p className="font-medium">{medicalData.physical_activity || 'Not specified'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <HiOutlineClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">No medical information available</p>
                            <p className="text-sm text-gray-400">Add your medical information to help doctors provide better care</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Family Information Card */}
            <Card className="max-w-4xl mx-auto mb-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{t('profile.familyInformation')}</h1>
                        <Button 
                            variant="solid"
                            icon={<HiPlus />} 
                            onClick={() => openAddFamilyDrawer()}
                        >
                            {t('family.addFamilyMember')}
                        </Button>
                    </div>
                    
                    {familyData?.data?.familyTree && familyData.data.familyTree.length > 0 ? (
                        <div className="space-y-4">
                            {/* Family Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <HiUsers className="text-2xl text-blue-600 mr-3" />
                                        <div>
                                            <h3 className="text-lg font-semibold">{t('family.totalMembers')}</h3>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {familyData.data.familyTree.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Family Members List */}
                            <div className="space-y-4">
                                {familyData.data.familyTree.map((member) => (
                                    <Card key={member.id} className="p-4 hover:shadow-lg transition-shadow duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Avatar
                                                    size={60}
                                                    src={member.image || undefined}
                                                    alt={member.name}
                                                    className="ring-2 ring-blue-100"
                                                >
                                                    {!member.image && member.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {member.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {member.relation_type}
                                                        </span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {member.gender}
                                                        </span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {member.age} years
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <p>📧 {member.email}</p>
                                                        <p>📞 {member.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiEye />}
                                                    onClick={() => openViewFamilyDrawer(member)}
                                                    className="text-blue-600 hover:bg-blue-50"
                                                >
                                                    {t('common.view')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiPencil />}
                                                    onClick={() => openEditFamilyDrawer(member)}
                                                    className="text-amber-600 hover:bg-amber-50"
                                                >
                                                    {t('common.edit')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiTrash />}
                                                    onClick={() => {
                                                        if (confirm(t('family.confirmRemoveMember'))) {
                                                            handleRemoveFamilyMember(member.id)
                                                        }
                                                    }}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    {t('common.remove')}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <HiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">{t('family.noFamilyMembers')}</p>
                            <p className="text-sm text-gray-400">{t('family.getStartedMessage')}</p>
                        </div>
                    )}
                </div>
            </Card>

            <Drawer
                                    title={t('profile.editProfile')}
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
                                {t('profile.clickCameraIcon')}
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

            {/* Medical Information Drawer */}
            <Drawer
                title="Medical Information"
                isOpen={medicalFormVisible}
                onClose={() => toggleMedicalDrawer(false)}
                onRequestClose={() => toggleMedicalDrawer(false)}
                width={700}
            >
                <div className="p-6">
                    {medicalError && (
                        <Alert type="danger" showIcon className="mb-4">
                            {medicalError}
                        </Alert>
                    )}
                    
                    {medicalSuccess && (
                        <Alert type="success" showIcon className="mb-4">
                            {medicalSuccess}
                        </Alert>
                    )}
                    
                    <FormContainer>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="Blood Group">
                                <Controller
                                    name="blood_group"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="input input-md h-11 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Select blood group</option>
                                            {bloodGroupOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Food Allergies">
                                <Controller
                                    name="food_allergies"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="e.g., Peanuts, Shellfish, Dairy"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Drug Allergies">
                                <Controller
                                    name="drug_allergies"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="e.g., Penicillin, Aspirin"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Implants">
                                <Controller
                                    name="implants"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="e.g., Pacemaker, Joint replacement"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Surgeries">
                                <Controller
                                    name="surgeries"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="e.g., Appendectomy, Heart surgery"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Family Medical History">
                                <Controller
                                    name="family_medical_history"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="e.g., Diabetes, Heart disease"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Smoking Habits">
                                <Controller
                                    name="smoking_habits"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="input input-md h-11 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Select smoking habits</option>
                                            {smokingHabitsOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Alcohol Consumption">
                                <Controller
                                    name="alcohol_consumption"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="input input-md h-11 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Select alcohol consumption</option>
                                            {alcoholConsumptionOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Physical Activity" className="md:col-span-2">
                                <Controller
                                    name="physical_activity"
                                    control={medicalForm.control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="input input-md h-11 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Select physical activity level</option>
                                            {physicalActivityOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-2 mt-8">
                            <Button
                                variant="plain"
                                onClick={() => toggleMedicalDrawer(false)}
                                disabled={medicalSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={medicalForm.handleSubmit(handleMedicalSubmit)}
                                loading={medicalSubmitting}
                                disabled={medicalSubmitting}
                            >
                                Save Medical Information
                            </Button>
                        </div>
                    </FormContainer>
                </div>
            </Drawer>

            {/* Add Family Member Drawer */}
            <Drawer
                isOpen={addFamilyDrawerOpen}
                onClose={() => setAddFamilyDrawerOpen(false)}
                title="Add Family Member"
                width={600}
                placement="right"
                closable
            >
                <AddFamilyMemberForm
                    onSubmit={handleAddFamilyMember}
                    onCancel={() => setAddFamilyDrawerOpen(false)}
                    nodeUserId={selectedNodeId}
                />
            </Drawer>

            {/* Edit Family Member Drawer */}
            <Drawer
                isOpen={editFamilyDrawerOpen}
                onClose={() => setEditFamilyDrawerOpen(false)}
                title="Edit Family Member"
                width={600}
                placement="right"
                closable
            >
                {selectedFamilyMember && (
                    <EditFamilyMemberForm
                        member={selectedFamilyMember}
                        onSubmit={handleUpdateFamilyMember}
                        onCancel={() => setEditFamilyDrawerOpen(false)}
                    />
                )}
            </Drawer>

            {/* View Family Member Drawer */}
            <Drawer
                isOpen={viewFamilyDrawerOpen}
                onClose={() => setViewFamilyDrawerOpen(false)}
                title="Family Member Details"
                width={600}
                placement="right"
                closable
            >
                {selectedFamilyMember && (
                    <FamilyTreeCard
                        member={selectedFamilyMember}
                        onClose={() => setViewFamilyDrawerOpen(false)}
                    />
                )}
            </Drawer>
        </Container>
    )
}

export default Profile