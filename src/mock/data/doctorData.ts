export interface Doctor {
    id: number
    name: string
    title: string
    specialty: string
    qualification: string
    experience: number
    phone: string
    email: string
    hospital: string
    address: string
    bio: string
    avatar?: string
    languagesSpoken: string[]
    consultationFee?: number
    availableDays?: string[]
    rating?: number
}

export const doctors: Doctor[] = [
    {
        id: 1,
        name: 'Dr. Aditya Verma',
        title: 'Senior Consultant',
        specialty: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        phone: '+91 98765 12345',
        email: 'aditya.verma@emediub.com',
        hospital: 'Apollo Hospital',
        address: '45 MG Road, Bangalore, Karnataka 560001',
        bio: 'Dr. Aditya Verma is a senior cardiologist with over 15 years of experience in treating heart diseases. He specializes in interventional cardiology and has performed more than 5000 angioplasty procedures.',
        languagesSpoken: ['English', 'Hindi', 'Kannada'],
        consultationFee: 1500,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        rating: 4.8
    },
    {
        id: 2,
        name: 'Dr. Meera Kapoor',
        title: 'Consultant',
        specialty: 'Neurology',
        qualification: 'MBBS, MD (Neurology), DM (Neurology)',
        experience: 12,
        phone: '+91 87654 23456',
        email: 'meera.kapoor@emediub.com',
        hospital: 'Fortis Hospital',
        address: '154 Bannerghatta Road, Bangalore, Karnataka 560076',
        bio: 'Dr. Meera Kapoor is a neurologist with expertise in headache disorders, epilepsy, and movement disorders. She has trained at prestigious institutions in India and the UK.',
        languagesSpoken: ['English', 'Hindi', 'Bengali', 'Tamil'],
        consultationFee: 1800,
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        rating: 4.9
    },
    {
        id: 3,
        name: 'Dr. Suresh Reddy',
        title: 'Senior Consultant',
        specialty: 'Endocrinology',
        qualification: 'MBBS, MD (Internal Medicine), DM (Endocrinology)',
        experience: 18,
        phone: '+91 76543 34567',
        email: 'suresh.reddy@emediub.com',
        hospital: 'Manipal Hospital',
        address: '98 HAL Airport Road, Bangalore, Karnataka 560017',
        bio: 'Dr. Suresh Reddy is an endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. He is known for his patient-centric approach.',
        languagesSpoken: ['English', 'Hindi', 'Telugu', 'Kannada'],
        consultationFee: 1700,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        rating: 4.7
    },
    {
        id: 4,
        name: 'Dr. Priyanka Joshi',
        title: 'Consultant',
        specialty: 'Pediatrics',
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        experience: 10,
        phone: '+91 65432 45678',
        email: 'priyanka.joshi@emediub.com',
        hospital: 'Rainbow Children\'s Hospital',
        address: '78 Marathahalli Road, Bangalore, Karnataka 560037',
        bio: 'Dr. Priyanka Joshi is a pediatrician with special interest in newborn care, childhood immunization, and pediatric infectious diseases.',
        languagesSpoken: ['English', 'Hindi', 'Marathi'],
        consultationFee: 1200,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        rating: 4.9
    },
    {
        id: 5,
        name: 'Dr. Rajiv Menon',
        title: 'Senior Consultant',
        specialty: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement',
        experience: 20,
        phone: '+91 54321 56789',
        email: 'rajiv.menon@emediub.com',
        hospital: 'Sparsh Hospital',
        address: '29 Infantry Road, Bangalore, Karnataka 560001',
        bio: 'Dr. Rajiv Menon is an orthopedic surgeon specializing in joint replacement surgeries, sports injuries, and arthroscopic procedures.',
        languagesSpoken: ['English', 'Hindi', 'Malayalam', 'Tamil'],
        consultationFee: 2000,
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        rating: 4.8
    },
    {
        id: 6,
        name: 'Dr. Anjali Gupta',
        title: 'Consultant',
        specialty: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 8,
        phone: '+91 43210 67890',
        email: 'anjali.gupta@emediub.com',
        hospital: 'Skin & Care Clinic',
        address: '65 Indiranagar Main Road, Bangalore, Karnataka 560038',
        bio: 'Dr. Anjali Gupta is a dermatologist specializing in cosmetic dermatology, pediatric dermatology, and dermatosurgery.',
        languagesSpoken: ['English', 'Hindi', 'Punjabi'],
        consultationFee: 1300,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        rating: 4.6
    },
    {
        id: 7,
        name: 'Dr. Karthik Raghavan',
        title: 'Consultant',
        specialty: 'Pulmonology',
        qualification: 'MBBS, MD (Respiratory Medicine)',
        experience: 11,
        phone: '+91 32109 78901',
        email: 'karthik.raghavan@emediub.com',
        hospital: 'Narayana Health',
        address: '258 Hosur Road, Bangalore, Karnataka 560099',
        bio: 'Dr. Karthik Raghavan is a pulmonologist with expertise in respiratory disorders, sleep medicine, and critical care.',
        languagesSpoken: ['English', 'Hindi', 'Tamil', 'Kannada'],
        consultationFee: 1400,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        rating: 4.7
    }
] 