import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface PatientOnCall {
    id: number | string
    name: string
    relation_type?: string
    phone?: string
    email?: string
    age?: string
    gender?: string
    image?: string | null
    isMainUser?: boolean
}

type PatientOnCallState = {
    selectedPatient: PatientOnCall | null
    isPatientSelected: boolean
}

type PatientOnCallAction = {
    setSelectedPatient: (patient: PatientOnCall) => void
    clearSelectedPatient: () => void
    getSelectedPatientId: () => number | string | null
}

const initialState: PatientOnCallState = {
    selectedPatient: null,
    isPatientSelected: false,
}

export const usePatientOnCallStore = create<PatientOnCallState & PatientOnCallAction>()(
    persist(
        (set, get) => ({
            ...initialState,
            setSelectedPatient: (patient: PatientOnCall) => {
                set({
                    selectedPatient: patient,
                    isPatientSelected: true,
                })
                // Also store patient ID in localStorage for backup
                localStorage.setItem('selectedPatientId', patient.id.toString())
            },
            clearSelectedPatient: () => {
                set({
                    selectedPatient: null,
                    isPatientSelected: false,
                })
                // Clear from localStorage as well
                localStorage.removeItem('selectedPatientId')
            },
            getSelectedPatientId: () => {
                const state = get()
                return state.selectedPatient?.id || null
            },
        }),
        {
            name: 'patientOnCall',
            storage: createJSONStorage(() => localStorage),
        },
    ),
) 