import { Button } from '@/components/ui'

interface WaitingRoomProps {
    queueStatus: {
        position: number
        estimatedWait: string
    } | null
    onExitQueue: () => void
}

const WaitingRoom = ({ queueStatus, onExitQueue }: WaitingRoomProps) => {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8">
                <h2 className="text-2xl text-white font-bold mb-4">
                    Waiting for your consultation
                </h2>
                {queueStatus && (
                    <div className="mb-4">
                        <p className="text-lg">
                            Your position in queue:{' '}
                            <span className="font-bold">
                                {queueStatus.position}
                            </span>
                        </p>
                        <p className="text-lg">
                            Estimated wait time:{' '}
                            <span className="font-bold">
                                {queueStatus.estimatedWait}
                            </span>
                        </p>
                    </div>
                )}
                <p className="text-gray-400">
                    Please don&apos;t close this window. You&apos;ll be
                    connected with the doctor shortly.
                </p>
                <Button
                    variant="solid"
                    className="mt-4 bg-red-500"
                    onClick={onExitQueue}
                >
                    Leave Queue
                </Button>
            </div>
        </div>
    )
}

export default WaitingRoom 