import React from 'react'
import { Button } from '@/components/ui'
import { FaCheckCircle, FaNotesMedical, FaHeart } from 'react-icons/fa'

interface ConsultationCompleteProps {
    onRedirectToPrescriptions: () => void
}

const ConsultationComplete: React.FC<ConsultationCompleteProps> = ({
    onRedirectToPrescriptions,
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-[30]">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-700">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                        <FaCheckCircle className="text-green-400 text-4xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Consultation Complete!
                    </h1>
                    <p className="text-gray-300">
                        Thank you for using our Video Consultation  service
                    </p>
                </div>

                {/* Message */}
                <div className="mb-8 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-center mb-2">
                        <FaHeart className="text-red-400 mr-2" />
                        <span className="text-sm font-medium text-gray-200">
                            We hope you feel better soon!
                        </span>
                    </div>
                    <p className="text-sm text-gray-300">
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
                        onClick={onRedirectToPrescriptions}
                    >
                        View My Prescriptions
                    </Button>

                    <p className="text-xs text-gray-400 mt-4">
                        You can always access your consultation history and
                        prescriptions from your dashboard
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-20">
                    <FaNotesMedical className="text-blue-400 text-2xl" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                    <FaHeart className="text-red-400 text-xl" />
                </div>
            </div>
        </div>
    )
}

export default ConsultationComplete
