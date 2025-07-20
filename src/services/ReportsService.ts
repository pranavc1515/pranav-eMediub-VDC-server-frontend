import ApiService from './ApiService'

export interface ReportResponse {
    status: boolean
    status_code: number
    message: string
    file_size?: string
    total_usage?: string
    show_warning?: boolean
    show_upgrade_popup?: boolean
    data?: {
        selfReports: ReportData[]
        familyReports: ReportData[]
    }
}

export interface ReportData {
    id: number
    user_id: number
    doctor_id: number
    uploaded_by: string | null
    related_user: number | null
    doctor_name: string
    report_date: string
    report_reason: string | null
    report_analysis: string | null
    report_pdf: string
    food_allergies: string | null
    drug_allergies: string | null
    blood_group: string | null
    implants: string | null
    surgeries: string | null
    family_medical_history: string | null
    created_at: string
    updated_at: string
    patient_name: string
    type?: string
}

export interface UploadReportRequest {
    report_pdf: File[]
    report_date: string
    doctor_name: string
    report_analysis?: string
    target_user_id?: number
    doctor_id?: number
}

export interface EditReportRequest {
    report_pdf?: File[]
    report_title?: string
    report_type?: string
    report_date?: string
    doctor_name?: string
    report_analysis?: string
    target_user_id?: number
    doctor_id?: number
}

const ReportsService = {
    /**
     * Upload one or more medical reports
     * POST /api/reports/upload
     */
    uploadReports(data: UploadReportRequest) {
        const formData = new FormData()
        
        // Append PDF files
        data.report_pdf.forEach((file) => {
            formData.append('report_pdf', file)
        })
        
        // Append other form data
        formData.append('report_date', data.report_date)
        formData.append('doctor_name', data.doctor_name)
        
        if (data.report_analysis) {
            formData.append('report_analysis', data.report_analysis)
        }
        
        if (data.target_user_id) {
            formData.append('target_user_id', data.target_user_id.toString())
        }
        
        if (data.doctor_id) {
            formData.append('doctor_id', data.doctor_id.toString())
        }

        return ApiService.fetchDataWithAxios<ReportResponse, FormData>({
            url: '/api/reports/upload',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * View user and family medical reports
    //  * GET api/reports/view
     */
    getReports() {
        return ApiService.fetchDataWithAxios<ReportResponse>({
            url: '/api/reports/view',
            method: 'GET',
        })
    },

    /**
     * Edit a medical report
     * PUT /api/reports/edit/{report_id}
     */
    editReport(reportId: number, data: EditReportRequest) {
        const formData = new FormData()
        
        // Append PDF files if provided
        if (data.report_pdf && data.report_pdf.length > 0) {
            data.report_pdf.forEach((file) => {
                formData.append('report_pdf', file)
            })
        }
        
        // Append other form data if provided
        if (data.report_title) formData.append('report_title', data.report_title)
        if (data.report_type) formData.append('report_type', data.report_type)
        if (data.report_date) formData.append('report_date', data.report_date)
        if (data.doctor_name) formData.append('doctor_name', data.doctor_name)
        if (data.report_analysis) formData.append('report_analysis', data.report_analysis)
        if (data.target_user_id) formData.append('target_user_id', data.target_user_id.toString())
        if (data.doctor_id) formData.append('doctor_id', data.doctor_id.toString())

        return ApiService.fetchDataWithAxios<ReportResponse, FormData>({
            url: `/api/reports/edit/${reportId}`,
            method: 'PUT',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Delete a report
     * DELETE /api/reports/delete/{report_id}
     */
    deleteReport(reportId: number) {
        return ApiService.fetchDataWithAxios<ReportResponse>({
            url: `/api/reports/delete/${reportId}`,
            method: 'DELETE',
        })
    },
}

export default ReportsService 