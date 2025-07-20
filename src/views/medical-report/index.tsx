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
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
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
                <Notification title={t('medicalReport.reportSubmitted')} type="success">
                    {t('medicalReport.reportAssignedMessage')}
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
                    <h3 className="mb-2">{t('medicalReport.title')}</h3>
                    <p className="text-gray-500">{t('medicalReport.subtitle')}</p>
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
                            {t('medicalReport.newReport')}
                        </span>
                    </Tabs.TabNav>
                    <Tabs.TabNav value="history">
                        <span className="flex items-center">
                            <span className="icon-history text-lg mr-2"></span>
                            {t('medicalReport.reportHistory')}
                        </span>
                    </Tabs.TabNav>
                    <Tabs.TabNav value="templates">
                        <span className="flex items-center">
                            <span className="icon-template text-lg mr-2"></span>
                            {t('medicalReport.templates')}
                        </span>
                    </Tabs.TabNav>
                </Tabs.TabList>
                <Tabs.TabContent value="newReport">
                    <Card className="mt-6">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h5 className="flex items-center">
                                <span className="icon-stethoscope text-xl text-primary-500 mr-2"></span>
                                {t('medicalReport.createNewReport')}
                            </h5>
                        </div>
                        
                        <Form onSubmit={onFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <FormItem
                                        label={t('medicalReport.selectPatient')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-user text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.selectPatient')}</span>
                                            </div>
                                        }
                                        invalid={!selectedPatient}
                                        errorMessage={!selectedPatient ? t('medicalReport.pleaseSelectPatient') : ""}
                                    >
                                        <Select<PatientOption>
                                            placeholder={t('medicalReport.selectPatientPlaceholder')} 
                                            options={patientOptions}
                                            onChange={handlePatientChange}
                                        />
                                    </FormItem>
                                </div>
                                <div>
                                    <FormItem
                                        label={t('medicalReport.reportType')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-file-text text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.reportType')}</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Select<{ value: string; label: string }>
                                            placeholder={t('medicalReport.selectReportTypePlaceholder')} 
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
                                                        <span className="font-medium">{t('medicalReport.age')}:</span> {getPatientById(selectedPatient)?.age} | 
                                                        <span className="font-medium ml-2">{t('medicalReport.gender')}:</span> {getPatientById(selectedPatient)?.gender}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">{t('medicalReport.lastVisit')}:</span> {getPatientById(selectedPatient)?.lastVisit}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="md:ml-6 mt-2 md:mt-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">{t('medicalReport.medicalHistory')}:</span> {getPatientById(selectedPatient)?.medicalHistory}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">{t('medicalReport.allergies')}:</span> {getPatientById(selectedPatient)?.allergies}
                                                </p>
                                            </div>
                                        </div>
                                    </Alert>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <FormItem
                                        label={t('medicalReport.dateOfConsultation')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-calendar text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.dateOfConsultation')}</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input type="date" />
                                    </FormItem>
                                </div>
                                <div>
                                    <FormItem
                                        label={t('medicalReport.followUpRequired')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-check-circle text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.followUpRequired')}</span>
                                            </div>
                                        }
                                    >
                                        <Select<{ value: string; label: string }>
                                            placeholder={t('medicalReport.followUpRequiredPlaceholder')} 
                                            options={[
                                                { value: 'yes', label: t('common.yes') },
                                                { value: 'no', label: t('common.no') }
                                            ]}
                                        />
                                    </FormItem>
                                </div>
                            </div>
                            
                            <Card className="bg-gray-50 mb-6">
                                <div className="mb-4 border-b border-gray-200 pb-2">
                                    <h6 className="flex items-center text-primary-500">
                                        <span className="icon-clipboard-list text-lg mr-2"></span>
                                        {t('medicalReport.consultationDetails')}
                                    </h6>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem
                                        label={t('medicalReport.symptoms')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-activity text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.symptoms')}</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input textArea rows={3} placeholder={t('medicalReport.symptomsPlaceholder')} />
                                    </FormItem>
                                </div>

                                <div className="mb-4">
                                    <FormItem
                                        label={t('medicalReport.diagnosis')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-search text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.diagnosis')}</span>
                                            </div>
                                        }
                                        invalid={false}
                                    >
                                        <Input textArea rows={3} placeholder={t('medicalReport.diagnosisPlaceholder')} />
                                    </FormItem>
                                </div>
                            </Card>
                            
                            <Card className="bg-gray-50 mb-6">
                                <div className="mb-4 border-b border-gray-200 pb-2">
                                    <h6 className="flex items-center text-primary-500">
                                        <span className="icon-clipboard-check text-lg mr-2"></span>
                                        {t('medicalReport.treatmentPlan')}
                                    </h6>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem>
                                        <RichTextEditor
                                            value={reportContent}
                                            onChange={handleRichTextChange}
                                            placeholder={t('medicalReport.treatmentPlanPlaceholder')}
                                        />
                                    </FormItem>
                                </div>
                                
                                <div className="mb-4">
                                    <FormItem
                                        label={t('medicalReport.prescription')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-medicine text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.prescription')}</span>
                                            </div>
                                        }
                                    >
                                        <Input 
                                            textArea
                                            rows={3} 
                                            placeholder={t('medicalReport.prescriptionPlaceholder')} 
                                        />
                                    </FormItem>
                                </div>

                                <div className="mb-4">
                                    <FormItem
                                        label={t('medicalReport.additionalNotes')}
                                        extra={
                                            <div className="flex items-center">
                                                <span className="icon-file-plus text-lg text-primary-500 mr-2"></span>
                                                <span>{t('medicalReport.additionalNotes')}</span>
                                            </div>
                                        }
                                    >
                                        <Input 
                                            textArea
                                            rows={3} 
                                            placeholder={t('medicalReport.additionalNotesPlaceholder')} 
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
                                    {t('common.cancel')}
                                </Button>
                                <Button 
                                    variant="solid" 
                                    type="submit"
                                    loading={submitting}
                                    icon={<span className="icon-check"></span>}
                                >
                                    {t('medicalReport.submitReport')}
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
                            <h5 className="mb-2">{t('medicalReport.reportHistory')}</h5>
                            <p className="text-gray-500 mb-4">{t('medicalReport.reportHistoryMessage')}</p>
                            <Button variant="solid">{t('medicalReport.checkBackSoon')}</Button>
                        </div>
                    </Card>
                </Tabs.TabContent>
                <Tabs.TabContent value="templates">
                    <Card className="mt-6">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="icon-template text-gray-400 text-3xl"></span>
                            </div>
                            <h5 className="mb-2">{t('medicalReport.reportTemplates')}</h5>
                            <p className="text-gray-500 mb-4">{t('medicalReport.reportTemplatesMessage')}</p>
                            <Button variant="solid">{t('medicalReport.checkBackSoon')}</Button>
                        </div>
                    </Card>
                </Tabs.TabContent>
            </Tabs>
        </Container>
    )
}

export default MedicalReport 