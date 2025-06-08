import { memo, Suspense, lazy } from 'react'
import { useSessionUser } from '@/store/authStore'

const DoctorHomePage = lazy(() => import('./components/DoctorHomePage'))
const UserHomePage = lazy(() => import('./components/UserHomePage'))

const Home = () => {
    const user = useSessionUser((state) => state.user)
    const isDoctor = user.authority?.includes('doctor') || false

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin">
                <span className="text-2xl icon-loading" />
            </div>
        </div>}>
            {isDoctor ? <DoctorHomePage /> : <UserHomePage />}
        </Suspense>
    )
}

export default memo(Home)
