import ApiService from './ApiService'

interface CreateOrderRequest {
    amount: number
    currency: string
}

interface OrderResponse {
    success: boolean
    order: {
        id: string
        amount: number
        currency: string
        receipt: string
        status: string
    }
}

interface VerifyPaymentRequest {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

interface VerifyPaymentResponse {
    success: boolean
    message: string
}

interface PaymentDetailsResponse {
    success: boolean
    payment: {
        id: string
        order_id: string
        amount: number
        status: string
        method: string
    }
}

const PaymentService = {
    createOrder: (data: CreateOrderRequest) => {
        return ApiService.fetchDataWithAxios<OrderResponse>({
            url: '/api/payment/create-order',
            method: 'POST',
            data,
        })
    },

    verifyPayment: (data: VerifyPaymentRequest) => {
        return ApiService.fetchDataWithAxios<VerifyPaymentResponse>({
            url: '/api/payment/verify-payment',
            method: 'POST',
            data,
        })
    },

    getPaymentDetails: (paymentId: string) => {
        return ApiService.fetchDataWithAxios<PaymentDetailsResponse>({
            url: `/api/payment/details/${paymentId}`,
            method: 'GET',
        })
    },
}

export default PaymentService
