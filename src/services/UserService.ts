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
    age: string
    dob: string
    gender: string
    marital_status: string
    height: string
    weight: string
    diet: string
    profession: string
    image: string
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
            url: '/api/users/profile',
            method: 'GET',
        })
    },
    
    /**
     * Update user's personal details
     * @param data The personal details to update
     * @returns Promise with update result
     */
    updatePersonalDetails(data: UserPersonalDetails) {
        return ApiService.fetchDataWithAxios<UserUpdateResponse>({
            url: '/api/users/record-personal-details',
            method: 'PUT',
            data,
        })
    },
    
    /**
     * Get user's profile details
     * @returns Promise with user profile details
     */
    getProfileDetails() {
        return ApiService.fetchDataWithAxios<UserProfileDetailsResponse>({
            url: '/api/users/profile-details',
            method: 'GET',
        })
    }
}

export type { UserProfile, UserProfileResponse, UserPersonalDetails, UserUpdateResponse, UserProfileDetailsResponse }
export default UserService 