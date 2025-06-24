import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import PageContainer from '@/components/template/PageContainer'
import {
    protectedRoutes as appProtectedRoutes,
    publicRoutes,
} from '@/configs/routes.config'
import { useAuth } from '@/auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'

import Prescriptions from '@/views/doctor/Prescriptions'
import UploadPrescription from '@/views/doctor/UploadPrescription'
import UserPrescriptions from '@/views/user/Prescriptions'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const AllRoutes = (props: AllRoutesProps) => {
    const { user } = useAuth()

    const doctorRoutes = [
        {
            key: 'uploadPrescription',
            path: '/doctor/upload-prescription',
            component: UploadPrescription,
            authority: ['doctor'],
            meta: {
                label: 'Upload Prescription',
                pageTitle: 'Upload Prescription',
                desc: 'Upload or generate prescriptions for patients',
            },
        },
        {
            key: 'prescriptions',
            path: '/doctor/prescriptions',
            component: Prescriptions,
            authority: ['doctor'],
            meta: {
                label: 'Prescriptions',
                pageTitle: 'Prescriptions',
                desc: 'Manage prescriptions for patients',
            },
        },
    ]

    const patientRoutes = [
        {
            key: 'userPrescriptions',
            path: '/user/prescriptions',
            component: UserPrescriptions,
            authority: ['user'],
            meta: {
                label: 'My Prescriptions',
                pageTitle: 'My Prescriptions',
                desc: 'View and manage your prescriptions',
            },
        },
    ]

    const combinedProtectedRoutes = [
        ...appProtectedRoutes,
        ...doctorRoutes,
        ...patientRoutes,
    ]

    return (
        <Routes>
            <Route path="/" element={<PublicRoute />}>
                {publicRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <AppRoute
                                routeKey={route.key}
                                component={route.component}
                                {...route.meta}
                            />
                        }
                    />
                ))}
            </Route>
            <Route path="/" element={<ProtectedRoute />}>
                {combinedProtectedRoutes.map((route, index) => (
                    <Route
                        key={route.key + index}
                        path={route.path}
                        element={
                            <AuthorityGuard
                                userAuthority={user.authority}
                                authority={route.authority}
                            >
                                <PageContainer {...props} {...route.meta}>
                                    <AppRoute
                                        routeKey={route.key}
                                        component={route.component}
                                        {...route.meta}
                                    />
                                </PageContainer>
                            </AuthorityGuard>
                        }
                    />
                ))}
                <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
        </Routes>
    )
}

export default AllRoutes
