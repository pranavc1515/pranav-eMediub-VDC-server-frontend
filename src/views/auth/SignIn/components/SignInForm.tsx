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
                    .min(4, 'Please enter a valid 4-digit OTP')
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
                        : 'api/user/register-new'
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
                            : { username: phone },
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

        if (!disableSubmit && otp.length === 4) {
            setSubmitting(true)

            try {
                const apiEndpoint =
                    userType === 'doctor'
                        ? 'api/doctors/validate-otp'
                        : 'api/user/validate-otp'
                const fullUrl = `/${apiEndpoint}`

                const response = await ApiService.fetchDataWithAxios({
                    url: fullUrl,
                    method: 'post',
                    data: {
                        phoneNumber: phoneNumber,
                        otp,
                    },
                })

                if (
                    response &&
                    ((response as any).status === true ||
                        (response as any).success === true)
                ) {
                    const { token, doctor, user } = (response as any).data
                    
                    // Debug logging
                    console.log('OTP validation successful:', { token, doctor, user });
                    
                    // Store the token in different ways to ensure it's available
                    localStorage.setItem('token', token);
                    sessionStorage.setItem('token', token);
                    setToken(token);
                    console.log('Token stored in multiple places');
                    
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
                                  userId: user.id.toString(),
                                  userName: user.phoneNumber,
                                  authority: ['user'],
                                  avatar: '',
                                  email: user.phoneNumber,
                              }
                    
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
                        console.log('Sign in successful, redirecting to', 
                            (userType === 'doctor' ? doctor.isProfileComplete : user.isProfileComplete) 
                            ? appConfig.authenticatedEntryPath : '/profile-setup');
                            
                        if ((userType === 'doctor' ? doctor.isProfileComplete : user.isProfileComplete)) {
                            navigate(appConfig.authenticatedEntryPath)
                        } else {
                            navigate('/profile-setup')
                        }
                    } else {
                        // If sign in failed despite valid OTP
                        console.error('Sign in failed after OTP validation:', result);
                        setMessage?.(result.message || 'Authentication failed')
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
                        label={`${userType === 'doctor' ? 'Doctor ' : ''}Phone Number`}
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
                                        length={4}
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
            <div className="mt-4 pt-2">
                <Button 
                    onClick={() => {
                        console.log("Auth Debug: localStorage token =", localStorage.getItem('token'));
                        console.log("Auth Debug: sessionStorage token =", sessionStorage.getItem('token'));
                        console.log("Auth Debug: Authenticated =", useAuth().authenticated);
                        console.log("Auth Debug: User =", useAuth().user);
                        if (!useAuth().authenticated) {
                            alert("Not authenticated! Will try to redirect to home manually.");
                            navigate(appConfig.authenticatedEntryPath);
                        }
                    }} 
                    size="sm" 
                    variant="solid"
                >
                    Debug Auth State
                </Button>
            </div>
        </div>
    )
}

export default SignInForm
