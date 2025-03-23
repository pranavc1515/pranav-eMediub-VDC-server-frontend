import { useState } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Tag, 
    Tabs,
    Input,
    Select,
    Table
} from '@/components/ui'
import Container from '@/components/shared/Container'

interface Prescription {
    id: number
    patientId: number
    patientName: string
    patientAge: number
    patientGender: string
    medications: {
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions: string
    }[]
    status: 'active' | 'completed' | 'cancelled'
    createdDate: string
    expiryDate: string
    notes?: string
}

const Prescriptions = () => {
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
    const [isCreatingNew, setIsCreatingNew] = useState(false)
    
    // Form states for new prescription
    const [selectedPatient, setSelectedPatient] = useState('')
    const [medications, setMedications] = useState([{ 
        name: '', 
        dosage: '', 
        frequency: '', 
        duration: '', 
        instructions: '' 
    }])
    const [prescriptionNotes, setPrescriptionNotes] = useState('')

    // Mock prescription data
    const prescriptions: Prescription[] = [
        {
            id: 1,
            patientId: 1,
            patientName: 'John Smith',
            patientAge: 45,
            patientGender: 'Male',
            medications: [
                {
                    name: 'Lisinopril',
                    dosage: '10mg',
                    frequency: 'Once daily',
                    duration: '30 days',
                    instructions: 'Take in the morning with food'
                },
                {
                    name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    duration: '30 days',
                    instructions: 'Take with meals'
                }
            ],
            status: 'active',
            createdDate: '2023-04-15',
            expiryDate: '2023-05-15',
            notes: 'Patient blood pressure was 130/85 during visit'
        },
        {
            id: 2,
            patientId: 2,
            patientName: 'Anna Johnson',
            patientAge: 35,
            patientGender: 'Female',
            medications: [
                {
                    name: 'Sumatriptan',
                    dosage: '50mg',
                    frequency: 'As needed',
                    duration: '30 days',
                    instructions: 'Take at onset of migraine symptoms, maximum 2 tablets per 24 hours'
                }
            ],
            status: 'active',
            createdDate: '2023-04-02',
            expiryDate: '2023-05-02'
        },
        {
            id: 3,
            patientId: 3,
            patientName: 'Michael Brown',
            patientAge: 60,
            patientGender: 'Male',
            medications: [
                {
                    name: 'Metformin',
                    dosage: '1000mg',
                    frequency: 'Twice daily',
                    duration: '90 days',
                    instructions: 'Take with meals'
                },
                {
                    name: 'Lisinopril',
                    dosage: '20mg',
                    frequency: 'Once daily',
                    duration: '90 days',
                    instructions: 'Take in the morning'
                },
                {
                    name: 'Atorvastatin',
                    dosage: '10mg',
                    frequency: 'Once daily',
                    duration: '90 days',
                    instructions: 'Take in the evening'
                }
            ],
            status: 'active',
            createdDate: '2023-03-28',
            expiryDate: '2023-06-28',
            notes: 'Follow up for lab work in 3 months'
        },
        {
            id: 4,
            patientId: 1,
            patientName: 'John Smith',
            patientAge: 45,
            patientGender: 'Male',
            medications: [
                {
                    name: 'Amoxicillin',
                    dosage: '500mg',
                    frequency: 'Three times daily',
                    duration: '10 days',
                    instructions: 'Take until completed, even if symptoms improve'
                }
            ],
            status: 'completed',
            createdDate: '2023-02-10',
            expiryDate: '2023-02-20',
            notes: 'For sinus infection'
        }
    ]

    const patients = [
        { value: '1', label: 'John Smith (45 yrs, Male)' },
        { value: '2', label: 'Anna Johnson (35 yrs, Female)' },
        { value: '3', label: 'Michael Brown (60 yrs, Male)' },
        { value: '4', label: 'Sarah Williams (28 yrs, Female)' }
    ]

    const medications_list = [
        { value: 'lisinopril', label: 'Lisinopril' },
        { value: 'metformin', label: 'Metformin' },
        { value: 'atorvastatin', label: 'Atorvastatin' },
        { value: 'amoxicillin', label: 'Amoxicillin' },
        { value: 'sumatriptan', label: 'Sumatriptan' },
        { value: 'sertraline', label: 'Sertraline' },
        { value: 'cetirizine', label: 'Cetirizine' },
        { value: 'ibuprofen', label: 'Ibuprofen' }
    ]

    const frequencies = [
        { value: 'once_daily', label: 'Once daily' },
        { value: 'twice_daily', label: 'Twice daily' },
        { value: 'three_times_daily', label: 'Three times daily' },
        { value: 'four_times_daily', label: 'Four times daily' },
        { value: 'as_needed', label: 'As needed (PRN)' },
        { value: 'weekly', label: 'Weekly' }
    ]

    const durations = [
        { value: '7_days', label: '7 days' },
        { value: '10_days', label: '10 days' },
        { value: '14_days', label: '14 days' },
        { value: '30_days', label: '30 days' },
        { value: '60_days', label: '60 days' },
        { value: '90_days', label: '90 days' }
    ]

    const filteredPrescriptions = prescriptions.filter(prescription => {
        if (activeTab !== 'all' && prescription.status !== activeTab) {
            return false
        }
        
        if (searchTerm === '') {
            return true
        }
        
        const searchLower = searchTerm.toLowerCase()
        return (
            prescription.patientName.toLowerCase().includes(searchLower) ||
            prescription.medications.some(med => med.name.toLowerCase().includes(searchLower))
        )
    })

    const handleViewPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription)
        setIsCreatingNew(false)
    }

    const handleAddMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ])
    }

    const handleRemoveMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index))
    }

    const handleMedicationChange = (index: number, field: string, value: string) => {
        const updatedMedications = [...medications]
        updatedMedications[index] = {
            ...updatedMedications[index],
            [field]: value
        }
        setMedications(updatedMedications)
    }

    const handleCreatePrescription = () => {
        // In a real app, this would submit the data to the backend
        console.log({
            patientId: selectedPatient,
            medications,
            notes: prescriptionNotes
        })
        
        // Reset form and return to main view
        setSelectedPatient('')
        setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
        setPrescriptionNotes('')
        setIsCreatingNew(false)
    }

    const columns = [
        {
            key: 'patient',
            title: 'Patient',
            dataIndex: 'patient',
            render: (_: any, record: Prescription) => (
                <div className="flex items-center">
                    <Avatar shape="circle" size={35} />
                    <div className="ml-2">
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-xs text-gray-500">
                            {record.patientAge} yrs, {record.patientGender}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'medications',
            title: 'Medications',
            dataIndex: 'medications',
            render: (_: any, record: Prescription) => (
                <div>
                    {record.medications.map((med, index) => (
                        <div key={index} className={index !== 0 ? 'mt-1' : ''}>
                            <span className="font-medium">{med.name}</span> {med.dosage}
                        </div>
                    ))}
                </div>
            )
        },
        {
            key: 'dates',
            title: 'Dates',
            dataIndex: 'dates',
            render: (_: any, record: Prescription) => (
                <div>
                    <div>Created: {record.createdDate}</div>
                    <div className="text-xs text-gray-500">
                        Expires: {record.expiryDate}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            dataIndex: 'status',
            render: (_: any, record: Prescription) => {
                let color = ''
                switch(record.status) {
                    case 'active':
                        color = 'bg-emerald-100 text-emerald-600'
                        break
                    case 'completed':
                        color = 'bg-gray-100 text-gray-600'
                        break
                    case 'cancelled':
                        color = 'bg-red-100 text-red-600'
                        break
                }
                
                return (
                    <Tag className={color}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Tag>
                )
            }
        },
        {
            key: 'actions',
            title: 'Actions',
            dataIndex: 'actions',
            render: (_: any, record: Prescription) => (
                <div className="flex space-x-2 justify-end">
                    <Button 
                        size="sm"
                        onClick={() => handleViewPrescription(record)}
                    >
                        View
                    </Button>
                    <Button 
                        size="sm" 
                        variant="solid"
                    >
                        Print
                    </Button>
                </div>
            )
        }
    ]

    const renderPrescriptionContent = () => {
        if (isCreatingNew) {
            return (
                <Card>
                    <div className="p-4">
                        <h4 className="mb-4">Create New Prescription</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="font-medium block mb-2">Patient</label>
                                <Select
                                    options={patients}
                                    value={selectedPatient}
                                    onChange={(val: string) => setSelectedPatient(val)}
                                    placeholder="Select a patient"
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-medium">Medications</label>
                                    <Button 
                                        size="sm" 
                                        onClick={handleAddMedication}
                                        icon="plus"
                                    >
                                        Add Medication
                                    </Button>
                                </div>
                                
                                {medications.map((medication, index) => (
                                    <div key={index} className="mb-4 p-4 border rounded-lg">
                                        <div className="flex justify-between mb-3">
                                            <h5>Medication #{index + 1}</h5>
                                            {index > 0 && (
                                                <Button 
                                                    size="xs" 
                                                    variant="plain"
                                                    onClick={() => handleRemoveMedication(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Medication Name</label>
                                                <Select
                                                    options={medications_list}
                                                    value={medication.name}
                                                    onChange={(val: string) => handleMedicationChange(index, 'name', val)}
                                                    placeholder="Select medication"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Dosage</label>
                                                <Input 
                                                    value={medication.dosage}
                                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                    placeholder="e.g. 10mg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Frequency</label>
                                                <Select
                                                    options={frequencies}
                                                    value={medication.frequency}
                                                    onChange={(val: string) => handleMedicationChange(index, 'frequency', val)}
                                                    placeholder="Select frequency"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Duration</label>
                                                <Select
                                                    options={durations}
                                                    value={medication.duration}
                                                    onChange={(val: string) => handleMedicationChange(index, 'duration', val)}
                                                    placeholder="Select duration"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm text-gray-500 block mb-1">Special Instructions</label>
                                                <Input 
                                                    value={medication.instructions}
                                                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                                    placeholder="e.g. Take with food"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <label className="font-medium block mb-2">Notes</label>
                                <Input 
                                    textArea
                                    value={prescriptionNotes}
                                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                                    placeholder="Additional notes for the prescription..."
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <Button onClick={() => setIsCreatingNew(false)}>
                                    Cancel
                                </Button>
                                <Button variant="solid" onClick={handleCreatePrescription}>
                                    Create Prescription
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )
        }
        
        if (selectedPrescription) {
            return (
                <Card>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="mb-1">Prescription Details</h4>
                                <p className="text-gray-500">Created on {selectedPrescription.createdDate}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button size="sm" icon="arrow-left" onClick={() => setSelectedPrescription(null)}>
                                    Back
                                </Button>
                                <Button size="sm" variant="solid" icon="printer">
                                    Print
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <Card>
                                    <div className="p-4">
                                        <h5 className="font-semibold mb-3">Patient Information</h5>
                                        <div className="flex items-center mb-4">
                                            <Avatar shape="circle" size={50} />
                                            <div className="ml-3">
                                                <div className="font-medium">{selectedPrescription.patientName}</div>
                                                <div className="text-sm text-gray-500">
                                                    {selectedPrescription.patientAge} yrs, {selectedPrescription.patientGender}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between border-t pt-3">
                                            <div className="text-sm text-gray-500">Status</div>
                                            <Tag className={
                                                selectedPrescription.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                                selectedPrescription.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                                'bg-red-100 text-red-600'
                                            }>
                                                {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                                            </Tag>
                                        </div>
                                        <div className="flex justify-between border-t pt-3 mt-3">
                                            <div className="text-sm text-gray-500">Valid Until</div>
                                            <div>{selectedPrescription.expiryDate}</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="md:col-span-2">
                                <Card>
                                    <div className="p-4">
                                        <h5 className="font-semibold mb-3">Prescribed Medications</h5>
                                        <div className="space-y-4">
                                            {selectedPrescription.medications.map((medication, index) => (
                                                <div key={index} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between">
                                                        <div className="font-medium">{medication.name} {medication.dosage}</div>
                                                        <Tag className="bg-blue-100 text-blue-600">
                                                            {medication.frequency}
                                                        </Tag>
                                                    </div>
                                                    <div className="mt-2 text-sm">
                                                        <span className="text-gray-500">Duration:</span> {medication.duration}
                                                    </div>
                                                    <div className="mt-1 text-sm">
                                                        <span className="text-gray-500">Instructions:</span> {medication.instructions}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {selectedPrescription.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <h6 className="font-medium mb-1">Notes</h6>
                                                <p className="text-sm">{selectedPrescription.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                                
                                <div className="flex justify-end mt-4 space-x-2">
                                    {selectedPrescription.status === 'active' && (
                                        <>
                                            <Button>Renew Prescription</Button>
                                            <Button variant="plain" color="red">
                                                Cancel Prescription
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )
        }
        
        return (
            <>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex">
                        <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                            <Tabs.TabList>
                                <Tabs.TabNav value="all">All</Tabs.TabNav>
                                <Tabs.TabNav value="active">Active</Tabs.TabNav>
                                <Tabs.TabNav value="completed">Completed</Tabs.TabNav>
                                <Tabs.TabNav value="cancelled">Cancelled</Tabs.TabNav>
                            </Tabs.TabList>
                        </Tabs>
                    </div>
                    <div className="flex space-x-2">
                        <Input 
                            placeholder="Search prescriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<span className="text-gray-400">🔍</span>}
                        />
                        <Button 
                            variant="solid" 
                            onClick={() => setIsCreatingNew(true)}
                        >
                            + New Prescription
                        </Button>
                    </div>
                </div>
                
                <Card>
                    <Table dataSource={filteredPrescriptions} columns={columns} />
                </Card>
            </>
        )
    }

    return (
        <Container className="h-full">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h3>Prescriptions</h3>
                </div>
                
                {renderPrescriptionContent()}
            </div>
        </Container>
    )
}

export default Prescriptions 