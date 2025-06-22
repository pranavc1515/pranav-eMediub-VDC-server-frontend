import React from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import ScrollBar from '@/components/ui/ScrollBar'

interface TermsAndConditionsModalProps {
    isOpen: boolean
    onClose: () => void
    onAccept: () => void
    userType: 'user' | 'doctor'
}

const DOCTOR_TERMS = `
TERMS AND CONDITIONS FOR DOCTORS

1. Professional Conduct
You agree to maintain the highest standards of professional conduct and ethics while using our platform. You must provide accurate medical information and maintain patient confidentiality at all times.

2. Medical License Verification
You must have a valid medical license to practice in your jurisdiction. You agree to provide accurate licensing information and notify us immediately of any changes to your license status.

3. Telemedicine Regulations
You acknowledge and agree to comply with all applicable telemedicine regulations in your jurisdiction. You are responsible for determining whether telemedicine is appropriate for each patient interaction.

4. Patient Privacy and HIPAA Compliance
You agree to protect patient privacy and comply with all applicable privacy laws, including HIPAA. You will not share patient information outside of the platform without proper authorization.

5. Prescription Guidelines
Any prescriptions issued through the platform must comply with local regulations and medical standards. You are solely responsible for all prescriptions issued.

6. Platform Usage
You agree to use the platform only for legitimate medical consultations and not for any illegal or unauthorized purposes.

7. Liability
You acknowledge that you are solely responsible for your medical advice and treatment recommendations. The platform serves only as a communication medium.

8. Data Security
You agree to take reasonable measures to protect patient data and maintain secure login credentials.

By accepting these terms, you confirm that you have read, understood, and agree to be bound by these terms and conditions.
`

const USER_TERMS = `
TERMS AND CONDITIONS FOR USERS

1. Medical Disclaimer
This platform provides a means to connect with licensed healthcare providers. The platform itself does not provide medical advice, diagnosis, or treatment.

2. User Responsibilities
You agree to provide accurate health information to healthcare providers. You are responsible for following the medical advice given by licensed professionals.

3. Emergency Situations
This platform is not intended for emergency medical situations. In case of a medical emergency, please contact emergency services immediately.

4. Privacy and Data Protection
We are committed to protecting your privacy. Your medical information will be shared only with your chosen healthcare providers and as required by law.

5. Age Requirements
You must be at least 18 years old to use this platform. If you are under 18, a parent or guardian must create the account and supervise its use.

6. Payment and Billing
You agree to pay all applicable fees for consultations and services. All payments are non-refundable unless otherwise specified.

7. Platform Availability
We strive to maintain platform availability but do not guarantee uninterrupted service. We are not liable for any damages resulting from service interruptions.

8. User Conduct
You agree to use the platform respectfully and not to abuse, harass, or threaten healthcare providers or other users.

9. Data Security
You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.

By accepting these terms, you confirm that you have read, understood, and agree to be bound by these terms and conditions.
`

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
    isOpen,
    onClose,
    onAccept,
    userType,
}) => {
    const terms = userType === 'doctor' ? DOCTOR_TERMS : USER_TERMS
    const title = `Terms and Conditions - ${userType === 'doctor' ? 'Healthcare Providers' : 'Patients'}`

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ScrollBar className="max-h-96 mb-6">
                    <div className="whitespace-pre-line text-sm leading-relaxed pr-4">
                        {terms}
                    </div>
                </ScrollBar>
                <div className="flex gap-3 justify-end">
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="solid" onClick={onAccept}>
                        Accept Terms
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default TermsAndConditionsModal 