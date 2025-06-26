import { Navigate, Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated, user } = useAuth()

    const getRedirectPath = () => {
        if (user?.authority?.includes('doctor')) {
            return '/doctor/profile'
        }
        return authenticatedEntryPath
    }

    return authenticated ? <Navigate to={getRedirectPath()} /> : <Outlet />
}

export default PublicRoute
