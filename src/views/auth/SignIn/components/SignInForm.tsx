import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/Input/PhoneInput'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Checkbox from '@/components/ui/Checkbox'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import OtpInput from '@/components/shared/OtpInput'
import ApiService from '@/services/ApiService'
import DoctorService from '@/services/DoctorService'
import { useToken } from '@/store/authStore'
import appConfig from '@/configs/app.config'
import TermsAndConditionsModal from '@/components/shared/TermsAndConditionsModal'
import { saveUserToStorage, updateUserData, type UserStorageData } from '@/utils/userStorage'
import UserService from '@/services/UserService'
import { useTranslation } from '@/utils/hooks/useTranslation'

import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    userType: 'user' | 'doctor'
}

const SignInForm = ({
    disableSubmit = false,
    className,
    setMessage,
    userType,
}: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [showOtpVerification, setShowOtpVerification] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otpValue, setOtpValue] = useState('')
    const [isNewDoctor, setIsNewDoctor] = useState(false)
    const [isProfileComplete, setIsProfileComplete] = useState(false)
    const [isTermsAccepted, setIsTermsAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const [isResending, setIsResending] = useState(false)
    const { t } = useTranslation()

    const navigate = useNavigate()
    const { signIn } = useAuth()
    const { setToken } = useToken()

    const phoneSchema = z.object({
        phone: z
            .string()
            .min(1, t('auth.enterPhoneNumber'))
            .refine((phone) => {
                const cleanPhone = phone.replace(/[^\d]/g, '')
                return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)
            }, t('auth.validPhoneNumber')),
    })

    const otpSchema = z.object({
        otp: z
            .string()
            .length(6, t('auth.validOtp'))
            .nonempty(t('auth.enterOtp')),
    })

    const phoneForm = useForm({
        defaultValues: { phone: '' },
        resolver: zodResolver(phoneSchema),
    })
    const otpForm = useForm({
        defaultValues: { otp: '' },
        resolver: zodResolver(otpSchema),
    })

    const formatPhone = (phone: string) => {
        // Remove non-digit characters first
        const clean = phone.replace(/[^\d]/g, '')

        // Extract country code and local number
        const country = clean.length > 10 ? clean.slice(0, clean.length - 10) : '91'
        const local = clean.slice(-10)

        // For doctors, return without space, for users return with space
        return userType === 'doctor' 
            ? `+${country}${local}`
            : `+${country} ${local}`
    }


    const handleTermsCheckboxChange = (checked: boolean) => {
        if (checked) {
            setShowTermsModal(true)
        } else {
            setIsTermsAccepted(false)
        }
    }

    const handleTermsAccept = () => {
        setIsTermsAccepted(true)
        setShowTermsModal(false)
    }

    const handleTermsCancel = () => {
        setShowTermsModal(false)
    }

    // Timer effect for resend countdown
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [resendTimer])

    const handleSendOtp = async ({ phone }: { phone: string }) => {
        if (disableSubmit || !isTermsAccepted) return

        const formattedPhone = formatPhone(phone)
        setSubmitting(true)

        try {
            const endpoint =
                userType === 'doctor'
                    ? await handleDoctorOtpRequest(formattedPhone)
                    : await handleUserOtpRequest(formattedPhone)

            if (endpoint.success) {
                setPhoneNumber(formattedPhone)
                setShowOtpVerification(true)
                setOtpValue('')
                otpForm.reset()
                setResendTimer(30) // Start 30 second countdown
                setMessage?.(endpoint.message)
            } else {
                setMessage?.(endpoint.message)
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            setMessage?.(t('auth.otpSendError'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDoctorOtpRequest = async (phone: string) => {
        const check = await DoctorService.checkDoctorExists(phone)
        setIsNewDoctor(!check.exists)
        setIsProfileComplete(check.data?.isProfileComplete || false)

        const endpoint = check.exists
            ? 'api/doctors/login'
            : 'api/doctors/register'
        const response = await ApiService.fetchDataWithAxios({
            url: `/${endpoint}`,
            method: 'post',
            data: { phoneNumber: phone },
        }) as any

        return {
            success: response?.status || response?.success,
            message: response?.message || '',
        }
    }

    const handleUserOtpRequest = async (phone: string) => {
        const check = await ApiService.fetchDataWithAxios({
            url: '/api/patients/checkUserExists',
            method: 'post',
            data: { phone },
        }) as any

        const endpoint = check.isUserExist
            ? 'api/patients/do-login'
            : 'api/patients/register-new'
        const payload = check.isUserExist ? { username: phone } : { phone }

        const response = await ApiService.fetchDataWithAxios({
            url: `/${endpoint}`,
            method: 'post',
            data: payload,
        }) as any

        return {
            success: response?.status || response?.success,
            message: response?.message || '',
        }
    }

    const handleOtpVerification = async ({ otp }: { otp: string }) => {
        if (disableSubmit || otp.length !== 6) return

        setSubmitting(true)

        try {
            const response = await ApiService.fetchDataWithAxios({
                url:
                    userType === 'doctor'
                        ? '/api/doctors/validate-otp'
                        : '/api/patients/validate-otp',
                method: 'post',
                data:
                    userType === 'doctor'
                        ? { phoneNumber: phoneNumber, otp }
                        : { phone: phoneNumber, otp },
            })

            if ((response as any)?.status || (response as any)?.success) {
                await processOtpSuccess(response)
            } else {
                setMessage?.(t('auth.invalidOtp'))
            }
        } catch (error) {
            console.error('OTP verification error:', error)
            setMessage?.(t('auth.otpVerificationError'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleResendOtp = async () => {
        if (resendTimer > 0 || isResending) return

        setIsResending(true)
        setMessage?.(t('auth.resending'))

        try {
            const endpoint =
                userType === 'doctor'
                    ? await handleDoctorOtpRequest(phoneNumber)
                    : await handleUserOtpRequest(phoneNumber)

            if (endpoint.success) {
                setOtpValue('')
                otpForm.reset()
                setResendTimer(30) // Reset timer to 30 seconds
                setMessage?.(t('auth.otpResentSuccess'))
            } else {
                setMessage?.(endpoint.message)
            }
        } catch (error) {
            console.error('Resend OTP error:', error)
            setMessage?.(t('auth.otpResendError'))
        } finally {
            setIsResending(false)
        }
    }

    const processOtpSuccess = async (response: any) => {
        const data = userType === 'doctor' ? response.data : response
        const token = data.token
        if (!token) return setMessage?.(t('auth.noTokenReceived'))

        setToken(token)
        localStorage.setItem('token', token)

        const profile = createUserProfile(data, phoneNumber, token)
        const storageSaved = saveUserToStorage(profile)
        
        if (!storageSaved) {
            console.warn('Failed to save user data to localStorage, but continuing with authentication')
        }

        // For users, fetch additional profile details from API
        if (userType === 'user') {
            try {
                await fetchAndStoreUserProfileDetails()
            } catch (error) {
                console.warn('Failed to fetch user profile details, but continuing with authentication:', error)
            }
        }

        const result = await signIn({
            email: phoneNumber,
            password: '',
            userType,
            profile,
            token,
        })

        if (result.status === 'success') {
            const isComplete = profile.isProfileComplete
            const redirectPath = isComplete
                ? userType === 'doctor'
                    ? '/doctor/profile'
                    : appConfig.authenticatedEntryPath
                : userType === 'doctor'
                  ? '/profile-setup'
                  : '/user-profile-setup'

            navigate(redirectPath)
        } else {
            setMessage?.(result.message || t('auth.authenticationFailed'))
        }
    }

    const fetchAndStoreUserProfileDetails = async () => {
        try {
            const profileResponse = await UserService.getProfileDetails()
            
            if (profileResponse.status && profileResponse.data) {
                const profileData = profileResponse.data
                
                // Update stored user data with comprehensive profile details
                const profileUpdates: Partial<UserStorageData> = {
                    userId: profileData.id, // Set the correct user ID from profile API
                    userName: profileData.name || undefined,
                    email: profileData.email || undefined,
                    phoneNumber: profileData.phone || undefined,
                    patientId: profileData.id, // Also set patientId for backward compatibility
                    isPhoneVerify: profileData.isPhoneVerify,
                    isEmailVerify: profileData.isEmailVerify,
                    age: profileData.age,
                    dob: profileData.dob,
                    gender: profileData.gender,
                    marital_status: profileData.marital_status,
                    language: (profileData as any).language,
                    height: profileData.height,
                    weight: profileData.weight,
                    diet: profileData.diet,
                    profession: profileData.profession,
                    smoking_routine: profileData.smoking_routine,
                    drinking_routine: profileData.drinking_routine,
                    activity_routine: profileData.activity_routine,
                    image: profileData.image,
                    avatar: profileData.image, // Use image as avatar
                }

                // Update the stored user data
                const updateSuccess = updateUserData(profileUpdates)
                
                if (updateSuccess) {
                    console.log('User profile details fetched and stored successfully')
                } else {
                    console.warn('Failed to update user profile details in storage')
                }
            }
        } catch (error) {
            console.error('Error fetching user profile details:', error)
            throw error
        }
    }

    const createUserProfile = (data: any, phone: string, token: string): UserStorageData => {
        if (userType === 'doctor') {
            const user = data.doctor
            const professional = user.DoctorProfessional || {}
            
            return {
                userId: user.id,
                userName: user.name || user.fullName || 'Doctor',
                authority: ['doctor'],
                avatar: user.profilePhoto,
                email: user.email,
                phoneNumber: user.phoneNumber || phone,
                isProfileComplete: isProfileComplete,
                userType: 'doctor',
                loginTimestamp: new Date().toISOString(),
                token: token,
                // Doctor-specific data
                specialization: professional.specialization,
                consultationFees: professional.consultationFees,
            }
        }

        const user = data.patient
        return {
            userId: user.id,
            userName: user.name || user.fullName || 'User',
            authority: ['user'],
            avatar: user.profilePhoto,
            email: user.email,
            phoneNumber: user.phoneNumber || user.phone || phone,
            isProfileComplete: user.isProfileComplete,
            userType: 'user',
            loginTimestamp: new Date().toISOString(),
            token: token,
            // User-specific data
            patientId: user.id,
        }
    }

    return (
        <div className={className}>
            {!showOtpVerification ? (
                <Form onSubmit={phoneForm.handleSubmit(handleSendOtp)}>
                    <FormItem
                        label={t('auth.phoneNumber')}
                        invalid={!!phoneForm.formState.errors.phone}
                        errorMessage={phoneForm.formState.errors.phone?.message}
                    >
                        <Controller
                            name="phone"
                            control={phoneForm.control}
                            render={({ field }) => (
                                <PhoneInput
                                    value={field.value}
                                    onChange={(value: string) => {
                                        const match = value.match(/^(\+\d{1,4})(\d{6,})$/);
                                        const formatted = match ? `${match[1]} ${match[2]}` : value;
                                        field.onChange(formatted);
                                    }}
                                    placeholder="Mobile number"
                                />
                            )}
                        />

                    </FormItem>
                    
                    <FormItem className="mb-6">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                checked={isTermsAccepted}
                                onChange={handleTermsCheckboxChange}
                            />
                            <div className="text-sm leading-5">
                                <span>{t('auth.agreeToTerms')} </span>
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(true)}
                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                >
                                    {t('auth.termsAndConditions')}
                                </button>
                                <span> {userType === 'doctor' ? t('auth.forHealthcareProviders') : t('auth.forPatients')}</span>
                            </div>
                        </div>
                    </FormItem>
                    
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        disabled={!isTermsAccepted || isSubmitting}
                    >
                        {isSubmitting ? t('auth.sendingOtp') : t('auth.sendOtp')}
                    </Button>
                </Form>
            ) : (
                <Form onSubmit={otpForm.handleSubmit(handleOtpVerification)}>
                    <FormItem
                        invalid={!!otpForm.formState.errors.otp}
                        errorMessage={otpForm.formState.errors.otp?.message}
                    >
                        <Controller
                            name="otp"
                            control={otpForm.control}
                            render={() => (
                                <OtpInput
                                    value={otpValue}
                                    onChange={(value) => {
                                        setOtpValue(value)
                                        otpForm.setValue('otp', value)
                                    }}
                                    length={6}
                                    inputClass="h-[58px]"
                                />
                            )}
                        />
                    </FormItem>
                    
                    <div className="mb-4">
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? t('auth.verifying') : t('auth.verifyOtp')}
                        </Button>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                            {t('auth.didntReceiveOtp')}
                        </div>
                        <Button
                            type="button"
                            variant="plain"
                            size="sm"
                            loading={isResending}
                            disabled={resendTimer > 0 || isResending}
                            onClick={handleResendOtp}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        >
                            {isResending 
                                ? t('auth.resending')
                                : resendTimer > 0 
                                    ? `${t('auth.resendOtpIn')} ${resendTimer}${t('auth.seconds')}` 
                                    : t('auth.resendOtp')
                            }
                        </Button>
                    </div>
                </Form>
            )}

            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onClose={handleTermsCancel}
                onAccept={handleTermsAccept}
                userType={userType}
            />
        </div>
    )
}

export default SignInForm
