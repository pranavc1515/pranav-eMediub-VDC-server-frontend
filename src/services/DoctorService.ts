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
    isProfileComplete?: boolean
    timeCreated: string
    timeUpdated: string
    DoctorProfessional: {
        qualification: string | null
        specialization: string | null
        registrationNumber: string | null
        registrationState: string | null
        expiryDate: string | null
        certificates: Array<{
            key: string
            url: string
            name: string
            type: string
            uploadedAt: string
        }>
        clinicName: string | null
        status: string
        yearsOfExperience: number | null
        communicationLanguages: string[]
        timeCreated: string
        timeUpdated: string
    }
}

type AvailableDoctorsResponse = {
    success: boolean
    count: number
    data: DoctorProfile[]
    totalPages?: number
    currentPage?: number
    pageSize?: number
}

type CheckDoctorExistsResponse = {
    success: boolean
    exists: boolean
    data: {
        id: number
        phoneNumber: string
        isProfileComplete: boolean
    } | null
}

type GetDoctorsParams = {
    specialization?: string
    page?: number
    limit?: number
    search?: string
    onlyAvailable?: boolean
}

type VDCStatusResponse = {
    success: boolean
    data: {
        vdcEnabled: boolean
        hasOptedVDC: boolean
    }
}

type VDCSettingsResponse = {
    success: boolean
    data: {
        vdcEnabled: boolean
        consultationFees: string
        availableDays: string[]
        availableTimeSlots: {
            [day: string]: {
                start: string
                end: string
            }
        }
        paymentOptions: {
            upi: {
                enabled: boolean
                upiId: string
                qrCode?: string
            }
            bank: {
                enabled: boolean
                accountNumber: string
                accountHolderName: string
                ifscCode: string
                bankName: string
            }
        }
    }
}

type UpdateVDCSettingsRequest = {
    vdcEnabled: boolean
    consultationFees: number
    availableDays: string[]
    availableTimeSlots: {
        [day: string]: {
            start: string
            end: string
        }
    }
    paymentOptions: {
        upi: {
            enabled: boolean
            upiId: string
            qrCode: string
        }
        bank: {
            enabled: boolean
            accountNumber: string
            accountHolderName: string
            ifscCode: string
            bankName: string
        }
    }
}

type UpdateVDCSettingsResponse = {
    success: boolean
    message: string
    data: {
        vdcEnabled: boolean
        consultationFees: number
        availableDays: string[]
        availableTimeSlots: {
            [day: string]: {
                start: string
                end: string
            }
        }
        paymentOptions: {
            upi: {
                enabled: boolean
                upiId: string
                qrCode: string
            }
            bank: {
                enabled: boolean
                accountNumber: string
                accountHolderName: string
                ifscCode: string
                bankName: string
            }
        }
    }
}

type EmailVerificationStatusResponse = {
    success: boolean
    data: {
        doctorId: number
        email: string
        emailVerified: boolean
        hasPendingVerification: boolean | null
        otpExpiresAt: string | null
    }
}

type SendEmailOTPResponse = {
    success: boolean
    message: string
    data: {
        email?: string
        otpSent?: boolean
        expiresAt?: string
        emailVerified?: boolean
    }
}

type VerifyEmailOTPResponse = {
    success: boolean
    message: string
    data: {
        doctorId: number
        email: string
        emailVerified: boolean
        verifiedAt: string
    }
}

