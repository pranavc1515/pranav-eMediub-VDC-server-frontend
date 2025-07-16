import ApiService from './ApiService'
import endpointConfig, { apiPrefix } from '@/configs/endpoint.config'
import type { SignUpCredential } from '@/@types/auth'

export async function apiSignIn() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signIn,
        method: 'post',
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signUp,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: { email: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: { password: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function apiDeleteAccount() {
    return ApiService.fetchDataWithAxios({
        url: `${apiPrefix}/patients/do-delete-account`,
        method: 'delete',
    })
}
