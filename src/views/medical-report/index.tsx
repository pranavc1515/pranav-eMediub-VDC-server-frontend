import { useState } from 'react'
import { 
    Card, 
    Input,
    Button,
    Select,
    Form,
    FormItem,
    Alert,
    Avatar,
    Notification,
    toast,
    Tabs
} from '@/components/ui'
import Container from '@/components/shared/Container'
import RichTextEditor from '@/components/shared/RichTextEditor'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import type { JSONContent } from '@tiptap/react'

const patientList = [
    {
        id: 1,
        name: 'John Smith',
        age: 45,
        gender: 'Male',
        avatar: '/img/avatars/patient-1.jpg',
        lastVisit: '2023-10-15',
        medicalHistory: 'Hypertension, Type 2 Diabetes',
        allergies: 'Penicillin'
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        age: 32,
        gender: 'Female',
        avatar: '/img/avatars/patient-2.jpg',
        lastVisit: '2023-11-05',
        medicalHistory: 'Asthma',
        allergies: 'None'
    },
    {
        id: 3,
        name: 'Robert Lee',
        age: 58,
        gender: 'Male',
        avatar: '/img/avatars/patient-3.jpg',
        lastVisit: '2023-09-28',
        medicalHistory: 'Coronary Artery Disease, GERD',
        allergies: 'Sulfa Drugs'
    },
    {
        id: 4,
        name: 'Emily Chen',
        age: 27,
        gender: 'Female',
        avatar: '/img/avatars/patient-4.jpg',
        lastVisit: '2023-12-01',
        medicalHistory: 'Migraine',
        allergies: 'Latex'
    },
    {
        id: 5,
        name: 'Michael Wilson',
        age: 41,
        gender: 'Male',
        avatar: '/img/avatars/patient-5.jpg',
        lastVisit: '2023-11-20',
        medicalHistory: 'Anxiety Disorder',
        allergies: 'None'
    },
]

const reportTypes = [
    { value: 'general', label: 'General Consultation' },
    { value: 'followup', label: 'Follow-up Checkup' },
    { value: 'specialist', label: 'Specialist Consultation' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'chronic', label: 'Chronic Disease Management' },
]

interface PatientOption {
    value: string;
    label: string;
}

