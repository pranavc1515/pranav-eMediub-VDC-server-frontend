import ApiService from './ApiService'

export type Medicine = {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes: string
}

export type Prescription = {
    id: string
    consultationId: string
    doctorId: number
    userId: number
    medicines: Medicine[]
    instructions: string
    fileUrl?: string
    createdAt: string
    updatedAt: string
}

export type PrescriptionResponse = {
    success: boolean
    data: Prescription
    message?: string
}

export type PrescriptionListResponse = {
    success: boolean
    data: {
        prescriptions: Prescription[]
        total: number
        page: number
        limit: number
    }
    message?: string
}

export type CreateCustomPrescriptionPayload = {
    medicines: Medicine[]
    instructions: string
    patientName?: string
    patientId?: string
}

const PrescriptionService = {
    /**
     * Upload a prescription file for a consultation
     */
    uploadPrescription(consultationId: string, file: File, doctorId?: number, userId?: number) {
        const formData = new FormData()
        formData.append('file', file)

        let url = `/api/prescriptions/upload/${consultationId}`
        if (doctorId) {
            url += `?doctorId=${doctorId}`
            if (userId) url += `&userId=${userId}`
        } else if (userId) {
            url += `?userId=${userId}`
        }

        return ApiService.fetchDataWithAxios<PrescriptionResponse>({
            url,
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Create a custom prescription for a consultation
     */
    createCustomPrescription(
        consultationId: string,
        data: CreateCustomPrescriptionPayload,
        doctorId?: number,
        userId?: number
    ) {
        let url = `/api/prescriptions/custom/${consultationId}`
        if (doctorId) {
            url += `?doctorId=${doctorId}`
            if (userId) url += `&userId=${userId}`
        } else if (userId) {
            url += `?userId=${userId}`
        }

        return ApiService.fetchDataWithAxios<PrescriptionResponse>({
            url,
            method: 'POST',
            data,
        })
    },

    /**
     * Get prescriptions for a patient
     */
    getPatientPrescriptions(userId: number, page: number = 1, limit: number = 10) {
        return ApiService.fetchDataWithAxios<PrescriptionListResponse>({
            url: `/api/prescriptions/patient/me?userId=${userId}&page=${page}&limit=${limit}`,
            method: 'GET',
        })
    },

    /**
     * Get prescriptions created by a doctor
     */
    getDoctorPrescriptions(doctorId: number, page: number = 1, limit: number = 10) {
        return ApiService.fetchDataWithAxios<PrescriptionListResponse>({
            url: `/api/prescriptions/doctor/me?doctorId=${doctorId}&page=${page}&limit=${limit}`,
            method: 'GET',
        })
    },

    /**
     * Get prescriptions for a specific consultation
     */
    getConsultationPrescriptions(consultationId: string) {
        return ApiService.fetchDataWithAxios<PrescriptionListResponse>({
            url: `/api/prescriptions/consultation/${consultationId}`,
            method: 'GET',
        })
    },

    /**
     * Get prescription by ID
     */
    getPrescriptionById(id: string) {
        return ApiService.fetchDataWithAxios<PrescriptionResponse>({
            url: `/api/prescriptions/${id}`,
            method: 'GET',
        })
    },

    /**
     * Delete a prescription
     */
    deletePrescription(id: string, doctorId?: number) {
        let url = `/api/prescriptions/${id}`
        if (doctorId) url += `?doctorId=${doctorId}`

        return ApiService.fetchDataWithAxios<{ success: boolean; message: string }>({
            url,
            method: 'DELETE',
        })
    },
}

export default PrescriptionService 