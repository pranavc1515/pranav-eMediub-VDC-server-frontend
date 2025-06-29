import { memo, Suspense, lazy } from 'react'
import { useSessionUser } from '@/store/authStore'
import { useStoredUser } from '@/hooks/useStoredUser'
import type { Meta } from '@/@types/routes'

const DoctorVDC = lazy(() => import('./components/doctorVDC'))
const UserVDC = lazy(() => import('./components/userVDC'))

const Home = <T extends Meta>(props: T): JSX.Element => {
    const user = useSessionUser((state) => state.user)
    const { isDoctor, userData, userType, loginTimestamp } = useStoredUser()
    
    // Log stored user data for demonstration (remove in production)
    console.log('Stored user data:', {
        userType,
        userData,
        loginTimestamp,
        isDoctor,
    })
    
    // Use stored data as fallback if zustand store is empty
    const isDoctorUser = isDoctor || user.authority?.includes('doctor') || false

    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin">
                        <span className="text-2xl icon-loading" />
                    </div>
                </div>
            }
        >
            {isDoctorUser ? <DoctorVDC /> : <UserVDC />}
        </Suspense>
    )
}

export default memo(Home)
