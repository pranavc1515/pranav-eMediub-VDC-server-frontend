import { Card, Avatar } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { useEffect, useState } from 'react'
import { fetchAboutUs } from '@/services/CommonService'
import Loading from '@/components/shared/Loading'

interface AboutResponse {
    status: boolean
    status_code: number
    message: string
    data: {
        content: string
    }
}

const teamMembers = [
    {
        name: 'Kasi Reddy',
        role: 'Founder & CEO',
        avatar: '/img/avatars/doctor-6.jpg',
        bio: 'Kasi Reddy founded eMediHub with the vision of making healthcare accessible to everyone. With over 15 years of experience in healthcare administration and as a practicing physician, he leads our medical innovation initiatives.',
    },
    {
        name: 'Bala Rajesh Kancharla',
        role: 'Chief Technology Officer',
        avatar: '/img/avatars/user-4.jpg',
        bio: 'Bala Rajesh brings 12 years of experience in healthcare technology. He leads our development team in building secure, reliable, and user-friendly telehealth solutions that connect patients with doctors worldwide.',
    },
    {
        name: 'Ayyapa Raju',
        role: 'Director',
        avatar: '/img/avatars/doctor-2.jpg',
        bio: 'Dr. Ayyapa oversees all medical protocols and quality assurance. With his background in both IT Sales and management, he ensures that our platform delivers the highest standard of care.',
    },
]

const keyFeatures = [
    {
        icon: 'icon-video',
        title: 'Secure Video Consultations',
        description:
            'Connect with licensed doctors through our secure, HIPAA-compliant video platform from the comfort of your home.',
    },
    {
        icon: 'icon-document',
        title: 'Comprehensive Medical Reports',
        description:
            'Receive detailed medical reports after each consultation, with treatment plans and prescriptions if needed.',
    },
    {
        icon: 'icon-clock',
        title: '24/7 Availability',
        description:
            'Access medical care whenever you need it with our around-the-clock service and on-demand consultations.',
    },
    {
        icon: 'icon-devices',
        title: 'Multi-Platform Access',
        description:
            'Use our service on any device - desktop, tablet, or mobile, with our responsive web application.',
    },
    {
        icon: 'icon-shield',
        title: 'Data Security',
        description:
            'Your health information is protected with enterprise-grade encryption and security protocols.',
    },
    {
        icon: 'icon-users',
        title: 'Specialist Network',
        description:
            'Access a wide network of specialists across various medical fields for comprehensive healthcare.',
    },
]

const AboutUs = () => {
    const [aboutContent, setAboutContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const getAboutContent = async () => {
            try {
                setLoading(true)
                const response = await fetchAboutUs() as AboutResponse
                if (response?.status && response?.data?.content) {
                    setAboutContent(response.data.content)
                } else {
                    setError('Failed to load about us content')
                }
            } catch (err) {
                console.error('Error fetching about us content:', err)
                setError('Failed to load about us content')
            } finally {
                setLoading(false)
            }
        }

        getAboutContent()
    }, [])

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center h-64">
                    <Loading loading={true} />
                </div>
            </Container>
        )
    }

    if (error) {
        return (
            <Container>
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">{error}</p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="mb-8 text-center">
                <h2 className="mb-2">About eMediHub</h2>
                <p className="text-gray-500">
                    Revolutionizing healthcare through technology and compassion
                </p>
            </div>

            {/* Hero Section */}
            <Card className="mb-8 overflow-hidden">
                <div className="p-6">
                    <div 
                        className="terms-content" 
                        dangerouslySetInnerHTML={{ __html: aboutContent }}
                    />
                </div>
            </Card>

            {/* Key Features */}
            <div className="mb-12">
                <h3 className="text-center mb-8">What Sets Us Apart</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {keyFeatures.map((feature, index) => (
                        <Card
                            key={index}
                            className="p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                                    <span
                                        className={`${feature.icon} text-primary-500 text-2xl`}
                                    ></span>
                                </div>
                                <h5 className="mb-2 font-semibold">
                                    {feature.title}
                                </h5>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Our Team */}
            <div className="mb-12">
                <h3 className="text-center mb-8">Our Leadership Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member, index) => (
                        <Card
                            key={index}
                            className="p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col items-center text-center">
                                <Avatar
                                    size={100}
                                    src={member.avatar}
                                    className="mb-4"
                                />
                                <h5 className="mb-1 font-semibold">
                                    {member.name}
                                </h5>
                                <p className="text-primary-500 mb-3">
                                    {member.role}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {member.bio}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <Card className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">
                            5000+
                        </h2>
                        <p className="text-gray-600">Consultations Monthly</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">
                            200+
                        </h2>
                        <p className="text-gray-600">Qualified Doctors</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">
                            50+
                        </h2>
                        <p className="text-gray-600">Medical Specialties</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">
                            98%
                        </h2>
                        <p className="text-gray-600">Patient Satisfaction</p>
                    </div>
                </div>
            </Card>

            {/* Values */}
            <div className="mb-12">
                <h3 className="text-center mb-8">Our Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                                <span className="icon-heart text-white text-2xl"></span>
                            </div>
                            <h5 className="mb-2 font-semibold">
                                Patient-Centered Care
                            </h5>
                            <p>
                                We place patients at the center of everything we
                                do, focusing on their needs, preferences, and
                                overall experience.
                            </p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                                <span className="icon-check text-white text-2xl"></span>
                            </div>
                            <h5 className="mb-2 font-semibold">
                                Quality & Excellence
                            </h5>
                            <p>
                                We're committed to delivering the highest
                                quality healthcare services with continuous
                                improvement and innovation.
                            </p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                                <span className="icon-lock text-white text-2xl"></span>
                            </div>
                            <h5 className="mb-2 font-semibold">
                                Trust & Privacy
                            </h5>
                            <p>
                                We build trust by maintaining the highest
                                standards of confidentiality, security, and
                                ethical practice.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Contact */}
            <Card className="mb-8">
                <div className="p-6 text-center">
                    <h3 className="mb-4">Get In Touch</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Have questions about our services or want to learn more
                        about how eMediHub can help you? We'd love to hear from
                        you.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="flex items-center text-primary-500">
                            <span className="icon-mail text-xl mr-2"></span>
                            <span>contact@emediub.com</span>
                        </div>
                        <div className="flex items-center text-primary-500">
                            <span className="icon-phone text-xl mr-2"></span>
                            <span>+91 8805047968</span>
                        </div>
                        <div className="flex items-center text-primary-500">
                            <span className="icon-location text-xl mr-2"></span>
                            <span>
                                1372/C, 2nd Floor, 32nd E Cross Rd, 4th T Block
                                East, Jayanagar, Bengaluru, Karnataka 560041
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    )
}

export default AboutUs
