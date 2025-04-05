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
    isOnline?: string
    lastSeen?: string
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

type AvailableDoctorsResponse = {
    success: boolean
    count: number
    data: DoctorProfile[]
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
    
    /**
     * Fetch available doctors who are online and have "available" status
     * @param specialization Optional specialization to filter doctors by
     * @returns Promise with available doctors data
     */
    getAvailableDoctors(specialization?: string) {
        return ApiService.fetchDataWithAxios<AvailableDoctorsResponse>({
            url: '/api/doctors/available',
            method: 'GET',
            params: specialization ? { specialization } : undefined,
        })
    },
}

export type { DoctorProfile, AvailableDoctorsResponse }
export default DoctorService
