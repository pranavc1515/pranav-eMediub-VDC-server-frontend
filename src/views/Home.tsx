import { useState } from 'react'
import { 
    Card, 
    Input,
    Button,
    Badge,
    Avatar,
    Select,
    Tag
} from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import Chart from '@/components/shared/Chart'
import { Link } from 'react-router-dom'

const problemCategories = [
    { value: 'general', label: 'General Health' },
    { value: 'cardiology', label: 'Heart & Cardiology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'dermatology', label: 'Skin Problems' },
    { value: 'orthopedics', label: 'Bone & Joint Pain' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'other', label: 'Other Problems' },
]

const onlineDoctors = [
    {
        id: 1,
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        rating: 4.9,
        experience: '10 years',
        avatar: '/img/avatars/doctor-1.jpg',
        availability: 'Available now',
        categories: ['cardiology', 'general']
    },
    {
        id: 2,
        name: 'Dr. Michael Chen',
        specialty: 'Pediatrician',
        rating: 4.7,
        experience: '8 years',
        avatar: '/img/avatars/doctor-2.jpg',
        availability: 'Available in 5 min',
        categories: ['pediatrics', 'general']
    },
    {
        id: 3,
        name: 'Dr. Emma Rodriguez',
        specialty: 'Dermatologist',
        rating: 4.8,
        experience: '12 years',
        avatar: '/img/avatars/doctor-3.jpg',
        availability: 'Available now',
        categories: ['dermatology']
    },
    {
        id: 4,
        name: 'Dr. David Kim',
        specialty: 'Orthopedic Surgeon',
        rating: 4.6,
        experience: '15 years',
        avatar: '/img/avatars/doctor-4.jpg',
        availability: 'Available in 10 min',
        categories: ['orthopedics']
    },
    {
        id: 5,
        name: 'Dr. Lisa Patel',
        specialty: 'Psychiatrist',
        rating: 4.9,
        experience: '9 years',
        avatar: '/img/avatars/doctor-5.jpg',
        availability: 'Available now',
        categories: ['mental']
    },
    {
        id: 6,
        name: 'Dr. James Wilson',
        specialty: 'Neurologist',
        rating: 4.8,
        experience: '14 years',
        avatar: '/img/avatars/doctor-6.jpg',
        availability: 'Available in 15 min',
        categories: ['neurology']
    }
]

const statsData = [
    {
        title: 'Available Doctors',
        value: 48,
        growth: 12.5,
        icon: 'user-md'
    },
    {
        title: 'Active Consultations',
        value: 17,
        growth: 3.7,
        icon: 'video'
    },
    {
        title: 'Avg. Wait Time',
        value: '3 min',
        growth: -8.2,
        icon: 'clock'
    },
    {
        title: 'Patient Satisfaction',
        value: '96%',
        growth: 2.3,
        icon: 'smile'
    }
]

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    
    const filteredDoctors = onlineDoctors.filter(doctor => {
        const matchesCategory = selectedCategory === 'all' || doctor.categories.includes(selectedCategory)
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <Container className="h-full">
            <div className="mb-8">
                <h3 className="mb-2">Video Doctor Consultation</h3>
                <p className="text-gray-500">Connect with doctors instantly for online medical consultation</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                {statsData.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                <span className={`text-2xl icon-${stat.icon}`}></span>
                            </div>
                            <div>
                                <h5 className="font-semibold text-sm">{stat.title}</h5>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold">{stat.value}</span>
                                    <span className={`text-xs ${stat.growth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {stat.growth > 0 ? '+' : ''}{stat.growth}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search and Problem Selection */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3">
                        <Input 
                            placeholder="Search doctor or specialty..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            prefix={<span className="text-lg icon-search"></span>}
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <h6 className="mb-2 text-sm text-gray-500">Select your health concern:</h6>
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                className={`${selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
                                variant={selectedCategory === 'all' ? 'solid' : 'default'}
                                onClick={() => setSelectedCategory('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            {problemCategories.map(category => (
                                <Button 
                                    key={category.value}
                                    className={`${selectedCategory === category.value ? 'bg-primary-500 text-white' : 'bg-gray-100'} rounded-full text-sm px-3 py-1`}
                                    variant={selectedCategory === category.value ? 'solid' : 'default'}
                                    onClick={() => setSelectedCategory(category.value)}
                                    size="sm"
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Banner */}
            <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-2/3 p-4">
                        <h4 className="text-xl font-bold mb-2">Start Your Video Consultation Now</h4>
                        <p className="mb-4">Connect with a doctor instantly and get medical advice from the comfort of your home.</p>
                        <Link to="/video-consultation">
                            <Button variant="solid" className="bg-white text-blue-600 hover:bg-gray-100">
                                <span className="icon-video mr-2"></span>
                                Start Consultation
                            </Button>
                        </Link>
                    </div>
                    <div className="md:w-1/3 flex justify-end">
                        <DoubleSidedImage 
                            src="/img/others/doctor-consultation.png"
                            darkModeSrc="/img/others/doctor-consultation-dark.png"
                            alt="Video consultation"
                            className="h-40 object-contain"
                        />
                    </div>
                </div>
            </Card>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar size={60} src={doctor.avatar} />
                                <div>
                                    <h5 className="font-semibold">{doctor.name}</h5>
                                    <p className="text-gray-500">{doctor.specialty}</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-400 icon-star"></span>
                                        <span>{doctor.rating}</span>
                                        <span className="mx-1">•</span>
                                        <span>{doctor.experience}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Badge className={doctor.availability.includes('now') ? 'bg-emerald-500' : 'bg-amber-500'}>
                                    {doctor.availability}
                                </Badge>
                                <Button variant="solid" size="sm">
                                    <span className="icon-video mr-1"></span>
                                    <Link to="/video-consultation" className="text-white">
                                        Consult Now
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center p-8">
                        <div className="text-gray-400 text-xl mb-2">No doctors available for the selected category</div>
                        <Button variant="plain" onClick={() => setSelectedCategory('all')}>Show all doctors</Button>
                    </div>
                )}
            </div>
        </Container>
    )
}

export default Home
