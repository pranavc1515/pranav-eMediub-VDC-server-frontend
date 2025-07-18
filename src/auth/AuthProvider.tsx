import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignOut, apiSignUp, apiDeleteAccount } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { clearAllUserData, getCurrentUser } from '@/utils/userStorage'
import { useNavigate } from 'react-router-dom'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

// Temporary mock data for development
const MOCK_USERS = {
    user: {
        email: 'user@emedihub.com',
        password: '123Qwe',
        userData: {
            userId: '1',
            userName: 'Test User',
            authority: ['user'],
            avatar: '',
            email: 'user@emedihub.com',
        },
    },
    doctor: {
        email: 'doctor@emedihub.com',
        password: '123Qwe',
        userData: {
            userId: '2',
            userName: 'Dr. Test',
            authority: ['doctor'],
            avatar: '',
            email: 'doctor@emedihub.com',
        },
    },
}

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const loadUserFromStorage = useSessionUser((state) => state.loadUserFromStorage)
    const { token, setToken } = useToken()

    const authenticated = Boolean((token && signedIn) || (user?.userId && user?.authority?.length > 0))

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    // Load user data from localStorage on initialization
    useEffect(() => {
        // Force load from localStorage
        loadUserFromStorage()
        
        // Check if we have a token but no user data
        if (token && (!user?.userId || !user?.userName)) {
            const storedUser = getCurrentUser()
            if (storedUser) {
                // Convert UserStorageData to User type
                const userData = {
                    ...storedUser,
                    userId: storedUser.userId?.toString() || '',
                    userName: storedUser.userName || '',
                    email: storedUser.email || '',
                    avatar: storedUser.avatar || '',
                    image: storedUser.image || '',
                    authority: storedUser.authority || ['user'],
                }
                setUser(userData as User)
                setSessionSignedIn(true)
            }
        }
    }, [token, user?.userId, user?.userName, loadUserFromStorage, setUser, setSessionSignedIn])

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        if (redirectUrl && redirectUrl.startsWith('/')) {
            navigatorRef.current?.navigate(redirectUrl)
        } else {
            // Check if user is a doctor and redirect to their dashboard instead of home
            const defaultPath = user?.authority?.includes('doctor') 
                ? '/doctor/dashboard' 
                : appConfig.authenticatedEntryPath
            navigatorRef.current?.navigate(defaultPath)
        }
    }

    const handleSignIn = (tokens: Token, user?: User) => {
        setToken(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({})
        setSessionSignedIn(false)
        // Clear all user data from localStorage
        clearAllUserData()
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            // If the user is authenticating with a profile (from OTP flow)
            if (values.profile) {
                // Use the provided token and profile
                console.log('Signing in with profile:', values.profile);
                
                const accessToken = values.token || (typeof token === 'string' ? token : '');
                console.log('Using access token:', accessToken);
                
                // handleSignIn expects a Token object and User object
                handleSignIn(
                    { accessToken },
                    values.profile
                );
                
                // Force session state update
                setSessionSignedIn(true);
                
                // Redirect after authentication
                redirect();
                return {
                    status: 'success',
                    message: '',
                };
            }
            
            // Fallback to mock authentication for development
            const mockUser = MOCK_USERS[values.userType];
            if (
                values.email === mockUser.email &&
                values.password === mockUser.password
            ) {
                // Simulate successful sign in
                handleSignIn(
                    { accessToken: `mock-token-${values.userType}` },
                    mockUser.userData,
                );
                redirect();
                return {
                    status: 'success',
                    message: '',
                };
            }
            return {
                status: 'failed',
                message: 'Invalid email or password',
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                status: 'failed',
                message: 'An error occurred during sign in',
            };
        }
    };

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp) {
                handleSignIn({ accessToken: resp.token }, resp.user)
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'An error occurred'
            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    const deleteAccount = async (): Promise<boolean> => {
        try {
            await apiDeleteAccount()
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
            return true
        } catch (error) {
            console.error('Error deleting account:', error)
            return false
        }
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                deleteAccount,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

IsolatedNavigator.displayName = 'IsolatedNavigator'

export default AuthProvider