type ResendEmailOTPResponse = {
    success: boolean
    message: string
    data: {
        email: string
        otpSent: boolean
        expiresAt: string
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
            profilePhoto?: File
        },
    ) {
        // Check if we need to send as multipart/form-data (when profilePhoto is included)
        if (data.profilePhoto) {
            const formData = new FormData()
            formData.append('fullName', data.fullName)
            formData.append('email', data.email)
            formData.append('gender', data.gender)
            formData.append('dob', data.dob)
            formData.append('profilePhoto', data.profilePhoto)

            return ApiService.fetchDataWithAxios<{
                success: boolean
                data: DoctorProfile
            }>({
                url: `/api/doctors/personal-details/${doctorId}`,
                method: 'PUT',
                data: formData as unknown as Record<string, unknown>,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        }

        // Send as regular JSON if no profilePhoto
        return ApiService.fetchDataWithAxios<{
            success: boolean
            data: DoctorProfile
        }>({
            url: `/api/doctors/personal-details/${doctorId}`,
            method: 'PUT',
            data: {
                fullName: data.fullName,
                email: data.email,
                gender: data.gender,
                dob: data.dob,
            },
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
            clinicName: string
            yearsOfExperience: number | undefined
            communicationLanguages: string[]
            certificates?: File[]
            certificatesToRemove?: string[]
        },
    ) {
        const formData = new FormData()
        
        // Add text fields
        formData.append('qualification', data.qualification)
        formData.append('specialization', data.specialization)
        formData.append('registrationNumber', data.registrationNumber)
        formData.append('registrationState', data.registrationState)
        formData.append('expiryDate', data.expiryDate)
        formData.append('clinicName', data.clinicName)
        
        // Handle potentially undefined values
        if (data.yearsOfExperience !== undefined) {
            formData.append('yearsOfExperience', data.yearsOfExperience.toString())
        } else {
            formData.append('yearsOfExperience', '0')
        }
        
        // Convert arrays to JSON strings as required by the API
        formData.append('communicationLanguages', JSON.stringify(data.communicationLanguages))
        
        // Add certificate files if provided
        if (data.certificates && data.certificates.length > 0) {
            data.certificates.forEach((file) => {
                formData.append('certificates', file)
            })
        }
        
        // Add certificates to remove if provided
        if (data.certificatesToRemove && data.certificatesToRemove.length > 0) {
            formData.append('certificatesToRemove', JSON.stringify(data.certificatesToRemove))
        }

        return ApiService.fetchDataWithAxios<{
            success: boolean
            message: string
            data: DoctorProfile['DoctorProfessional']
        }>({
            url: `/api/doctors/professional-details/${doctorId}`,
            method: 'PUT',
            data: formData as unknown as Record<string, unknown>,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Check if a doctor exists by phone number
     * @param phoneNumber The phone number to check
     * @returns Promise with doctor existence data
     */
    checkDoctorExists(phoneNumber: string) {
        return ApiService.fetchDataWithAxios<CheckDoctorExistsResponse>({
            url: '/api/doctors/checkDoctorExists',
            method: 'POST',
            data: { phoneNumber },
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

    /**
     * Get doctors with pagination, search and availability filtering
     * @param params Options for filtering, pagination and search
     * @returns Promise with doctors data
     */
    getDoctors(params: GetDoctorsParams = {}) {
        const { specialization, page, limit, search, onlyAvailable } = params

        return ApiService.fetchDataWithAxios<AvailableDoctorsResponse>({
            url: '/api/doctors',
            method: 'GET',
            params: {
                ...(specialization && { specialization }),
                ...(page && { page }),
                ...(limit && { limit }),
                ...(search && { search }),
                ...(onlyAvailable !== undefined && { onlyAvailable }),
            },
        })
    },

    /**
     * Get VDC status for the authenticated doctor
     * @returns Promise with VDC status data
     */
    getVDCStatus() {
        return ApiService.fetchDataWithAxios<VDCStatusResponse>({
            url: '/api/doctors/vdc-status',
            method: 'GET',
        })
    },

    /**
     * Get VDC settings for the authenticated doctor
     * @returns Promise with VDC settings data
     */
    getVDCSettings() {
        return ApiService.fetchDataWithAxios<VDCSettingsResponse>({
            url: '/api/doctors/vdc-settings',
            method: 'GET',
        })
    },

    /**
     * Update VDC settings for the authenticated doctor
     * @param data VDC settings to update
     * @returns Promise with updated VDC settings
     */
    updateVDCSettings(data: UpdateVDCSettingsRequest) {
        return ApiService.fetchDataWithAxios<UpdateVDCSettingsResponse>({
            url: '/api/doctors/vdc-settings',
            method: 'PUT',
            data,
        })
    },

    /**
     * Get doctor's UI language preference
     * @returns Promise with language preference data
     */
    getLanguage() {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            data: {
                uiLanguage: string
            }
        }>({
            url: '/api/doctors/language',
            method: 'GET',
        })
    },

    /**
     * Update doctor's UI language preference
     * @param language The language preference (en, hi, kn)
     * @returns Promise with update result
     */
    updateLanguage(language: string) {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            message: string
        }>({
            url: '/api/doctors/language',
            method: 'POST',
            data: { language },
        })
    },

    /**
     * Get email verification status for doctor
     * @param doctorId The doctor's ID
     * @returns Promise with email verification status
     */
    getEmailVerificationStatus(doctorId: number) {
        return ApiService.fetchDataWithAxios<EmailVerificationStatusResponse>({
            url: `/api/doctors/email-verification-status/${doctorId}`,
            method: 'GET',
        })
    },

    /**
     * Send email OTP for verification
     * @param email The email to verify
     * @param doctorId The doctor's ID
     * @returns Promise with OTP send result
     */
    sendEmailOTP(email: string, doctorId: number) {
        return ApiService.fetchDataWithAxios<SendEmailOTPResponse>({
            url: '/api/doctors/send-email-otp',
            method: 'POST',
            data: { email, doctorId },
        })
    },

    /**
     * Verify email OTP
     * @param email The email being verified
     * @param otp The OTP code
     * @param doctorId The doctor's ID
     * @returns Promise with verification result
     */
    verifyEmailOTP(email: string, otp: string, doctorId: number) {
        return ApiService.fetchDataWithAxios<VerifyEmailOTPResponse>({
            url: '/api/doctors/verify-email-otp',
            method: 'POST',
            data: { email, otp, doctorId },
        })
    },

    /**
     * Resend email OTP
     * @param doctorId The doctor's ID
     * @returns Promise with resend result
     */
    resendEmailOTP(doctorId: number) {
        return ApiService.fetchDataWithAxios<ResendEmailOTPResponse>({
            url: '/api/doctors/resend-email-otp',
            method: 'POST',
            data: { doctorId },
        })
    },

    /**
     * Delete doctor account
     * @returns Promise with deletion result
     */
    deleteAccount() {
        return ApiService.fetchDataWithAxios<{
            success: boolean
            message: string
        }>({
            url: '/api/doctors/delete-account',
            method: 'DELETE',
        })
    },
}

export type {
    DoctorProfile,
    AvailableDoctorsResponse,
    CheckDoctorExistsResponse,
    GetDoctorsParams,
    VDCStatusResponse,
    VDCSettingsResponse,
    UpdateVDCSettingsRequest,
    UpdateVDCSettingsResponse,
    EmailVerificationStatusResponse,
    SendEmailOTPResponse,
    VerifyEmailOTPResponse,
    ResendEmailOTPResponse,
}
export default DoctorService
