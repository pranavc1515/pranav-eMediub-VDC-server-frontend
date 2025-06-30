import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/@types/auth'

type Session = {
    signedIn: boolean
}

type AuthState = {
    session: Session
    user: User
}

type AuthAction = {
    setSessionSignedIn: (payload: boolean) => void
    setUser: (payload: User) => void
    loadUserFromStorage: () => void
}

const getPersistStorage = () => {
    if (appConfig.accessTokenPersistStrategy === 'localStorage') {
        return localStorage
    }

    if (appConfig.accessTokenPersistStrategy === 'sessionStorage') {
        return sessionStorage
    }

    return cookiesStorage
}

// Function to load user data from localStorage with key 'user_data'
const loadUserDataFromStorage = (): User => {
    try {
        const userData = localStorage.getItem('user_data')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            console.log('Loading user data from localStorage:', parsedUser)
            
            // Only return user data if it's a user/patient (not doctor)
            if (parsedUser) {
                // Check if user is a doctor - if so, don't load from localStorage
                if (parsedUser.authority && parsedUser.authority.includes('doctor')) {
                    console.log('Doctor user detected, not loading from localStorage')
                    return {
                        avatar: '',
                        userName: '',
                        email: '',
                        authority: [],
                    }
                }
                
                // Ensure we have a valid user ID
                const userId = parsedUser.userId || parsedUser.patientId || parsedUser.id || ''
                if (!userId) {
                    console.log('No valid user ID found in localStorage data')
                    return {
                        avatar: '',
                        userName: '',
                        email: '',
                        authority: [],
                    }
                }
                
                // Build the user object
                const userName = parsedUser.userName || 
                               `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() ||
                               parsedUser.name || ''
                
                const userObj = {
                    userId,
                    userName,
                    email: parsedUser.email || '',
                    authority: parsedUser.authority || ['user'],
                    avatar: parsedUser.avatar || parsedUser.image || '',
                    phoneNumber: parsedUser.phoneNumber || '',
                    ...parsedUser // Include all other properties
                }
                
                console.log('Successfully loaded user from localStorage:', userObj)
                return userObj
            }
        }
    } catch (error) {
        console.error('Error loading user data from localStorage:', error)
    }
    
    return {
        avatar: '',
        userName: '',
        email: '',
        authority: [],
    }
}

// Load user data and determine initial sign-in state
const initialUserData = loadUserDataFromStorage()
const hasValidUser = Boolean(initialUserData.userId && initialUserData.authority?.length > 0)

const initialState: AuthState = {
    session: {
        signedIn: hasValidUser,
    },
    user: initialUserData,
}

export const useSessionUser = create<AuthState & AuthAction>()(
    persist(
        (set) => ({
            ...initialState,
            setSessionSignedIn: (payload) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: payload,
                    },
                })),
            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),
            loadUserFromStorage: () => {
                const userData = loadUserDataFromStorage()
                if (userData.userId || userData.userName || userData.email) {
                    set((state) => ({
                        user: userData,
                        session: {
                            ...state.session,
                            signedIn: true,
                        },
                    }))
                }
            },
        }),
        {
            name: 'sessionUser',
            storage: createJSONStorage(() => getPersistStorage()),
        },
    ),
)

export const useToken = () => {
    const storage = getPersistStorage()

    const setToken = (token: string) => {
        storage.setItem(TOKEN_NAME_IN_STORAGE, token)
    }

    return {
        setToken,
        token: storage.getItem(TOKEN_NAME_IN_STORAGE),
    }
}
