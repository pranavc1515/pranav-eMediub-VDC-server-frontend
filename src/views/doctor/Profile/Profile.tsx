import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import DoctorService from '@/services/DoctorService'
import type { DoctorProfile } from '@/services/DoctorService'
import Card from '@/components/shared/Card'
import Avatar from '@/components/shared/Avatar'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import DatePicker from '@/components/ui/DatePicker'
import Select from '@/components/ui/Select'
import dayjs from 'dayjs'
import Badge from '@/components/ui/Badge'
import { getTodayDateString } from '@/utils/dateUtils'

// Common languages in India
const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Odia', label: 'Odia' },
    { value: 'Assamese', label: 'Assamese' },
]

const Profile = () => {
    const [profile, setProfile] = useState<DoctorProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [personalDrawerOpen, setPersonalDrawerOpen] = useState(false)
    const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false)

    // Add state for forms
    const [personalFormLoading, setPersonalFormLoading] = useState(false)
    const [personalFormError, setPersonalFormError] = useState('')
    const [professionalFormLoading, setProfessionalFormLoading] =
        useState(false)
    const [professionalFormError, setProfessionalFormError] = useState('')

    const [selectedLanguages, setSelectedLanguages] = useState<
        { value: string; label: string }[]
    >([])

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [certificatesToRemove, setCertificatesToRemove] = useState<string[]>([])

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await DoctorService.getProfile()
                if (response.success) {
                    setProfile(response.data)
                }
            } catch (err) {
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    // Initialize selected languages from profile data
    useEffect(() => {
        if (profile?.DoctorProfessional?.communicationLanguages) {
            setSelectedLanguages(
                profile.DoctorProfessional.communicationLanguages.map(
                    (lang) => ({
                        value: lang,
                        label: lang,
                    }),
                ),
            )
        }
    }, [profile])

    if (loading) {
        return (
            <Container className="h-full flex items-center justify-center">
                <Loading loading={true} />
            </Container>
        )
    }

    if (error) {
        return (
            <Container className="h-full flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </Container>
        )
    }

    if (!profile) {
        return (
            <Container className="h-full flex items-center justify-center">
                <div>No profile data available</div>
            </Container>
        )
    }

    return (
        <Container className="py-4">
            <div className="flex justify-end mb-4 gap-4">
                <Button
                    variant="solid"
                    onClick={() => {
                    setProfessionalDrawerOpen(true)
                    setCertificatesToRemove([])
                    setSelectedFiles([])
                }}
                >
                    Edit Professional Details
                </Button>
                <Button
                    variant="solid"
                    onClick={() => setPersonalDrawerOpen(true)}
                >
                    Edit Personal Details
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                    <div className="p-6 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <Avatar
                            size={100}
                            shape="circle"
                            src={profile.profilePhoto || ''}
                            icon={<span>👨‍⚕️</span>}
                        />

                        {/* Name */}
                        <h2 className="mt-4 text-2xl font-semibold">
                            {profile.fullName}
                        </h2>

                        {/* Specialization */}
                        <p className="text-gray-600">
                            {profile.DoctorProfessional.specialization ||
                                'Specialization not set'}
                        </p>

                        {/* Badges */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {profile.DoctorProfessional.status ===
                            'Verified' ? (
                                <div className="inline-block rounded-full  bg-green-100 text-green-800 text-sm font-semibold px-3 py-1">
                                    {profile.DoctorProfessional.status}
                                </div>
                            ) : (
                                <div className="inline-block rounded-full    bg-red-100  text-red-800 text-sm font-semibold px-3 py-1">
                                    {profile.DoctorProfessional.status}
                                </div>
                            )}
                            {profile.status === 'Active' ? (
                                <div className="inline-block rounded-full bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1">
                                    Active
                                </div>
                            ) : (
                                <div className="inline-block rounded-full bg-red-100 text-red-800 text-sm font-semibold px-3 py-1">
                                    Inactive
                                </div>
                            )}
                        </div>

                        {/* Certificates */}
                        <div className="mt-6 w-full">
                            <p className="text-gray-600 mb-2 font-medium">Certificates</p>
                            <div className="space-y-2">
                                {profile?.DoctorProfessional?.certificates && profile.DoctorProfessional.certificates.length > 0 ? (
                                    profile.DoctorProfessional.certificates.map((cert, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p 
                                                        className="text-sm font-medium text-gray-900 truncate" 
                                                        title={cert.name}
                                                        style={{ maxWidth: '200px' }}
                                                    >
                                                        {cert.name.length > 25 ? `${cert.name.substring(0, 25)}...` : cert.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Uploaded: {new Date(cert.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <a
                                                    href={cert.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 transition-colors whitespace-nowrap"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        No certificates uploaded yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-4">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">
                                        Phone Number
                                    </p>
                                    <p>{profile.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email</p>
                                    <p>{profile.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Gender</p>
                                    <p>{profile.gender || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        Date of Birth
                                    </p>
                                    <p>{profile.dob || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-4">
                                Professional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">
                                        Qualification
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .qualification || 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        Registration Number
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .registrationNumber ||
                                            'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        Registration State
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .registrationState ||
                                            'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        Years of Experience
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .yearsOfExperience ||
                                            'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Clinic Name</p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .clinicName || 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        Consultation Fees
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .consultationFees
                                            ? `₹${profile.DoctorProfessional.consultationFees}`
                                            : 'Not set'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-600">
                                        Communication Languages
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .communicationLanguages.length > 0
                                            ? profile.DoctorProfessional.communicationLanguages.join(
                                                  ', ',
                                              )
                                            : 'Not specified'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-600">
                                        Available Days
                                    </p>
                                    <p>
                                        {profile.DoctorProfessional
                                            .availableDays.length > 0
                                            ? profile.DoctorProfessional.availableDays.join(
                                                  ', ',
                                              )
                                            : 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Personal Details Drawer */}
            <Drawer
                isOpen={personalDrawerOpen}
                onClose={() => setPersonalDrawerOpen(false)}
                title="Edit Personal Details"
            >
                <div className="p-4">
                    <div className="space-y-4">
                        <FormItem
                            label="Full Name"
                            asterisk={true}
                            invalid={!!personalFormError}
                        >
                            <Input
                                name="fullName"
                                id="fullName"
                                defaultValue={profile?.fullName}
                            />
                        </FormItem>
                        <FormItem label="Email">
                            <Input
                                name="email"
                                id="email"
                                defaultValue={profile?.email || ''}
                            />
                        </FormItem>
                        <FormItem label="Gender" asterisk={true}>
                            <select
                                name="gender"
                                id="gender"
                                defaultValue={profile?.gender || ''}
                                className="w-full rounded-md border border-gray-300 p-2"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </FormItem>
                        <FormItem label="Date of Birth" asterisk={true}>
                            <input
                                type="date"
                                name="dob"
                                id="dob"
                                defaultValue={profile?.dob ? profile.dob : ''}
                                max={getTodayDateString()}
                                className="w-full rounded-md border border-gray-300 p-2"
                            />
                        </FormItem>
                        {personalFormError && (
                            <div className="text-red-500 text-sm mb-4">
                                {personalFormError}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                onClick={() => {
                                    setPersonalDrawerOpen(false)
                                    setSelectedFiles([])
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={async (e) => {
                                    e.preventDefault()
                                    const formData = {
                                        fullName: (
                                            document.getElementById(
                                                'fullName',
                                            ) as HTMLInputElement
                                        ).value,
                                        email: (
                                            document.getElementById(
                                                'email',
                                            ) as HTMLInputElement
                                        ).value,
                                        gender: (
                                            document.getElementById(
                                                'gender',
                                            ) as HTMLSelectElement
                                        ).value,
                                        dob: (
                                            document.getElementById(
                                                'dob',
                                            ) as HTMLInputElement
                                        ).value,
                                        certificates: selectedFiles,
                                    }

                                    setPersonalFormLoading(true)
                                    setPersonalFormError('')

                                    try {
                                        const response =
                                            await DoctorService.updatePersonalDetails(
                                                profile?.id,
                                                formData,
                                            )

                                        if (response.success) {
                                            setProfile((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          ...response.data,
                                                      }
                                                    : null,
                                            )
                                            setPersonalDrawerOpen(false)
                                            setSelectedFiles([])
                                        } else {
                                            setPersonalFormError(
                                                'Failed to update profile. Please try again.',
                                            )
                                        }
                                    } catch (err) {
                                        setPersonalFormError(
                                            'Failed to update profile. Please try again.',
                                        )
                                    } finally {
                                        setPersonalFormLoading(false)
                                    }
                                }}
                                loading={personalFormLoading}
                                disabled={personalFormLoading}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>

            {/* Professional Details Drawer */}
            <Drawer
                isOpen={professionalDrawerOpen}
                onClose={() => {
                    setProfessionalDrawerOpen(false)
                    setSelectedFiles([])
                    setCertificatesToRemove([])
                    setProfessionalFormError('')
                }}
                title="Edit Professional Details"
            >
                <div className="p-4">
                    <div className="space-y-4">
                        <FormItem label="Qualification" asterisk={true}>
                            <Input
                                name="qualification"
                                id="qualification"
                                defaultValue={
                                    profile?.DoctorProfessional.qualification ||
                                    ''
                                }
                            />
                        </FormItem>
                        <FormItem label="Specialization" asterisk={true}>
                            <Input
                                name="specialization"
                                id="specialization"
                                defaultValue={
                                    profile?.DoctorProfessional
                                        .specialization || ''
                                }
                            />
                        </FormItem>
                        <FormItem label="Registration Number" asterisk={true}>
                            <Input
                                name="registrationNumber"
                                id="registrationNumber"
                                defaultValue={
                                    profile?.DoctorProfessional
                                        .registrationNumber || ''
                                }
                            />
                        </FormItem>
                        <FormItem label="Registration State" asterisk={true}>
                            <Input
                                name="registrationState"
                                id="registrationState"
                                defaultValue={
                                    profile?.DoctorProfessional
                                        .registrationState || ''
                                }
                            />
                        </FormItem>
                        <FormItem label="Expiry Date">
                            <input
                                type="date"
                                name="expiryDate"
                                id="expiryDate"
                                defaultValue={
                                    profile?.DoctorProfessional.expiryDate || ''
                                }
                                className="w-full rounded-md border border-gray-300 p-2"
                            />
                        </FormItem>
                        <FormItem label="Clinic Name">
                            <Input
                                name="clinicName"
                                id="clinicName"
                                defaultValue={
                                    profile?.DoctorProfessional.clinicName || ''
                                }
                            />
                        </FormItem>
                        <FormItem label="Years of Experience">
                            <Input
                                name="yearsOfExperience"
                                id="yearsOfExperience"
                                type="number"
                                defaultValue={
                                    profile?.DoctorProfessional.yearsOfExperience?.toString() ||
                                    '0'
                                }
                            />
                        </FormItem>
                        <FormItem label="Communication Languages">
                            <Select
                                id="communicationLanguages"
                                name="communicationLanguages"
                                isMulti
                                options={languageOptions}
                                value={selectedLanguages}
                                onChange={(options) =>
                                    setSelectedLanguages(
                                        options as {
                                            value: string
                                            label: string
                                        }[],
                                    )
                                }
                                placeholder="Select languages"
                            />
                        </FormItem>
                        <FormItem label="Consultation Fees">
                            <Input
                                name="consultationFees"
                                id="consultationFees"
                                type="number"
                                defaultValue={
                                    profile?.DoctorProfessional.consultationFees?.toString() ||
                                    '0'
                                }
                            />
                        </FormItem>
                        <FormItem label="Available Days">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    'Monday',
                                    'Tuesday',
                                    'Wednesday',
                                    'Thursday',
                                    'Friday',
                                    'Saturday',
                                    'Sunday',
                                ].map((day) => (
                                    <label
                                        key={day}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            name={`day-${day}`}
                                            id={`day-${day}`}
                                            defaultChecked={profile?.DoctorProfessional.availableDays.includes(
                                                day,
                                            )}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </FormItem>
                        <FormItem label="Certificates Management">
                            {/* Show existing certificates */}
                            {profile?.DoctorProfessional?.certificates && profile.DoctorProfessional.certificates.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">Current Certificates:</p>
                                    <div className="space-y-2">
                                        {profile.DoctorProfessional.certificates
                                            .filter(cert => !certificatesToRemove.includes(cert.key))
                                            .map((cert, index) => (
                                            <div key={cert.key} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p 
                                                        className="text-sm font-medium text-gray-900 truncate" 
                                                        title={cert.name}
                                                    >
                                                        {cert.name.length > 30 ? `${cert.name.substring(0, 30)}...` : cert.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Uploaded: {new Date(cert.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={cert.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCertificatesToRemove(prev => 
                                                                prev.includes(cert.key) 
                                                                    ? prev.filter(key => key !== cert.key)
                                                                    : [...prev, cert.key]
                                                            )
                                                        }}
                                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs transition-colors ${
                                                            certificatesToRemove.includes(cert.key)
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        {certificatesToRemove.includes(cert.key) ? 'Undo' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Show removed certificates */}
                                    {certificatesToRemove.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2 text-red-600">Certificates Marked for Removal:</p>
                                            <div className="space-y-2">
                                                {profile.DoctorProfessional.certificates
                                                    .filter(cert => certificatesToRemove.includes(cert.key))
                                                    .map((cert, index) => (
                                                    <div key={cert.key} className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200 opacity-75">
                                                        <div className="flex-1 min-w-0 mr-3">
                                                            <p 
                                                                className="text-sm font-medium text-red-800 truncate line-through" 
                                                                title={cert.name}
                                                            >
                                                                {cert.name.length > 30 ? `${cert.name.substring(0, 30)}...` : cert.name}
                                                            </p>
                                                            <p className="text-xs text-red-600 mt-1">
                                                                Will be removed when you save changes
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCertificatesToRemove(prev => 
                                                                        prev.filter(key => key !== cert.key)
                                                                    )
                                                                }}
                                                                className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs hover:bg-green-200 transition-colors"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                                Undo
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    
                                </div>
                            )}
                            
                            {/* Upload new certificates */}
                            <div>
                                <p className="text-sm font-medium mb-2">Add New Certificates:</p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || [])
                                        setSelectedFiles(files)
                                    }}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Upload medical certificates, qualifications, or registration documents. PDF, JPG, JPEG, PNG - Max 5MB each, Maximum 10 files.
                                </p>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium">Selected new files:</p>
                                        <ul className="text-sm text-gray-600">
                                            {selectedFiles.map((file, index) => (
                                                <li key={index} className="flex items-center justify-between">
                                                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFiles(prev => prev.filter((_, i) => i !== index))
                                                        }}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </FormItem>
                        {professionalFormError && (
                            <div className="text-red-500 text-sm mb-4">
                                {professionalFormError}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                onClick={() => {
                                    setProfessionalDrawerOpen(false)
                                    setSelectedFiles([])
                                    setCertificatesToRemove([])
                                    setProfessionalFormError('')
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={(e) => {
                                    e.preventDefault()

                                    // Get values from the component state
                                    const communicationLanguages =
                                        selectedLanguages.map(
                                            (option) => option.value,
                                        )

                                    // Get selected available days
                                    const availableDays: string[] = []
                                    const days = [
                                        'Monday',
                                        'Tuesday',
                                        'Wednesday',
                                        'Thursday',
                                        'Friday',
                                        'Saturday',
                                        'Sunday',
                                    ]
                                    days.forEach((day) => {
                                        const checkbox =
                                            document.getElementById(
                                                `day-${day}`,
                                            ) as HTMLInputElement
                                        if (checkbox && checkbox.checked) {
                                            availableDays.push(day)
                                        }
                                    })

                                    const formData = {
                                        qualification: (
                                            document.getElementById(
                                                'qualification',
                                            ) as HTMLInputElement
                                        ).value,
                                        specialization: (
                                            document.getElementById(
                                                'specialization',
                                            ) as HTMLInputElement
                                        ).value,
                                        registrationNumber: (
                                            document.getElementById(
                                                'registrationNumber',
                                            ) as HTMLInputElement
                                        ).value,
                                        registrationState: (
                                            document.getElementById(
                                                'registrationState',
                                            ) as HTMLInputElement
                                        ).value,
                                        expiryDate: (
                                            document.getElementById(
                                                'expiryDate',
                                            ) as HTMLInputElement
                                        ).value,
                                        clinicName: (
                                            document.getElementById(
                                                'clinicName',
                                            ) as HTMLInputElement
                                        ).value,
                                        yearsOfExperience: Number(
                                            (
                                                document.getElementById(
                                                    'yearsOfExperience',
                                                ) as HTMLInputElement
                                            ).value,
                                        ),
                                        communicationLanguages,
                                        consultationFees: Number(
                                            (
                                                document.getElementById(
                                                    'consultationFees',
                                                ) as HTMLInputElement
                                            ).value,
                                        ),
                                        availableDays,
                                        certificates: selectedFiles.length > 0 ? selectedFiles : undefined,
                                        certificatesToRemove: certificatesToRemove.length > 0 ? certificatesToRemove : undefined,
                                    }

                                    const submitFn = async () => {
                                        setProfessionalFormLoading(true)
                                        setProfessionalFormError('')

                                        try {
                                            const response =
                                                await DoctorService.updateProfessionalDetails(
                                                    profile?.id,
                                                    formData,
                                                )

                                            if (response.success) {
                                                setProfile((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              DoctorProfessional:
                                                                  {
                                                                      ...prev.DoctorProfessional,
                                                                      ...response.data,
                                                                  },
                                                          }
                                                        : null,
                                                )
                                                setProfessionalDrawerOpen(false)
                                                setSelectedFiles([])
                                                setCertificatesToRemove([])
                                            } else {
                                                setProfessionalFormError(
                                                    'Failed to update professional details. Please try again.',
                                                )
                                            }
                                        } catch (err) {
                                            setProfessionalFormError(
                                                'Failed to update professional details. Please try again.',
                                            )
                                        } finally {
                                            setProfessionalFormLoading(false)
                                        }
                                    }

                                    submitFn()
                                }}
                                loading={professionalFormLoading}
                                disabled={professionalFormLoading}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </Container>
    )
}

export default Profile
