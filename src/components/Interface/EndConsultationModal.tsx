import React from 'react'
import { Button } from '@/components/ui'
import { FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa'

interface EndConsultationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

const EndConsultationModal: React.FC<EndConsultationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <FaExclamationTriangle className="text-red-600 text-lg" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            End Consultation
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-gray-700 mb-4 text-center">
                        Are you sure you want to end this consultation?
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-center">
                            <p className="text-sm text-blue-800 font-medium mb-2">
                                This will complete the consultation session
                            </p>
                            <p className="text-xs text-blue-600">
                                The patient will be notified and redirected to view their consultation summary
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        icon={isLoading ? <FaSpinner className="animate-spin" /> : undefined}
                    >
                        {isLoading ? 'Ending...' : 'Yes, End Consultation'}
                    </Button>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    Make sure you have completed all necessary documentation before ending the consultation.
                </p>
            </div>
        </div>
    )
}

export default EndConsultationModal 