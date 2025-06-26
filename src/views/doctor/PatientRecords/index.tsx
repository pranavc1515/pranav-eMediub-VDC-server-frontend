import { useState } from 'react'
import { Card, Button, Avatar, Tag, Tabs, Table, Input } from '@/components/ui'
import Container from '@/components/shared/Container'
import {
    patientRecords,
    consultationHistory,
    patientMedicalDocuments,
    type PatientRecord,
} from '@/mock/data'

const PatientRecords = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] =
        useState<PatientRecord | null>(null)
    const [activeTab, setActiveTab] = useState('all')

    const filteredPatients = patientRecords.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.conditions.some((c) =>
                c.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
    )

    const handlePatientSelect = (patient: PatientRecord) => {
        setSelectedPatient(patient)
        setActiveTab('overview')
    }

    const getPatientConsultations = (patientId: number) => {
        return consultationHistory.filter(
            (consultation) => consultation.patientId === patientId,
        )
    }

    const getPatientDocuments = (patientId: number) => {
        return patientMedicalDocuments.filter(
            (doc) => doc.patientId === patientId,
        )
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
                            window.location.href = `/vdc`
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
                                    {selectedPatient.age} years old •{' '}
                                    {selectedPatient.gender} •{' '}
                                    {selectedPatient.bloodGroup}
                                </div>
                                {selectedPatient.occupation && (
                                    <div className="text-gray-500">
                                        {selectedPatient.occupation}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setSelectedPatient(null)}
                                icon="arrow-left"
                            >
                                Back to List
                            </Button>
                            <Button variant="solid">Edit Patient</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="md:col-span-1">
                            <div className="p-4">
                                <h5 className="font-semibold mb-3">
                                    Contact Information
                                </h5>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-gray-500">
                                            Phone
                                        </div>
                                        <div>{selectedPatient.phone}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">
                                            Email
                                        </div>
                                        <div>{selectedPatient.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">
                                            Address
                                        </div>
                                        <div>{selectedPatient.address}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="md:col-span-2">
                            <div className="p-4">
                                <h5 className="font-semibold mb-3">
                                    Medical Information
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-gray-500 mb-1">
                                            Medical Conditions
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPatient.conditions.map(
                                                (condition, index) => (
                                                    <Tag
                                                        key={index}
                                                        className="bg-blue-100 text-blue-600"
                                                    >
                                                        {condition}
                                                    </Tag>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">
                                            Medications
                                        </div>
                                        <ul className="list-disc pl-4">
                                            {selectedPatient.medications.map(
                                                (medication, index) => (
                                                    <li key={index}>
                                                        {medication}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">
                                            Allergies
                                        </div>
                                        {selectedPatient.allergies.length >
                                        0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedPatient.allergies.map(
                                                    (allergy, index) => (
                                                        <Tag
                                                            key={index}
                                                            className="bg-red-100 text-red-600"
                                                        >
                                                            {allergy}
                                                        </Tag>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div>No known allergies</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">
                                            Notes
                                        </div>
                                        <div>{selectedPatient.notes}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="mt-4">
                        <Tabs
                            defaultValue="overview"
                            value={activeTab}
                            onChange={(val) => setActiveTab(val)}
                        >
                            <Tabs.TabList>
                                <Tabs.TabNav value="overview">
                                    Overview
                                </Tabs.TabNav>
                                <Tabs.TabNav value="consultations">
                                    Consultation History
                                </Tabs.TabNav>
                                <Tabs.TabNav value="documents">
                                    Medical Documents
                                </Tabs.TabNav>
                                <Tabs.TabNav value="prescriptions">
                                    Prescriptions
                                </Tabs.TabNav>
                            </Tabs.TabList>
                            <Tabs.TabContent value="overview">
                                <Card className="mt-4">
                                    <div className="p-4">
                                        <h5 className="font-semibold mb-3">
                                            Patient Summary
                                        </h5>
                                        <div className="text-gray-600">
                                            <p>
                                                {selectedPatient.name} is a{' '}
                                                {selectedPatient.age}-year-old{' '}
                                                {selectedPatient.gender.toLowerCase()}
                                                with a history of{' '}
                                                {selectedPatient.conditions.join(
                                                    ', ',
                                                )}
                                                .
                                            </p>
                                            <p className="mt-2">
                                                The patient is currently on{' '}
                                                {selectedPatient.medications.join(
                                                    ', ',
                                                )}
                                                .
                                            </p>
                                            {selectedPatient.allergies.length >
                                                0 && (
                                                <p className="mt-2">
                                                    Known allergies:{' '}
                                                    {selectedPatient.allergies.join(
                                                        ', ',
                                                    )}
                                                    .
                                                </p>
                                            )}
                                            <p className="mt-2">
                                                Last visit was on{' '}
                                                {selectedPatient.lastVisit}.
                                                {selectedPatient.upcomingAppointment &&
                                                    ` There is an upcoming appointment scheduled for ${selectedPatient.upcomingAppointment}.`}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <Card>
                                        <div className="p-4">
                                            <h5 className="font-semibold mb-3">
                                                Recent Consultations
                                            </h5>
                                            {getPatientConsultations(
                                                selectedPatient.id,
                                            )
                                                .slice(0, 3)
                                                .map((consultation, index) => (
                                                    <div
                                                        key={index}
                                                        className="border-b pb-3 mb-3 last:border-0 last:mb-0 last:pb-0"
                                                    >
                                                        <div className="flex justify-between">
                                                            <div className="font-medium">
                                                                {
                                                                    consultation.date
                                                                }
                                                            </div>
                                                            <Tag className="bg-blue-100 text-blue-600">
                                                                {
                                                                    consultation.type
                                                                }
                                                            </Tag>
                                                        </div>
                                                        <div className="text-gray-600 mt-1">
                                                            {
                                                                consultation.diagnosis
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </Card>

                                    <Card>
                                        <div className="p-4">
                                            <h5 className="font-semibold mb-3">
                                                Recent Documents
                                            </h5>
                                            {getPatientDocuments(
                                                selectedPatient.id,
                                            )
                                                .slice(0, 3)
                                                .map((document, index) => (
                                                    <div
                                                        key={index}
                                                        className="border-b pb-3 mb-3 last:border-0 last:mb-0 last:pb-0"
                                                    >
                                                        <div className="flex justify-between">
                                                            <div className="font-medium">
                                                                {document.name}
                                                            </div>
                                                            <Tag className="bg-green-100 text-green-600">
                                                                {document.type}
                                                            </Tag>
                                                        </div>
                                                        <div className="flex justify-between mt-1">
                                                            <div className="text-gray-600">
                                                                {document.date}
                                                            </div>
                                                            <a
                                                                href={
                                                                    document.fileUrl
                                                                }
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                View
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </Card>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="consultations">
                                <Card className="mt-4">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h5 className="font-semibold">
                                                Consultation History
                                            </h5>
                                            <Button size="sm">
                                                Add New Consultation
                                            </Button>
                                        </div>

                                        <table className="min-w-full">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Type
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Reason
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Diagnosis
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Notes
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getPatientConsultations(
                                                    selectedPatient.id,
                                                ).map((consultation, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">
                                                            {consultation.date}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <Tag className="bg-blue-100 text-blue-600">
                                                                {
                                                                    consultation.type
                                                                }
                                                            </Tag>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {
                                                                consultation.reason
                                                            }
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {
                                                                consultation.diagnosis
                                                            }
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {consultation.notes}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <Button size="xs">
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="documents">
                                <Card className="mt-4">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h5 className="font-semibold">
                                                Medical Documents
                                            </h5>
                                            <Button size="sm">
                                                Upload New Document
                                            </Button>
                                        </div>

                                        <table className="min-w-full">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">
                                                        Document Name
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Type
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-2 text-left">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getPatientDocuments(
                                                    selectedPatient.id,
                                                ).map((document, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">
                                                            {document.name}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <Tag className="bg-green-100 text-green-600">
                                                                {document.type}
                                                            </Tag>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {document.date}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex space-x-2">
                                                                <Button size="xs">
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="xs"
                                                                    variant="plain"
                                                                >
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="prescriptions">
                                <Card className="mt-4">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h5 className="font-semibold">
                                                Prescriptions
                                            </h5>
                                            <Button size="sm">
                                                Add New Prescription
                                            </Button>
                                        </div>

                                        <div className="text-gray-600 py-16 text-center">
                                            <p>
                                                Prescriptions for this patient
                                                will appear here.
                                            </p>
                                            <p>
                                                Use the 'Add New Prescription'
                                                button to create a prescription.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Tabs.TabContent>
                        </Tabs>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Container>
            <div className="mb-4">
                <h3>Patient Records</h3>
                <p className="text-gray-500">
                    View and manage all your patient records
                </p>
            </div>

            {selectedPatient ? (
                renderPatientDetails()
            ) : (
                <Card>
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <h4>All Patients</h4>
                            <div className="mt-2 md:mt-0 w-full md:w-64">
                                <Input
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    prefix={<span>🔍</span>}
                                />
                            </div>
                        </div>

                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Contact
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Conditions
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Last Visit
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center">
                                                <Avatar
                                                    shape="circle"
                                                    size={35}
                                                />
                                                <div className="ml-2">
                                                    <div className="font-medium">
                                                        {patient.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {patient.age} yrs,{' '}
                                                        {patient.gender}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div>
                                                <div>{patient.phone}</div>
                                                <div className="text-xs text-gray-500">
                                                    {patient.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {patient.conditions.map(
                                                    (condition, index) => (
                                                        <Tag
                                                            key={index}
                                                            className="bg-blue-100 text-blue-600"
                                                        >
                                                            {condition}
                                                        </Tag>
                                                    ),
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            {patient.lastVisit}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex space-x-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePatientSelect(
                                                            patient,
                                                        )
                                                    }
                                                >
                                                    View Records
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </Container>
    )
}

export default PatientRecords
