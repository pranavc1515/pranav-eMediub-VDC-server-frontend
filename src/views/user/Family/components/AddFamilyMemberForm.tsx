import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/Input/PhoneInput'
import Select from '@/components/ui/Select'
import Form from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import FormContainer from '@/components/ui/Form/FormContainer'
import Upload from '@/components/ui/Upload'
import { useSessionUser } from '@/store/authStore'
import { getTodayDateString } from '@/utils/dateUtils'
import type { AddFamilyMemberRequest } from '@/services/FamilyService'
import { formatPhoneNumber } from '@/utils/validationSchemas'

interface AddFamilyMemberFormProps {
    nodeUserId: number | null
    onSubmit: (data: AddFamilyMemberRequest) => void
    onCancel: () => void
}

interface FormData {
    name: string
    relationName: string
    phone: string
    email: string
    age: string
    dob: string
    gender: string
    marital_status: string
    profession: string
    height: string
    weight: string
    diet: string
    image: string
}

interface FormErrors {
    [key: string]: string
}

const relationOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Sister', label: 'Sister' },
    { value: 'Son', label: 'Son' },
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Grandfather', label: 'Grandfather' },
    { value: 'Grandmother', label: 'Grandmother' },
    { value: 'Uncle', label: 'Uncle' },
    { value: 'Aunt', label: 'Aunt' },
    { value: 'Cousin', label: 'Cousin' },
]

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
]

const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
]

const dietOptions = [
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Other', label: 'Other' },
]

