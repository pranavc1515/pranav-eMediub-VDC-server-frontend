import { useState, useCallback } from 'react'
import ConsultationService, {
    ConsultationResponse,
    ConsultationRecord,
} from '@/services/ConsultationService'
import { AxiosError } from 'axios'

interface ApiErrorData {
    message: string
    success: boolean
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalCount: number
}

interface UseConsultationProps {
    doctorId: number
}

interface UseConsultationReturn {
    isLoading: boolean
    error: string | null
    consultationHistory: ConsultationRecord[]
    pagination: PaginationInfo
    startConsultation: (patientId: number) => Promise<ConsultationResponse>
    nextConsultation: () => Promise<ConsultationResponse>
    getHistory: (page?: number, limit?: number) => Promise<void>
    cancelConsultation: (
        consultationId: string,
        reason: string,
    ) => Promise<ConsultationResponse>
    endConsultation: (
        consultationId: string,
        notes?: string,
    ) => Promise<ConsultationResponse>
}

const useConsultation = ({
    doctorId,
}: UseConsultationProps): UseConsultationReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [consultationHistory, setConsultationHistory] = useState<
        ConsultationRecord[]
    >([])
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    })

    const handleError = (error: AxiosError<ApiErrorData>) => {
        const message = error.response?.data?.message || 'An error occurred'
        setError(message)
        console.error('Consultation error:', message)
    }

    const startConsultation = async (
        patientId: number,
    ): Promise<ConsultationResponse> => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await ConsultationService.startConsultation(
                doctorId,
                patientId,
            )
            return response
        } catch (err) {
            handleError(err as AxiosError<ApiErrorData>)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const nextConsultation = async (): Promise<ConsultationResponse> => {
        try {
            setIsLoading(true)
            setError(null)
            const response =
                await ConsultationService.nextConsultation(doctorId)
            return response
        } catch (err) {
            handleError(err as AxiosError<ApiErrorData>)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const getHistory = useCallback(
        async (page: number = 1, limit: number = 10): Promise<void> => {
            try {
                setIsLoading(true)
                setError(null)
                const response =
                    await ConsultationService.getConsultationHistory(
                        page,
                        limit,
                    )
                setConsultationHistory(response.data)
                setPagination({
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    totalCount: response.count,
                })
            } catch (err) {
                handleError(err as AxiosError<ApiErrorData>)
            } finally {
                setIsLoading(false)
            }
        },
        [],
    )

    const cancelConsultation = async (
        consultationId: string,
        reason: string,
    ): Promise<ConsultationResponse> => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await ConsultationService.cancelConsultation(
                consultationId,
                reason,
            )
            return response
        } catch (err) {
            handleError(err as AxiosError<ApiErrorData>)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const endConsultation = async (
        consultationId: string,
        notes?: string,
    ): Promise<ConsultationResponse> => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await ConsultationService.endConsultation(
                consultationId,
                notes,
            )
            return response
        } catch (err) {
            handleError(err as AxiosError<ApiErrorData>)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        consultationHistory,
        pagination,
        startConsultation,
        nextConsultation,
        getHistory,
        cancelConsultation,
        endConsultation,
    }
}

export default useConsultation
