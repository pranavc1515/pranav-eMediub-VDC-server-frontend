import { useState, useCallback } from 'react'
import PrescriptionService, {
    Prescription,
    Medicine,
    CreateCustomPrescriptionPayload,
} from '@/services/PrescriptionService'

interface UsePrescriptionProps {
    doctorId?: number
    userId?: number
}

interface PrescriptionListData {
    prescriptions: Prescription[]
    total: number
    page: number
    limit: number
}

interface UploadPrescriptionParams {
    consultationId: string
    file: File
}

interface CreateCustomPrescriptionParams {
    consultationId: string
    medicines: Medicine[]
    instructions: string
    patientName?: string
    patientId?: string
}

const usePrescription = ({ doctorId, userId }: UsePrescriptionProps = {}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [prescriptionList, setPrescriptionList] = useState<PrescriptionListData | null>(null)
    const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null)

    const uploadPrescription = async ({ consultationId, file }: UploadPrescriptionParams) => {
        try {
            setLoading(true)
            const response = await PrescriptionService.uploadPrescription(
                consultationId,
                file,
                doctorId,
                userId
            )
            if (response.success) {
                setCurrentPrescription(response.data)
                setError(null)
                return response.data
            } else {
                setError(response.message || 'Failed to upload prescription')
                return null
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Unexpected error occurred'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const createCustomPrescription = async ({
        consultationId,
        medicines,
        instructions,
        patientName,
        patientId,
    }: CreateCustomPrescriptionParams) => {
        try {
            setLoading(true)
            const payload: CreateCustomPrescriptionPayload = {
                medicines,
                instructions,
                patientName,
                patientId,
            }

            const response = await PrescriptionService.createCustomPrescription(
                consultationId,
                payload,
                doctorId,
                userId
            )

            if (response.success) {
                setCurrentPrescription(response.data)
                setError(null)
                return response.data
            } else {
                setError(response.message || 'Failed to create prescription')
                return null
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Unexpected error occurred'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchPatientPrescriptions = useCallback(
        async (page: number = 1, limit: number = 10) => {
            if (!userId) {
                setError('User ID is required to fetch patient prescriptions')
                return null
            }

            try {
                setLoading(true)
                const response = await PrescriptionService.getPatientPrescriptions(userId, page, limit)
                if (response.success) {
                    setPrescriptionList(response.data)
                    setError(null)
                    return response.data
                } else {
                    setError(response.message || 'Failed to fetch prescriptions')
                    return null
                }
            } catch (err: any) {
                const errorMessage = err?.message || 'Unexpected error occurred'
                setError(errorMessage)
                return null
            } finally {
                setLoading(false)
            }
        },
        [userId]
    )

    const fetchDoctorPrescriptions = useCallback(
        async (page: number = 1, limit: number = 10) => {
            if (!doctorId) {
                setError('Doctor ID is required to fetch doctor prescriptions')
                return null
            }

            try {
                setLoading(true)
                const response = await PrescriptionService.getDoctorPrescriptions(doctorId, page, limit)
                if (response.success) {
                    setPrescriptionList(response.data)
                    setError(null)
                    return response.data
                } else {
                    setError(response.message || 'Failed to fetch prescriptions')
                    return null
                }
            } catch (err: any) {
                const errorMessage = err?.message || 'Unexpected error occurred'
                setError(errorMessage)
                return null
            } finally {
                setLoading(false)
            }
        },
        [doctorId]
    )

    const fetchConsultationPrescriptions = async (consultationId: string) => {
        try {
            setLoading(true)
            const response = await PrescriptionService.getConsultationPrescriptions(consultationId)
            if (response.success) {
                setPrescriptionList(response.data)
                setError(null)
                return response.data
            } else {
                setError(response.message || 'Failed to fetch prescriptions')
                return null
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Unexpected error occurred'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchPrescriptionById = async (id: string) => {
        try {
            setLoading(true)
            const response = await PrescriptionService.getPrescriptionById(id)
            if (response.success) {
                setCurrentPrescription(response.data)
                setError(null)
                return response.data
            } else {
                setError(response.message || 'Failed to fetch prescription')
                return null
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Unexpected error occurred'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const deletePrescription = async (id: string) => {
        try {
            setLoading(true)
            const response = await PrescriptionService.deletePrescription(id, doctorId)
            if (response.success) {
                // Remove the deleted prescription from the list if it exists
                if (prescriptionList) {
                    setPrescriptionList({
                        ...prescriptionList,
                        prescriptions: prescriptionList.prescriptions.filter(p => p.id !== id)
                    })
                }
                if (currentPrescription?.id === id) {
                    setCurrentPrescription(null)
                }
                setError(null)
                return true
            } else {
                setError(response.message || 'Failed to delete prescription')
                return false
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Unexpected error occurred'
            setError(errorMessage)
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        prescriptionList,
        currentPrescription,
        uploadPrescription,
        createCustomPrescription,
        fetchPatientPrescriptions,
        fetchDoctorPrescriptions,
        fetchConsultationPrescriptions,
        fetchPrescriptionById,
        deletePrescription,
    }
}

export default usePrescription 