const AddFamilyMemberForm = ({
    nodeUserId,
    onSubmit,
    onCancel,
}: AddFamilyMemberFormProps) => {
    const { user } = useSessionUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        relationName: '',
        phone: '',
        email: '',
        age: '',
        dob: '',
        gender: '',
        marital_status: '',
        profession: '',
        height: '',
        weight: '',
        diet: '',
        image: '',
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
            newErrors.name = 'Name can only contain letters and spaces'
        }
        if (!formData.relationName) {
            newErrors.relationName = 'Relation is required'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (formData.phone.length !== 10) {
            newErrors.phone = 'Phone number must be 10 digits'
        } else if (!/^[6-9]/.test(formData.phone)) {
            newErrors.phone = 'Phone number must start with 6, 7, 8, or 9'
        }
        if (!formData.age.trim()) {
            newErrors.age = 'Age is required'
        }
        if (!formData.gender) {
            newErrors.gender = 'Gender is required'
        }
        if (!formData.marital_status) {
            newErrors.marital_status = 'Marital status is required'
        }
        if (formData.dob) {
            const birthDate = new Date(formData.dob)
            if (isNaN(birthDate.getTime())) {
                newErrors.dob = 'Please enter a valid date'
            } else if (birthDate > new Date()) {
                newErrors.dob = 'Future dates are not allowed'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    const handleImageUpload = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                handleInputChange('image', base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            // Get userId from auth store or localStorage as fallback
            const authUserId = user.userId ? parseInt(user.userId, 10) : null
            const storedUserId = localStorage.getItem('userId')
            const userIdFromStorage = storedUserId
                ? parseInt(storedUserId, 10)
                : null

            const finalNodeUserId =
                nodeUserId || authUserId || userIdFromStorage

            if (!finalNodeUserId) {
                throw new Error('User ID not found. Please log in again.')
            }

            const requestData: AddFamilyMemberRequest = {
                nodeUserId: finalNodeUserId,
                relationName: formData.relationName,
                name: formData.name,
                phone: `+91${formData.phone}`,
                email: formData.email,
                age: formData.age,
                dob: formData.dob,
                gender: formData.gender,
                marital_status: formData.marital_status,
                profession: formData.profession,
                height: formData.height,
                weight: formData.weight,
                diet: formData.diet,
                image: formData.image,
            }
            await onSubmit(requestData)
        } catch (error) {
            console.error('Error adding family member:', error)
            // The error will be handled by the parent component
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <FormContainer>
                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Basic Information
                            </h4>

                            <FormItem
                                label="Name"
                                invalid={!!errors.name}
                                errorMessage={errors.name}
                                asterisk
                            >
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter full name"
                                />
                            </FormItem>

                            <FormItem
                                label="Relation"
                                invalid={!!errors.relationName}
                                errorMessage={errors.relationName}
                                asterisk
                            >
                                <Select
                                    options={relationOptions}
                                    placeholder="Select relation"
                                    value={relationOptions.find(
                                        (opt) =>
                                            opt.value === formData.relationName,
                                    )}
                                    onChange={(option) =>
                                        handleInputChange(
                                            'relationName',
                                            option?.value || '',
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Gender"
                                invalid={!!errors.gender}
                                errorMessage={errors.gender}
                                asterisk
                            >
                                <Select
                                    options={genderOptions}
                                    placeholder="Select gender"
                                    value={genderOptions.find(
                                        (opt) => opt.value === formData.gender,
                                    )}
                                    onChange={(option) =>
                                        handleInputChange(
                                            'gender',
                                            option?.value || '',
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Age"
                                invalid={!!errors.age}
                                errorMessage={errors.age}
                                asterisk
                            >
                                <Input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) =>
                                        handleInputChange('age', e.target.value)
                                    }
                                    placeholder="Enter age"
                                />
                            </FormItem>

                            <FormItem 
                                label="Date of Birth"
                                invalid={!!errors.dob}
                                errorMessage={errors.dob}
                            >
                                <Input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) =>
                                        handleInputChange('dob', e.target.value)
                                    }
                                    max={getTodayDateString()}
                                />
                            </FormItem>

                            <FormItem
                                label="Marital Status"
                                invalid={!!errors.marital_status}
                                errorMessage={errors.marital_status}
                                asterisk
                            >
                                <Select
                                    options={maritalStatusOptions}
                                    placeholder="Select marital status"
                                    value={maritalStatusOptions.find(
                                        (opt) =>
                                            opt.value ===
                                            formData.marital_status,
                                    )}
                                    onChange={(option) =>
                                        handleInputChange(
                                            'marital_status',
                                            option?.value || '',
                                        )
                                    }
                                />
                            </FormItem>
                        </div>

                        {/* Contact & Additional Information */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Contact & Additional Information
                            </h4>

                            <FormItem
                                label="Phone Number"
                                invalid={!!errors.phone}
                                errorMessage={errors.phone}
                                asterisk
                            >
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value) =>
                                        handleInputChange(
                                            'phone',
                                            value,
                                        )
                                    }
                                    placeholder="Enter 10 digit number"
                                />
                            </FormItem>

                            <FormItem label="Email">
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter email address"
                                />
                            </FormItem>

                            <FormItem label="Profession">
                                <Input
                                    value={formData.profession}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'profession',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter profession"
                                />
                            </FormItem>

                            <FormItem label="Height (cm)">
                                <Input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'height',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter height in cm"
                                />
                            </FormItem>

                            <FormItem label="Weight (kg)">
                                <Input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'weight',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter weight in kg"
                                />
                            </FormItem>

                            <FormItem label="Diet">
                                <Select
                                    options={dietOptions}
                                    placeholder="Select diet type"
                                    value={dietOptions.find(
                                        (opt) => opt.value === formData.diet,
                                    )}
                                    onChange={(option) =>
                                        handleInputChange(
                                            'diet',
                                            option?.value || '',
                                        )
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="mt-6">
                        <FormItem label="Profile Image">
                            <Upload
                                onChange={handleImageUpload}
                                showList={false}
                                uploadLimit={1}
                                accept="image/*"
                            >
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    {formData.image ? (
                                        <div className="space-y-2">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-20 h-20 object-cover rounded-full mx-auto"
                                            />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to change image
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                                                <span className="text-2xl">
                                                    📷
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to upload image
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Upload>
                        </FormItem>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="default"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Family Member'}
                        </Button>
                    </div>
                </Form>
            </FormContainer>
        </div>
    )
}

export default AddFamilyMemberForm
