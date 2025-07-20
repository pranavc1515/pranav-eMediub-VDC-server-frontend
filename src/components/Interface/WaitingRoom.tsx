import { Button, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientOnCallStore } from '@/store/patientOnCallStore'

interface WaitingRoomProps {
    queueStatus: {
        position: number
        estimatedWait: string
        status?: string
        queueLength?: number
        totalInQueue?: number
    } | null
    onExitQueue: () => void
    onBackToPatientSelection?: () => void
}

const WaitingRoom = ({
    queueStatus,
    onExitQueue,
    onBackToPatientSelection,
}: WaitingRoomProps) => {
    const previousPositionRef = useRef<number | null>(null)
    const hasShownNearTurnNotification = useRef(false)
    const navigate = useNavigate()
    const { clearSelectedPatient } = usePatientOnCallStore()

    // Monitor queue position changes and show relevant notifications
    useEffect(() => {
        if (!queueStatus) return

        const currentPosition = queueStatus.position

        // Show notification when position improves (gets closer to front)
        if (
            previousPositionRef.current !== null &&
            previousPositionRef.current > currentPosition &&
            currentPosition > 0
        ) {
            toast.push(
                <Notification type="success" title="Queue Update">
                    You've moved up in the queue! Now position #
                    {currentPosition}
                </Notification>,
            )
        }

        // Show special notification when it's almost the patient's turn
        if (currentPosition === 1 && !hasShownNearTurnNotification.current) {
            toast.push(
                <Notification type="info" title="Almost Your Turn!">
                    You're next in line. The doctor will be with you shortly.
                </Notification>,
            )
            hasShownNearTurnNotification.current = true
        }

        // Show notification when entering consultation
        if (currentPosition === 0 && previousPositionRef.current !== 0) {
            toast.push(
                <Notification type="success" title="Consultation Starting">
                    Your consultation is beginning now. Please wait to be
                    connected...
                </Notification>,
            )
        }

        previousPositionRef.current = currentPosition
    }, [queueStatus?.position])

    // Show notification when estimated wait time improves significantly
    useEffect(() => {
        if (!queueStatus?.estimatedWait) return

        const waitMinutes = parseInt(
            queueStatus.estimatedWait.match(/\d+/)?.[0] || '0',
        )

        // Notify when wait time is very short
        if (waitMinutes <= 5 && queueStatus.position > 0) {
            toast.push(
                <Notification type="info" title="Short Wait">
                    Estimated wait time is only {queueStatus.estimatedWait}.
                    Please stay ready!
                </Notification>,
            )
        }
    }, [queueStatus?.estimatedWait])

    const getPositionColor = (position: number) => {
        if (position === 0) return 'text-green-400'
        if (position <= 3) return 'text-yellow-400'
        return 'text-blue-400'
    }

    const getStatusMessage = (status?: string, position?: number) => {
        if (status === 'in_consultation' || position === 0) {
            return 'You are currently in consultation'
        }
        if (position === 1) {
            return 'You are next in line!'
        }
        return 'Please wait for your turn'
    }

    const handleExitQueue = () => {
        // Clear patient selection when leaving queue
        clearSelectedPatient()

        // Show confirmation before leaving
        toast.push(
            <Notification type="warning" title="Leaving Queue">
                Leaving consultation queue...
            </Notification>,
        )
        onExitQueue()

        // Navigate to /vdc after leaving queue
        navigate('/vdc')
    }

    const handleBackToPatientSelection = () => {
        // Clear patient selection and go back to selection
        clearSelectedPatient()

        // Show info message
        toast.push(
            <Notification type="info" title="Patient Selection">
                Please choose a patient for consultation
            </Notification>,
        )

        if (onBackToPatientSelection) {
            onBackToPatientSelection()
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8 max-w-md">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl text-white font-bold mb-2">
                        Waiting for your consultation
                    </h2>
                </div>

                {queueStatus && (
                    <div className="mb-6">
                        <div className="bg-gray-800 rounded-lg p-4 mb-4">
                            <p className="text-lg mb-2">
                                Your position in queue:{' '}
                                <span
                                    className={`font-bold text-2xl ${getPositionColor(queueStatus.position)}`}
                                >
                                    {queueStatus.position === 0
                                        ? 'In Consultation'
                                        : `#${queueStatus.position}`}
                                </span>
                            </p>

                            {queueStatus.position > 0 && (
                                <p className="text-lg mb-2">
                                    Estimated wait time:{' '}
                                    <span className="font-bold text-blue-400">
                                        {queueStatus.estimatedWait}
                                    </span>
                                </p>
                            )}

                            {queueStatus.queueLength !== undefined && (
                                <p className="text-sm text-gray-300">
                                    {queueStatus.queueLength} patient
                                    {queueStatus.queueLength !== 1
                                        ? 's'
                                        : ''}{' '}
                                    waiting
                                    {queueStatus.totalInQueue &&
                                        queueStatus.totalInQueue >
                                            queueStatus.queueLength &&
                                        ` • ${queueStatus.totalInQueue - queueStatus.queueLength} in consultation`}
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-200">
                                💡{' '}
                                {getStatusMessage(
                                    queueStatus.status,
                                    queueStatus.position,
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <p className="text-gray-400 mb-4">
                    Please don&apos;t close this window. You&apos;ll be
                    connected with the doctor automatically when it&apos;s your
                    turn.
                </p>

                <div className="flex justify-center mt-4">
                    <Button
                        variant="solid"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleExitQueue}
                    >
                        Leave Queue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default WaitingRoom
