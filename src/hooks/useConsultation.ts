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
    getDoctorHistory: (page?: number, limit?: number) => Promise<void>
    getPatientHistory: (patientId: number, page?: number, limit?: number) => Promise<void>
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



    const getDoctorHistory = useCallback(
        async (page: number = 1, limit: number = 15): Promise<void> => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await ConsultationService.getDoctorConsultationHistory(
                    doctorId,
                    page,
                    limit,
                )
                if (response.success) {
                    setConsultationHistory(response.consultations)
                    setPagination({
                        currentPage: response.currentPage,
                        totalPages: response.totalPages,
                        totalCount: response.count,
                    })
                } else {
                    setError('Failed to fetch consultation history')
                }
            } catch (err) {
                handleError(err as AxiosError<ApiErrorData>)
            } finally {
                setIsLoading(false)
            }
        },
        [doctorId],
    )

    const getPatientHistory = useCallback(
        async (patientId: number, page: number = 1, limit: number = 15): Promise<void> => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await ConsultationService.getPatientConsultationHistory(
                    patientId,
                    page,
                    limit,
                )
                if (response.success) {
                    setConsultationHistory(response.consultations)
                    setPagination({
                        currentPage: response.currentPage,
                        totalPages: response.totalPages,
                        totalCount: response.count,
                    })
                } else {
                    setError('Failed to fetch patient consultation history')
                }
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
        getDoctorHistory,
        getPatientHistory,
        cancelConsultation,
        endConsultation,
    }
}

export default useConsultation
