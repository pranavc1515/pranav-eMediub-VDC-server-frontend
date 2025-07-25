export type SignInCredential = {
    email: string
    password: string
    userType: 'user' | 'doctor'
    profile?: any
    token?: string
}

export type SignInResponse = {
    token: string
    user: {
        userId: string
        userName: string
        authority: string[]
        avatar: string
        email: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    patientId?: string | null
    id?: string | null
    avatar?: string | null
    userName?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    phoneNumber?: string | null
    authority?: string[]
    image?: string | null
    [key: string]: any // Allow additional properties from localStorage
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
