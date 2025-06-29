export interface UserStorageData {
    userId: string | number
    userName: string
    authority: string[]
    avatar?: string
    email?: string
    phoneNumber: string
    isProfileComplete?: boolean
    userType: 'user' | 'doctor'
    loginTimestamp: string
    token: string
    // Additional doctor-specific data
    specialization?: string
    consultationFees?: number | string
    // Additional user-specific data
    patientId?: string | number
}

export interface StorageKeys {
    USER_DATA: 'user_data'
    DOCTOR_DATA: 'doctor_data'
    CURRENT_USER_TYPE: 'current_user_type'
    LOGIN_TIMESTAMP: 'login_timestamp'
}

const STORAGE_KEYS: StorageKeys = {
    USER_DATA: 'user_data',
    DOCTOR_DATA: 'doctor_data',
    CURRENT_USER_TYPE: 'current_user_type',
    LOGIN_TIMESTAMP: 'login_timestamp',
}

class UserStorageManager {
    private isLocalStorageAvailable(): boolean {
        try {
            const test = '__localStorage_test__'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
        } catch {
            return false
        }
    }

    private getStorageKey(userType: 'user' | 'doctor'): string {
        return userType === 'doctor' ? STORAGE_KEYS.DOCTOR_DATA : STORAGE_KEYS.USER_DATA
    }

    /**
     * Save user/doctor login details to localStorage
     */
    saveUserData(userData: UserStorageData): boolean {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage is not available')
            return false
        }

        try {
            const dataToStore = {
                ...userData,
                loginTimestamp: new Date().toISOString(),
            }

            const storageKey = this.getStorageKey(userData.userType)
            
            // Store user-specific data
            localStorage.setItem(storageKey, JSON.stringify(dataToStore))
            
            // Store current user type
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER_TYPE, userData.userType)
            
            // Store login timestamp
            localStorage.setItem(STORAGE_KEYS.LOGIN_TIMESTAMP, dataToStore.loginTimestamp)
            
            // Store token (maintaining backward compatibility)
            localStorage.setItem('token', userData.token)
            
            // Legacy storage for backward compatibility
            localStorage.setItem(userData.userType, JSON.stringify(dataToStore))

            console.log(`${userData.userType} data saved successfully to localStorage`)
            return true
        } catch (error) {
            console.error('Error saving user data to localStorage:', error)
            return false
        }
    }

    /**
     * Retrieve user/doctor data from localStorage
     */
    getUserData(userType?: 'user' | 'doctor'): UserStorageData | null {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage is not available')
            return null
        }

        try {
            // If userType not provided, get current user type
            const currentUserType = userType || this.getCurrentUserType()
            if (!currentUserType) return null

            const storageKey = this.getStorageKey(currentUserType)
            const storedData = localStorage.getItem(storageKey)
            
            if (!storedData) return null
            
            return JSON.parse(storedData) as UserStorageData
        } catch (error) {
            console.error('Error retrieving user data from localStorage:', error)
            return null
        }
    }

    /**
     * Get current logged-in user type
     */
    getCurrentUserType(): 'user' | 'doctor' | null {
        if (!this.isLocalStorageAvailable()) return null
        
        try {
            return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_TYPE) as 'user' | 'doctor' | null
        } catch (error) {
            console.error('Error getting current user type:', error)
            return null
        }
    }

    /**
     * Get user ID of currently logged-in user
     */
    getCurrentUserId(): string | number | null {
        const userData = this.getUserData()
        return userData?.userId || null
    }

    /**
     * Get login timestamp
     */
    getLoginTimestamp(): string | null {
        if (!this.isLocalStorageAvailable()) return null
        
        try {
            return localStorage.getItem(STORAGE_KEYS.LOGIN_TIMESTAMP)
        } catch (error) {
            console.error('Error getting login timestamp:', error)
            return null
        }
    }

    /**
     * Check if user is logged in
     */
    isUserLoggedIn(): boolean {
        const token = localStorage.getItem('token')
        const userData = this.getUserData()
        return !!(token && userData)
    }

    /**
     * Update specific user data fields
     */
    updateUserData(updates: Partial<UserStorageData>): boolean {
        const currentData = this.getUserData()
        if (!currentData) return false

        const updatedData = { ...currentData, ...updates }
        return this.saveUserData(updatedData)
    }

    /**
     * Clear all user/doctor data from localStorage
     */
    clearUserData(): boolean {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage is not available')
            return false
        }

        try {
            // Remove user data
            localStorage.removeItem(STORAGE_KEYS.USER_DATA)
            localStorage.removeItem(STORAGE_KEYS.DOCTOR_DATA)
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_TYPE)
            localStorage.removeItem(STORAGE_KEYS.LOGIN_TIMESTAMP)
            localStorage.removeItem('token')
            
            // Remove legacy storage
            localStorage.removeItem('user')
            localStorage.removeItem('doctor')

            console.log('User data cleared from localStorage')
            return true
        } catch (error) {
            console.error('Error clearing user data from localStorage:', error)
            return false
        }
    }

    /**
     * Clear specific user type data
     */
    clearUserTypeData(userType: 'user' | 'doctor'): boolean {
        if (!this.isLocalStorageAvailable()) return false

        try {
            const storageKey = this.getStorageKey(userType)
            localStorage.removeItem(storageKey)
            localStorage.removeItem(userType) // Legacy
            
            // If this was the current user, clear current user type
            if (this.getCurrentUserType() === userType) {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_TYPE)
                localStorage.removeItem(STORAGE_KEYS.LOGIN_TIMESTAMP)
                localStorage.removeItem('token')
            }
            
            return true
        } catch (error) {
            console.error(`Error clearing ${userType} data from localStorage:`, error)
            return false
        }
    }

    /**
     * Get all stored user data (for debugging/admin purposes)
     */
    getAllStoredData(): Record<string, any> {
        if (!this.isLocalStorageAvailable()) return {}

        try {
            return {
                userData: this.getUserData('user'),
                doctorData: this.getUserData('doctor'),
                currentUserType: this.getCurrentUserType(),
                loginTimestamp: this.getLoginTimestamp(),
                token: localStorage.getItem('token'),
            }
        } catch (error) {
            console.error('Error getting all stored data:', error)
            return {}
        }
    }
}

// Create and export singleton instance
const userStorageManager = new UserStorageManager()

export default userStorageManager

// Export convenient functions for direct use
export const saveUserToStorage = (userData: UserStorageData) => userStorageManager.saveUserData(userData)
export const getUserFromStorage = (userType?: 'user' | 'doctor') => userStorageManager.getUserData(userType)
export const getCurrentUser = () => userStorageManager.getUserData()
export const getCurrentUserType = () => userStorageManager.getCurrentUserType()
export const getCurrentUserId = () => userStorageManager.getCurrentUserId()
export const isUserLoggedIn = () => userStorageManager.isUserLoggedIn()
export const updateUserData = (updates: Partial<UserStorageData>) => userStorageManager.updateUserData(updates)
export const clearAllUserData = () => userStorageManager.clearUserData()
export const clearUserTypeData = (userType: 'user' | 'doctor') => userStorageManager.clearUserTypeData(userType) 