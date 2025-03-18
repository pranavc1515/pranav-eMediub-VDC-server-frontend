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

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    userType: 'user' | 'doctor'
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
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
    const navigate = useNavigate()

    const {
        disableSubmit = false,
        className,
        setMessage,
        passwordHint,
        userType,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: MOCK_USERS[userType].email,
            password: MOCK_USERS[userType].password,
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
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
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignIn)}>
                <FormItem
                    label={`${userType === 'user' ? 'User' : 'Doctor'} Email`}
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder={`Enter your ${userType === 'user' ? 'user' : 'doctor'} email`}
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
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting
                        ? 'Signing in...'
                        : `Sign In as ${userType === 'user' ? 'User' : 'Doctor'}`}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
