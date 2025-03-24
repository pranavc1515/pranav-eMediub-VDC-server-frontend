export interface Prescription {
    id: number
    patientId: number
    patientName: string
    patientAge: number
    patientGender: string
    doctorId: number
    doctorName: string
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

export const prescriptions: Prescription[] = [
    {
        id: 1,
        patientId: 1,
        patientName: 'Rajesh Kumar',
        patientAge: 45,
        patientGender: 'Male',
        doctorId: 1,
        doctorName: 'Dr. Aditya Verma',
        medications: [
            {
                name: 'Amlodipine',
                dosage: '5mg',
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
        patientName: 'Priya Sharma',
        patientAge: 35,
        patientGender: 'Female',
        doctorId: 2,
        doctorName: 'Dr. Meera Kapoor',
        medications: [
            {
                name: 'Sumatriptan',
                dosage: '50mg',
                frequency: 'As needed',
                duration: '30 days',
                instructions: 'Take at onset of migraine symptoms, maximum 2 tablets per 24 hours'
            },
            {
                name: 'Escitalopram',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take in the morning'
            }
        ],
        status: 'active',
        createdDate: '2023-04-02',
        expiryDate: '2023-05-02',
        notes: 'Follow up in 30 days to evaluate efficacy'
    },
    {
        id: 3,
        patientId: 3,
        patientName: 'Anand Patel',
        patientAge: 60,
        patientGender: 'Male',
        doctorId: 3,
        doctorName: 'Dr. Suresh Reddy',
        medications: [
            {
                name: 'Metformin',
                dosage: '1000mg',
                frequency: 'Twice daily',
                duration: '90 days',
                instructions: 'Take with meals'
            },
            {
                name: 'Telmisartan',
                dosage: '40mg',
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
        patientId: 4,
        patientName: 'Meera Iyer',
        patientAge: 28,
        patientGender: 'Female',
        doctorId: 1,
        doctorName: 'Dr. Aditya Verma',
        medications: [
            {
                name: 'Cetirizine',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take at night'
            },
            {
                name: 'Salbutamol',
                dosage: 'Inhaler',
                frequency: 'As needed',
                duration: '30 days',
                instructions: 'Use inhaler when experiencing shortness of breath, 2 puffs per use'
            }
        ],
        status: 'active',
        createdDate: '2023-04-10',
        expiryDate: '2023-05-10',
        notes: 'Avoid dust exposure and maintain inhaler with patient at all times'
    },
    {
        id: 5,
        patientId: 5,
        patientName: 'Vikram Singh',
        patientAge: 52,
        patientGender: 'Male',
        doctorId: 2,
        doctorName: 'Dr. Meera Kapoor',
        medications: [
            {
                name: 'Diclofenac',
                dosage: '50mg',
                frequency: 'Twice daily',
                duration: '14 days',
                instructions: 'Take with food to avoid stomach upset'
            },
            {
                name: 'Amlodipine',
                dosage: '5mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take in the morning'
            }
        ],
        status: 'active',
        createdDate: '2023-04-05',
        expiryDate: '2023-05-05',
        notes: 'Recommended physiotherapy sessions for back pain. Avoid heavy lifting.'
    },
    {
        id: 6,
        patientId: 1,
        patientName: 'Rajesh Kumar',
        patientAge: 45,
        patientGender: 'Male',
        doctorId: 3,
        doctorName: 'Dr. Suresh Reddy',
        medications: [
            {
                name: 'Azithromycin',
                dosage: '500mg',
                frequency: 'Once daily',
                duration: '3 days',
                instructions: 'Take 1 hour before or 2 hours after meals'
            }
        ],
        status: 'completed',
        createdDate: '2023-02-10',
        expiryDate: '2023-02-13',
        notes: 'For respiratory tract infection'
    },
    {
        id: 7,
        patientId: 6,
        patientName: 'Sunita Reddy',
        patientAge: 40,
        patientGender: 'Female',
        doctorId: 2,
        doctorName: 'Dr. Meera Kapoor',
        medications: [
            {
                name: 'Levothyroxine',
                dosage: '50mcg',
                frequency: 'Once daily',
                duration: '90 days',
                instructions: 'Take on empty stomach, 30 minutes before breakfast'
            },
            {
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                duration: '90 days',
                instructions: 'Take with meals'
            }
        ],
        status: 'active',
        createdDate: '2023-03-20',
        expiryDate: '2023-06-20',
        notes: 'TSH levels to be rechecked after 3 months'
    },
    {
        id: 8,
        patientId: 7,
        patientName: 'Arjun Nair',
        patientAge: 32,
        patientGender: 'Male',
        doctorId: 1,
        doctorName: 'Dr. Aditya Verma',
        medications: [
            {
                name: 'Pantoprazole',
                dosage: '40mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take before breakfast'
            },
            {
                name: 'Melatonin',
                dosage: '3mg',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take 30 minutes before bedtime'
            }
        ],
        status: 'active',
        createdDate: '2023-04-12',
        expiryDate: '2023-05-12',
        notes: 'Advised to avoid spicy foods, caffeine and alcohol'
    }
]

export const indianMedications = [
    { value: 'amlodipine', label: 'Amlodipine' },
    { value: 'metformin', label: 'Metformin' },
    { value: 'telmisartan', label: 'Telmisartan' },
    { value: 'atorvastatin', label: 'Atorvastatin' },
    { value: 'azithromycin', label: 'Azithromycin' },
    { value: 'pantoprazole', label: 'Pantoprazole' },
    { value: 'cetirizine', label: 'Cetirizine' },
    { value: 'salbutamol', label: 'Salbutamol' },
    { value: 'levothyroxine', label: 'Levothyroxine' },
    { value: 'diclofenac', label: 'Diclofenac' },
    { value: 'escitalopram', label: 'Escitalopram' },
    { value: 'sumatriptan', label: 'Sumatriptan' },
    { value: 'paracetamol', label: 'Paracetamol' },
    { value: 'omeprazole', label: 'Omeprazole' },
    { value: 'amoxicillin', label: 'Amoxicillin' },
    { value: 'hydrochlorothiazide', label: 'Hydrochlorothiazide' }
]

export const medicationFrequencies = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'as_needed', label: 'As needed (PRN)' },
    { value: 'weekly', label: 'Weekly' }
]

export const medicationDurations = [
    { value: '3_days', label: '3 days' },
    { value: '5_days', label: '5 days' },
    { value: '7_days', label: '7 days' },
    { value: '10_days', label: '10 days' },
    { value: '14_days', label: '14 days' },
    { value: '30_days', label: '30 days' },
    { value: '60_days', label: '60 days' },
    { value: '90_days', label: '90 days' }
] 