import { memo, Suspense, lazy } from 'react'
import { useSessionUser } from '@/store/authStore'
import type { Meta } from '@/@types/routes'

const DoctorVDC = lazy(() => import('./components/doctorVDC'))
const UserVDC = lazy(() => import('./components/userVDC'))

const Home = <T extends Meta>(props: T): JSX.Element => {
    const user = useSessionUser((state) => state.user)
    const isDoctor = user.authority?.includes('doctor') || false

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
            {isDoctor ? <DoctorVDC /> : <UserVDC />}
        </Suspense>
    )
}

export default memo(Home)
