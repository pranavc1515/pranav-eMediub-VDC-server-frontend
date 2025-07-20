import { useState } from 'react'
import { Button, Card, Alert } from '@/components/ui'
import { useAuth } from '@/auth'
import DoctorService from '@/services/DoctorService'
import ApiService from '@/services/ApiService'

const EmailVerificationDebug = () => {
    const { user } = useAuth()
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const testDirectProfileFetch = async () => {
        setLoading(true)
        setError('')
        setDebugInfo(null)

        try {
            console.log('Testing direct profile fetch')
            const response = await ApiService.fetchDataWithAxios<{
                success: boolean
                data: any
            }>({
                url: '/api/doctors/profile',
                method: 'GET',
            })
            setDebugInfo({
                success: response.success,
                data: response.data,
                timestamp: new Date().toISOString()
            })
            console.log('Direct profile response:', response)
        } catch (err: any) {
            console.error('Direct profile fetch error:', err)
            setError(err.message || 'Failed to fetch profile')
        } finally {
            setLoading(false)
        }
    }

    const testEmailVerificationStatus = async () => {
        if (!user?.id && !user?.userId) {
            setError('No user ID available')
            return
        }

        setLoading(true)
        setError('')
        setDebugInfo(null)

        try {
            const userId = user?.id || user?.userId
            console.log('Testing email verification status for user:', userId)
            const response = await DoctorService.getEmailVerificationStatus(Number(userId))
            setDebugInfo({
                success: response.success,
                data: response.data,
                timestamp: new Date().toISOString()
            })
            console.log('Debug response:', response)
        } catch (err: any) {
            console.error('Debug error:', err)
            setError(err.message || 'Failed to get verification status')
        } finally {
            setLoading(false)
        }
    }

    const testSendEmailOTP = async () => {
        if (!user?.id && !user?.userId) {
            setError('No user ID available')
            return
        }

        setLoading(true)
        setError('')
        setDebugInfo(null)

        try {
            const userId = user?.id || user?.userId
            const testEmail = 'test@example.com'
            console.log('Testing send email OTP for:', testEmail, 'User ID:', userId)
            const response = await DoctorService.sendEmailOTP(testEmail, Number(userId))
            setDebugInfo({
                success: response.success,
                data: response.data,
                message: response.message,
                timestamp: new Date().toISOString()
            })
            console.log('Send OTP debug response:', response)
        } catch (err: any) {
            console.error('Send OTP debug error:', err)
            setError(err.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const testResendEmailOTP = async () => {
        if (!user?.id && !user?.userId) {
            setError('No user ID available')
            return
        }

        setLoading(true)
        setError('')
        setDebugInfo(null)

        try {
            const userId = user?.id || user?.userId
            console.log('Testing resend email OTP for user:', userId)
            const response = await DoctorService.resendEmailOTP(Number(userId))
            setDebugInfo({
                success: response.success,
                data: response.data,
                message: response.message,
                timestamp: new Date().toISOString()
            })
            console.log('Resend OTP debug response:', response)
        } catch (err: any) {
            console.error('Resend OTP debug error:', err)
            setError(err.message || 'Failed to resend OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Email Verification Debug</h3>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">User ID: {user?.id || user?.userId || 'Not available'}</p>
                <p className="text-sm text-gray-600 mb-2">User Email: {user?.email || 'Not available'}</p>
                <p className="text-sm text-gray-600 mb-2">User Name: {user?.userName || user?.fullName || 'Not available'}</p>
                <p className="text-sm text-gray-600 mb-2">Authority: {user?.authority?.join(', ') || 'Not available'}</p>
            </div>

            {error && (
                <Alert type="danger" showIcon className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                    size="sm"
                    onClick={testDirectProfileFetch}
                    loading={loading}
                >
                    Test Direct Profile Fetch
                </Button>
                <Button
                    size="sm"
                    onClick={testEmailVerificationStatus}
                    loading={loading}
                >
                    Test Verification Status
                </Button>
                <Button
                    size="sm"
                    onClick={testSendEmailOTP}
                    loading={loading}
                >
                    Test Send OTP
                </Button>
                <Button
                    size="sm"
                    onClick={testResendEmailOTP}
                    loading={loading}
                >
                    Test Resend OTP
                </Button>
            </div>

            {debugInfo && (
                <div className="mt-4">
                    <h4 className="font-medium mb-2">Debug Information:</h4>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </Card>
    )
}

export default EmailVerificationDebug 