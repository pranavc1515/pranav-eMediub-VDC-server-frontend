import ApiService from './ApiService'
import type { AxiosRequestConfig } from 'axios'

/**
 * Types for Consultation Services
 */
export type ConsultationResponse = {
    success: boolean
    message?: string
    error?: string
    consultationId?: string
    roomName?: string
    doctorId?: number
    patientId?: number
    data?: any
}

export type ConsultationStatusResponse = {
    success: boolean
    message?: string
    status?: string
    action?: 'rejoin' | 'ended' | 'none' | 'wait' | 'joined' | 'in_consultation' | 'conflict'
    consultationId?: string
    roomName?: string
    position?: number
    estimatedWait?: string
    queueLength?: number
    totalInQueue?: number
}

export type RejoinResponse = {
    success: boolean
    message: string
    consultationId?: string
    roomName?: string
    doctorId?: number
    patientId?: number
    action?: string
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
    prescription?: string
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
    pageSize: number
    consultations: ConsultationRecord[]
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
     * Check consultation status for reconnection handling
     */
    checkConsultationStatus(doctorId: number, patientId: number, autoJoin: boolean = true) {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/consultation/checkStatus',
            data: { doctorId, patientId, autoJoin },
        }
        return ApiService.fetchDataWithAxios<ConsultationStatusResponse>(config)
    },

    /**
     * Rejoin an existing consultation
     */
    rejoinConsultation(consultationId: string, userId: string, userType: 'doctor' | 'patient') {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/consultation/rejoin',
            data: { consultationId, userId, userType },
        }
        return ApiService.fetchDataWithAxios<RejoinResponse>(config)
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

    /**
     * End consultation by doctor
     */
    endConsultationByDoctor(consultationId: string | number, doctorId: number, notes?: string) {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/consultation/endConsultation',
            data: { 
                consultationId: parseInt(consultationId.toString()), 
                doctorId: parseInt(doctorId.toString()), 
                notes 
            },
        }
        return ApiService.fetchDataWithAxios<ConsultationResponse>(config)
    },

    /**
     * Get consultation history for a doctor
     */
    getDoctorConsultationHistory(doctorId: number, page: number = 1, limit: number = 15) {
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `/api/consultation/doctor/${doctorId}/history`,
            params: { page, limit },
        }
        return ApiService.fetchDataWithAxios<ConsultationHistoryResponse>(config)
    },

    /**
     * Get consultation history for a patient
     */
    getPatientConsultationHistory(patientId: number, page: number = 1, limit: number = 15) {
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `/api/consultation/patient/${patientId}/history`,
            params: { page, limit },
        }
        return ApiService.fetchDataWithAxios<ConsultationHistoryResponse>(config)
    },

    /**
     * Get doctor consultation history
     */
    getDoctorHistory(doctorId: number, page: number = 1, limit: number = 15) {
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `/api/consultation/doctor/${doctorId}/history?page=${page}&limit=${limit}`,
        }
        return ApiService.fetchDataWithAxios<{
            success: boolean
            consultations: ConsultationRecord[]
            totalCount: number
            totalPages: number
            currentPage: number
            pageSize: number
        }>(config)
    },

    /**
     * Get patient consultation history
     */
    getPatientHistory(patientId: number, page: number = 1, limit: number = 15) {
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `/api/consultation/patient/${patientId}/history?page=${page}&limit=${limit}`,
        }
        return ApiService.fetchDataWithAxios<{
            success: boolean
            consultations: ConsultationRecord[]
            totalCount: number
            totalPages: number
            currentPage: number
            pageSize: number
        }>(config)
    },
}

export default ConsultationService
