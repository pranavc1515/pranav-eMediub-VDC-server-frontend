import { useState, useEffect } from 'react'
import {
    Drawer,
    Button,
    Input,
    FormItem,
    Alert,
    Badge
} from '@/components/ui'
import { HiOutlineMail, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi'
import { useTranslation } from '@/utils/hooks/useTranslation'
import DoctorService from '@/services/DoctorService'
import { useAuth } from '@/auth'

interface EmailVerificationDrawerProps {
    isOpen: boolean
    onClose: () => void
    onVerificationSuccess: () => void
    doctorEmail?: string
    isEmailVerified?: boolean
}

const EmailVerificationDrawer = ({
    isOpen,
    onClose,
    onVerificationSuccess,
    doctorEmail,
    isEmailVerified = false
}: EmailVerificationDrawerProps) => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [email, setEmail] = useState(doctorEmail || '')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(0)
    const [verificationStatus, setVerificationStatus] = useState({
        isVerified: isEmailVerified,
        email: doctorEmail || ''
    })

    // Reset state when drawer opens/closes
    useEffect(() => {
        if (isOpen) {
            setEmail(doctorEmail || '')
            setVerificationStatus({
                isVerified: isEmailVerified,
                email: doctorEmail || ''
            })
            // Load current verification status
            loadVerificationStatus()
        } else {
            // Reset state when closing
            setOtp('')
            setOtpSent(false)
            setSuccess('')
            setError('')
            setResendTimer(0)
        }
    }, [isOpen, doctorEmail, isEmailVerified])

    // Timer countdown effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [resendTimer])

    const loadVerificationStatus = async () => {
        if (!user?.id) return
        
        try {
            const response = await DoctorService.getEmailVerificationStatus(Number(user.id))
            if (response.success) {
                setVerificationStatus({
                    isVerified: response.data.emailVerified,
                    email: response.data.email
                })
                setEmail(response.data.email)
            }
        } catch (err) {
            console.error('Error loading verification status:', err)
        }
    }

    const handleSendOTP = async () => {
        if (!email.trim() || !user?.id) {
            setError(t('auth.email'))
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await DoctorService.sendEmailOTP(email, Number(user.id))
            if (response.success) {
                if (response.data.emailVerified) {
                    setSuccess(t('settings.emailAlreadyVerified'))
                    setVerificationStatus({
                        isVerified: true,
                        email: email
                    })
                } else {
                    setOtpSent(true)
                    setResendTimer(60) // 1 minute resend timer
                    setSuccess(t('settings.codeSentTo') + ' ' + email)
                }
            } else {
                setError(response.message || t('settings.emailVerificationError'))
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('settings.emailVerificationError'))
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp.trim() || !email.trim() || !user?.id) {
            setError(t('auth.enterOtp'))
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await DoctorService.verifyEmailOTP(email, otp, Number(user.id))
            if (response.success) {
                setSuccess(t('settings.emailVerifiedSuccess'))
                setVerificationStatus({
                    isVerified: true,
                    email: email
                })
                
                // Call success callback after a short delay
                setTimeout(() => {
                    onVerificationSuccess()
                    onClose()
                }, 1500)
            } else {
                setError(response.message || t('settings.invalidVerificationCode'))
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
            if (errorMessage?.includes('expired')) {
                setError(t('settings.verificationCodeExpired'))
            } else if (errorMessage?.includes('Invalid')) {
                setError(t('settings.invalidVerificationCode'))
            } else {
                setError(errorMessage || t('settings.emailVerificationError'))
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!user?.id) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await DoctorService.resendEmailOTP(Number(user.id))
            if (response.success) {
                setResendTimer(60)
                setSuccess(t('settings.codeResent'))
            } else {
                setError(response.message || t('settings.emailVerificationError'))
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('settings.emailVerificationError'))
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setOtp('')
        setOtpSent(false)
        setSuccess('')
        setError('')
        onClose()
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            placement="right"
            width={480}
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <HiOutlineMail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold">{t('settings.emailVerification')}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('settings.emailVerificationDesc')}
                        </p>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <Alert type="success" showIcon className="mb-4" onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert type="danger" showIcon className="mb-4" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Email Verification Status */}
                {verificationStatus.email && (
                    <div className="mb-6 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-medium text-gray-700">
                                    {verificationStatus.email}
                                </div>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    verificationStatus.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {verificationStatus.isVerified ? (
                                        <>
                                            <HiOutlineCheckCircle className="h-3 w-3" />
                                            {t('settings.emailVerified')}
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineXCircle className="h-3 w-3" />
                                            {t('settings.emailNotVerified')}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* If email is already verified, show success message */}
                {verificationStatus.isVerified ? (
                    <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <HiOutlineCheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('settings.emailVerified')}
                        </h3>
                        <p className="text-gray-500">
                            {t('settings.emailAlreadyVerified')}
                        </p>
                        <Button
                            variant="solid"
                            className="mt-6"
                            onClick={handleClose}
                        >
                            {t('common.close')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Email Input */}
                        <FormItem label={t('auth.email')}>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.email')}
                                disabled={otpSent || loading}
                            />
                        </FormItem>

                        {/* OTP Input (shown after OTP is sent) */}
                        {otpSent && (
                            <FormItem label={t('settings.verificationCode')}>
                                <Input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder={t('settings.enterOtpCode')}
                                    maxLength={6}
                                    disabled={loading}
                                />
                                <div className="text-sm text-gray-500 mt-2">
                                    {t('settings.enterVerificationCode')}
                                </div>
                            </FormItem>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {!otpSent ? (
                                <>
                                    <Button
                                        variant="solid"
                                        onClick={handleSendOTP}
                                        loading={loading}
                                        disabled={!email.trim()}
                                        className="flex-1"
                                    >
                                        {loading ? t('settings.sendingCode') : t('settings.sendVerificationCode')}
                                    </Button>
                                    <Button
                                        variant="plain"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="solid"
                                        onClick={handleVerifyOTP}
                                        loading={loading}
                                        disabled={!otp.trim() || otp.length !== 6}
                                        className="flex-1"
                                    >
                                        {loading ? t('settings.verifying') : t('settings.verifyCode')}
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={handleResendOTP}
                                        disabled={resendTimer > 0 || loading}
                                    >
                                        {resendTimer > 0 
                                            ? `${t('settings.resendCodeIn')} ${resendTimer}${t('settings.seconds')}`
                                            : t('settings.resendCode')
                                        }
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    )
}

export default EmailVerificationDrawer 