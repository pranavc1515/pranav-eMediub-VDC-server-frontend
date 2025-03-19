import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ENV } from '@/configs/environment'

const ApiService = {
    baseUrl: ENV.API_BASE_URL,

    getFullUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint}`
    },

    fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
    ) {
        const fullUrl = param.url ? this.getFullUrl(param.url) : param.url
        return new Promise<Response>((resolve, reject) => {
            AxiosBase({ ...param, url: fullUrl })
                .then((response: AxiosResponse<Response>) => {
                    resolve(response.data)
                })
                .catch((errors: AxiosError) => {
                    reject(errors)
                })
        })
    },
}

export default ApiService
