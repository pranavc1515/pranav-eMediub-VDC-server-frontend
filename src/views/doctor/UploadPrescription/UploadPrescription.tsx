import { useState } from 'react'
import {
    Card,
    Button,
    Input,
    FormContainer,
    FormItem,
    Upload,
    Notification,
    toast,
    Tabs,
} from '@/components/ui'
import { useSessionUser } from '@/store/authStore'
import Container from '@/components/shared/Container'
import { HiOutlineDocumentAdd, HiOutlineCloudUpload } from 'react-icons/hi'
import usePrescription from '@/hooks/usePrescription'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    PrescriptionUploadSchema,
    CustomPrescriptionSchema,
    type PrescriptionUploadFormData,
    type CustomPrescriptionFormData,
    type MedicineFormData
} from '@/utils/validationSchemas'
import type { Medicine } from '@/services/PrescriptionService'

const { TabNav, TabList, TabContent } = Tabs

const UploadPrescription = () => {
    const user = useSessionUser((state) => state.user)
    const docId = user.userId
    const [activeTab, setActiveTab] = useState('upload')
    const [file, setFile] = useState<File | null>(null)

    // Upload form
    const uploadForm = useForm<PrescriptionUploadFormData>({
        resolver: zodResolver(PrescriptionUploadSchema),
        defaultValues: {
            consultationId: '',
            doctorId: docId?.toString(),
            userId: '',
        }
    })

    // Custom prescription form
    const customForm = useForm<CustomPrescriptionFormData>({
        resolver: zodResolver(CustomPrescriptionSchema),
        defaultValues: {
            consultationId: '',
            medicines: [
                {
                    name: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    notes: '',
                },
            ],
            instructions: '',
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: customForm.control,
        name: 'medicines'
    })

    const {
        loading: isUploading,
        uploadPrescription,
        createCustomPrescription,
    } = usePrescription({
        doctorId: docId ? parseInt(docId) : undefined,
        userId: undefined,
    })

    // Handle file upload
    const onFileUpload = (_: File[], fileList: File[]) => {
        if (fileList.length > 0) {
            const selectedFile = fileList[0]
            
            // Validate file size (10MB limit)
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.push(
                    <Notification type="danger" title="File Too Large">
                        <span>File size must be less than 10MB</span>
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
            if (!allowedTypes.includes(selectedFile.type)) {
                toast.push(
                    <Notification type="danger" title="Invalid File Type">
                        <span>Only JPG, JPEG, PNG, and PDF files are allowed</span>
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
                return
            }

            setFile(selectedFile)
        }
    }

    const handleUploadPrescription = async (data: PrescriptionUploadFormData) => {
        if (!file) {
            toast.push(
                <Notification type="danger" title="Error">
                    <span>Please select a file to upload</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        const result = await uploadPrescription({
            consultationId: data.consultationId,
            file,
        })

        if (result) {
            toast.push(
                <Notification type="success" title="Success">
                    <span>Prescription uploaded successfully</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )

            // Reset form
            uploadForm.reset()
            setFile(null)
        }
    }

    const handleAddMedicine = () => {
        append({
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: '',
        })
    }

    const handleRemoveMedicine = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        }
    }

    const handleCreateCustomPrescription = async (data: CustomPrescriptionFormData) => {
        const result = await createCustomPrescription({
            consultationId: data.consultationId,
            medicines: data.medicines as Medicine[],
            instructions: data.instructions || '',
        })

        if (result) {
            toast.push(
                <Notification type="success" title="Success">
                    <span>Custom prescription created successfully</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )

            // Reset form
            customForm.reset({
                consultationId: '',
                medicines: [
                    {
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        notes: '',
                    },
                ],
                instructions: '',
            })
        }
    }

    return (
        <Container>
            <div className="mb-6">
                <h3>Upload Prescription</h3>
                <p>Upload or generate a prescription for your patients</p>
            </div>

            <Card>
                <Tabs
                    defaultValue="upload"
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as string)}
                >
                    <TabList>
                        <TabNav value="upload">Upload Prescription</TabNav>
                        <TabNav value="generate">Generate Prescription</TabNav>
                    </TabList>
                    <div className="p-4">
                        <TabContent value="upload">
                            <form onSubmit={uploadForm.handleSubmit(handleUploadPrescription)}>
                                <FormContainer>
                                    <FormItem
                                        label="Consultation ID"
                                        labelClass="font-medium mb-2"
                                        asterisk={true}
                                        invalid={!!uploadForm.formState.errors.consultationId}
                                        errorMessage={uploadForm.formState.errors.consultationId?.message}
                                    >
                                        <Controller
                                            name="consultationId"
                                            control={uploadForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter consultation ID"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Doctor ID (optional if authenticated)"
                                        labelClass="font-medium mb-2"
                                    >
                                        <Controller
                                            name="doctorId"
                                            control={uploadForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    disabled
                                                    placeholder="Enter doctor ID"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Patient ID (optional)"
                                        labelClass="font-medium mb-2"
                                        invalid={!!uploadForm.formState.errors.userId}
                                        errorMessage={uploadForm.formState.errors.userId?.message}
                                    >
                                        <Controller
                                            name="userId"
                                            control={uploadForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter patient ID"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Prescription File"
                                        labelClass="font-medium mb-2"
                                        asterisk={true}
                                    >
                                        <Upload
                                            onChange={onFileUpload}
                                            accept="image/*, application/pdf"
                                            showList={false}
                                            uploadLimit={1}
                                        >
                                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                                                <div className="mb-2">
                                                    <HiOutlineCloudUpload className="text-3xl text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold">
                                                        Click or drag file to upload
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Support PDF, JPG, JPEG, PNG (Max 10MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </Upload>
                                        {file && (
                                            <div className="mt-2 text-sm font-medium text-gray-600">
                                                Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                            </div>
                                        )}
                                    </FormItem>
                                    <Button
                                        block
                                        variant="solid"
                                        type="submit"
                                        loading={isUploading}
                                        icon={<HiOutlineCloudUpload />}
                                    >
                                        Upload Prescription
                                    </Button>
                                </FormContainer>
                            </form>
                        </TabContent>
                        <TabContent value="generate">
                            <form onSubmit={customForm.handleSubmit(handleCreateCustomPrescription)}>
                                <FormContainer>
                                    <FormItem
                                        label="Consultation ID"
                                        labelClass="font-medium mb-2"
                                        asterisk={true}
                                        invalid={!!customForm.formState.errors.consultationId}
                                        errorMessage={customForm.formState.errors.consultationId?.message}
                                    >
                                        <Controller
                                            name="consultationId"
                                            control={customForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter consultation ID"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <div className="mt-6 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5>Medicines</h5>
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                type="button"
                                                onClick={handleAddMedicine}
                                            >
                                                Add Medicine
                                            </Button>
                                        </div>

                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="bg-gray-50 p-4 rounded-lg mb-4"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h6>Medicine #{index + 1}</h6>
                                                    {fields.length > 1 && (
                                                        <Button
                                                            size="xs"
                                                            variant="plain"
                                                            type="button"
                                                            onClick={() => handleRemoveMedicine(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormItem
                                                        label="Medicine Name"
                                                        labelClass="font-medium mb-1"
                                                        asterisk={true}
                                                        invalid={!!customForm.formState.errors.medicines?.[index]?.name}
                                                        errorMessage={customForm.formState.errors.medicines?.[index]?.name?.message}
                                                    >
                                                        <Controller
                                                            name={`medicines.${index}.name`}
                                                            control={customForm.control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Enter medicine name"
                                                                />
                                                            )}
                                                        />
                                                    </FormItem>
                                                    <FormItem
                                                        label="Dosage"
                                                        labelClass="font-medium mb-1"
                                                        asterisk={true}
                                                        invalid={!!customForm.formState.errors.medicines?.[index]?.dosage}
                                                        errorMessage={customForm.formState.errors.medicines?.[index]?.dosage?.message}
                                                    >
                                                        <Controller
                                                            name={`medicines.${index}.dosage`}
                                                            control={customForm.control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="e.g. 500mg"
                                                                />
                                                            )}
                                                        />
                                                    </FormItem>
                                                    <FormItem
                                                        label="Frequency"
                                                        labelClass="font-medium mb-1"
                                                        asterisk={true}
                                                        invalid={!!customForm.formState.errors.medicines?.[index]?.frequency}
                                                        errorMessage={customForm.formState.errors.medicines?.[index]?.frequency?.message}
                                                    >
                                                        <Controller
                                                            name={`medicines.${index}.frequency`}
                                                            control={customForm.control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="e.g. 3 times a day"
                                                                />
                                                            )}
                                                        />
                                                    </FormItem>
                                                    <FormItem
                                                        label="Duration"
                                                        labelClass="font-medium mb-1"
                                                        asterisk={true}
                                                        invalid={!!customForm.formState.errors.medicines?.[index]?.duration}
                                                        errorMessage={customForm.formState.errors.medicines?.[index]?.duration?.message}
                                                    >
                                                        <Controller
                                                            name={`medicines.${index}.duration`}
                                                            control={customForm.control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="e.g. 7 days"
                                                                />
                                                            )}
                                                        />
                                                    </FormItem>
                                                </div>
                                                <FormItem
                                                    label="Notes"
                                                    labelClass="font-medium mb-1"
                                                    invalid={!!customForm.formState.errors.medicines?.[index]?.notes}
                                                    errorMessage={customForm.formState.errors.medicines?.[index]?.notes?.message}
                                                >
                                                    <Controller
                                                        name={`medicines.${index}.notes`}
                                                        control={customForm.control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="Additional notes (optional)"
                                                            />
                                                        )}
                                                    />
                                                </FormItem>
                                            </div>
                                        ))}

                                        {customForm.formState.errors.medicines && (
                                            <div className="text-red-500 text-sm mb-4">
                                                {Array.isArray(customForm.formState.errors.medicines)
                                                    ? 'Please fill in all required medicine fields'
                                                    : customForm.formState.errors.medicines.message}
                                            </div>
                                        )}
                                    </div>

                                    <FormItem
                                        label="General Instructions"
                                        labelClass="font-medium mb-2"
                                        invalid={!!customForm.formState.errors.instructions}
                                        errorMessage={customForm.formState.errors.instructions?.message}
                                    >
                                        <Controller
                                            name="instructions"
                                            control={customForm.control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    className="w-full rounded-md border border-gray-300 p-2"
                                                    rows={4}
                                                    placeholder="Enter general instructions for the patient"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <Button
                                        block
                                        variant="solid"
                                        type="submit"
                                        loading={isUploading}
                                        icon={<HiOutlineDocumentAdd />}
                                    >
                                        Generate Prescription
                                    </Button>
                                </FormContainer>
                            </form>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </Container>
    )
}

export default UploadPrescription
