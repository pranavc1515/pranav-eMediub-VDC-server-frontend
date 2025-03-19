import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import OtpInput from '@/components/shared/OtpInput'
import ApiService from '@/services/ApiService'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    userType: 'user' | 'doctor'
}

type SignInFormSchema = {
    email: string
    password: string
    phone?: string
}

type OtpVerificationSchema = {
    otp: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
    phone: z.string().optional(),
})

const phoneValidationSchema: ZodType<SignInFormSchema> = z.object({
    phone: z
        .string({ required_error: 'Please enter your phone number' })
        .min(10, { message: 'Please enter a valid phone number' }),
    email: z.string().optional(),
    password: z.string().optional(),
})

const otpValidationSchema: ZodType<OtpVerificationSchema> = z.object({
    otp: z.string().min(6, { message: 'Please enter a valid 6-digit OTP' }),
})

// Temporary mock data for development
const MOCK_USERS = {
    user: {
        email: 'user@emedihub.com',
        password: '123Qwe',
        userData: {
            userId: '1',
            userName: 'Test User',
            authority: ['user'],
            avatar: '',
            email: 'user@emedihub.com',
        },
    },
    doctor: {
        email: 'doctor@emedihub.com',
        password: '123Qwe',
        userData: {
            userId: '2',
            userName: 'Dr. Test',
            authority: ['doctor'],
            avatar: '',
            email: 'doctor@emedihub.com',
        },
    },
}

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [showOtpVerification, setShowOtpVerification] =
        useState<boolean>(false)
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const navigate = useNavigate()

    const {
        disableSubmit = false,
        className,
        setMessage,
        passwordHint,
        userType,
    } = props

    // Form for email/password or phone number
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues:
            userType === 'doctor'
                ? {
                      email: MOCK_USERS[userType].email,
                      password: MOCK_USERS[userType].password,
                  }
                : {},
        resolver: zodResolver(
            userType === 'doctor' ? validationSchema : phoneValidationSchema,
        ),
    })

    // Form for OTP verification
    const {
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
        control: otpControl,
        reset: resetOtpForm,
    } = useForm<OtpVerificationSchema>({
        resolver: zodResolver(otpValidationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        if (userType === 'doctor') {
            // Doctor sign-in remains unchanged
            const { email, password } = values

            if (!disableSubmit) {
                setSubmitting(true)

                try {
                    // Temporary mock authentication
                    const mockUser = MOCK_USERS[userType]
                    if (
                        email === mockUser.email &&
                        password === mockUser.password
                    ) {
                        // Simulate successful sign in
                        const result = await signIn({
                            email,
                            password,
                            userType,
                        })

                        if (result?.status === 'failed') {
                            setMessage?.('Invalid credentials')
                        } else {
                            navigate(appConfig.authenticatedEntryPath)
                        }
                    } else {
                        setMessage?.('Invalid email or password')
                    }
                } catch {
                    setMessage?.('An error occurred during sign in')
                }

                setSubmitting(false)
            }
        } else {
            // User sign-in with phone number
            const { phone } = values
            if (!disableSubmit) {
                setSubmitting(true)

                try {
                    // First try register-new API
                    let response = await ApiService.fetchDataWithAxios({
                        url: 'user/register-new',
                        method: 'post',
                        data: { username: phone },
                    })

                    // If registration is successful, proceed with the flow
                    if (response?.status === true) {
                        setPhoneNumber(phone || '')
                        setShowOtpVerification(true)
                        resetOtpForm({ otp: '' })
                        setMessage?.(
                            response?.message || 'OTP sent successfully',
                        )
                    } else {
                        // Handle specific error messages
                        const errorMessage =
                            response?.message || 'Failed to send OTP'
                        console.error('API Response:', response)
                        setMessage?.(errorMessage)
                    }
                } catch (error) {
                    console.error('API Error:', error)
                    // If registration fails, try to login existing user
                    try {
                        const loginResponse =
                            await ApiService.fetchDataWithAxios({
                                url: 'user/do-login',
                                method: 'post',
                                data: { username: phone },
                            })

                        if (loginResponse?.status === true) {
                            setPhoneNumber(phone || '')
                            setShowOtpVerification(true)
                            resetOtpForm({ otp: '' })
                            setMessage?.('OTP sent successfully')
                        } else {
                            const errorMessage =
                                loginResponse?.message || 'Failed to login'
                            setMessage?.(errorMessage)
                        }
                    } catch (loginError) {
                        console.error('Login error:', loginError)
                        const errorMessage =
                            loginError?.response?.data?.message ||
                            'Failed to login. Please try again.'
                        setMessage?.(errorMessage)
                    }
                    setSubmitting(false)
                }
            }
        }
    }

    const onVerifyOtp = async (values: OtpVerificationSchema) => {
        const { otp } = values

        if (!disableSubmit && otp.length === 6) {
            setSubmitting(true)

            try {
                // Call the validate-otp API
                const response = await ApiService.fetchDataWithAxios({
                    url: 'user/validate-otp',
                    method: 'post',
                    data: {
                        phone: phoneNumber,
                        email: '',
                        otp,
                    },
                })

                if (response && response.status === true) {
                    // Store token in localStorage
                    localStorage.setItem('auth_token', response.token)

                    // Use the existing auth context to set the user as authenticated
                    const result = await signIn({
                        email: 'user@emedihub.com', // Using mock user data for now
                        password: '123Qwe',
                        userType: 'user',
                    })

                    if (result?.status === 'failed') {
                        setMessage?.('Authentication failed')
                    } else {
                        navigate(appConfig.authenticatedEntryPath)
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
                    {userType === 'doctor' ? (
                        // Doctor sign-in form (unchanged)
                        <>
                            <FormItem
                                label="Doctor Email"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="email"
                                            placeholder="Enter your doctor email"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Password"
                                invalid={Boolean(errors.password)}
                                errorMessage={errors.password?.message}
                                className={classNames(
                                    passwordHint && 'mb-0',
                                    errors.password?.message && 'mb-8',
                                )}
                            >
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <PasswordInput
                                            type="text"
                                            placeholder="Password"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            {passwordHint}
                        </>
                    ) : (
                        // User sign-in form with phone number
                        <>
                            <FormItem
                                label="Phone Number"
                                invalid={Boolean(errors.phone)}
                                errorMessage={errors.phone?.message}
                            >
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="tel"
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
                        </>
                    )}
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
                            render={({ field }) => (
                                <OtpInput
                                    placeholder=""
                                    inputClass="h-[58px]"
                                    length={6}
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
                        {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </Form>
            )}
        </div>
    )
}

export default SignInForm
