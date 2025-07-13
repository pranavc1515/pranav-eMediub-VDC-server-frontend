import React, { useEffect } from 'react'
import { Button, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { FaCheckCircle, FaNotesMedical, FaHeart } from 'react-icons/fa'

interface ConsultationCompleteProps {
    onRedirectToReport: () => void
}

const ConsultationComplete: React.FC<ConsultationCompleteProps> = ({
    onRedirectToReport,
}) => {
    // Show welcome completion notification when component mounts
    useEffect(() => {
        toast.push(
            <Notification type="success" title="Consultation Complete">
                Your video consultation has been successfully completed. Thank you for using our service!
            </Notification>
        )
    }, [])

    const handleRedirectToReport = () => {
        toast.push(
            <Notification type="info" title="Viewing Reports">
                Redirecting to your consultation reports and prescriptions...
            </Notification>
        )
        onRedirectToReport()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-[30]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center border border-gray-200">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
                        <FaCheckCircle className="text-green-600 text-4xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Consultation Complete!
                    </h1>
                    <p className="text-gray-600">
                        Thank you for using our Video Consultation service
                    </p>
                </div>

                {/* Message */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center mb-2">
                        <FaHeart className="text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-800">
                            We hope you feel better soon!
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Your consultation has been successfully completed. The
                        doctor may have provided prescriptions or
                        recommendations for you.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        variant="solid"
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-lg transition-all duration-200"
                        icon={<FaNotesMedical />}
                        onClick={handleRedirectToReport}
                    >
                        View Medical Reports
                    </Button>

                    <p className="text-xs text-gray-500 mt-4">
                        You can always access your consultation history and
                        prescriptions from your dashboard
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-20">
                    <FaNotesMedical className="text-blue-500 text-2xl" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                    <FaHeart className="text-red-500 text-xl" />
                </div>
            </div>
        </div>
    )
}

export default ConsultationComplete
