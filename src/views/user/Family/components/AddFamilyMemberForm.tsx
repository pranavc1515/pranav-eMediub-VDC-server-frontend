import { useState } from 'react'
import { Button, Input, Select, FormItem, FormContainer, DatePicker, Checkbox } from '@/components/ui'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type AddFamilyMemberFormProps = {
    onSubmit: (values: any) => void
    onCancel: () => void
}

const validationSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string()
        .regex(/^\d{10}$/, 'Phone number must be 10 digits')
        .min(1, 'Phone number is required'),
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    bloodGroup: z.string().min(1, 'Blood group is required'),
    emergencyContact: z.boolean(),
})

type FormData = z.infer<typeof validationSchema>

const AddFamilyMemberForm = ({ onSubmit, onCancel }: AddFamilyMemberFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            relationship: '',
            dateOfBirth: '',
            gender: '',
            phone: '',
            email: '',
            bloodGroup: '',
            emergencyContact: false,
        },
    })

    const relationshipOptions = [
        { value: 'Father', label: 'Father' },
        { value: 'Mother', label: 'Mother' },
        { value: 'Spouse', label: 'Spouse' },
        { value: 'Son', label: 'Son' },
        { value: 'Daughter', label: 'Daughter' },
        { value: 'Brother', label: 'Brother' },
        { value: 'Sister', label: 'Sister' },
        { value: 'Other', label: 'Other' },
    ]

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ]

    const bloodGroupOptions = [
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
    ]

    const onSubmitForm = async (values: FormData) => {
        setIsSubmitting(true)
        try {
            await onSubmit(values)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        label="First Name"
                        invalid={!!errors.firstName}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Enter first name"
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Last Name"
                        invalid={!!errors.lastName}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Enter last name"
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Relationship"
                        invalid={!!errors.relationship}
                        errorMessage={errors.relationship?.message}
                    >
                        <Controller
                            name="relationship"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Select relationship"
                                    options={relationshipOptions}
                                    value={relationshipOptions.find(option => option.value === field.value)}
                                    onChange={(option: any) => field.onChange(option?.value || '')}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Date of Birth"
                        invalid={!!errors.dateOfBirth}
                        errorMessage={errors.dateOfBirth?.message}
                    >
                        <Controller
                            name="dateOfBirth"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="date"
                                    placeholder="Select date of birth"
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Gender"
                        invalid={!!errors.gender}
                        errorMessage={errors.gender?.message}
                    >
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Select gender"
                                    options={genderOptions}
                                    value={genderOptions.find(option => option.value === field.value)}
                                    onChange={(option: any) => field.onChange(option?.value || '')}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Blood Group"
                        invalid={!!errors.bloodGroup}
                        errorMessage={errors.bloodGroup?.message}
                    >
                        <Controller
                            name="bloodGroup"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Select blood group"
                                    options={bloodGroupOptions}
                                    value={bloodGroupOptions.find(option => option.value === field.value)}
                                    onChange={(option: any) => field.onChange(option?.value || '')}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Phone Number"
                        invalid={!!errors.phone}
                        errorMessage={errors.phone?.message}
                    >
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="tel"
                                    placeholder="Enter phone number"
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Email Address"
                        invalid={!!errors.email}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="email"
                                    placeholder="Enter email address"
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <div className="mt-4">
                    <Controller
                        name="emergencyContact"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onChange={field.onChange}
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Set as emergency contact
                                </span>
                            </Checkbox>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        loading={isSubmitting}
                    >
                        Add Family Member
                    </Button>
                </div>
            </FormContainer>
        </form>
    )
}

export default AddFamilyMemberForm 