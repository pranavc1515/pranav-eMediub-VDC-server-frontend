import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'

const termsContent = [
    {
        title: 'Acceptance of Terms',
        content:
            'By accessing or using the eMediHub application, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application.',
    },
    {
        title: 'Use of Services',
        content:
            'The eMediHub platform is designed to facilitate communication between medical professionals and patients. The information provided through our service is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
    },
    {
        title: 'Video Consultation',
        content:
            'Video consultations are provided on an as-is basis. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free. You understand that technical problems may delay or prevent you from accessing the service. We are not responsible for any issues that may arise due to internet connectivity, device compatibility, or other technical limitations.',
    },
    {
        title: 'Privacy Policy',
        content:
            'Your use of the eMediHub service is also governed by our Privacy Policy, which is incorporated here by reference. We are committed to protecting your personal and medical information with the highest levels of security and confidentiality in compliance with applicable healthcare regulations.',
    },
    {
        title: 'Liability Limitations',
        content:
            'To the maximum extent permitted by law, in no event shall eMediHub, its affiliates, or service providers be liable for any indirect, punitive, incidental, special, consequential damages, or any damages whatsoever including, without limitation, damages for loss of use, data, or profits, arising out of or in any way connected with the use or performance of the service.',
    },
    {
        title: 'User Accounts',
        content:
            'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.',
    },
    {
        title: 'Medical Reports',
        content:
            'Any medical reports generated through the eMediHub platform are provided for informational purposes and should be reviewed by appropriate healthcare professionals. We do not guarantee the accuracy, completeness, or usefulness of any medical report generated through our service.',
    },
    {
        title: 'Termination',
        content:
            'We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms and Conditions. Upon termination, your right to use the service will immediately cease.',
    },
    {
        title: 'Changes to Terms',
        content:
            'We reserve the right to modify or replace these Terms and Conditions at any time. It is your responsibility to check these Terms and Conditions periodically for changes. Your continued use of the service following the posting of any changes constitutes acceptance of those changes.',
    },
]

const TermsConditions = () => {
    return (
        <Container>
            <div className="mb-8 text-center">
                <h2 className="mb-2">Terms & Conditions</h2>
                <p className="text-gray-500">
                    Please read these terms and conditions carefully before
                    using our services
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
                                Welcome to eMediHub. These Terms and Conditions
                                govern your use of our virtual doctor
                                consultation platform and services, including
                                our mobile application and website. By using our
                                services, you agree to these terms.
                            </p>
                        </div>

                        {termsContent.map((section, index) => (
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
                            <h5 className="font-semibold mb-2">Contact Us</h5>
                            <p className="text-gray-600">
                                If you have any questions about these Terms and
                                Conditions, please contact us at:
                                <br />
                                Email: support@emediub.com
                                <br />
                                Phone: +91 8805047968
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="w-full md:w-1/3">
                    <Card className="mb-6">
                        <div className="flex justify-center mb-4">
                            <DoubleSidedImage
                                src="/img/others/terms-conditions-illustration_116137-562.avif"
                                darkModeSrc="/img/others/terms-conditions-illustration_116137-562.avif"
                                alt="Terms and Conditions"
                                className="h-48 object-contain"
                            />
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <h6 className="mb-2">Need Assistance?</h6>
                            <p className="text-sm text-gray-600 mb-3">
                                Our customer support team is available to help
                                you with any questions about our terms.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <span className="flex items-center text-primary-500">
                                    <span className="icon-mail text-lg mr-2"></span>
                                    <span className="text-sm">
                                        Email Support
                                    </span>
                                </span>
                                <span className="flex items-center text-primary-500">
                                    <span className="icon-phone text-lg mr-2"></span>
                                    <span className="text-sm">
                                        Call Support
                                    </span>
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h6 className="mb-4">Related Documents</h6>
                        <div className="space-y-3">
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="icon-document text-primary-500 text-xl mr-3"></span>
                                <span>Privacy Policy</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="icon-shield text-primary-500 text-xl mr-3"></span>
                                <span>Data Protection Policy</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="icon-info text-primary-500 text-xl mr-3"></span>
                                <span>Cookie Policy</span>
                            </div>
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="icon-warning text-primary-500 text-xl mr-3"></span>
                                <span>Disclaimer</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default TermsConditions
