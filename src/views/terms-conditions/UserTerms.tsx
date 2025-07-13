import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { useEffect, useState } from 'react'
import { fetchUserTerms } from '@/services/CommonService'
import Loading from '@/components/shared/Loading'

interface TermsResponse {
    status: boolean
    status_code: number
    message: string
    data: {
        content: string
    }
}

const UserTerms = () => {
    const [termsContent, setTermsContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const getTerms = async () => {
            try {
                setLoading(true)
                const response = await fetchUserTerms() as TermsResponse
                if (response?.status && response?.data?.content) {
                    setTermsContent(response.data.content)
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

        getTerms()
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
                <h2 className="mb-2">Terms & Conditions for Patients</h2>
                <p className="text-gray-500">
                    Terms and conditions for patients and users of eMediHub services
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-2/3">
                    <Card className="mb-6">
                        <div className="p-6">
                            <div 
                                className="terms-content" 
                                dangerouslySetInnerHTML={{ __html: termsContent }}
                            />
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