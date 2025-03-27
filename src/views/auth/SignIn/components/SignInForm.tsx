import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import OtpInput from '@/components/shared/OtpInput'
import ApiService from '@/services/ApiService'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToken } from '@/store/authStore'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    userType: 'user' | 'doctor'
}

type SignInFormSchema = {
    phone: string
}

type OtpVerificationSchema = {
    otp: string
}

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [showOtpVerification, setShowOtpVerification] =
        useState<boolean>(false)
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [otpValue, setOtpValue] = useState<string>('')
    const navigate = useNavigate()
    const { setToken } = useToken()

    const { disableSubmit = false, className, setMessage, userType } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            phone: '',
        },
        resolver: zodResolver(
            z.object({
                phone: z
                    .string()
                    .min(10, 'Please enter a valid phone number')
                    .nonempty('Please enter your phone number'),
            }),
        ),
    })

    const {
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
        control: otpControl,
        setValue: setOtpFormValue,
        reset: resetOtpForm,
    } = useForm<OtpVerificationSchema>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(
            z.object({
                otp: z
                    .string()
                    .min(6, 'Please enter a valid 6-digit OTP')
                    .nonempty('Please enter OTP'),
            }),
        ),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { phone } = values

        if (!disableSubmit) {
            setSubmitting(true)

            try {
                const apiEndpoint =
                    userType === 'doctor'
                        ? 'api/doctors/register'
                        : 'api/users/register-new'
                // Fix URL construction by ensuring a slash between base URL and endpoint
                const fullUrl = `/${apiEndpoint}`

                // console.log('Sending request with data:', {
                //     url: fullUrl,
                //     data:
                //         userType === 'doctor'
                //             ? { phoneNumber: phone }
                //             : { username: phone },
                // })

                const response = await ApiService.fetchDataWithAxios({
                    url: fullUrl,
                    method: 'post',
                    data:
                        userType === 'doctor'
                            ? { phoneNumber: phone }
                            : { phone },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                console.log('API Response:', response)

                if (
                    (response && (response as any).status === true) ||
                    (response as any).success === true
                ) {
                    setPhoneNumber(phone || '')
                    setShowOtpVerification(true)
                    resetOtpForm()
                    setOtpValue('')
                    setMessage?.(
                        (response as any)?.message || 'OTP sent successfully',
                    )
                } else {
                    const errorMessage =
                        (response as any)?.message || 'Failed to send OTP'
                    console.error('API Response Error:', response)
                    setMessage?.(errorMessage)
                }
            } catch (error: any) {
                console.error('API Error Details:', {
                    message: error.message,
                    response: error.response,
                    status: error.response?.status,
                })

                if (error.response?.data?.message) {
                    setMessage?.(error.response.data.message)
                } else {
                    setMessage?.('Failed to send OTP. Please try again.')
                }
            }

            setSubmitting(false)
        }
    }

    const onVerifyOtp = async (values: OtpVerificationSchema) => {
        const { otp } = values

        if (!disableSubmit && otp.length === 6) {
            setSubmitting(true)

            try {
                const apiEndpoint =
                    userType === 'doctor'
                        ? 'api/doctors/validate-otp'
                        : 'api/users/validate-otp'
                const fullUrl = `/${apiEndpoint}`

                const response = await ApiService.fetchDataWithAxios({
                    url: fullUrl,
                    method: 'post',
                    data: userType === 'doctor' 
                        ? { phoneNumber: phoneNumber, otp }
                        : { phone: phoneNumber, otp },
                })

                if (
                    response &&
                    ((response as any).status === true ||
                        (response as any).success === true)
                ) {
                    // Handle different response structures for doctor and user
                    const responseData = userType === 'doctor' ? (response as any).data : response;
                    
                    if (!responseData) {
                        console.error('Invalid response data:', response);
                        setMessage?.('Invalid response from server');
                        setSubmitting(false);
                        return;
                    }
                    
                    const token = userType === 'doctor' ? responseData.token : responseData.token;
                    const doctor = responseData.doctor;
                    const user = userType === 'doctor' ? responseData.user : responseData;
                    
                    if (!token) {
                        console.error('No token in response:', responseData);
                        setMessage?.('Authentication failed: No token received');
                        setSubmitting(false);
                        return;
                    }
                    
                    if (!token) {
                        console.error('No token in response:', responseData);
                        setMessage?.('Authentication failed: No token received');
                        setSubmitting(false);
                        return;
                    }
                    
                    console.log('OTP validation successful:', responseData);
                    
                    // Store the token in different ways to ensure it's available
                    localStorage.setItem('token', token);
                    sessionStorage.setItem('token', token);
                    setToken(token);
                    
                    // Create a profile that matches the User type structure in auth.ts
                    const profile = userType === 'doctor' ? {
                        userId: doctor.id.toString(),
                        userName: `Dr. ${doctor.phoneNumber}`,
                        authority: ['doctor'],
                        avatar: '',
                        email: doctor.phoneNumber,
                    } : {
                        userId: user.id?.toString() || user.userId?.toString() || '',
                        userName: user.fullName || phoneNumber,
                        authority: ['user'],
                        avatar: user.profilePhoto || '',
                        email: user.email || phoneNumber,
                        phoneNumber: user.phoneNumber || phoneNumber,
                        isProfileComplete: user.isProfileComplete || false
                    }
                    
                    console.log('Created profile for auth:', profile);
                    
                    console.log('Created profile for auth:', profile);
                    
                    console.log('Created profile for auth:', profile);
                    
                    // Then sign in with the correctly structured profile
                    const result = await signIn({
                        email: phoneNumber,
                        password: '',
                        userType: userType,
                        profile,
                        token
                    })

                    console.log('Sign in result:', result)

                    // Only redirect if sign in was successful
                    if (result.status === 'success') {
                        console.log('Sign in successful, checking profile completion');
                        
                        // Check if profile is complete - handle different response structures
                        const isProfileComplete = userType === 'doctor' 
                            ? doctor?.isProfileComplete 
                            : user?.isProfileComplete;
                            
                        if (isProfileComplete) {
                            console.log('Profile is complete, redirecting to home');
                            navigate(appConfig.authenticatedEntryPath);
                        } else {
                            console.log('Profile is incomplete, redirecting to profile setup');
                            navigate('/profile-setup');
                        }
                    } else if (result.status === 'failed') {
                        // If sign in failed despite valid OTP
                        console.error('Sign in failed after OTP validation:', result);
                        setMessage?.(result.message || 'Authentication failed');
                    } else {
                        // If no status is returned, consider it a success since we have the token
                        console.log('No explicit status returned, proceeding with token');
                        const isProfileComplete = userType === 'doctor' 
                            ? doctor?.isProfileComplete 
                            : user?.isProfileComplete;
                            
                        if (isProfileComplete) {
                            console.log('Profile is complete, redirecting to home');
                            navigate(appConfig.authenticatedEntryPath);
                        } else {
                            console.log('Profile is incomplete, redirecting to profile setup');
                            navigate('/profile-setup');
                        }
                    }
                } else {
                    setMessage?.('Invalid OTP')
                }
            } catch (error) {
                setMessage?.('An error occurred during OTP verification')
                console.error('Error verifying OTP:', error)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            {!showOtpVerification ? (
                <Form onSubmit={handleSubmit(onSignIn)}>
                    <FormItem
                        label={`Phone Number`}
                        invalid={Boolean(errors.phone)}
                        errorMessage={errors.phone?.message}
                    >
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    autoComplete="off"
                                    placeholder="Enter your phone number"
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
                <Form onSubmit={handleOtpSubmit(onVerifyOtp)}>
                    <FormItem
                        invalid={Boolean(otpErrors.otp)}
                        errorMessage={otpErrors.otp?.message}
                    >
                        <Controller
                            name="otp"
                            control={otpControl}
                            render={({ field }) => {
                                return (
                                    <OtpInput
                                        placeholder=""
                                        value={otpValue}
                                        onChange={(value) => {
                                            setOtpValue(value)
                                            setOtpFormValue('otp', value)
                                        }}
                                        inputClass="h-[58px]"
                                        length={6}
                                    />
                                )
                            }}
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
