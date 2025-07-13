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

const TermsConditions = () => {
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
                <h2 className="mb-2">Terms & Conditions</h2>
                <p className="text-gray-500">
                    Please read these terms and conditions carefully before
                    using our services
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