const MedicalReport = () => {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
    const [reportContent, setReportContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState('newReport')
    
    const onFormSubmit = (values: any) => {
        setSubmitting(true)
        
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false)
            toast.push(
                <Notification title="Report Submitted" type="success">
                    Medical report has been assigned to the patient
                </Notification>
            )
            
            // Reset form
            setReportContent('')
            setSelectedPatient(null)
        }, 1500)
    }
    
    const patientOptions: PatientOption[] = patientList.map(patient => ({
        value: patient.id.toString(),
        label: `${patient.name} (${patient.age}, ${patient.gender})`
    }))

    const handleRichTextChange = (content: { text: string; html: string; json: JSONContent }) => {
        setReportContent(content.html)
    }

    const getPatientById = (id: string | null) => {
        if (!id) return null
        return patientList.find(p => p.id.toString() === id)
    }

    const handlePatientChange = (option: any) => {
        if (option) {
            setSelectedPatient(option.value)
        } else {
            setSelectedPatient(null)
        }
    }

    return (
        <Container>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="mb-2">Medical Report Management</h3>
                    <p className="text-gray-500">Create and manage medical reports for your patients</p>
                </div>
                <DoubleSidedImage 
                    src="/img/others/medical-report.png"
                    darkModeSrc="/img/others/medical-report-dark.png"
                    alt="Medical Report"
                    className="h-24 object-contain hidden md:block"
                />
            </div>

            <Tabs value={activeTab} onChange={(val) => setActiveTab(val as string)}>
                <Tabs.TabList>
                    <Tabs.TabNav value="newReport">
                        <span className="flex items-center">
                            <span className="icon-file-plus text-lg mr-2"></span>
                            New Report
                        </span>
                    </Tabs.TabNav>
                    <Tabs.TabNav value="history">
                        <span className="flex items-center">
                            <span className="icon-history text-lg mr-2"></span>
                            Report History
                        </span>
                    </Tabs.TabNav>
                    <Tabs.TabNav value="templates">
                        <span className="flex items-center">
                            <span className="icon-template text-lg mr-2"></span>
                            Templates
                        </span>
                    </Tabs.TabNav>
                </Tabs.TabList>
                <Tabs.TabContent value="newReport">
                    <Card className="mt-6">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h5 className="flex items-center">
                                <span className="icon-stethoscope text-xl text-primary-500 mr-2"></span>
                                Create New Medical Report
                            </h5>
                        </div>
                        
                        <Form onSubmit={onFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <FormItem
                                        label="Select Patient"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-user text-lg text-primary-500 mr-2"></span>
                                                <span>Select Patient</span>
                                            </div>
                                        }
                                        invalid={!selectedPatient}
                                        errorMessage={!selectedPatient ? "Please select a patient" : ""}
                                    >
                                        <Select<PatientOption>
                                            placeholder="Select a patient" 
                                            options={patientOptions}
                                            onChange={handlePatientChange}
                                        />
                                    </FormItem>
                                </div>
                                <div>
                                    <FormItem
                                        label="Report Type"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-file-text text-lg text-primary-500 mr-2"></span>
                                                <span>Report Type</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Select<{ value: string; label: string }>
                                            placeholder="Select report type" 
                                            options={reportTypes}
                                        />
                                    </FormItem>
                                </div>
                            </div>
                            
                            {selectedPatient && (
                                <div className="mb-6">
                                    <Alert type="info" showIcon>
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar 
                                                    src={getPatientById(selectedPatient)?.avatar} 
                                                    size={60}
                                                />
                                                <div>
                                                    <h5 className="font-semibold mb-1">
                                                        {getPatientById(selectedPatient)?.name}
                                                    </h5>
                                                    <p className="text-sm mb-1">
                                                        <span className="font-medium">Age:</span> {getPatientById(selectedPatient)?.age} | 
                                                        <span className="font-medium ml-2">Gender:</span> {getPatientById(selectedPatient)?.gender}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">Last visit:</span> {getPatientById(selectedPatient)?.lastVisit}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="md:ml-6 mt-2 md:mt-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">Medical History:</span> {getPatientById(selectedPatient)?.medicalHistory}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Allergies:</span> {getPatientById(selectedPatient)?.allergies}
                                                </p>
                                            </div>
                                        </div>
                                    </Alert>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <FormItem
                                        label="Date of Consultation"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-calendar text-lg text-primary-500 mr-2"></span>
                                                <span>Date of Consultation</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input type="date" />
                                    </FormItem>
                                </div>
                                <div>
                                    <FormItem
                                        label="Follow-up Required"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-check-circle text-lg text-primary-500 mr-2"></span>
                                                <span>Follow-up Required</span>
                                            </div>
                                        }
                                    >
                                        <Select<{ value: string; label: string }>
                                            placeholder="Is follow-up required?" 
                                            options={[
                                                { value: 'yes', label: 'Yes' },
                                                { value: 'no', label: 'No' }
                                            ]}
                                        />
                                    </FormItem>
                                </div>
                            </div>
                            
                            <Card className="bg-gray-50 mb-6">
                                <div className="mb-4 border-b border-gray-200 pb-2">
                                    <h6 className="flex items-center text-primary-500">
                                        <span className="icon-clipboard-list text-lg mr-2"></span>
                                        Consultation Details
                                    </h6>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem
                                        label="Symptoms"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-activity text-lg text-primary-500 mr-2"></span>
                                                <span>Symptoms</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input textArea rows={3} placeholder="Enter patient symptoms" />
                                    </FormItem>
                                </div>

                                <div className="mb-4">
                                    <FormItem
                                        label="Diagnosis"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-search text-lg text-primary-500 mr-2"></span>
                                                <span>Diagnosis</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input textArea rows={3} placeholder="Enter diagnosis" />
                                    </FormItem>
                                </div>
                            </Card>
                            
                            <Card className="bg-gray-50 mb-6">
                                <div className="mb-4 border-b border-gray-200 pb-2">
                                    <h6 className="flex items-center text-primary-500">
                                        <span className="icon-clipboard-check text-lg mr-2"></span>
                                        Treatment Plan
                                    </h6>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem>
                                        <RichTextEditor
                                            value={reportContent}
                                            onChange={handleRichTextChange}
                                            placeholder="Enter detailed treatment plan and recommendations..."
                                        />
                                    </FormItem>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem
                                        label="Prescription"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-medicine text-lg text-primary-500 mr-2"></span>
                                                <span>Prescription</span>
                                            </div>
                                        }
                                    >
                                        <Input 
                                            textArea
                                            rows={3} 
                                            placeholder="Enter medications, dosage and instructions" 
                                        />
                                    </FormItem>
                                </div>

                                <div className="mb-4">
                                    <FormItem
                                        label="Additional Notes"
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-file-plus text-lg text-primary-500 mr-2"></span>
                                                <span>Additional Notes</span>
                                            </div>
                                        }
                                    >
                                        <Input 
                                            textArea
                                            rows={3} 
                                            placeholder="Any additional notes or instructions for the patient" 
                                        />
                                    </FormItem>
                                </div>
                            </Card>
                            
                            <div className="flex justify-end">
                                <Button 
                                    variant="plain" 
                                    className="mr-2"
                                    type="button"
                                    icon={<span className="icon-x"></span>}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="solid" 
                                    type="submit"
                                    loading={submitting}
                                    icon={<span className="icon-check"></span>}
                                >
                                    Submit Report
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Tabs.TabContent>
                <Tabs.TabContent value="history">
                    <Card className="mt-6">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="icon-history text-gray-400 text-3xl"></span>
                            </div>
                            <h5 className="mb-2">Report History</h5>
                            <p className="text-gray-500 mb-4">This feature will be available in the next update</p>
                            <Button variant="solid">Check Back Soon</Button>
                        </div>
                    </Card>
                </Tabs.TabContent>
                <Tabs.TabContent value="templates">
                    <Card className="mt-6">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="icon-template text-gray-400 text-3xl"></span>
                            </div>
                            <h5 className="mb-2">Report Templates</h5>
                            <p className="text-gray-500 mb-4">Save time with report templates. Coming soon!</p>
                            <Button variant="solid">Check Back Soon</Button>
                        </div>
                    </Card>
                </Tabs.TabContent>
            </Tabs>
        </Container>
    )
}

export default MedicalReport 