import ApiService from './ApiService'

export interface MedicalDetails {
    id?: number
    user_id?: number
    doctor_id?: number | null
    uploaded_by?: string | null
    related_user?: number | null
    doctor_name?: string | null
    report_date?: string | null
    report_reason?: string | null
    report_analysis?: string | null
    report_pdf?: string | null
    food_allergies?: string
    drug_allergies?: string
    blood_group?: string
    implants?: string
    surgeries?: string
    family_medical_history?: string
    smoking_habits?: string
    alcohol_consumption?: string
    physical_activity?: string
    created_at?: string
    updated_at?: string
}

export interface MedicalDetailsResponse {
    status: boolean
    status_code: number
    message: string
    data: MedicalDetails
}

export interface UpdateMedicalDetailsRequest extends Record<string, unknown> {
    blood_group?: string
    food_allergies?: string
    drug_allergies?: string
    implants?: string
    surgeries?: string
    family_medical_history?: string
    smoking_habits?: string
    alcohol_consumption?: string
    physical_activity?: string
}

export interface UpdateMedicalDetailsResponse {
    status: boolean
    status_code: number
    message: string
    data: Partial<MedicalDetails>
}

const MedicalDetailsService = {
    /**
     * Get patient's medical details
     * GET /api/patients/medical-details
     */
    getMedicalDetails() {
        return ApiService.fetchDataWithAxios<MedicalDetailsResponse>({
            url: '/api/patients/medical-details',
            method: 'GET',
        })
    },

    /**
     * Update patient's medical details
     * POST /api/patients/medical-details
     */
    updateMedicalDetails(data: UpdateMedicalDetailsRequest) {
        return ApiService.fetchDataWithAxios<UpdateMedicalDetailsResponse>({
            url: '/api/patients/medical-details',
            method: 'POST',
            data,
        })
    }
}

export default MedicalDetailsService 