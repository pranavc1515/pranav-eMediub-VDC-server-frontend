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
                phone: z.string()
                    .min(10, 'Please enter a valid phone number')
                    .nonempty('Please enter your phone number'),
            })
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
                otp: z.string()
                    .min(6, 'Please enter a valid 6-digit OTP')
                    .nonempty('Please enter OTP'),
            })
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

                if (response && (response as any).status === true || (response as any).success === true) {
                    setPhoneNumber(phone || '')
                    setShowOtpVerification(true)
                    resetOtpForm()
                    setOtpValue('')
                    setMessage?.((response as any)?.message || 'OTP sent successfully')
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
                        ? 'api/doctors/verify-otp'
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
                    ((response as any).status === true || (response as any).success === true)
                ) {
                    localStorage.setItem('auth_token', (response as any).token)
                    await signIn({
                        email: phoneNumber,
                        password: '',
                        userType: userType
                    })
                    navigate(appConfig.authenticatedEntryPath)
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
                                            setOtpValue(value);
                                            setOtpFormValue('otp', value);
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
