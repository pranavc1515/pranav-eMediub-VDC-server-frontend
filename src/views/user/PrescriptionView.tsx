import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiDownload } from 'react-icons/hi'

const PrescriptionView = () => {
    const [prescriptions] = useState([
        {
            id: 1,
            doctorName: 'Dr. John Doe',
            date: '2024-03-20',
            diagnosis: 'Common Cold',
            medicines: [
                { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' },
                { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily' }
            ],
            notes: 'Take medicines with warm water. Rest well and stay hydrated.'
        },
        // Add more prescription data as needed
    ])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((prescription) => (
                <Card key={prescription.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{prescription.doctorName}</h3>
                            <p className="text-sm text-gray-500">{prescription.date}</p>
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            className="flex items-center gap-2"
                        >
                            <HiDownload />
                            <span>Download</span>
                        </Button>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Diagnosis</h4>
                        <p className="text-gray-600">{prescription.diagnosis}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Medicines</h4>
                        <ul className="space-y-2">
                            {prescription.medicines.map((medicine, index) => (
                                <li key={index} className="text-gray-600">
                                    <span className="font-medium">{medicine.name}</span> - {medicine.dosage} ({medicine.frequency})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-gray-600">{prescription.notes}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default PrescriptionView 