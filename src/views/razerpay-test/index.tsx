import { useState, useEffect } from 'react'
import {
    Card,
    Button,
    Input,
    FormItem,
    FormContainer,
    Alert,
} from '@/components/ui'
import { toast } from '@/components/ui/toast'
import PaymentService from '@/services/PaymentService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import appConfig from '@/configs/app.config'
import { ENV } from '@/configs/environment'

interface PaymentResponse {
    success: boolean
    order_id: string
    amount: number
    currency: string
    receipt: string
    payment_id?: string
    upi_link?: string
}

interface VerifyPaymentRequest extends Record<string, unknown> {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

interface VerifyPaymentResponse {
    success: boolean
    message: string
}

const RazerpayTest = () => {
    const [amount, setAmount] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate()
    const { authenticated } = useAuth()

    // Check authentication when component mounts
    useEffect(() => {
        if (!authenticated) {
            const redirectUrl = `/razerpay-test`
            navigate(
                `${appConfig.unAuthenticatedEntryPath}?redirectUrl=${redirectUrl}`,
            )
        }
    }, [authenticated, navigate])

    const handleCreateOrder = async () => {
        try {
            // Check if user is authenticated before proceeding
            if (!authenticated) {
                // Redirect to login page with the current URL as redirect parameter
                const redirectUrl = `/razerpay-test`
                navigate(
                    `${appConfig.unAuthenticatedEntryPath}?redirectUrl=${redirectUrl}`,
                )
                return
            }

            setLoading(true)
            setError('')

            const response = await PaymentService.initiatePayment({
                doctor_id: 1, // Test doctor ID
                transaction_type: 'VDC',
                amount: amount,
            })

            if (response.success) {
                initializeRazorpay(response)
            } else {
                setError('Failed to initiate payment')
            }
        } catch (err) {
            console.error('Payment order creation error:', err)
            setError('An error occurred while creating the payment order')
        } finally {
            setLoading(false)
        }
    }

    const initializeRazorpay = (paymentData: PaymentResponse) => {
        // Check if Razorpay is available in the window object
        if (!(window as any).Razorpay) {
            setError(
                'Razorpay SDK failed to load. Please check your internet connection',
            )
            return
        }

        const options = {
            key: ENV.RAZORPAY_KEY, // Razorpay test key
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: 'eMediHub',
            description: 'Test Payment',
            order_id: paymentData.order_id,
            handler: function (response: any) {
                verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                })
            },
            prefill: {
                name: 'Test User',
                email: 'test@example.com',
                contact: '9999999999',
            },
            theme: {
                color: '#3399cc',
            },
        }

        const razorpayInstance = new (window as any).Razorpay(options)
        razorpayInstance.open()
    }

    const verifyPayment = async (paymentData: VerifyPaymentRequest) => {
        try {
            setLoading(true)
            const response = await PaymentService.verifyPayment(paymentData)

            if (response.success) {
                toast.push(
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <strong>Payment Successful!</strong>
                        <span className="block sm:inline"> Your payment has been verified successfully!</span>
                    </div>
                )
            } else {
                setError('Payment verification failed')
            }
        } catch (err) {
            console.error('Payment verification error:', err)
            setError('An error occurred while verifying the payment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                        Razerpay Test Payment
                    </h4>
                    <p className="text-gray-500">
                        Make a test payment of ₹1 using Razerpay
                    </p>
                </div>

                {error && (
                    <Alert className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}

                <FormContainer>
                    <FormItem label="Amount (₹)">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min={1}
                            disabled
                        />
                    </FormItem>
                    <Button
                        block
                        variant="solid"
                        onClick={handleCreateOrder}
                        loading={loading}
                        className="mt-4"
                    >
                        Pay ₹{amount}
                    </Button>
                </FormContainer>

                <div className="mt-4 text-xs text-gray-500">
                    <p>
                        Note: This is a test payment integration. No actual
                        money will be deducted.
                    </p>
                    <p>
                        You'll need to add the Razorpay script to your
                        index.html file:
                    </p>
                    <code className="block mt-2 p-2 bg-gray-100 rounded">
                        &lt;script
                        src="{ENV.RAZORPAY_CHECKOUT_URL}"&gt;&lt;/script&gt;
                    </code>
                </div>
            </Card>
        </div>
    )
}

export default RazerpayTest
