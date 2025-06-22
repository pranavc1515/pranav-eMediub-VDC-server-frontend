import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'

const userTermsContent = [
    {
        title: 'Medical Disclaimer and Platform Purpose',
        content:
            'eMediHub provides a platform to connect you with licensed healthcare providers. Our platform itself does not provide medical advice, diagnosis, or treatment. All medical advice, diagnoses, and treatments are provided by licensed healthcare professionals. We serve only as a communication medium between you and your healthcare provider.',
    },
    {
        title: 'User Responsibilities and Accurate Information',
        content:
            'You agree to provide accurate, complete, and truthful health information to healthcare providers during consultations. Providing false or incomplete information may compromise your care and safety. You are responsible for following the medical advice, prescriptions, and treatment plans provided by licensed healthcare professionals through our platform.',
    },
    {
        title: 'Emergency Situations and Limitations',
        content:
            'eMediHub is not intended for emergency medical situations. In case of a medical emergency, life-threatening condition, or severe symptoms, please contact emergency services (911) immediately or visit your nearest emergency room. Do not use our platform to seek help for urgent medical situations that require immediate in-person care.',
    },
    {
        title: 'Privacy and Data Protection',
        content:
            'We are committed to protecting your privacy and personal health information. Your medical information will be shared only with your chosen healthcare providers and as required by law. We implement industry-standard security measures to protect your data. Please review our Privacy Policy for detailed information about how we collect, use, and protect your information.',
    },
    {
        title: 'Age Requirements and Parental Consent',
        content:
            'You must be at least 18 years old to use eMediHub independently. If you are under 18, a parent or legal guardian must create the account, provide consent, and supervise its use. Parents or guardians are responsible for all activities under accounts they create for minors and must ensure accurate information is provided.',
    },
    {
        title: 'Payment, Billing, and Refund Policy',
        content:
            'You agree to pay all applicable fees for consultations and services as displayed on our platform. Payment is required before or at the time of service. All payments are processed securely through our payment partners. Refunds are provided only in accordance with our refund policy and in cases of technical failures preventing service delivery.',
    },
    {
        title: 'Platform Availability and Technical Limitations',
        content:
            'While we strive to maintain platform availability, we do not guarantee uninterrupted, timely, secure, or error-free service. Technical issues including internet connectivity, device compatibility, or server maintenance may affect your ability to access our services. We are not liable for any damages resulting from service interruptions or technical difficulties.',
    },
    {
        title: 'User Conduct and Community Standards',
        content:
            'You agree to use our platform respectfully and professionally. Do not abuse, harass, threaten, or engage in inappropriate behavior with healthcare providers or other users. Maintain appropriate boundaries during consultations and respect the professional nature of medical consultations. Violation of these standards may result in account suspension or termination.',
    },
    {
        title: 'Account Security and Responsibility',
        content:
            'You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Use strong passwords and do not share your account information with others. Notify us immediately if you suspect unauthorized access to your account. We are not responsible for losses resulting from unauthorized account access due to your negligence.',
    },
    {
        title: 'Prescription and Medication Management',
        content:
            'Prescriptions issued through our platform are valid only when provided by licensed healthcare providers. You are responsible for filling prescriptions at licensed pharmacies and following medication instructions. Do not share medications with others. If you have questions about prescriptions, contact the prescribing healthcare provider or your pharmacist.',
    },
]

const UserTerms = () => {
    return (
        <Container>
            <div className="mb-8 text-center">
                <h2 className="mb-2">Terms & Conditions for Patients</h2>
                <p className="text-gray-500">
                    Terms and conditions for patients and users of eMediHub services
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-2/3">
                    <Card className="mb-6">
                        <div className="p-2 mb-6">
                            <p className="text-sm text-gray-500">
                                Last Updated: March 1, 2024
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="mb-4">
                                Welcome to eMediHub Patient Portal. These Terms and Conditions govern your use 
                                of our telemedicine platform as a patient. By creating an account and using our 
                                services, you agree to these terms. Please read them carefully before using our platform.
                            </p>
                        </div>

                        {userTermsContent.map((section, index) => (
                            <div key={index} className="mb-6">
                                <h5 className="font-semibold mb-2">
                                    {section.title}
                                </h5>
                                <p className="text-gray-600">
                                    {section.content}
                                </p>
                            </div>
                        ))}

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="font-semibold mb-2">Patient Support</h5>
                            <p className="text-gray-600">
                                For patient support and questions about our services, please contact us at:
                                <br />
                                Email: patients@emediub.com
                                <br />
                                Phone: +91 8805047968
                                <br />
                                Patient Support Hours: 24/7 for urgent matters, 8 AM - 8 PM for general inquiries
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="w-full md:w-1/3">
                    <Card className="mb-6">
                        <div className="flex justify-center mb-4">
                            <DoubleSidedImage
                                src="/img/others/patient-terms.png"
                                darkModeSrc="/img/others/patient-terms.png"
                                alt="Patient Terms and Conditions"
                                className="h-48 object-contain"
                            />
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <h6 className="mb-2">Patient Care Support</h6>
                            <p className="text-sm text-gray-600 mb-3">
                                Our patient care team is available to help you navigate our services 
                                and answer any questions about your care.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <span className="flex items-center text-green-600">
                                    <span className="text-lg mr-2">💬</span>
                                    <span className="text-sm">Chat Support</span>
                                </span>
                                <span className="flex items-center text-green-600">
                                    <span className="text-lg mr-2">📞</span>
                                    <span className="text-sm">Call Support</span>
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h6 className="mb-4">Patient Resources</h6>
                        <div className="space-y-3">
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-green-500 text-xl mr-3">🏥</span>
                                <span>How to Use Telemedicine</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-green-500 text-xl mr-3">🔒</span>
                                <span>Privacy Protection</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-green-500 text-xl mr-3">💊</span>
                                <span>Prescription Management</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-green-500 text-xl mr-3">🚨</span>
                                <span>Emergency Guidelines</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-green-500 text-xl mr-3">📋</span>
                                <span>Health Records Access</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default UserTerms 