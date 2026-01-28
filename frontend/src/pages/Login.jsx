/**
 * Login Page
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiff } from '../contexts/LiffContext'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
    const navigate = useNavigate()
    const { isLoggedIn, liffError } = useLiff()
    const { user, isLoading, error: authError } = useAuth()

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && user) {
            switch (user.status) {
                case 'NEW':
                    navigate('/register', { replace: true })
                    break
                case 'PENDING':
                    navigate('/waiting', { replace: true })
                    break
                case 'APPROVED':
                    navigate('/jobs', { replace: true })
                    break
                default:
                    break
            }
        }
    }, [user, isLoading, navigate])

    const displayError = liffError || authError

    if (displayError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card text-center max-w-sm">
                    <div className="text-5xl mb-4">😢</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        เกิดข้อผิดพลาด
                    </h1>
                    <p className="text-gray-600 mb-6 break-words">
                        {displayError}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary w-full"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                    {authError && (
                        <p className="mt-4 text-xs text-red-400">
                            Server Error: {authError}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <div className="card text-center max-w-sm w-full">
                {/* Logo */}
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚀</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ORBIT
                </h1>
                <p className="text-gray-600 mb-8">
                    แพลตฟอร์มสำหรับอินฟลูเอนเซอร์
                </p>

                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                        <div className="spinner" />
                        <span>กำลังเข้าสู่ระบบ...</span>
                    </div>
                ) : (
                    <div className="bg-gray-50 text-gray-600 p-4 rounded-xl text-sm">
                        <p>กรุณาเปิดแอปผ่าน LINE เพื่อเข้าใช้งาน</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Login
