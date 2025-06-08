import { useEffect, useState, useCallback } from 'react'
import PatientQueueService, { PatientQueueEntry } from '@/services/PatientQueue'

interface UsePatientQueueProps {
    doctorId: number
}

interface LeaveQueueParams {
    patientId: number
}

interface JoinQueueParams {
    patientId: number
}

interface QueuePositionInfo {
    position: number
    estimatedWait: string
    roomName: string
}

const usePatientQueue = ({ doctorId }: UsePatientQueueProps) => {
    const [queue, setQueue] = useState<PatientQueueEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [positionInfo, setPositionInfo] = useState<QueuePositionInfo | null>(
        null,
    )

    const fetchQueue = useCallback(async () => {
        try {
            setLoading(true)
            const response = await PatientQueueService.getPatientQueue(doctorId)
            if (response.success) {
                setQueue(response.data.queue)
                setError(null)
            } else {
                setError(response.message || 'Failed to load queue')
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error')
        } finally {
            setLoading(false)
        }
    }, [doctorId])

    const joinQueue = async ({ patientId }: JoinQueueParams) => {
        try {
            setLoading(true)
            const response = await PatientQueueService.joinQueue(
                patientId,
                doctorId,
            )
            if (response.success) {
                setPositionInfo({
                    position: response.position,
                    estimatedWait: response.estimatedWait,
                    roomName: response.roomName,
                })
                setError(null)
                return response
            } else {
                setError(response.message || 'Failed to join queue')
                return null
            }
        } catch (err: Error) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unexpected error'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const leaveQueue = async ({ patientId }: LeaveQueueParams) => {
        try {
            setLoading(true)
            const response = await PatientQueueService.leaveQueue(
                patientId,
                doctorId,
            )
            if (response.success) {
                setQueue(response.data)
                setError(null)
            } else {
                setError(response.message || 'Failed to leave queue')
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error')
        } finally {
            setLoading(false)
        }
    }

    return {
        queue,
        loading,
        error,
        positionInfo,
        fetchQueue,
        joinQueue,
        leaveQueue,
    }
}

export default usePatientQueue
