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
import { 
    prescriptions, 
    patientRecords,
    indianMedications,
    medicationFrequencies,
    medicationDurations,
    type Prescription
} from '@/mock/data'
import type { SingleValue } from 'react-select'

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

    const patients = patientRecords.map(patient => ({
        value: patient.id.toString(),
        label: `${patient.name} (${patient.age} yrs, ${patient.gender})`
    }))

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

    const handleSelectChange = (value: SingleValue<string>, setter: (value: string) => void) => {
        if (value) {
            setter(value)
        }
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

    const renderPrescriptionContent = () => {
        if (isCreatingNew) {
            return (
                <Card>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h4>Create New Prescription</h4>
                            <Button 
                                size="sm" 
                                onClick={() => setIsCreatingNew(false)}
                                icon="arrow-left"
                            >
                                Back to List
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Patient</label>
                                <Select
                                    options={patients as any}
                                    value={selectedPatient}
                                    onChange={(val) => handleSelectChange(val as SingleValue<string>, (value) => setSelectedPatient(value))}
                                    placeholder="Select patient"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h5>Medications</h5>
                                <Button 
                                    size="sm" 
                                    onClick={handleAddMedication}
                                >
                                    Add Medication
                                </Button>
                            </div>
                            
                            {medications.map((medication, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="flex justify-between">
                                        <h6 className="mb-2">Medication #{index + 1}</h6>
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
                                            <label className="form-label">Medication Name</label>
                                            <Select
                                                options={indianMedications as any}
                                                value={medication.name}
                                                onChange={(val) => handleSelectChange(val as SingleValue<string>, (value) => handleMedicationChange(index, 'name', value))}
                                                placeholder="Select medication"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Dosage</label>
                                            <Input 
                                                value={medication.dosage}
                                                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                placeholder="e.g. 10mg"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Frequency</label>
                                            <Select
                                                options={medicationFrequencies as any}
                                                value={medication.frequency}
                                                onChange={(val) => handleSelectChange(val as SingleValue<string>, (value) => handleMedicationChange(index, 'frequency', value))}
                                                placeholder="Select frequency"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Duration</label>
                                            <Select
                                                options={medicationDurations as any}
                                                value={medication.duration}
                                                onChange={(val) => handleSelectChange(val as SingleValue<string>, (value) => handleMedicationChange(index, 'duration', value))}
                                                placeholder="Select duration"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="form-label">Special Instructions</label>
                                            <Input 
                                                value={medication.instructions}
                                                onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                                placeholder="e.g. Take with food"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-4">
                                <label className="form-label">Notes</label>
                                <Input
                                    value={prescriptionNotes}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrescriptionNotes(e.target.value)}
                                    placeholder="Additional notes for the prescription"
                                />
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <Button 
                                    variant="solid" 
                                    onClick={handleCreatePrescription}
                                >
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
                                <h4>Prescription Details</h4>
                                <p className="text-gray-500">
                                    Created on {selectedPrescription.createdDate} • 
                                    {selectedPrescription.status === 'active' && 
                                        <span className="text-green-600"> Active</span>
                                    }
                                    {selectedPrescription.status === 'completed' && 
                                        <span className="text-gray-600"> Completed</span>
                                    }
                                    {selectedPrescription.status === 'cancelled' && 
                                        <span className="text-red-600"> Cancelled</span>
                                    }
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <Button 
                                    onClick={() => setSelectedPrescription(null)} 
                                    icon="arrow-left"
                                >
                                    Back to List
                                </Button>
                                <Button 
                                    onClick={() => window.print()}
                                    icon="printer"
                                >
                                    Print
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="md:col-span-1">
                                <div className="p-4">
                                    <h5 className="font-semibold mb-3">Patient Information</h5>
                                    <div className="flex items-center mb-3">
                                        <Avatar shape="circle" size={50} />
                                        <div className="ml-3">
                                            <div className="font-medium">{selectedPrescription.patientName}</div>
                                            <div className="text-gray-500">
                                                {selectedPrescription.patientAge} years old • {selectedPrescription.patientGender}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card className="md:col-span-2">
                                <div className="p-4">
                                    <h5 className="font-semibold mb-3">Prescription Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-gray-500">Prescribing Doctor</div>
                                            <div>{selectedPrescription.doctorName}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Prescription ID</div>
                                            <div>#{selectedPrescription.id.toString().padStart(6, '0')}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Issue Date</div>
                                            <div>{selectedPrescription.createdDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Valid Until</div>
                                            <div>{selectedPrescription.expiryDate}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        
                        <Card>
                            <div className="p-4">
                                <h5 className="font-semibold mb-4">Prescribed Medications</h5>
                                
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">Medication</th>
                                            <th className="px-4 py-2 text-left">Dosage</th>
                                            <th className="px-4 py-2 text-left">Frequency</th>
                                            <th className="px-4 py-2 text-left">Duration</th>
                                            <th className="px-4 py-2 text-left">Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPrescription.medications.map((medication, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="px-4 py-3 font-medium">{medication.name}</td>
                                                <td className="px-4 py-3">{medication.dosage}</td>
                                                <td className="px-4 py-3">{medication.frequency}</td>
                                                <td className="px-4 py-3">{medication.duration}</td>
                                                <td className="px-4 py-3">{medication.instructions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {selectedPrescription.notes && (
                                    <div className="mt-4">
                                        <h6 className="font-medium mb-2">Notes</h6>
                                        <p className="text-gray-600">{selectedPrescription.notes}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </Card>
            )
        }
        
        return (
            <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                        <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                            <Tabs.TabList>
                                <Tabs.TabNav value="all">All Prescriptions</Tabs.TabNav>
                                <Tabs.TabNav value="active">Active</Tabs.TabNav>
                                <Tabs.TabNav value="completed">Completed</Tabs.TabNav>
                                <Tabs.TabNav value="cancelled">Cancelled</Tabs.TabNav>
                            </Tabs.TabList>
                        </Tabs>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-4 items-center">
                        <Input 
                            placeholder="Search prescriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<span>🔍</span>}
                            className="w-60"
                        />
                        <Button 
                            variant="solid"
                            onClick={() => setIsCreatingNew(true)}
                        >
                            Create New
                        </Button>
                    </div>
                </div>
                
                <Card>
                    <div className="p-4">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left">Patient</th>
                                    <th className="px-4 py-2 text-left">Medications</th>
                                    <th className="px-4 py-2 text-left">Created</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPrescriptions.map((prescription) => (
                                    <tr key={prescription.id} className="border-b border-gray-200 last:border-0">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <Avatar shape="circle" size={35} />
                                                <div className="ml-2">
                                                    <div className="font-medium">{prescription.patientName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {prescription.patientAge} yrs, {prescription.patientGender}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="max-w-xs">
                                                {prescription.medications.map((med, index) => (
                                                    <Tag key={index} className="bg-blue-100 text-blue-600 mr-1 mb-1">
                                                        {med.name}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>{prescription.createdDate}</div>
                                            <div className="text-xs text-gray-500">
                                                Expires: {prescription.expiryDate}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {prescription.status === 'active' && 
                                                <Tag className="bg-green-100 text-green-600">Active</Tag>
                                            }
                                            {prescription.status === 'completed' && 
                                                <Tag className="bg-gray-100 text-gray-600">Completed</Tag>
                                            }
                                            {prescription.status === 'cancelled' && 
                                                <Tag className="bg-red-100 text-red-600">Cancelled</Tag>
                                            }
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-2">
                                                <Button 
                                                    size="sm"
                                                    onClick={() => handleViewPrescription(prescription)}
                                                >
                                                    View
                                                </Button>
                                                {prescription.status === 'active' && (
                                                    <Button size="sm" variant="plain">
                                                        Renew
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredPrescriptions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No prescriptions found.
                            </div>
                        )}
                    </div>
                </Card>
            </>
        )
    }

    return (
        <Container>
            <div className="mb-4">
                <h3>Prescriptions</h3>
                <p className="text-gray-500">Manage prescriptions for your patients</p>
            </div>
            
            {renderPrescriptionContent()}
        </Container>
    )
}

export default Prescriptions 