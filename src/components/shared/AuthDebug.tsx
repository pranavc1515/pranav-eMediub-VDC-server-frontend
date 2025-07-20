import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/auth'

const AuthDebug = () => {
    const { user, authenticated } = useAuth()
    const [localStorageData, setLocalStorageData] = useState<any>(null)
    const [tokenData, setTokenData] = useState<any>(null)

    useEffect(() => {
        // Get localStorage data
        try {
            const userData = localStorage.getItem('user_data')
            const doctorData = localStorage.getItem('doctor_data')
            const userStorage = localStorage.getItem('user')
            const token = localStorage.getItem('token')
            
            setLocalStorageData({
                user_data: userData ? JSON.parse(userData) : null,
                doctor_data: doctorData ? JSON.parse(doctorData) : null,
                user: userStorage ? JSON.parse(userStorage) : null,
                token: token ? 'Token exists' : 'No token'
            })

            // Parse token if exists
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    setTokenData(payload)
                } catch (e) {
                    setTokenData({ error: 'Failed to parse token' })
                }
            }
        } catch (e) {
            console.error('Error reading localStorage:', e)
        }
    }, [])

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">Auth Context State:</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                        <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
                        <p><strong>User ID:</strong> {user?.id || user?.userId || 'Not available'}</p>
                        <p><strong>User Name:</strong> {user?.userName || user?.fullName || 'Not available'}</p>
                        <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
                        <p><strong>Authority:</strong> {user?.authority?.join(', ') || 'Not available'}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2">localStorage Data:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(localStorageData, null, 2)}
                    </pre>
                </div>

                {tokenData && (
                    <div>
                        <h4 className="font-medium mb-2">Token Payload:</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                            {JSON.stringify(tokenData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default AuthDebug 