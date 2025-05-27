import { useState, useEffect, useCallback } from 'react'
import DoctorService from '@/services/DoctorService'

// Define types for doctor and service response
interface Doctor {
    id: string
    fullName: string
    DoctorProfessional?: {
        specialization?: string
    }
    [key: string]: any // for any additional fields
}

interface DoctorResponse {
    success: boolean
    data: Doctor[]
    count: number
    totalPages?: number
    currentPage?: number
    message?: string
}

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
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [count, setCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [currentPage, setCurrentPage] = useState<number>(initialPage)
    const [searchTerm, setSearchTerm] = useState<string>('')

    const fetchDoctors = useCallback(
        async (page: number = currentPage, search: string = searchTerm) => {
            try {
                setLoading(true)
                setError(null)

                const response: DoctorResponse = await DoctorService.getDoctors(
                    {
                        specialization,
                        page,
                        limit: pageSize,
                        search,
                        onlyAvailable: showOnlyAvailable,
                    },
                )

                if (response.success) {
                    setDoctors(response.data)
                    setCount(response.count)
                    setTotalPages(
                        response.totalPages ??
                            Math.ceil(response.count / pageSize),
                    )
                    setCurrentPage(response.currentPage ?? page)
                } else {
                    setError(response.message || 'Error fetching doctors')
                }
            } catch (err: any) {
                setError(err?.message || 'Error fetching doctors')
            } finally {
                setLoading(false)
            }
        },
        [specialization, showOnlyAvailable, pageSize, currentPage, searchTerm],
    )

    useEffect(() => {
        if (autoFetch) {
            fetchDoctors(initialPage, '')
        }
    }, [
        autoFetch,
        fetchDoctors,
        initialPage,
        specialization,
        showOnlyAvailable,
    ])

    const changePage = (page: number) => {
        setCurrentPage(page)
        fetchDoctors(page, searchTerm)
    }

    const search = (term: string) => {
        setSearchTerm(term)
        fetchDoctors(1, term)
    }

    const toggleAvailability = (onlyAvailable: boolean): boolean => {
        return onlyAvailable
    }

    const filterDoctors = (term: string): Doctor[] => {
        if (!term) return doctors

        return doctors.filter(
            (doctor) =>
                doctor.fullName?.toLowerCase().includes(term.toLowerCase()) ||
                doctor.DoctorProfessional?.specialization
                    ?.toLowerCase()
                    .includes(term.toLowerCase()),
        )
    }

    return {
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
        toggleAvailability,
        searchTerm,
    }
}

export default useDoctors
