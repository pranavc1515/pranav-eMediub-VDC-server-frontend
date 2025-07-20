export const ENV = {
    API_BASE_URL:
        // import.meta.env.VITE_APP_API_BASE_URL || 'https://api.emedihub.com',
        import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3000',
    BACKEND_URL:
        // import.meta.env.VITE_BACKEND_URL || 'https://api.emedihub.com',
        import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    RAZORPAY_KEY:
        import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_6pdNA8n5Gcoe3D',
    RAZORPAY_CHECKOUT_URL:
        import.meta.env.VITE_RAZORPAY_CHECKOUT_URL ||
        'https://checkout.razorpay.com/v1/checkout.js',
    DEV_PROXY_TARGET:
        //  import.meta.env.VITE_DEV_PROXY_TARGET || 'https://api.emedihub.com',
        import.meta.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000',
}
