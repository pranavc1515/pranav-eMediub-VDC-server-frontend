import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
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

import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    userType: 'user' | 'doctor'
}

const phoneSchema = z.object({
    phone: z
        .string()
        .min(10, 'Please enter a valid phone number')
        .nonempty('Please enter your phone number'),
})

const otpSchema = z.object({
    otp: z
        .string()
        .length(6, 'Please enter a valid 6-digit OTP')
        .nonempty('Please enter OTP'),
})

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

    const navigate = useNavigate()
    const { signIn } = useAuth()
    const { setToken } = useToken()

    const phoneForm = useForm({
        defaultValues: { phone: '' },
        resolver: zodResolver(phoneSchema),
    })
    const otpForm = useForm({
        defaultValues: { otp: '' },
        resolver: zodResolver(otpSchema),
    })

    const formatPhone = (phone: string) => `+91${phone}`

    const handleSendOtp = async ({ phone }: { phone: string }) => {
        if (disableSubmit) return

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
                setMessage?.(endpoint.message)
            } else {
                setMessage?.(endpoint.message)
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            setMessage?.('An error occurred while sending OTP.')
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
        })

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
        })

        const endpoint = check.isUserExist
            ? 'api/patients/do-login'
            : 'api/patients/register-new'
        const payload = check.isUserExist ? { username: phone } : { phone }

        const response = await ApiService.fetchDataWithAxios({
            url: `/${endpoint}`,
            method: 'post',
            data: payload,
        })

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

            if (response?.status || response?.success) {
                await processOtpSuccess(response)
            } else {
                setMessage?.('Invalid OTP')
            }
        } catch (error) {
            console.error('OTP verification error:', error)
            setMessage?.('An error occurred during OTP verification.')
        } finally {
            setSubmitting(false)
        }
    }

    const processOtpSuccess = async (response: any) => {
        const data = userType === 'doctor' ? response.data : response
        const token = data.token
        if (!token) return setMessage?.('No token received.')

        setToken(token)
        localStorage.setItem('token', token)

        const profile = createUserProfile(data, phoneNumber)
        saveUserToStorage(profile, userType)

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
                ? appConfig.authenticatedEntryPath
                : userType === 'doctor'
                  ? '/profile-setup'
                  : '/user-profile-setup'

            navigate(redirectPath)
        } else {
            setMessage?.(result.message || 'Authentication failed')
        }
    }

    const createUserProfile = (data: any, phone: string) => {
        if (userType === 'doctor') {
            const user = data.doctor
            return {
                userId: user.id,
                userName: user.name,
                authority: ['doctor'],
                avatar: user.profilePhoto,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isProfileComplete: isProfileComplete,
            }
        }

        const user = data.patient
        return {
            userId: user.id,
            userName: user.name,
            authority: ['user'],
            avatar: user.profilePhoto,
            email: user.email,
            phoneNumber: user.phoneNumber || user.phone,
            isProfileComplete: user.isProfileComplete,
        }
    }

    const saveUserToStorage = (profile: any, userType: string) => {
        localStorage.setItem(userType, JSON.stringify(profile))
    }

    return (
        <div className={className}>
            {!showOtpVerification ? (
                <Form onSubmit={phoneForm.handleSubmit(handleSendOtp)}>
                    <FormItem
                        label="Phone Number"
                        invalid={!!phoneForm.formState.errors.phone}
                        errorMessage={phoneForm.formState.errors.phone?.message}
                    >
                        <Controller
                            name="phone"
                            control={phoneForm.control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    placeholder="Mobile number"
                                    prefix="+91"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
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
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </Form>
            )}
        </div>
    )
}

export default SignInForm
