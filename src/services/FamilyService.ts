import ApiService from './ApiService'
import type { AxiosRequestConfig } from 'axios'

export interface FamilyMember {
    id: number
    name: string
    relation_type: string
    phone: string
    email: string
    age: string
    dob: string
    gender: string
    marital_status: string
    profession: string
    image: string | null
    height: string
    weight: string
    diet: string
    relatives: FamilyMember[]
}

export interface FamilyTreeResponse {
    status: boolean
    status_code: number
    message: string
    data: {
        user: {
            id: number
            totalRelativMembers: number
        }
        familyTree: FamilyMember[]
    }
}

export interface AddFamilyMemberRequest {
    nodeUserId: number
    relationName: string
    name: string
    phone: string
    email?: string
    age: string
    dob?: string
    gender: string
    marital_status: string
    profession?: string
    height?: string
    weight?: string
    diet?: string
    image?: string
}

export interface AddFamilyMemberResponse {
    status: boolean
    status_code: number
    message: string
    familyUserId: number
}

export interface UpdateFamilyMemberRequest {
    name?: string
    relationName?: string
    phone?: string
    email?: string
    age?: string
    dob?: string
    gender?: string
    marital_status?: string
    profession?: string
    height?: string
    weight?: string
    diet?: string
    image?: string
}

export interface RemoveFamilyMemberRequest {
    userId: number
}

export interface ApiResponse {
    status: boolean
    status_code: number
    message: string
}

const FamilyService = {
    /**
     * Get user's family tree
     * GET /family/view-family-tree
     */
    getFamilyTree() {
        return ApiService.fetchDataWithAxios<FamilyTreeResponse>({
            url: '/api/family/view-family-tree',
            method: 'GET',
        })
    },

    async addFamilyMember(data: AddFamilyMemberRequest): Promise<AddFamilyMemberResponse> {
        const requestConfig: AxiosRequestConfig = {
            method: 'POST',
            url: '/api/family/add-family-connection',
            data,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        }
        return ApiService.fetchDataWithAxios<AddFamilyMemberResponse>(requestConfig)
    },

    async updateFamilyMember(
        familyMemberId: number,
        data: UpdateFamilyMemberRequest
    ): Promise<ApiResponse> {
        const requestConfig: AxiosRequestConfig = {
            method: 'POST',
            url: `/api/family/update-family-details/${familyMemberId}`,
            data,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        }
        return ApiService.fetchDataWithAxios<ApiResponse>(requestConfig)
    },

    async removeFamilyMember(
        relatedUserId: number,
        data: RemoveFamilyMemberRequest
    ): Promise<ApiResponse> {
        const requestConfig: AxiosRequestConfig = {
            method: 'DELETE',
            url: `/api/family/remove-member/${relatedUserId}`,
            data,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        }
        return ApiService.fetchDataWithAxios<ApiResponse>(requestConfig)
    },
}

export default FamilyService 