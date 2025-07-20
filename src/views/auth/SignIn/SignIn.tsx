import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import { useState } from 'react'
import { Segment } from '@/components/ui/Segment'
import type { SegmentValue } from '@/components/ui/Segment/context'
import { useTranslation } from '@/utils/hooks/useTranslation'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    disableSubmit?: boolean
}

type UserType = 'user' | 'doctor'

export const SignInBase = ({
    signUpUrl = '/sign-up',
    forgetPasswordUrl = '/forgot-password',
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const [userType, setUserType] = useState<UserType>('user')
    const { t } = useTranslation()

    const mode = useThemeStore((state) => state.mode)

    const handleSegmentChange = (value: SegmentValue) => {
        if (typeof value === 'string') {
            setUserType(value as UserType)
        }
    }

    return (
        <>
            <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    imgClass="mx-auto"
                    logoWidth={60}
                />
            </div>
            <div className="mb-8">
                <h2 className="mb-2">{t('auth.welcomeBack')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.enterCredentials')}
                </p>
            </div>
            <div className="mb-8">
                <Segment value={userType} onChange={handleSegmentChange}>
                    <Segment.Item value="user">{t('auth.user')}</Segment.Item>
                    <Segment.Item value="doctor">
                        {t('auth.doctor')}
                    </Segment.Item>
                </Segment>
            </div>
            {message && (
                <Alert
                    showIcon
                    className="mb-4"
                    type={
                        message.toLowerCase().includes('success')
                            ? 'success'
                            : 'danger'
                    }
                >
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
                userType={userType}
                passwordHint={
                    <div className="mb-7 mt-2">
                        <ActionLink
                            to={forgetPasswordUrl}
                            className="font-semibold heading-text mt-2 underline"
                            themeColor={false}
                        >
                            {t('auth.forgotPassword')}
                        </ActionLink>
                    </div>
                }
            />
            {/* <div>
                <div className="mt-6 text-center">
                    <span>{t('auth.dontHaveAccount')} </span>
                    <ActionLink
                        to={`${signUpUrl}?type=${userType}`}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        {t('auth.signUp')}
                    </ActionLink>
                </div>
            </div> */}
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
