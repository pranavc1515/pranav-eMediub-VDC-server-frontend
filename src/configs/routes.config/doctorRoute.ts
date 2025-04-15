import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const doctorRoute: Routes = [
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
    },
]

export default doctorRoute
