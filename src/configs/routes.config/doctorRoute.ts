import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const doctorRoute: Routes = [
    {
        key: 'doctor.profile',
        path: '/doctor/profile',
        component: lazy(() => import('@/views/doctor/Profile')),
        authority: ['doctor'],
    },
]

export default doctorRoute
