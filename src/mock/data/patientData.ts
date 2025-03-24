export interface PatientRecord {
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
    bloodGroup?: string
    occupation?: string
}

export const patientRecords: PatientRecord[] = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@gmail.com',
        address: '123 Gandhi Road, Mumbai, Maharashtra 400001',
        lastVisit: '2023-03-15',
        bloodGroup: 'B+',
        occupation: 'Software Engineer',
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        medications: ['Amlodipine 5mg', 'Metformin 500mg'],
        allergies: ['Penicillin'],
        notes: 'Patient is managing blood pressure well with current medications.',
        upcomingAppointment: '2023-05-10'
    },
    {
        id: 2,
        name: 'Priya Sharma',
        age: 35,
        gender: 'Female',
        phone: '+91 87654 32109',
        email: 'priya.sharma@yahoo.com',
        address: '456 Nehru Street, Delhi, Delhi 110001',
        lastVisit: '2023-04-02',
        bloodGroup: 'O+',
        occupation: 'Teacher',
        conditions: ['Migraine', 'Anxiety'],
        medications: ['Sumatriptan', 'Escitalopram 10mg'],
        allergies: [],
        notes: 'Patient reports 2-3 migraines per month, triggers include stress and lack of sleep.',
        upcomingAppointment: '2023-05-05'
    },
    {
        id: 3,
        name: 'Anand Patel',
        age: 60,
        gender: 'Male',
        phone: '+91 76543 21098',
        email: 'anand.patel@hotmail.com',
        address: '789 Subhash Marg, Ahmedabad, Gujarat 380001',
        lastVisit: '2023-03-28',
        bloodGroup: 'AB+',
        occupation: 'Retired Bank Manager',
        conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
        medications: ['Metformin 1000mg', 'Telmisartan 40mg', 'Atorvastatin 10mg'],
        allergies: ['Sulfa drugs'],
        notes: 'Last HbA1c: 7.2%. Will need foot examination and eye referral.',
    },
    {
        id: 4,
        name: 'Meera Iyer',
        age: 28,
        gender: 'Female',
        phone: '+91 65432 10987',
        email: 'meera.iyer@gmail.com',
        address: '321 Tagore Lane, Bangalore, Karnataka 560001',
        lastVisit: '2023-04-10',
        bloodGroup: 'A+',
        occupation: 'Marketing Executive',
        conditions: ['Seasonal allergies', 'Asthma'],
        medications: ['Cetirizine 10mg', 'Salbutamol inhaler'],
        allergies: ['Dust', 'Pollen', 'Shellfish'],
        notes: 'Patient managing seasonal allergies well with current medication.',
        upcomingAppointment: '2023-05-20'
    },
    {
        id: 5,
        name: 'Vikram Singh',
        age: 52,
        gender: 'Male',
        phone: '+91 54321 09876',
        email: 'vikram.singh@yahoo.com',
        address: '123 Netaji Road, Jaipur, Rajasthan 302001',
        lastVisit: '2023-04-05',
        bloodGroup: 'B-',
        occupation: 'Business Owner',
        conditions: ['Lower Back Pain', 'Hypertension'],
        medications: ['Diclofenac', 'Amlodipine'],
        allergies: ['Ibuprofen'],
        notes: 'Patient experiencing lower back pain. Physical therapy recommended.',
    },
    {
        id: 6,
        name: 'Sunita Reddy',
        age: 40,
        gender: 'Female',
        phone: '+91 43210 98765',
        email: 'sunita.reddy@gmail.com',
        address: '567 Ambedkar Road, Hyderabad, Telangana 500001',
        lastVisit: '2023-03-20',
        bloodGroup: 'O-',
        occupation: 'Architect',
        conditions: ['Hypothyroidism', 'PCOS'],
        medications: ['Levothyroxine 50mcg', 'Metformin 500mg'],
        allergies: ['Nuts'],
        notes: 'TSH levels stable with current medication.',
        upcomingAppointment: '2023-05-15'
    },
    {
        id: 7,
        name: 'Arjun Nair',
        age: 32,
        gender: 'Male',
        phone: '+91 32109 87654',
        email: 'arjun.nair@hotmail.com',
        address: '890 Kerala Street, Kochi, Kerala 682001',
        lastVisit: '2023-04-12',
        bloodGroup: 'A-',
        occupation: 'IT Consultant',
        conditions: ['Gastritis', 'Insomnia'],
        medications: ['Pantoprazole 40mg', 'Melatonin 3mg'],
        allergies: ['Aspirin'],
        notes: 'Patient reports improved sleep with melatonin.',
        upcomingAppointment: '2023-05-25'
    },
]

