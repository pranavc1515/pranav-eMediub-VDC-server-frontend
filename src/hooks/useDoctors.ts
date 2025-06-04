import { useState, useEffect, useCallback, useMemo } from 'react'
import DoctorService from '@/services/DoctorService'
import type { DoctorProfile } from '@/services/DoctorService'

// Props for the hook
interface UseDoctorsProps {
    specialization?: string
    autoFetch?: boolean
    showOnlyAvailable?: boolean
    initialPage?: number
    pageSize?: number
}

const useDoctors = ({
    specialization = '',
    autoFetch = true,
    showOnlyAvailable = false,
    initialPage = 1,
    pageSize = 15,
}: UseDoctorsProps) => {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [count, setCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [currentPage, setCurrentPage] = useState<number>(initialPage)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [lastFetchParams, setLastFetchParams] = useState<string>('')

    // Memoize the fetch parameters
    const fetchParams = useMemo(() => {
        return JSON.stringify({
            specialization,
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            onlyAvailable: showOnlyAvailable,
        })
    }, [specialization, currentPage, pageSize, searchTerm, showOnlyAvailable])

    const fetchDoctors = useCallback(async () => {
        // Prevent duplicate API calls with same parameters
        if (lastFetchParams === fetchParams && doctors.length > 0) {
            return;
        }

        try {
            setLoading(true)
            setError(null)

            const response = await DoctorService.getDoctors({
                specialization,
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                onlyAvailable: showOnlyAvailable,
            })

            if (response.success) {
                setDoctors(response.data)
                setCount(response.count)
                setTotalPages(response.totalPages || Math.ceil(response.count / pageSize))
                
                // Only update current page if it's different
                if (response.currentPage !== currentPage) {
                    setCurrentPage(response.currentPage || currentPage)
                }
                
                setLastFetchParams(fetchParams)
            } else {
                setError('Error fetching doctors')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error fetching doctors'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [fetchParams, currentPage, pageSize, searchTerm, showOnlyAvailable, specialization, doctors.length])

    useEffect(() => {
        if (autoFetch) {
            fetchDoctors()
        }
    }, [autoFetch, fetchDoctors])

    const changePage = useCallback((page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page)
        }
    }, [currentPage])

    const search = useCallback((term: string) => {
        setSearchTerm(term)
        setCurrentPage(1) // Reset to first page when searching
    }, [])

    const filterDoctors = useCallback((term: string): DoctorProfile[] => {
        if (!term) return doctors

        return doctors.filter(
            (doctor) =>
                doctor.fullName?.toLowerCase().includes(term.toLowerCase()) ||
                doctor.DoctorProfessional?.specialization
                    ?.toLowerCase()
                    .includes(term.toLowerCase())
        )
    }, [doctors])

    // Memoize the return value
    return useMemo(() => ({
        doctors,
        count,
        loading,
        error,
        fetchDoctors,
        filterDoctors,
        totalPages,
        currentPage,
        changePage,
        search,
        searchTerm,
    }), [
        doctors,
        count,
        loading,
        error,
        fetchDoctors,
        filterDoctors,
        totalPages,
        currentPage,
        changePage,
        search,
        searchTerm,
    ])
}

export default useDoctors
