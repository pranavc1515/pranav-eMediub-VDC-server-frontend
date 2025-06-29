import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Form from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import FormContainer from '@/components/ui/Form/FormContainer'
import Upload from '@/components/ui/Upload'
import type { FamilyMember, UpdateFamilyMemberRequest } from '@/services/FamilyService'

interface EditFamilyMemberFormProps {
    member: FamilyMember
    onSubmit: (data: UpdateFamilyMemberRequest) => void
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

const EditFamilyMemberForm = ({ member, onSubmit, onCancel }: EditFamilyMemberFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: member.name,
        relationName: member.relation_type,
        phone: member.phone,
        email: member.email,
        age: member.age.toString(),
        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
        gender: member.gender,
        marital_status: member.marital_status,
        profession: member.profession || '',
        height: member.height || '',
        weight: member.weight || '',
        diet: member.diet || '',
        image: member.image || '',
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
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
            const requestData: UpdateFamilyMemberRequest = {
                name: formData.name,
                relationName: formData.relationName,
                phone: formData.phone,
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
                            >
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter full name"
                                />
                            </FormItem>

                            <FormItem
                                label="Relation"
                                invalid={!!errors.relationName}
                                errorMessage={errors.relationName}
                            >
                                <Select
                                    options={relationOptions}
                                    value={relationOptions.find(opt => opt.value === formData.relationName)}
                                    placeholder="Select relation"
                                    onChange={(option) => handleInputChange('relationName', option?.value || '')}
                                />
                            </FormItem>

                            <FormItem
                                label="Gender"
                                invalid={!!errors.gender}
                                errorMessage={errors.gender}
                            >
                                <Select
                                    options={genderOptions}
                                    value={genderOptions.find(opt => opt.value === formData.gender)}
                                    placeholder="Select gender"
                                    onChange={(option) => handleInputChange('gender', option?.value || '')}
                                />
                            </FormItem>

                            <FormItem
                                label="Age"
                                invalid={!!errors.age}
                                errorMessage={errors.age}
                            >
                                <Input
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    placeholder="e.g., 25-year"
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
                                    onChange={(e) => handleInputChange('dob', e.target.value)}
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
                            >
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+91XXXXXXXXXX"
                                />
                            </FormItem>

                            <FormItem
                                label="Email"
                                invalid={!!errors.email}
                                errorMessage={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </FormItem>

                            <FormItem
                                label="Marital Status"
                                invalid={!!errors.marital_status}
                                errorMessage={errors.marital_status}
                            >
                                <Select
                                    options={maritalStatusOptions}
                                    value={maritalStatusOptions.find(opt => opt.value === formData.marital_status)}
                                    placeholder="Select marital status"
                                    onChange={(option) => handleInputChange('marital_status', option?.value || '')}
                                />
                            </FormItem>

                            <FormItem
                                label="Profession"
                                invalid={!!errors.profession}
                                errorMessage={errors.profession}
                            >
                                <Input
                                    value={formData.profession}
                                    onChange={(e) => handleInputChange('profession', e.target.value)}
                                    placeholder="Enter profession"
                                />
                            </FormItem>

                            <div className="grid grid-cols-2 gap-4">
                                <FormItem
                                    label="Height"
                                    invalid={!!errors.height}
                                    errorMessage={errors.height}
                                >
                                    <Input
                                        value={formData.height}
                                        onChange={(e) => handleInputChange('height', e.target.value)}
                                        placeholder="e.g., 160-cm"
                                    />
                                </FormItem>

                                <FormItem
                                    label="Weight"
                                    invalid={!!errors.weight}
                                    errorMessage={errors.weight}
                                >
                                    <Input
                                        value={formData.weight}
                                        onChange={(e) => handleInputChange('weight', e.target.value)}
                                        placeholder="e.g., 70-kg"
                                    />
                                </FormItem>
                            </div>

                            <FormItem
                                label="Diet"
                                invalid={!!errors.diet}
                                errorMessage={errors.diet}
                            >
                                <Select
                                    options={dietOptions}
                                    value={dietOptions.find(opt => opt.value === formData.diet)}
                                    placeholder="Select diet preference"
                                    onChange={(option) => handleInputChange('diet', option?.value || '')}
                                />
                            </FormItem>
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Profile Image
                        </h4>
                        <FormItem
                            label="Upload Profile Picture"
                            invalid={!!errors.image}
                            errorMessage={errors.image}
                        >
                            <Upload
                                accept="image/*"
                                multiple={false}
                                onChange={handleImageUpload}
                            />
                        </FormItem>
                        {formData.image && (
                            <div className="mt-4">
                                <img
                                    src={formData.image}
                                    alt="Profile Preview"
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={onCancel}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Update Family Member
                        </Button>
                    </div>
                </Form>
            </FormContainer>
        </div>
    )
}

export default EditFamilyMemberForm 