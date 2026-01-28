/**
 * ErrorBoundary - Catches React errors and displays a friendly fallback UI
 * 
 * Features:
 * - Cute, friendly design
 * - Error logging
 * - Retry button
 * - Contact support option
 */

import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console (can be extended to send to error tracking service)
        console.error('🚨 App Error:', error, errorInfo)
        this.setState({ errorInfo })
    }

    handleRetry = () => {
        // Clear error state and re-render
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback onRetry={this.handleRetry} />
        }

        return this.props.children
    }
}

// Cute Fallback UI Component
const ErrorFallback = ({ onRetry }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/50 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200/50 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/50 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Content Card */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-xl">
                {/* Cute Robot Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-32 h-32 relative">
                        {/* Robot head */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl transform rotate-3 shadow-lg" />
                        <div className="absolute inset-1 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-3xl transform -rotate-1" />
                        <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
                            {/* Face */}
                            <div className="relative">
                                {/* Eyes - Dizzy animation */}
                                <div className="flex gap-5 mb-3">
                                    <div className="w-5 h-5 relative">
                                        <span className="absolute inset-0 text-2xl animate-spin" style={{ animationDuration: '2s' }}>✕</span>
                                    </div>
                                    <div className="w-5 h-5 relative">
                                        <span className="absolute inset-0 text-2xl animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>✕</span>
                                    </div>
                                </div>
                                {/* Mouth */}
                                <div className="w-10 h-5 mx-auto border-b-4 border-gray-400 rounded-b-full" />
                            </div>
                        </div>
                        {/* Antenna */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="w-1 h-4 bg-indigo-400 rounded-full mx-auto" />
                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    อุ๊ปส์! มีบางอย่างผิดพลาด
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 mb-2 text-lg">
                    🔧 ระบบกำลังซ่อมแซมอยู่นะ
                </p>

                {/* Description */}
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                    ไม่ต้องกังวล! ลองรีเฟรชหน้าเว็บดู<br />
                    หากยังไม่หาย กรุณาติดต่อทีมซัพพอร์ต
                </p>

                {/* Action buttons */}
                <div className="space-y-3">
                    {/* Retry Button */}
                    <button
                        onClick={onRetry}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        ลองใหม่อีกครั้ง
                    </button>

                    {/* Contact Support Button */}
                    <a
                        href="https://line.me/R/ti/p/@yourofficialaccount"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-2xl transition-all duration-200"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.034.194-.034.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            ติดต่อทีมซัพพอร์ต
                        </span>
                    </a>
                </div>

                {/* Decorative elements */}
                <div className="mt-8 flex justify-center gap-2">
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
            </div>
        </div>
    )
}

export default ErrorBoundary
