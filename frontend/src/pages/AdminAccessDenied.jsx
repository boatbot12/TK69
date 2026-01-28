/**
 * AdminAccessDenied - Page shown when user doesn't have admin access
 * 
 * Premium UI design with:
 * - Professional gradient background
 * - Clear messaging
 * - Contact button
 */

import { useAuth } from '../contexts/AuthContext'

const AdminAccessDenied = () => {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content Card */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    ไม่มีสิทธิ์เข้าถึง
                </h1>

                {/* User info */}
                {user && (
                    <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                        <img
                            src={user.picture_url || '/default-avatar.png'}
                            alt={user.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-white/80 text-sm">{user.display_name}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-white/60 mb-8 leading-relaxed">
                    บัญชีของคุณไม่มีสิทธิ์ Admin<br />
                    กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าถึง
                </p>

                {/* Action buttons */}
                <div className="space-y-3">
                    {/* Contact Admin Button */}
                    <a
                        href="https://line.me/R/ti/p/@252aijwp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3.5 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.034.194-.034.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            ติดต่อผู้ดูแลระบบ
                        </span>
                    </a>


                </div>

                {/* Footer note */}
                <p className="mt-8 text-xs text-white/30">
                    หากคุณเชื่อว่านี่คือข้อผิดพลาด กรุณาติดต่อทีมสนับสนุน
                </p>
            </div>
        </div>
    )
}

export default AdminAccessDenied
