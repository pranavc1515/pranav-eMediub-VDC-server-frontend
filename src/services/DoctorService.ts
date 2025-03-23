import ApiService from './ApiService'

type DoctorProfile = {
    id: number
    fullName: string
    phoneNumber: string
    email: string | null
    gender: string | null
    dob: string | null
    status: string
    emailVerified: boolean
    profilePhoto: string | null
    timeCreated: string
    timeUpdated: string
    DoctorProfessional: {
        qualification: string | null
        specialization: string | null
        registrationNumber: string | null
        registrationState: string | null
        expiryDate: string | null
        certificates: string[]
        clinicName: string | null
        status: string
        yearsOfExperience: number | null
        communicationLanguages: string[]
        consultationFees: number | null
        availableDays: string[]
        availableTimeSlots: Record<string, unknown>
        timeCreated: string
        timeUpdated: string
    }
}

const DoctorService = {
    getProfile(doctorId?: number) {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            data: DoctorProfile
        }>({
            url: '/api/doctors/profile',
            method: 'GET',
            params: doctorId ? { doctorId } : undefined,
        })
    },

    updatePersonalDetails(
        doctorId: number,
        data: {
            fullName: string
            email: string
            gender: string
            dob: string
            profilePhoto: string
        },
    ) {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            data: DoctorProfile
        }>({
            url: `/api/doctors/personal-details/${doctorId}`,
            method: 'PUT',
            data,
        })
    },

    updateProfessionalDetails(
        doctorId: number,
        data: {
            qualification: string
            specialization: string
            registrationNumber: string
            registrationState: string
            expiryDate: string
            certificates?: string[]
            clinicName: string
            yearsOfExperience: number
            communicationLanguages: string[]
            consultationFees: number
            availableDays: string[]
        },
    ) {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            message: string
            data: DoctorProfile['DoctorProfessional']
        }>({
            url: `/api/doctors/professional-details/${doctorId}`,
            method: 'PUT',
            data,
        })
    },
}

export type { DoctorProfile }
export default DoctorService
