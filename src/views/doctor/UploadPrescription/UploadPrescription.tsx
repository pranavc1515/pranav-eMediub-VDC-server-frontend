import { useState } from 'react'
import {
    Card,
    Button,
    Input,
    Select,
    FormContainer,
    FormItem,
    Upload,
    Notification,
    toast,
    Tabs,
} from '@/components/ui'
import Container from '@/components/shared/Container'
import type { SingleValue } from 'react-select'
import { HiOutlineDocumentAdd, HiOutlineCloudUpload } from 'react-icons/hi'
import axios from 'axios'

interface Medicine {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes: string
}

const { TabNav, TabList, TabContent } = Tabs

const UploadPrescription = () => {
    const [activeTab, setActiveTab] = useState('upload')
    const [consultationId, setConsultationId] = useState('')
    const [doctorId, setDoctorId] = useState('')
    const [userId, setUserId] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // States for custom prescription
    const [medicines, setMedicines] = useState<Medicine[]>([
        {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: '',
        },
    ])
    const [instructions, setInstructions] = useState('')

    // Handle file upload
    const onFileUpload = (files: FileList | null) => {
        if (files && files[0]) {
            setFile(files[0])
        }
    }

    const handleUploadPrescription = async () => {
        if (!consultationId) {
            toast.push(
                <Notification
                    type="danger"
                    title="Error"
                    content="Consultation ID is required"
                />,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        if (!file) {
            toast.push(
                <Notification
                    type="danger"
                    title="Error"
                    content="Please select a file to upload"
                />,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        try {
            setIsUploading(true)

            const formData = new FormData()
            formData.append('file', file)

            let url = `/api/prescriptions/upload/${consultationId}`

            // Add query parameters if provided
            if (doctorId) {
                url += `?doctorId=${doctorId}`

                if (userId) {
                    url += `&userId=${userId}`
                }
            } else if (userId) {
                url += `?userId=${userId}`
            }

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.status === 201) {
                toast.push(
                    <Notification
                        type="success"
                        title="Success"
                        content="Prescription uploaded successfully"
                    />,
                    {
                        placement: 'top-center',
                    },
                )

                // Reset form
                setConsultationId('')
                setDoctorId('')
                setUserId('')
                setFile(null)
            }
        } catch (error) {
            console.error('Error uploading prescription:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Error"
                    content="Failed to upload prescription"
                />,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddMedicine = () => {
        setMedicines([
            ...medicines,
            { name: '', dosage: '', frequency: '', duration: '', notes: '' },
        ])
    }

    const handleRemoveMedicine = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index))
        }
    }

    const handleMedicineChange = (
        index: number,
        field: keyof Medicine,
        value: string,
    ) => {
        const updatedMedicines = [...medicines]
        updatedMedicines[index] = {
            ...updatedMedicines[index],
            [field]: value,
        }
        setMedicines(updatedMedicines)
    }

    const handleCreateCustomPrescription = async () => {
        if (!consultationId) {
            toast.push(
                <Notification
                    type="danger"
                    title="Error"
                    content="Consultation ID is required"
                />,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        try {
            setIsUploading(true)

            const payload = {
                medicines: medicines.map((medicine) => ({
                    name: medicine.name,
                    dosage: medicine.dosage,
                    frequency: medicine.frequency,
                    duration: medicine.duration,
                    notes: medicine.notes,
                })),
                instructions,
            }

            let url = `/api/prescriptions/custom/${consultationId}`

            // Add query parameters if provided
            if (doctorId) {
                url += `?doctorId=${doctorId}`

                if (userId) {
                    url += `&userId=${userId}`
                }
            } else if (userId) {
                url += `?userId=${userId}`
            }

            const response = await axios.post(url, payload)

            if (response.status === 201) {
                toast.push(
                    <Notification
                        type="success"
                        title="Success"
                        content="Custom prescription created successfully"
                    />,
                    {
                        placement: 'top-center',
                    },
                )

                // Reset form
                setConsultationId('')
                setDoctorId('')
                setUserId('')
                setMedicines([
                    {
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        notes: '',
                    },
                ])
                setInstructions('')
            }
        } catch (error) {
            console.error('Error creating custom prescription:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Error"
                    content="Failed to create custom prescription"
                />,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setIsUploading(false)
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
                            <FormContainer>
                                <FormItem
                                    label="Consultation ID"
                                    labelClass="font-medium mb-2"
                                    required
                                >
                                    <Input
                                        value={consultationId}
                                        onChange={(e) =>
                                            setConsultationId(e.target.value)
                                        }
                                        placeholder="Enter consultation ID"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Doctor ID (optional if authenticated)"
                                    labelClass="font-medium mb-2"
                                >
                                    <Input
                                        value={doctorId}
                                        onChange={(e) =>
                                            setDoctorId(e.target.value)
                                        }
                                        placeholder="Enter doctor ID"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Patient ID (optional)"
                                    labelClass="font-medium mb-2"
                                >
                                    <Input
                                        value={userId}
                                        onChange={(e) =>
                                            setUserId(e.target.value)
                                        }
                                        placeholder="Enter patient ID"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Prescription File"
                                    labelClass="font-medium mb-2"
                                    required
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
                                                    Support PDF, JPG, JPEG, PNG
                                                </p>
                                            </div>
                                        </div>
                                    </Upload>
                                    {file && (
                                        <div className="mt-2 text-sm font-medium text-gray-600">
                                            Selected file: {file.name}
                                        </div>
                                    )}
                                </FormItem>
                                <Button
                                    block
                                    variant="solid"
                                    onClick={handleUploadPrescription}
                                    loading={isUploading}
                                    icon={<HiOutlineCloudUpload />}
                                >
                                    Upload Prescription
                                </Button>
                            </FormContainer>
                        </TabContent>
                        <TabContent value="generate">
                            <FormContainer>
                                <FormItem
                                    label="Consultation ID"
                                    labelClass="font-medium mb-2"
                                    required
                                >
                                    <Input
                                        value={consultationId}
                                        onChange={(e) =>
                                            setConsultationId(e.target.value)
                                        }
                                        placeholder="Enter consultation ID"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Doctor ID (optional if authenticated)"
                                    labelClass="font-medium mb-2"
                                >
                                    <Input
                                        value={doctorId}
                                        onChange={(e) =>
                                            setDoctorId(e.target.value)
                                        }
                                        placeholder="Enter doctor ID"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Patient ID (optional)"
                                    labelClass="font-medium mb-2"
                                >
                                    <Input
                                        value={userId}
                                        onChange={(e) =>
                                            setUserId(e.target.value)
                                        }
                                        placeholder="Enter patient ID"
                                    />
                                </FormItem>

                                <div className="mt-6 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5>Medicines</h5>
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            onClick={handleAddMedicine}
                                        >
                                            Add Medicine
                                        </Button>
                                    </div>

                                    {medicines.map((medicine, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 p-4 rounded-lg mb-4"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h6>Medicine #{index + 1}</h6>
                                                {medicines.length > 1 && (
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        onClick={() =>
                                                            handleRemoveMedicine(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormItem
                                                    label="Medicine Name"
                                                    labelClass="font-medium mb-1"
                                                >
                                                    <Input
                                                        value={medicine.name}
                                                        onChange={(e) =>
                                                            handleMedicineChange(
                                                                index,
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter medicine name"
                                                    />
                                                </FormItem>
                                                <FormItem
                                                    label="Dosage"
                                                    labelClass="font-medium mb-1"
                                                >
                                                    <Input
                                                        value={medicine.dosage}
                                                        onChange={(e) =>
                                                            handleMedicineChange(
                                                                index,
                                                                'dosage',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. 500mg"
                                                    />
                                                </FormItem>
                                                <FormItem
                                                    label="Frequency"
                                                    labelClass="font-medium mb-1"
                                                >
                                                    <Input
                                                        value={
                                                            medicine.frequency
                                                        }
                                                        onChange={(e) =>
                                                            handleMedicineChange(
                                                                index,
                                                                'frequency',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. 3 times a day"
                                                    />
                                                </FormItem>
                                                <FormItem
                                                    label="Duration"
                                                    labelClass="font-medium mb-1"
                                                >
                                                    <Input
                                                        value={
                                                            medicine.duration
                                                        }
                                                        onChange={(e) =>
                                                            handleMedicineChange(
                                                                index,
                                                                'duration',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. 5 days"
                                                    />
                                                </FormItem>
                                                <FormItem
                                                    label="Notes"
                                                    labelClass="font-medium mb-1"
                                                    className="md:col-span-2"
                                                >
                                                    <Input
                                                        value={medicine.notes}
                                                        onChange={(e) =>
                                                            handleMedicineChange(
                                                                index,
                                                                'notes',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. Take after meals"
                                                    />
                                                </FormItem>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <FormItem
                                    label="Additional Instructions"
                                    labelClass="font-medium mb-2"
                                >
                                    <Input
                                        textArea
                                        value={instructions}
                                        onChange={(e) =>
                                            setInstructions(e.target.value)
                                        }
                                        placeholder="Enter additional instructions for the patient"
                                    />
                                </FormItem>

                                <Button
                                    block
                                    variant="solid"
                                    onClick={handleCreateCustomPrescription}
                                    loading={isUploading}
                                    icon={<HiOutlineDocumentAdd />}
                                >
                                    Generate Prescription
                                </Button>
                            </FormContainer>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </Container>
    )
}

export default UploadPrescription
