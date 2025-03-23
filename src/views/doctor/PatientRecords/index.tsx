import { useState } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Tag,
    Tabs,
    Table,
    Input
} from '@/components/ui'
import Container from '@/components/shared/Container'

interface PatientRecord {
    id: number
    name: string
    age: number
    gender: string
    phone: string
    email: string
    address: string
    lastVisit: string
    conditions: string[]
    medications: string[]
    allergies: string[]
    notes: string
    upcomingAppointment?: string
}

const PatientRecords = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null)
    const [activeTab, setActiveTab] = useState('all')

    // Mock patient records data
    const patientRecords: PatientRecord[] = [
        {
            id: 1,
            name: 'John Smith',
            age: 45,
            gender: 'Male',
            phone: '(555) 123-4567',
            email: 'john.smith@example.com',
            address: '123 Main St, Anytown, CA 94321',
            lastVisit: '2023-03-15',
            conditions: ['Hypertension', 'Type 2 Diabetes'],
            medications: ['Lisinopril 10mg', 'Metformin 500mg'],
            allergies: ['Penicillin'],
            notes: 'Patient is managing blood pressure well with current medications.',
            upcomingAppointment: '2023-05-10'
        },
        {
            id: 2,
            name: 'Anna Johnson',
            age: 35,
            gender: 'Female',
            phone: '(555) 987-6543',
            email: 'anna.johnson@example.com',
            address: '456 Oak Ave, Somewhere, CA 94123',
            lastVisit: '2023-04-02',
            conditions: ['Migraine', 'Anxiety'],
            medications: ['Sumatriptan', 'Sertraline 50mg'],
            allergies: [],
            notes: 'Patient reports 2-3 migraines per month, triggers include stress and lack of sleep.',
            upcomingAppointment: '2023-05-05'
        },
        {
            id: 3,
            name: 'Michael Brown',
            age: 60,
            gender: 'Male',
            phone: '(555) 456-7890',
            email: 'michael.brown@example.com',
            address: '789 Pine Rd, Elsewhere, CA 94567',
            lastVisit: '2023-03-28',
            conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
            medications: ['Metformin 1000mg', 'Lisinopril 20mg', 'Atorvastatin 10mg'],
            allergies: ['Sulfa drugs'],
            notes: 'Last HbA1c: 7.2%. Will need foot examination and eye referral.',
        },
        {
            id: 4,
            name: 'Sarah Williams',
            age: 28,
            gender: 'Female',
            phone: '(555) 234-5678',
            email: 'sarah.williams@example.com',
            address: '321 Maple Dr, Nowhere, CA 94987',
            lastVisit: '2023-04-10',
            conditions: ['Seasonal allergies'],
            medications: ['Cetirizine 10mg'],
            allergies: ['Cats', 'Pollen'],
            notes: 'Patient managing seasonal allergies well with current medication.',
            upcomingAppointment: '2023-05-20'
        },
        {
            id: 5,
            name: 'Robert Davis',
            age: 52,
            gender: 'Male',
            phone: '(555) 567-8901',
            email: 'robert.davis@example.com',
            address: '123 Elm St, Somewhere, CA 94123',
            lastVisit: '2023-04-05',
            conditions: ['Lower Back Pain', 'Hypertension'],
            medications: ['Ibuprofen', 'Hydrochlorothiazide'],
            allergies: ['Ibuprofen'],
            notes: 'Patient experiencing lower back pain and hypertension. Prescribed Ibuprofen and Hydrochlorothiazide.',
        },
    ]

    const filteredPatients = patientRecords.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.conditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handlePatientSelect = (patient: PatientRecord) => {
        setSelectedPatient(patient)
        setActiveTab('overview')
    }

    const consultationHistory = [
        { id: 1, patientId: 1, date: '2023-03-15', type: 'Follow-up', reason: 'Blood pressure check', diagnosis: 'Controlled hypertension', notes: 'BP 130/85, continue current medications' },
        { id: 2, patientId: 1, date: '2023-02-01', type: 'Check-up', reason: 'Annual physical', diagnosis: 'Stable', notes: 'All vitals within normal range' },
        { id: 3, patientId: 1, date: '2022-11-12', type: 'Urgent', reason: 'Headache, dizziness', diagnosis: 'Hypertension flare-up', notes: 'BP 160/95, adjusted medication dosage' },
        { id: 4, patientId: 2, date: '2023-04-02', type: 'Consultation', reason: 'Recurring migraines', diagnosis: 'Chronic migraine', notes: 'Prescribed preventative treatment' },
        { id: 5, patientId: 3, date: '2023-03-28', type: 'Follow-up', reason: 'Diabetes monitoring', diagnosis: 'Type 2 Diabetes - controlled', notes: 'HbA1c: 7.2%, maintain current medications' },
    ]

    const patientMedicalDocuments = [
        { id: 1, patientId: 1, name: 'Blood Test Results', date: '2023-03-15', type: 'Lab Report', fileUrl: '#' },
        { id: 2, patientId: 1, name: 'EKG Report', date: '2023-03-15', type: 'Test Report', fileUrl: '#' },
        { id: 3, patientId: 1, name: 'Chest X-Ray', date: '2022-11-12', type: 'Imaging', fileUrl: '#' },
        { id: 4, patientId: 2, name: 'MRI Brain Scan', date: '2023-01-05', type: 'Imaging', fileUrl: '#' },
        { id: 5, patientId: 3, name: 'Blood Glucose Monitoring', date: '2023-03-28', type: 'Lab Report', fileUrl: '#' },
    ]

    const getPatientConsultations = (patientId: number) => {
        return consultationHistory.filter(consultation => consultation.patientId === patientId)
    }

    const getPatientDocuments = (patientId: number) => {
        return patientMedicalDocuments.filter(doc => doc.patientId === patientId)
    }

    const columns = [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            render: (_: string, record: PatientRecord) => (
                <div className="flex items-center">
                    <Avatar shape="circle" size={35} />
                    <div className="ml-2">
                        <div className="font-medium">{record.name}</div>
                        <div className="text-xs text-gray-500">
                            {record.age} yrs, {record.gender}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            title: 'Contact',
            dataIndex: 'contact',
            render: (_: string, record: PatientRecord) => (
                <div>
                    <div>{record.phone}</div>
                    <div className="text-xs text-gray-500">{record.email}</div>
                </div>
            ),
        },
        {
            key: 'conditions',
            title: 'Conditions',
            dataIndex: 'conditions',
            render: (_: string, record: PatientRecord) => (
                <div className="flex flex-wrap gap-1">
                    {record.conditions.map((condition, index) => (
                        <Tag key={index} className="bg-blue-100 text-blue-600">
                            {condition}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            key: 'lastVisit',
            title: 'Last Visit',
            dataIndex: 'lastVisit',
        },
        {
            key: 'actions',
            title: 'Actions',
            dataIndex: 'actions',
            render: (_: string, record: PatientRecord) => (
                <div className="flex space-x-2 justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handlePatientSelect(record)}
                    >
                        View Records
                    </Button>
                    <Button 
                        size="sm" 
                        variant="solid"
                        onClick={() => {
                            // Navigate to video consultation page with the patient details
                            window.location.href = `/doctor/video-consultation?patientId=${record.id}`
                        }}
                    >
                        Start Consultation
                    </Button>
                </div>
            ),
        },
    ]

    const renderPatientDetails = () => {
        if (!selectedPatient) return null

        return (
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            <Avatar shape="circle" size={60} />
                            <div className="ml-3">
                                <h4 className="mb-1">{selectedPatient.name}</h4>
                                <div className="text-gray-500">
                                    {selectedPatient.age} years old • {selectedPatient.gender}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={() => setSelectedPatient(null)} icon="arrow-left">
                                Back to List
                            </Button>
                            <Button variant="solid">
                                Edit Patient
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="md:col-span-1">
                            <div className="p-4">
                                <h5 className="font-semibold mb-3">Contact Information</h5>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div>{selectedPatient.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div>{selectedPatient.phone}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Address</div>
                                        <div>{selectedPatient.address}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Emergency Contact</div>
                                        <div>Jane Smith (Spouse)</div>
                                        <div>(555) 987-6543</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <div className="md:col-span-2 space-y-4">
                            <Card>
                                <div className="p-4">
                                    <h5 className="font-semibold mb-3">Medical Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Medical Conditions</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedPatient.conditions.map((condition, index) => (
                                                    <Tag key={index} className="bg-blue-100 text-blue-600">
                                                        {condition}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Allergies</div>
                                            <div className="mt-1">
                                                {selectedPatient.allergies.map((allergy, index) => (
                                                    <Tag key={index} className="bg-red-100 text-red-600">
                                                        {allergy}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Current Medications</div>
                                            <div className="space-y-1 mt-1">
                                                {selectedPatient.medications.map((medication, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <span className="text-blue-500 mr-2">•</span>
                                                        {medication}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Blood Type</div>
                                            <div className="mt-1">A+</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <div className="p-4">
                                    <h5 className="font-semibold mb-3">Consultation History</h5>
                                    <div className="space-y-3">
                                        {getPatientConsultations(selectedPatient.id).map(consultation => (
                                            <div key={consultation.id} className="border-b pb-3">
                                                <div className="flex justify-between">
                                                    <div className="font-medium">{consultation.date}</div>
                                                    <Tag className="bg-blue-100 text-blue-600">
                                                        {consultation.diagnosis}
                                                    </Tag>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {consultation.reason}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="font-semibold">Documents</h5>
                                        <Button size="sm">Upload New</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {getPatientDocuments(selectedPatient.id).map(document => (
                                            <div key={document.id} className="flex justify-between items-center p-2 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <div className="font-medium">{document.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {document.date} • {document.type}
                                                    </div>
                                                </div>
                                                <Button size="sm" icon="download">
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Container className="h-full">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h3>Patient Records</h3>
                    <Button variant="solid">
                        + Add New Patient
                    </Button>
                </div>
                
                {!selectedPatient ? (
                    <>
                        <div className="flex justify-between items-center">
                            <div className="flex">
                                <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                                    <Tabs.TabList>
                                        <Tabs.TabNav value="all">All Patients</Tabs.TabNav>
                                        <Tabs.TabNav value="recent">Recently Seen</Tabs.TabNav>
                                        <Tabs.TabNav value="upcoming">Upcoming Appointments</Tabs.TabNav>
                                    </Tabs.TabList>
                                </Tabs>
                            </div>
                            <div className="flex space-x-2">
                                <Input 
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    prefix={<span className="text-gray-400">🔍</span>}
                                />
                            </div>
                        </div>
                        
                        <Card>
                            <Table columns={columns} dataSource={filteredPatients} />
                        </Card>
                    </>
                ) : (
                    renderPatientDetails()
                )}
            </div>
        </Container>
    )
}

export default PatientRecords 