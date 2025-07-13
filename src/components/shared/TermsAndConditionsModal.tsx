import React, { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import ScrollBar from '@/components/ui/ScrollBar'
import { fetchUserTerms } from '@/services/CommonService'
import Loading from '@/components/shared/Loading'

interface TermsAndConditionsModalProps {
    isOpen: boolean
    onClose: () => void
    onAccept: () => void
    userType: 'user' | 'doctor'
}

interface TermsResponse {
    status: boolean
    status_code: number
    message: string
    data: {
        content: string
    }
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

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
    isOpen,
    onClose,
    onAccept,
    userType,
}) => {
    const [userTerms, setUserTerms] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Only fetch user terms when modal is open and userType is 'user'
        if (isOpen && userType === 'user') {
            const fetchTerms = async () => {
                try {
                    setLoading(true)
                    const response = await fetchUserTerms() as TermsResponse
                    if (response?.status && response?.data?.content) {
                        // Extract text content from HTML
                        const tempDiv = document.createElement('div')
                        tempDiv.innerHTML = response.data.content
                        const textContent = tempDiv.textContent || tempDiv.innerText || ''
                        setUserTerms(textContent)
                    } else {
                        setError('Failed to load terms and conditions')
                    }
                } catch (err) {
                    console.error('Error fetching terms:', err)
                    setError('Failed to load terms and conditions')
                } finally {
                    setLoading(false)
                }
            }

            fetchTerms()
        }
    }, [isOpen, userType])

    const terms = userType === 'doctor' ? DOCTOR_TERMS : userTerms || 'Loading terms and conditions...'
    const title = `Terms and Conditions - ${userType === 'doctor' ? 'Healthcare Providers' : 'Patients'}`

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ScrollBar className="max-h-96 mb-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loading loading={true} />
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : (
                        <div className="whitespace-pre-line text-sm leading-relaxed pr-4">
                            {terms}
                        </div>
                    )}
                </ScrollBar>
                <div className="flex gap-3 justify-end">
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="solid" onClick={onAccept} disabled={loading || !!error}>
                        Accept Terms
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default TermsAndConditionsModal 