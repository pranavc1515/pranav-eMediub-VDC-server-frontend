import ApiService from './ApiService'

interface InitiatePaymentRequest extends Record<string, unknown> {
    doctor_id: number
    transaction_type: 'VDC'
    amount: number
}

interface InitiatePaymentResponse {
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

interface PaymentStatusResponse {
    success: boolean
    status: string
}

const PaymentService = {
    /**
     * Initiate a payment for doctor consultation
     */
    initiatePayment: (data: InitiatePaymentRequest) => {
        return ApiService.fetchDataWithAxios<InitiatePaymentResponse>({
            url: '/api/payments/initiate',
            method: 'POST',
            data,
        })
    },

    /**
     * Verify Razorpay payment signature
     */
    verifyPayment: (data: VerifyPaymentRequest) => {
        return ApiService.fetchDataWithAxios<VerifyPaymentResponse>({
            url: '/api/payments/verify-payment',
            method: 'POST',
            data,
        })
    },

    /**
     * Get payment status by payment ID
     */
    getPaymentStatus: (paymentId: string) => {
        return ApiService.fetchDataWithAxios<PaymentStatusResponse>({
            url: `/api/payments/status/${paymentId}`,
            method: 'GET',
        })
    },
}

export type {
    InitiatePaymentRequest,
    InitiatePaymentResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentStatusResponse,
}

export default PaymentService