export const consultationHistory = [
    { id: 1, patientId: 1, date: '2023-03-15', type: 'Follow-up', reason: 'Blood pressure check', diagnosis: 'Controlled hypertension', notes: 'BP 130/85, continue current medications' },
    { id: 2, patientId: 1, date: '2023-02-01', type: 'Check-up', reason: 'Annual physical', diagnosis: 'Stable', notes: 'All vitals within normal range' },
    { id: 3, patientId: 1, date: '2022-11-12', type: 'Urgent', reason: 'Headache, dizziness', diagnosis: 'Hypertension flare-up', notes: 'BP 160/95, adjusted medication dosage' },
    { id: 4, patientId: 2, date: '2023-04-02', type: 'Consultation', reason: 'Recurring migraines', diagnosis: 'Chronic migraine', notes: 'Prescribed preventative treatment' },
    { id: 5, patientId: 3, date: '2023-03-28', type: 'Follow-up', reason: 'Diabetes monitoring', diagnosis: 'Type 2 Diabetes - controlled', notes: 'HbA1c: 7.2%, maintain current medications' },
    { id: 6, patientId: 4, date: '2023-04-10', type: 'Consultation', reason: 'Seasonal allergies', diagnosis: 'Allergic rhinitis', notes: 'Patient reports effectiveness of current medication' },
    { id: 7, patientId: 5, date: '2023-04-05', type: 'Initial', reason: 'Lower back pain', diagnosis: 'Lumbar strain', notes: 'Recommended physical therapy and pain management' },
    { id: 8, patientId: 6, date: '2023-03-20', type: 'Follow-up', reason: 'Thyroid check', diagnosis: 'Controlled hypothyroidism', notes: 'TSH: 2.8, continue current medication' },
    { id: 9, patientId: 7, date: '2023-04-12', type: 'Consultation', reason: 'Stomach pain', diagnosis: 'Gastritis', notes: 'Advised dietary modifications and prescribed pantoprazole' },
]

export const patientMedicalDocuments = [
    { id: 1, patientId: 1, name: 'Blood Test Results', date: '2023-03-15', type: 'Lab Report', fileUrl: '#' },
    { id: 2, patientId: 1, name: 'EKG Report', date: '2023-03-15', type: 'Test Report', fileUrl: '#' },
    { id: 3, patientId: 1, name: 'Chest X-Ray', date: '2022-11-12', type: 'Imaging', fileUrl: '#' },
    { id: 4, patientId: 2, name: 'MRI Brain Scan', date: '2023-01-05', type: 'Imaging', fileUrl: '#' },
    { id: 5, patientId: 3, name: 'Blood Glucose Monitoring', date: '2023-03-28', type: 'Lab Report', fileUrl: '#' },
    { id: 6, patientId: 4, name: 'Lung Function Test', date: '2023-04-10', type: 'Test Report', fileUrl: '#' },
    { id: 7, patientId: 5, name: 'Spine MRI', date: '2023-04-05', type: 'Imaging', fileUrl: '#' },
    { id: 8, patientId: 6, name: 'Thyroid Function Test', date: '2023-03-20', type: 'Lab Report', fileUrl: '#' },
    { id: 9, patientId: 7, name: 'Endoscopy Report', date: '2023-04-12', type: 'Procedure Report', fileUrl: '#' },
] 