import ApiService from './ApiService'
import type { AxiosRequestConfig } from 'axios'

/**
 * Types for Consultation Services
 */
export type ConsultationResponse = {
    success: boolean
    message: string
    consultationId?: string
    roomName?: string
    data?: any
}

export type ConsultationRecord = {
    id: string
    patientId: string
    doctorId: number
    scheduledDate: string
    startTime: string
    endTime: string
    status: 'ongoing' | 'completed' | 'cancelled'
    consultationType: 'video'
    roomName: string
    notes?: string
    doctor?: {
        id: string
        fullName: string
        specialization: string
        profilePhoto: string
    }
}

export type ConsultationHistoryResponse = {
    success: boolean
    count: number
    totalPages: number
    currentPage: number
    data: ConsultationRecord[]
}

/**
 * Consultation Service methods for managing consultation flows
 */
const ConsultationService = {
    /**
     * Start a new consultation session
     */
    startConsultation(doctorId: number, patientId: number) {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/consultation/startConsultation',
            data: { doctorId, patientId },
        }
        return ApiService.fetchDataWithAxios<ConsultationResponse>(config)
    },

    /**
     * Move to the next consultation session for a doctor
     */
    nextConsultation(doctorId: number) {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/consultation/nextConsultation',
            data: { doctorId },
        }
        return ApiService.fetchDataWithAxios<ConsultationResponse>(config)
    },

    /**
     * Fetch consultation history with pagination
     */
    getConsultationHistory(page: number = 1, limit: number = 10) {
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: '/api/consultation/history',
            params: { page, limit },
        }
        return ApiService.fetchDataWithAxios<ConsultationHistoryResponse>(
            config,
        )
    },

    /**
     * Cancel an ongoing or upcoming consultation
     */
    cancelConsultation(consultationId: string, cancelReason: string) {
        const config: AxiosRequestConfig = {
            method: 'DELETE',
            url: `/api/consultation/${consultationId}/cancel`,
            data: { cancelReason },
        }
        return ApiService.fetchDataWithAxios<ConsultationResponse>(config)
    },

    /**
     * End a consultation and optionally provide notes
     */
    endConsultation(consultationId: string, notes?: string) {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: `/api/consultation/${consultationId}/end`,
            data: { notes },
        }
        return ApiService.fetchDataWithAxios<ConsultationResponse>(config)
    },
}

export default ConsultationService
