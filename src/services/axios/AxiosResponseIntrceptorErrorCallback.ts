import { useSessionUser, useToken } from '@/store/authStore'
import { clearAllUserData } from '@/utils/userStorage'
import type { AxiosError } from 'axios'
import toast from '@/components/ui/toast/toast'
import Notification from '@/components/ui/Notification/Notification'
import { createElement } from 'react'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const { response } = error
    const { setToken } = useToken()

    if (response && unauthorizedCode.includes(response.status)) {
        setToken('')
        useSessionUser.getState().setUser({})
        useSessionUser.getState().setSessionSignedIn(false)
        // Clear all user data from localStorage on unauthorized access
        clearAllUserData()
    }

    // Show error message in toast notification
    if (response?.data) {
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
