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
        component: lazy(() => import('@/views/user/Dashboard')),
        authority: [],
    },
    {
        key: 'videoDoctorConsultation',
        path: '/vdc',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'user.appointments',
        path: '/user/appointments',
        component: lazy(() => import('@/views/user/Appointments')),
        authority: ['user'],
    },
    {
        key: 'user.profileSetup',
        path: '/user-profile-setup',
        component: lazy(() => import('@/views/user/ProfileSetup')),
        authority: ['user'],
        meta: {
            layout: 'blank',
        },
    },
    {
        key: 'user.family',
        path: '/user/family',
        component: lazy(() => import('@/views/user/Family')),
        authority: ['user'],
    },

    {
        key: 'doctorVideoCall',
        path: '/doctor/video-consultation/:id',
        component: lazy(() => import('@/views/Interface/VideoCallInterface')),
        authority: ['doctor'],
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
        key: 'userReports',
        path: '/user/reports',
        component: lazy(() => import('@/views/user/Reports')),
        authority: ['user'],
    },
    {
        key: 'doctorReports',
        path: '/doctor/reports',
        component: lazy(() => import('@/views/doctor/Reports')),
        authority: ['doctor'],
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
    {
        key: 'razerpayTest',
        path: '/razerpay-test',
        component: lazy(() => import('@/views/razerpay-test')),
        authority: [],
    },
    {
        key: 'userProfile',
        path: '/user/profile',
        component: lazy(() => import('@/views/user/Profile')),
        authority: ['user'],
    },
    {
        key: 'userSettings',
        path: '/user/settings',
        component: lazy(() => import('@/views/user/Settings')),
        authority: ['user'],
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
