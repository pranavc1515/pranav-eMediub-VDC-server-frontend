/**
 * Axios Response Interceptor Error Callback
 * 
 * This interceptor handles API error responses and shows toast notifications for errors.
 * However, it suppresses toast notifications for logout requests and certain authentication
 * failures to avoid showing error messages when users are intentionally logging out.
 * 
 * Suppressed requests:
 * - /sign-out (logout endpoint)
 * - Authentication endpoints with 401 status during logout flow
 */
import { useSessionUser, useToken } from '@/store/authStore'
import { clearAllUserData } from '@/utils/userStorage'
import type { AxiosError } from 'axios'
import toast from '@/components/ui/toast/toast'
import Notification from '@/components/ui/Notification/Notification'
import { createElement } from 'react'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const { response, config } = error
    const { setToken } = useToken()

    // Check if this is a logout or authentication-related request that should suppress toasts
    const isLogoutRequest = config?.url?.includes('/sign-out') || config?.url?.includes('sign-out')
    const isAuthRequest = config?.url?.includes('/sign-in') || config?.url?.includes('sign-in') || 
                         config?.url?.includes('/sign-up') || config?.url?.includes('sign-up') ||
                         config?.url?.includes('/profile-details') || config?.url?.includes('profile-details')
    
    // Suppress toasts for logout and certain auth requests during logout flow
    const shouldSuppressToast = isLogoutRequest || (isAuthRequest && response?.status === 401)

    // Debug logging for logout requests
    if (isLogoutRequest) {
        console.log('Logout request detected, suppressing toast notification:', {
            url: config?.url,
            status: response?.status,
            shouldSuppressToast
        })
    }

    if (response && unauthorizedCode.includes(response.status)) {
        setToken('')
        useSessionUser.getState().setUser({})
        useSessionUser.getState().setSessionSignedIn(false)
        // Clear all user data from localStorage on unauthorized access
        clearAllUserData()
    }

    // Show error message in toast notification, but suppress for logout requests and certain auth failures
    if (response?.data && !shouldSuppressToast) {
        const errorData = response.data as any
        const errorMessage = errorData.message || 'An error occurred'
        
        // Create element using createElement instead of JSX
        const notificationElement = createElement(Notification, {
            type: "danger",
            title: "Error",
            closable: true,
            children: errorMessage
        })
        
        toast.push(
            notificationElement,
            {
                placement: 'top-center',
            }
        )
    }
}

export default AxiosResponseIntrceptorErrorCallback
