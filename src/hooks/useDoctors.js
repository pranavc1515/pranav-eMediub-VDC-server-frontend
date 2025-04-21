import { useState, useEffect, useCallback } from 'react';
import DoctorService from '@/services/DoctorService';

const useDoctors = ({
  specialization = '',
  autoFetch = true,
  showOnlyAvailable = false,
  initialPage = 1,
  pageSize = 15
}) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDoctors = useCallback(async (page = currentPage, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the existing DoctorService to fetch data
      const response = await DoctorService.getDoctors({
        specialization,
        page,
        limit: pageSize,
        search,
        onlyAvailable: showOnlyAvailable
      });
      
      if (response.success) {
        setDoctors(response.data);
        setCount(response.count);
        setTotalPages(response.totalPages || Math.ceil(response.count / pageSize));
        setCurrentPage(response.currentPage || page);
      } else {
        setError(response.message || 'Error fetching doctors');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching doctors');
    } finally {
      setLoading(false);
    }
  }, [specialization, showOnlyAvailable, pageSize, currentPage, searchTerm]);

  useEffect(() => {
    if (autoFetch) {
      fetchDoctors(currentPage, '');
    }
  }, [autoFetch, fetchDoctors, currentPage, specialization]);

  const changePage = (page) => {
    setCurrentPage(page);
    fetchDoctors(page, searchTerm);
  };

  const search = (term) => {
    setSearchTerm(term);
    fetchDoctors(1, term); // Reset to first page when searching
  };

  const toggleAvailability = (onlyAvailable) => {
    // This will trigger a re-fetch through the useEffect
    return onlyAvailable; 
  };

  const filterDoctors = (term) => {
    if (!term) return doctors;
    
    return doctors.filter(doctor => 
      doctor.fullName?.toLowerCase().includes(term.toLowerCase()) ||
      doctor.DoctorProfessional?.specialization?.toLowerCase().includes(term.toLowerCase())
    );
  };

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
    searchTerm
  };
};

export default useDoctors; 