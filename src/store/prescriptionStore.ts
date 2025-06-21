import { create } from 'zustand'

type PrescriptionState = {
    selectedConsultationId: string | null
    selectedPatientId: string | null
}

type PrescriptionAction = {
    setPrescriptionDetails: (consultationId: string | null, patientId: string | null) => void
    clearPrescriptionDetails: () => void
}

export const usePrescriptionStore = create<PrescriptionState & PrescriptionAction>((set) => ({
    selectedConsultationId: null,
    selectedPatientId: null,
    setPrescriptionDetails: (consultationId, patientId) => set({ 
        selectedConsultationId: consultationId,
        selectedPatientId: patientId 
    }),
    clearPrescriptionDetails: () => set({ 
        selectedConsultationId: null,
        selectedPatientId: null 
    }),
})) 