import ApiService from './ApiService'

export type Patient = {
    firstName: string
    lastName: string
}

export type PatientQueueEntry = {
    id: number
    doctorId: number
    patientId: number
    status: 'waiting' | 'in_consultation' | 'left'
    position: number
    patient: Patient
}

export type PatientQueueResponse = {
    success: boolean
    data: {
        queue: PatientQueueEntry[]
        totalCount: number
        totalPages: number
        currentPage: number
        pageSize: number
    }
}

export type JoinQueueResponse = {
    success: boolean
    message: string
    action: 'joined' | 'waiting' | 'rejoin' | 'in_consultation'
    position: number
    estimatedWait: string
    roomName: string
    consultationId?: string
}

export type LeaveQueueResponse = {
    success: boolean
    message: string
    data: PatientQueueEntry[]
}

const PatientQueueService = {
    /**
     * Fetch the patient queue for a specific doctor
     */
    getPatientQueue(doctorId: number) {
        return ApiService.fetchDataWithAxios<PatientQueueResponse>({
            url: `/api/patientQueue/${doctorId}`,
            method: 'GET',
        })
    },

    /**
     * Join the patient queue for a specific doctor
     * Now handles reconnection scenarios
     */
    joinQueue(patientId: number, doctorId: number) {
        return ApiService.fetchDataWithAxios<JoinQueueResponse>({
            url: '/api/patientQueue/join',
            method: 'POST',
            data: {
                patientId,
                doctorId,
            },
        })
    },

    /**
     * Remove a patient from the queue
     * @param userId - The ID of the user who owns the account (platform user)
     * @param patientId - The ID of the patient for whom the consultation is (could be user or family member)
     * @param doctorId - The ID of the doctor
     */
    leaveQueue(userId: number, patientId: number, doctorId: number) {
        return ApiService.fetchDataWithAxios<LeaveQueueResponse>({
            url: '/api/patientQueue/leave',
            method: 'POST',
            data: { userId, patientId, doctorId },
        })
    },
}

export default PatientQueueService
