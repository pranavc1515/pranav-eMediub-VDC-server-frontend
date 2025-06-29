import { useSessionUser, useToken } from '@/store/authStore'
import { clearAllUserData } from '@/utils/userStorage'
import type { AxiosError } from 'axios'

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
}

export default AxiosResponseIntrceptorErrorCallback
