import ApiService from './ApiService'

export type FamilyMember = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    relationship: string
    dateOfBirth: string
    gender: string
    phone: string
    email: string
    bloodGroup: string
    medicalConditions?: string | null
    emergencyContact: boolean
    isActive?: boolean
    profileImage?: string | null
    notes?: string | null
    created_at?: string
    updated_at?: string
}

export type FamilyResponse = {
    success: boolean
    message: string
    data: FamilyMember | FamilyMember[]
    count?: number
}

export type AddFamilyMemberRequest = {
    userId: string
    firstName: string
    lastName: string
    relationship: string
    dateOfBirth: string
    gender: string
    phone: string
    email: string
    bloodGroup: string
    emergencyContact: boolean
}

export type UpdateFamilyMemberRequest = Partial<FamilyMember>

export type FamilyStatistics = {
    totalMembers: number
    emergencyContactsCount: number
    relationshipBreakdown: Array<{
        relationship: string
        count: number
    }>
    genderBreakdown: Array<{
        gender: string
        count: number
    }>
    ageGroupBreakdown: Array<{
        ageGroup: string
        count: number
    }>
    generatedAt: string
}

export type FamilyStatisticsResponse = {
    success: boolean
    message: string
    data: FamilyStatistics
}

export type SearchResponse = {
    success: boolean
    message: string
    data: FamilyMember[]
    count: number
    query: string
}

const FamilyService = {
    /**
     * Add a new family member
     */
    addFamilyMember(data: AddFamilyMemberRequest) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: '/api/family/add',
            method: 'POST',
            data,
        })
    },

    /**
     * Get all family members for a specific user
     */
    getFamilyMembers(userId: string, relationship?: string, isActive?: boolean) {
        const params = new URLSearchParams()
        if (relationship) params.append('relationship', relationship)
        if (isActive !== undefined) params.append('isActive', isActive.toString())
        
        const queryString = params.toString()
        const url = queryString 
            ? `/api/family/user/${userId}?${queryString}`
            : `/api/family/user/${userId}`

        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url,
            method: 'GET',
        })
    },

    /**
     * Get a specific family member by ID
     */
    getFamilyMember(id: string) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/${id}`,
            method: 'GET',
        })
    },

    /**
     * Update a family member
     */
    updateFamilyMember(id: string, data: UpdateFamilyMemberRequest) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/${id}`,
            method: 'PUT',
            data,
        })
    },

    /**
     * Soft delete a family member (sets isActive to false)
     */
    deleteFamilyMember(id: string) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/${id}`,
            method: 'DELETE',
        })
    },

    /**
     * Permanently delete a family member from the database
     */
    permanentlyDeleteFamilyMember(id: string) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/${id}/permanent`,
            method: 'DELETE',
        })
    },

    /**
     * Get family members by specific relationship
     */
    getFamilyMembersByRelationship(userId: string, relationship: string) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/user/${userId}/relationship/${relationship}`,
            method: 'GET',
        })
    },

    /**
     * Get all emergency contacts for a user
     */
    getEmergencyContacts(userId: string) {
        return ApiService.fetchDataWithAxios<FamilyResponse>({
            url: `/api/family/user/${userId}/emergency-contacts`,
            method: 'GET',
        })
    },

    /**
     * Search family members by name, relationship, phone, or email
     */
    searchFamilyMembers(userId: string, query: string) {
        return ApiService.fetchDataWithAxios<SearchResponse>({
            url: `/api/family/user/${userId}/search?query=${encodeURIComponent(query)}`,
            method: 'GET',
        })
    },

    /**
     * Get family statistics for a user
     */
    getFamilyStatistics(userId: string) {
        return ApiService.fetchDataWithAxios<FamilyStatisticsResponse>({
            url: `/api/family/user/${userId}/statistics`,
            method: 'GET',
        })
    },
}

export default FamilyService 