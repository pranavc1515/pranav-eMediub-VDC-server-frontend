import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'doctorProfile',
        path: '/doctor/profile',
        title: 'Profile',
        translateKey: 'nav.doctorProfile',
        icon: 'user',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['doctor'],
        subMenu: [],
    },
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'settings',
        path: '/settings',
        title: 'Settings',
        translateKey: 'nav.settings',
        icon: 'settings',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'videoConsultation',
        path: '/video-consultation',
        title: 'Video Doctor Consultation',
        translateKey: 'nav.videoConsultation',
        icon: 'video',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'medicalReport',
        path: '/medical-report',
        title: 'Medical Report',
        translateKey: 'nav.medicalReport',
        icon: 'report',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'termsConditions',
        path: '/terms-conditions',
        title: 'Terms & Conditions',
        translateKey: 'nav.termsConditions',
        icon: 'document',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'aboutUs',
        path: '/about-us',
        title: 'About Us',
        translateKey: 'nav.aboutUs',
        icon: 'info',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
]

export default navigationConfig
