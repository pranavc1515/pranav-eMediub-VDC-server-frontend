import { useState, useEffect } from 'react'
import DoctorService, { DoctorProfile } from '../services/DoctorService'

interface UseDoctorsOptions {
  specialization?: string
  autoFetch?: boolean
}

export function useDoctors(options: UseDoctorsOptions = {}) {
  const { specialization, autoFetch = true } = options
  
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = async (specialization?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await DoctorService.getAvailableDoctors(specialization)
      if (response.success) {
        setDoctors(response.data)
        setCount(response.count)
      } else {
        setError('Failed to fetch doctors')
      }
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Error fetching doctors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchDoctors(specialization)
    }
  }, [specialization, autoFetch])

  const filterDoctors = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return doctors
    }
    
    const term = searchTerm.toLowerCase()
    return doctors.filter(doctor => 
      doctor.fullName.toLowerCase().includes(term) ||
      doctor.DoctorProfessional?.specialization?.toLowerCase().includes(term)
    )
  }

  return {
    doctors,
    count,
    loading,
    error,
    fetchDoctors,
    filterDoctors
  }
}

export default useDoctors 