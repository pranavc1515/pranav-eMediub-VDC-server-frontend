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
import DoctorService from '@/services/DoctorService'
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
    const [isNewDoctor, setIsNewDoctor] = useState<boolean>(false)
    const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false)
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
                // For doctors, first check if they exist with the given phone number
                if (userType === 'doctor') {
                    try {
                        const checkResponse = await DoctorService.checkDoctorExists(phone)
                        console.log('Doctor check-exists response:', checkResponse)
                        
                        // Store doctor status for later use after OTP verification
                        setIsNewDoctor(!checkResponse.exists)
                        setIsProfileComplete(checkResponse.data?.isProfileComplete || false)
                        
                        // Determine which API endpoint to use based on doctor existence
                        const apiEndpoint = checkResponse.exists 
                            ? 'api/doctors/login' 
                            : 'api/doctors/register'
                        
                        const response = await ApiService.fetchDataWithAxios({
                            url: `/${apiEndpoint}`,
                            method: 'post',
                            data: { phoneNumber: phone },
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
                    } catch (error) {
                        console.error('Error checking doctor existence:', error)
                        setMessage?.('Failed to verify doctor account. Please try again.')
                        setSubmitting(false)
                        return
                    }
                } else {
                    // For regular users, use the existing flow
                    const apiEndpoint = 'api/users/register-new'
                    const fullUrl = `/${apiEndpoint}`
                    
                    const response = await ApiService.fetchDataWithAxios({
                        url: fullUrl,
                        method: 'post',
                        data: { phone },
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
                    data:
                        userType === 'doctor'
                            ? { phoneNumber: phoneNumber, otp }
                            : { phone: phoneNumber, otp },
                })

                if (
                    response &&
                    ((response as any).status === true ||
                        (response as any).success === true)
                ) {
                    // Handle different response structures for doctor and user
                    const responseData =
                        userType === 'doctor'
                            ? (response as any).data
                            : response

                    if (!responseData) {
                        console.error('Invalid response data:', response)
                        setMessage?.('Invalid response from server')
                        setSubmitting(false)
                        return
                    }

                    const token =
                        userType === 'doctor'
                            ? responseData.token
                            : responseData.token
                    const doctor = responseData.doctor
                    const user =
                        userType === 'doctor' ? responseData.user : responseData

                    if (!token) {
                        console.error('No token in response:', responseData)
                        setMessage?.('Authentication failed: No token received')
                        setSubmitting(false)
                        return
                    }

                    console.log('OTP validation successful:', responseData)

                    // Store the token in different ways to ensure it's available
                    localStorage.setItem('token', token)
                    sessionStorage.setItem('token', token)
                    setToken(token)
                    
                    // For doctors, handle redirect based on registration status
                    if (userType === 'doctor') {
                        // Create and set up profile before attempting navigation
                        const docProfile = {
                            userId: doctor.id.toString(),
                            userName: `Dr. ${doctor.phoneNumber}`,
                            authority: ['doctor'],
                            avatar: '',
                            email: doctor.phoneNumber,
                        };
                        
                        // If doctor is new (registered), redirect to profile setup
                        if (isNewDoctor) {
                            console.log('New doctor registered, redirecting to profile setup')
                            
                            // Sign in first to ensure authentication is set up properly
                            const authResult = await signIn({
                                email: phoneNumber,
                                password: '',
                                userType: 'doctor',
                                profile: docProfile,
                                token,
                            });
                            
                            if (authResult.status === 'success') {
                                // Use window.location for hard navigation to bypass router guards
                                window.location.href = '/profile-setup';
                            } else {
                                console.error('Failed to authenticate before redirect:', authResult);
                            }
                            
                            setSubmitting(false);
                            return;
                        }
                        
                        // If doctor is existing but profile is incomplete, redirect to profile setup
                        if (!isProfileComplete) {
                            console.log('Doctor profile incomplete, redirecting to profile setup')
                            
                            // Sign in first to ensure authentication is set up properly
                            const authResult = await signIn({
                                email: phoneNumber,
                                password: '',
                                userType: 'doctor',
                                profile: docProfile,
                                token,
                            });
                            
                            if (authResult.status === 'success') {
                                // Use window.location for hard navigation to bypass router guards
                                window.location.href = '/profile-setup';
                            } else {
                                console.error('Failed to authenticate before redirect:', authResult);
                            }
                            
                            setSubmitting(false);
                            return;
                        }
                        
                        // Update doctor.isProfileComplete for authentication profile
                        doctor.isProfileComplete = isProfileComplete;
                    } else if (userType === 'user') {
                        // For users, create user profile
                        const userProfile = {
                            userId: user.id?.toString() || user.userId?.toString() || '',
                            userName: user.fullName || phoneNumber,
                            authority: ['user'],
                            avatar: user.profilePhoto || '',
                            email: user.email || phoneNumber,
                            phoneNumber: user.phoneNumber || phoneNumber,
                            isProfileComplete: user.isProfileComplete || false,
                        };
                        
                        // If user profile is not complete, redirect to user profile setup
                        if (!user.isProfileComplete) {
                            console.log('User profile incomplete, redirecting to user profile setup')
                            
                            // Sign in first to ensure authentication is set up properly
                            const authResult = await signIn({
                                email: phoneNumber,
                                password: '',
                                userType: 'user',
                                profile: userProfile,
                                token,
                            });
                            
                            if (authResult.status === 'success') {
                                // Use window.location for hard navigation to bypass router guards
                                window.location.href = '/user-profile-setup';
                            } else {
                                console.error('Failed to authenticate before redirect:', authResult);
                            }
                            
                            setSubmitting(false);
                            return;
                        }
                    }

                    // Create a profile that matches the User type structure in auth.ts
                    const profile =
                        userType === 'doctor'
                            ? {
                                  userId: doctor.id.toString(),
                                  userName: `Dr. ${doctor.phoneNumber}`,
                                  authority: ['doctor'],
                                  avatar: '',
                                  email: doctor.phoneNumber,
                              }
                            : {
                                  userId:
                                      user.id?.toString() ||
                                      user.userId?.toString() ||
                                      '',
                                  userName: user.fullName || phoneNumber,
                                  authority: ['user'],
                                  avatar: user.profilePhoto || '',
                                  email: user.email || phoneNumber,
                                  phoneNumber: user.phoneNumber || phoneNumber,
                                  isProfileComplete:
                                      user.isProfileComplete || false,
                              }

                    console.log('Created profile for auth:', profile)

                    // Then sign in with the correctly structured profile
                    const result = await signIn({
                        email: phoneNumber,
                        password: '',
                        userType: userType,
                        profile,
                        token,
                    })

                    console.log('Sign in result:', result)

                    // Only redirect if sign in was successful
                    if (result.status === 'success') {
                        console.log(
                            'Sign in successful, checking profile completion',
                        )

                        // Check if profile is complete
                        const profileComplete = 
                            userType === 'doctor'
                                ? doctor?.isProfileComplete
                                : user?.isProfileComplete

                        if (profileComplete) {
                            console.log(
                                'Profile is complete, redirecting to home',
                            )
                            navigate(appConfig.authenticatedEntryPath)
                        } else {
                            console.log(
                                'Profile is incomplete, redirecting to profile setup',
                            )
                            // Use window.location for hard navigation to bypass router guards
                            if (userType === 'doctor') {
                                window.location.href = '/profile-setup';
                            } else {
                                window.location.href = '/user-profile-setup';
                            }
                        }
                    } else if (result.status === 'failed') {
                        // If sign in failed despite valid OTP
                        console.error(
                            'Sign in failed after OTP validation:',
                            result,
                        )
                        setMessage?.(result.message || 'Authentication failed')
                    } else {
                        // If no status is returned, consider it a success since we have the token
                        console.log(
                            'No explicit status returned, proceeding with token',
                        )
                        
                        // Check if profile is complete
                        const profileComplete = 
                            userType === 'doctor'
                                ? doctor?.isProfileComplete
                                : user?.isProfileComplete

                        if (profileComplete) {
                            console.log(
                                'Profile is complete, redirecting to home',
                            )
                            navigate(appConfig.authenticatedEntryPath)
                        } else {
                            console.log(
                                'Profile is incomplete, redirecting to profile setup',
                            )
                            // Use window.location for hard navigation to bypass router guards
                            if (userType === 'doctor') {
                                window.location.href = '/profile-setup';
                            } else {
                                window.location.href = '/user-profile-setup';
                            }
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
