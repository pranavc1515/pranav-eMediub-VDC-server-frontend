import { useState } from 'react'
import {
    Drawer,
    Button,
    Input,
    FormContainer,
    FormItem,
    Upload,
    Notification,
    toast,
} from '@/components/ui'
import { HiOutlineDocumentAdd, HiOutlineCloudUpload } from 'react-icons/hi'
import { FaNotesMedical } from 'react-icons/fa'
import usePrescription from '@/hooks/usePrescription'
import type { Medicine } from '@/services/PrescriptionService'

interface PrescriptionDrawerProps {
    isOpen: boolean
    onClose: () => void
    consultationId: string | null
    doctorId: number
    userId: number | null
}

const PrescriptionDrawer = ({
    isOpen,
    onClose,
    consultationId,
    doctorId,
    userId,
}: PrescriptionDrawerProps) => {
    const [activeTab, setActiveTab] = useState('upload')
    const [file, setFile] = useState<File | null>(null)
    console.log('ids:', consultationId, doctorId, userId)

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

    const {
        loading: isUploading,
        uploadPrescription,
        createCustomPrescription,
    } = usePrescription({
        doctorId,
        userId: userId || undefined,
    })

    // Handle file upload
    const onFileUpload = (_: File[], fileList: File[]) => {
        if (fileList.length > 0) {
            setFile(fileList[0])
        }
    }

    const handleUploadPrescription = async () => {
        if (!consultationId) {
            toast.push(
                <Notification type="danger">
                    <span>Consultation ID is required</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        if (!file) {
            toast.push(
                <Notification type="danger">
                    <span>Please select a file to upload</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        const result = await uploadPrescription({
            consultationId,
            file,
        })

        if (result) {
            toast.push(
                <Notification type="success">
                    <span>Prescription uploaded successfully</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )

            // Reset form
            setFile(null)
            onClose()
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
                <Notification type="danger">
                    <span>Consultation ID is required</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        const result = await createCustomPrescription({
            consultationId,
            medicines,
            instructions,
        })

        if (result) {
            toast.push(
                <Notification type="success">
                    <span>Custom prescription created successfully</span>
                </Notification>,
                {
                    placement: 'top-center',
                },
            )

            // Reset form
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
            onClose()
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            closable
            className="z-[40]"
            title={
                <div className="flex items-center gap-2">
                    <FaNotesMedical className="text-lg" />
                    <span>Create Prescription</span>
                </div>
            }
            width={540}
            showBackdrop={true}
            shouldCloseOnOverlayClick={true}
            onRequestClose={onClose}
        >
            <div className="flex flex-col h-full">
                <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
                    <Button
                        variant={activeTab === 'upload' ? 'solid' : 'plain'}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Prescription
                    </Button>
                    <Button
                        variant={activeTab === 'generate' ? 'solid' : 'plain'}
                        onClick={() => setActiveTab('generate')}
                    >
                        Generate Prescription
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'upload' ? (
                        <FormContainer>
                            <FormItem
                                label="Prescription File"
                                labelClass="font-medium mb-2"
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
                    ) : (
                        <FormContainer>
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
                                                    value={medicine.frequency}
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
                                                    value={medicine.duration}
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
                    )}
                </div>
            </div>
        </Drawer>
    )
}

export default PrescriptionDrawer
