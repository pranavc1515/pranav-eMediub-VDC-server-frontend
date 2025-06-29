import { useState, useEffect } from 'react'
import {
    getCurrentUser,
    getCurrentUserType,
    getCurrentUserId,
    isUserLoggedIn,
    getUserFromStorage,
    type UserStorageData,
} from '@/utils/userStorage'

/**
 * Custom hook to manage stored user data
 * Provides reactive access to localStorage user data
 */
export const useStoredUser = () => {
    const [userData, setUserData] = useState<UserStorageData | null>(null)
    const [userType, setUserType] = useState<'user' | 'doctor' | null>(null)
    const [userId, setUserId] = useState<string | number | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    const refreshUserData = () => {
        try {
            const currentUser = getCurrentUser()
            const currentType = getCurrentUserType()
            const currentId = getCurrentUserId()
            const loggedIn = isUserLoggedIn()

            setUserData(currentUser)
            setUserType(currentType)
            setUserId(currentId)
            setIsLoggedIn(loggedIn)
        } catch (error) {
            console.error('Error refreshing user data:', error)
            setUserData(null)
            setUserType(null)
            setUserId(null)
            setIsLoggedIn(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUserData()

        // Listen for storage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (
                event.key &&
                (event.key.includes('user_data') ||
                    event.key.includes('doctor_data') ||
                    event.key.includes('current_user_type') ||
                    event.key === 'token')
            ) {
                refreshUserData()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    return {
        userData,
        userType,
        userId,
        isLoggedIn,
        loading,
        refreshUserData,
        // Convenience getters
        isDoctor: userType === 'doctor',
        isUser: userType === 'user',
        userName: userData?.userName,
        userEmail: userData?.email,
        userPhone: userData?.phoneNumber,
        userAvatar: userData?.avatar || userData?.image,
        isProfileComplete: userData?.isProfileComplete,
        loginTimestamp: userData?.loginTimestamp,
        // Enhanced user profile fields
        isPhoneVerified: userData?.isPhoneVerify === 1,
        isEmailVerified: userData?.isEmailVerify === 1,
        age: userData?.age,
        dateOfBirth: userData?.dob,
        gender: userData?.gender,
        maritalStatus: userData?.marital_status,
        language: userData?.language,
        height: userData?.height,
        weight: userData?.weight,
        diet: userData?.diet,
        profession: userData?.profession,
        smokingRoutine: userData?.smoking_routine,
        drinkingRoutine: userData?.drinking_routine,
        activityRoutine: userData?.activity_routine,
        profileImage: userData?.image,
        // Doctor-specific convenience getters
        specialization: userData?.specialization,
        consultationFees: userData?.consultationFees,
    }
}

/**
 * Hook to get specific user type data
 */
export const useStoredUserData = (targetUserType?: 'user' | 'doctor') => {
    const [userData, setUserData] = useState<UserStorageData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        try {
            const data = getUserFromStorage(targetUserType)
            setUserData(data)
        } catch (error) {
            console.error('Error getting user data:', error)
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }, [targetUserType])

    return {
        userData,
        loading,
    }
}

export default useStoredUser 