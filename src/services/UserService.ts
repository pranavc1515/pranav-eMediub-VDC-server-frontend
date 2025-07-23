import ApiService from './ApiService'

type UserProfile = {
    id: number
    fullName: string
    phoneNumber: string
    email: string | null
    age: string | null
    dob: string | null
    gender: string | null
    maritalStatus: string | null
    height: string | null
    weight: string | null
    diet: string | null
    profession: string | null
    image: string | null
    isProfileComplete: boolean
    timeCreated: string
    timeUpdated: string
}

type UserProfileResponse = {
    success: boolean
    data: UserProfile
}

type UserPersonalDetails = {
    name: string
    email: string
    phone: string
    dob: string
    gender: string
    marital_status: string
    height: string
    weight: string
    diet: string
    profession: string
    image: string
    profilePhoto?: File
}

type UserUpdateResponse = {
    status: boolean
    status_code: number
    message: string
}

type UserProfileDetailsResponse = {
    status: boolean
    status_code: number
    message: string
    data: {
        id: number
        name: string
        phone: string
        email: string
        isPhoneVerify: number
        isEmailVerify: number
        age: string
        dob: string
        gender: string
        marital_status: string
        height: string
        weight: string
        diet: string
        profession: string
        smoking_routine: string | null
        drinking_routine: string | null
        activity_routine: string | null
        image: string | null
    }
}

const UserService = {
    /**
     * Get the current user's profile
     * @returns Promise with user profile data
     */
    getProfile() {
        return ApiService.fetchDataWithAxios<UserProfileResponse>({
            url: '/api/patients/profile-details',
            method: 'GET',
        })
    },
    
    /**
     * Update user's personal details
     * @param data The personal details to update
     * @returns Promise with update result
     */
    updatePersonalDetails(data: UserPersonalDetails) {
        // Check if we need to send as multipart/form-data (when profilePhoto is included)
        if (data.profilePhoto) {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('email', data.email)
            formData.append('phone', data.phone)
            formData.append('dob', data.dob)
            formData.append('gender', data.gender)
            formData.append('marital_status', data.marital_status)
            formData.append('height', data.height)
            formData.append('weight', data.weight)
            formData.append('diet', data.diet)
            formData.append('profession', data.profession)
            if (data.image) {
                formData.append('image', data.image)
            }
            formData.append('profilePhoto', data.profilePhoto)

            return ApiService.fetchDataWithAxios<UserUpdateResponse>({
                url: '/api/patients/record-personal-details',
                method: 'PUT',
                data: formData as unknown as Record<string, unknown>,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        }

        // Send as regular JSON if no profilePhoto
        return ApiService.fetchDataWithAxios<UserUpdateResponse>({
            url: '/api/patients/record-personal-details',
            method: 'PUT',
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                dob: data.dob,
                gender: data.gender,
                marital_status: data.marital_status,
                height: data.height,
                weight: data.weight,
                diet: data.diet,
                profession: data.profession,
                image: data.image,
            },
        })
    },
    
    /**
     * Get user's profile details
     * @returns Promise with user profile details
     */
    getProfileDetails() {
        return ApiService.fetchDataWithAxios<UserProfileDetailsResponse>({
            url: '/api/patients/profile-details',
            method: 'GET',
        })
    },

    /**
     * Update user's preferred language
     * @param language The language preference (en_US, hi_IN, kn_IN)
     * @returns Promise with update result
     */
    updateLanguage(language: string) {
        return ApiService.fetchDataWithAxios<{
            status: boolean
            status_code: number
            message: string
        }>({
            url: '/api/patients/language',
            method: 'POST',
            data: { language },
        })
    }
}

export type { UserProfile, UserProfileResponse, UserPersonalDetails, UserUpdateResponse, UserProfileDetailsResponse }
export default UserService 