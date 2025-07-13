import ApiService from './ApiService'
import { apiPrefix } from '@/configs/endpoint.config'

export async function apiGetNotificationCount() {
    return ApiService.fetchDataWithAxios<{
        count: number
    }>({
        url: '/notification/count',
        method: 'get',
    })
}

export async function apiGetNotificationList() {
    return ApiService.fetchDataWithAxios<
        {
            id: string
            target: string
            description: string
            date: string
            image: string
            type: number
            location: string
            locationLabel: string
            status: string
            readed: boolean
        }[]
    >({
        url: '/notification/list',
        method: 'get',
    })
}

export async function apiGetSearchResult<T>(params: { query: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/search/query',
        method: 'get',
        params,
    })
}

export async function fetchUserTerms() {
    return ApiService.fetchDataWithAxios({
        url: `${apiPrefix}/patients/settings/terms`,
        method: 'get',
    })
}

export async function fetchAboutUs() {
    return ApiService.fetchDataWithAxios({
        url: `${apiPrefix}/patients/settings/about`,
        method: 'get',
    })
}
