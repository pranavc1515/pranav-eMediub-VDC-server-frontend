import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const doctorRoute: Routes = [
    {
        key: 'doctor.dashboard',
        path: '/doctor/dashboard',
        component: lazy(() => import('@/views/doctor/Dashboard')),
        authority: ['doctor'],
    },
    {
        key: 'doctor.profile',
        path: '/doctor/profile',
        component: lazy(() => import('@/views/doctor/Profile')),
        authority: ['doctor'],
    },
    {
        key: 'doctor.profileSetup',
        path: '/profile-setup',
        component: lazy(() => import('@/views/doctor/ProfileSetup')),
        authority: ['doctor'],
        meta: {
            layout: 'blank',
        },
    },
]

export default doctorRoute
