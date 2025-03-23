import { Card, Avatar } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'

const teamMembers = [
    {
        name: 'Dr. James Wilson',
        role: 'Founder & CEO',
        avatar: '/img/avatars/doctor-6.jpg',
        bio: 'Dr. Wilson founded eMediHub with the vision of making healthcare accessible to everyone. With over 15 years of experience in healthcare administration and as a practicing physician, he leads our medical innovation initiatives.'
    },
    {
        name: 'Sarah Johnson',
        role: 'Chief Technology Officer',
        avatar: '/img/avatars/user-4.jpg',
        bio: 'Sarah brings 12 years of experience in healthcare technology. She leads our development team in building secure, reliable, and user-friendly telehealth solutions that connect patients with doctors worldwide.'
    },
    {
        name: 'Michael Chen',
        role: 'Chief Medical Officer',
        avatar: '/img/avatars/doctor-2.jpg',
        bio: 'Dr. Chen oversees all medical protocols and quality assurance. With his background in both emergency medicine and telemedicine, he ensures that our platform delivers the highest standard of care.'
    },
    {
        name: 'Emily Rodriguez',
        role: 'Head of Patient Experience',
        avatar: '/img/avatars/doctor-3.jpg',
        bio: 'Emily focuses on making every patient interaction seamless and beneficial. Her background in healthcare UX design and patient advocacy helps us create a platform that truly addresses patient needs.'
    }
]

const keyFeatures = [
    {
        icon: 'icon-video',
        title: 'Secure Video Consultations',
        description: 'Connect with licensed doctors through our secure, HIPAA-compliant video platform from the comfort of your home.'
    },
    {
        icon: 'icon-report',
        title: 'Comprehensive Medical Reports',
        description: 'Receive detailed medical reports after each consultation, with treatment plans and prescriptions if needed.'
    },
    {
        icon: 'icon-clock',
        title: '24/7 Availability',
        description: 'Access medical care whenever you need it with our around-the-clock service and on-demand consultations.'
    },
    {
        icon: 'icon-device',
        title: 'Multi-Platform Access',
        description: 'Use our service on any device - desktop, tablet, or mobile, with our responsive web application.'
    },
    {
        icon: 'icon-security',
        title: 'Data Security',
        description: 'Your health information is protected with enterprise-grade encryption and security protocols.'
    },
    {
        icon: 'icon-users',
        title: 'Specialist Network',
        description: 'Access a wide network of specialists across various medical fields for comprehensive healthcare.'
    }
]

const AboutUs = () => {
    return (
        <Container>
            <div className="mb-8 text-center">
                <h2 className="mb-2">About eMediHub</h2>
                <p className="text-gray-500">Revolutionizing healthcare through technology and compassion</p>
            </div>
            
            {/* Hero Section */}
            <Card className="mb-8 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="mb-4 text-primary-600">Our Mission</h3>
                        <p className="mb-4 text-lg">
                            At eMediHub, we're on a mission to make quality healthcare accessible to everyone, 
                            regardless of location or circumstance. We believe that technology can bridge the gap 
                            between patients and healthcare providers, creating a world where medical expertise 
                            is just a video call away.
                        </p>
                        <p className="text-gray-600">
                            Founded in 2020, we've been at the forefront of telehealth innovation, 
                            connecting thousands of patients with qualified doctors and specialists worldwide.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <DoubleSidedImage 
                            src="/img/others/about-hero.png"
                            darkModeSrc="/img/others/about-hero-dark.png"
                            alt="eMediHub Mission"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </Card>
            
            {/* Key Features */}
            <div className="mb-12">
                <h3 className="text-center mb-8">What Sets Us Apart</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {keyFeatures.map((feature, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                                    <span className={`${feature.icon} text-primary-500 text-2xl`}></span>
                                </div>
                                <h5 className="mb-2 font-semibold">{feature.title}</h5>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Our Team */}
            <div className="mb-12">
                <h3 className="text-center mb-8">Our Leadership Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col items-center text-center">
                                <Avatar size={100} src={member.avatar} className="mb-4" />
                                <h5 className="mb-1 font-semibold">{member.name}</h5>
                                <p className="text-primary-500 mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm">{member.bio}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Stats */}
            <Card className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">5000+</h2>
                        <p className="text-gray-600">Consultations Monthly</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">200+</h2>
                        <p className="text-gray-600">Qualified Doctors</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">50+</h2>
                        <p className="text-gray-600">Medical Specialties</p>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-primary-600 mb-2">98%</h2>
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
                            <h5 className="mb-2 font-semibold">Patient-Centered Care</h5>
                            <p>We place patients at the center of everything we do, focusing on their needs, preferences, and overall experience.</p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                                <span className="icon-check text-white text-2xl"></span>
                            </div>
                            <h5 className="mb-2 font-semibold">Quality & Excellence</h5>
                            <p>We're committed to delivering the highest quality healthcare services with continuous improvement and innovation.</p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                                <span className="icon-lock text-white text-2xl"></span>
                            </div>
                            <h5 className="mb-2 font-semibold">Trust & Privacy</h5>
                            <p>We build trust by maintaining the highest standards of confidentiality, security, and ethical practice.</p>
                        </div>
                    </Card>
                </div>
            </div>
            
            {/* Contact */}
            <Card className="mb-8">
                <div className="p-6 text-center">
                    <h3 className="mb-4">Get In Touch</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Have questions about our services or want to learn more about how eMediHub can help you?
                        We'd love to hear from you.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="flex items-center text-primary-500">
                            <span className="icon-mail text-xl mr-2"></span>
                            <span>contact@emediub.com</span>
                        </div>
                        <div className="flex items-center text-primary-500">
                            <span className="icon-phone text-xl mr-2"></span>
                            <span>+1 (555) 987-6543</span>
                        </div>
                        <div className="flex items-center text-primary-500">
                            <span className="icon-location text-xl mr-2"></span>
                            <span>123 Medical Drive, Health City, HC 12345</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    )
}

export default AboutUs 