import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'

const doctorTermsContent = [
    {
        title: 'Professional Conduct and Ethics',
        content:
            'As a healthcare provider using eMediHub, you agree to maintain the highest standards of professional conduct and medical ethics. You must provide accurate medical information, maintain patient confidentiality at all times, and adhere to your professional code of ethics. Any violation of medical ethics will result in immediate suspension from our platform.',
    },
    {
        title: 'Medical License Verification',
        content:
            'You must possess a valid medical license to practice in your jurisdiction and specialty. You agree to provide accurate licensing information during registration and notify us immediately of any changes to your license status, including suspensions, revocations, or restrictions. We reserve the right to verify your credentials at any time.',
    },
    {
        title: 'Telemedicine Regulations and Compliance',
        content:
            'You acknowledge and agree to comply with all applicable telemedicine regulations in your jurisdiction, including but not limited to state medical board requirements, HIPAA, and other healthcare privacy laws. You are solely responsible for determining whether telemedicine is appropriate for each patient interaction and must obtain proper informed consent.',
    },
    {
        title: 'Patient Privacy and HIPAA Compliance',
        content:
            'You agree to protect patient privacy and comply with all applicable privacy laws, including HIPAA, GDPR, and local healthcare data protection regulations. You will not share patient information outside of our secure platform without proper authorization. All patient communications must be conducted through our encrypted channels.',
    },
    {
        title: 'Prescription Guidelines and Responsibilities',
        content:
            'Any prescriptions issued through our platform must comply with local regulations, medical standards, and controlled substance laws. You are solely responsible for all prescriptions issued and must maintain proper documentation. Prescribing controlled substances through telemedicine is subject to additional regulations and restrictions.',
    },
    {
        title: 'Clinical Documentation and Record Keeping',
        content:
            'You must maintain accurate and complete medical records for all patient interactions conducted through our platform. Documentation should meet the same standards as in-person consultations and must be available for review by relevant authorities when required. Records must be retained according to applicable legal requirements.',
    },
    {
        title: 'Platform Usage and Professional Boundaries',
        content:
            'You agree to use our platform only for legitimate medical consultations and not for any illegal, unauthorized, or unprofessional purposes. Maintain appropriate professional boundaries with patients and do not engage in any form of harassment, discrimination, or inappropriate behavior.',
    },
    {
        title: 'Malpractice Insurance and Liability',
        content:
            'You are required to maintain adequate professional liability insurance that covers telemedicine services. You acknowledge that you are solely responsible for your medical advice, diagnoses, and treatment recommendations. eMediHub serves only as a communication platform and assumes no liability for medical decisions or outcomes.',
    },
    {
        title: 'Quality Assurance and Peer Review',
        content:
            'You agree to participate in quality assurance programs, peer reviews, and continuing education requirements as established by eMediHub. We reserve the right to monitor consultations for quality assurance purposes and to ensure compliance with medical standards and platform policies.',
    },
    {
        title: 'Compensation and Billing',
        content:
            'Compensation for services will be processed according to our payment terms. You are responsible for reporting income and paying applicable taxes. Any disputes regarding compensation must be reported within 30 days of the consultation date.',
    },
]

const DoctorTerms = () => {
    return (
        <Container>
            <div className="mb-8 text-center">
                <h2 className="mb-2">Terms & Conditions for Healthcare Providers</h2>
                <p className="text-gray-500">
                    Specific terms and conditions for doctors and healthcare professionals using eMediHub
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
                                Welcome to eMediHub Healthcare Providers Portal. These Terms and Conditions 
                                specifically govern healthcare professionals' use of our telemedicine platform. 
                                By registering as a healthcare provider, you agree to these professional terms 
                                in addition to our general terms of service.
                            </p>
                        </div>

                        {doctorTermsContent.map((section, index) => (
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
                            <h5 className="font-semibold mb-2">Professional Support</h5>
                            <p className="text-gray-600">
                                For professional support and compliance questions, please contact us at:
                                <br />
                                Email: providers@emediub.com
                                <br />
                                Phone: +91 8805047968
                                <br />
                                Professional Support Hours: 9 AM - 6 PM (Mon-Fri)
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="w-full md:w-1/3">
                    <Card className="mb-6">
                        <div className="flex justify-center mb-4">
                            <DoubleSidedImage
                                src="/img/others/doctor-terms.png"
                                darkModeSrc="/img/others/doctor-terms.png"
                                alt="Healthcare Provider Terms"
                                className="h-48 object-contain"
                            />
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <h6 className="mb-2">Professional Compliance</h6>
                            <p className="text-sm text-gray-600 mb-3">
                                Our compliance team is available to assist with regulatory questions 
                                and professional standards.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <span className="flex items-center text-blue-600">
                                    <span className="text-lg mr-2">📋</span>
                                    <span className="text-sm">Compliance</span>
                                </span>
                                <span className="flex items-center text-blue-600">
                                    <span className="text-lg mr-2">📞</span>
                                    <span className="text-sm">Support</span>
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h6 className="mb-4">Professional Resources</h6>
                        <div className="space-y-3">
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-blue-500 text-xl mr-3">📋</span>
                                <span>Medical Guidelines</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-blue-500 text-xl mr-3">🔒</span>
                                <span>HIPAA Compliance</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-blue-500 text-xl mr-3">📜</span>
                                <span>License Verification</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-blue-500 text-xl mr-3">⚖️</span>
                                <span>Professional Liability</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default DoctorTerms 