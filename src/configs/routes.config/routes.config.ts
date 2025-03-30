import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import doctorRoute from './doctorRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [
    {
        key: 'landing',
        path: '/',
        component: lazy(() => import('@/components/landingPage/LandingPage')),
        authority: [],
    },
    ...authRoute,
]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'videoConsultation',
        path: '/doctor/video-consultation',
        component: lazy(() => import('@/views/doctor/VideoConsultation')),
        authority: ['doctor'],
    },
    {
        key: 'doctorVideoCall',
        path: '/doctor/video-consultation/:id',
        component: lazy(() => import('@/views/doctor/VideoConsultation')),
        authority: ['doctor'],
    },
    {
        key: 'userVideoConsultation',
        path: '/user/video-consultation',
        component: lazy(() => import('@/views/user/VideoConsultation')),
        authority: ['user'],
    },
    {
        key: 'userVideoCall',
        path: '/user/video-consultation/:id',
        component: lazy(() => import('@/views/user/VideoCallView')),
        authority: ['user'],
    },
    {
        key: 'medicalReport',
        path: '/medical-report',
        component: lazy(() => import('@/views/medical-report')),
        authority: ['doctor'],
    },
    {
        key: 'userPrescriptions',
        path: '/user/prescriptions',
        component: lazy(() => import('@/views/user/PrescriptionView')),
        authority: ['user'],
    },
    {
        key: 'userMedicalReports',
        path: '/user/medical-reports',
        component: lazy(() => import('@/views/user/MedicalReportView')),
        authority: ['user'],
    },
    {
        key: 'termsConditions',
        path: '/terms-conditions',
        component: lazy(() => import('@/views/terms-conditions')),
        authority: [],
    },
    {
        key: 'aboutUs',
        path: '/about-us',
        component: lazy(() => import('@/views/about-us')),
        authority: [],
    },
    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/single-menu-view',
        component: lazy(() => import('@/views/demo/SingleMenuView')),
        authority: [],
    },
    {
        key: 'collapseMenu.item1',
        path: '/collapse-menu-item-view-1',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'collapseMenu.item2',
        path: '/collapse-menu-item-view-2',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
        authority: [],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: lazy(() => import('@/views/demo/GroupSingleMenuItemView')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView1'),
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView2'),
        ),
        authority: [],
    },
    ...othersRoute,
    ...doctorRoute,
]
