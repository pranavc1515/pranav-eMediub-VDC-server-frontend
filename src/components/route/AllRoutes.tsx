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
import VideoConsultation from '@/views/doctor/VideoConsultation'
import UserVideoConsultation from '@/views/VideoConsultation'

import PatientRecords from '@/views/doctor/PatientRecords'
import Prescriptions from '@/views/doctor/Prescriptions'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const AllRoutes = (props: AllRoutesProps) => {
    const { user } = useAuth()

    const doctorRoutes = [
        {
            key: 'videoConsultation',
            path: '/doctor/video-consultation',
            component: VideoConsultation,
            authority: ['doctor'],
            meta: {
                label: 'Video Consultation',
                pageTitle: 'Video Consultation',
                desc: 'Conduct video consultations with patients',
            },
        },

        {
            key: 'patientRecords',
            path: '/doctor/patient-records',
            component: PatientRecords,
            authority: ['doctor'],
            meta: {
                label: 'Patient Records',
                pageTitle: 'Patient Records',
                desc: 'View and manage patient records',
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
            key: 'userVideoConsultation',
            path: '/user/video-consultation/:doctorId',
            component: UserVideoConsultation,
            authority: ['user'],
            meta: {
                pageContainerType: 'gutterless',
                label: 'Video Consultation',
                pageTitle: 'Video Consultation',
                desc: 'Join video consultation with doctor',
            },
        },
    ]

    const combinedProtectedRoutes = [...appProtectedRoutes, ...doctorRoutes, ...patientRoutes]

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
