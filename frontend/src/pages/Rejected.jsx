/**
 * Rejected Page - Premium Mobile-First Design
 * 
 * A beautifully crafted rejection page that:
 * - Communicates the status clearly but empathetically
 * - Provides actionable next steps via LINE contact
 * - Maintains brand consistency with the LINE integration aesthetic
 */

import { useAuth } from '../contexts/AuthContext'
import { useLiff } from '../contexts/LiffContext'
import liff from '@line/liff'

// LINE Official Account ID from environment variable
const LINE_OA_ID = import.meta.env.VITE_LINE_OA_ID || '@your-oa-id'

const Rejected = () => {
    const { user } = useAuth()
    const { isMock } = useLiff()

    const handleContactSupport = () => {
        // Pre-fill message for rejected user
        const message = `สวัสดีค่ะ ฉันมีปัญหาเกี่ยวกับการสมัครที่โดนปฏิเสธ\n\nชื่อ: ${user?.display_name || 'ไม่ระบุ'}\nLine User ID: ${user?.line_user_id || 'ไม่ระบุ'}\n\nต้องการสอบถามเหตุผลและขอคำแนะนำในการสมัครใหม่ค่ะ`

        if (isMock) {
            alert(`[Dev Mode] จะเปิดแชท LINE กับ OA: ${LINE_OA_ID}\n\nข้อความ:\n${message}`)
            return
        }

        try {
            // Remove @ from OA ID and encode the message
            const cleanOaId = LINE_OA_ID.replace('@', '')
            const encodedMessage = encodeURIComponent(message)

            // Open LINE OA chat with pre-filled message
            // Format: https://line.me/R/oaMessage/@oa_id/?text=message
            const lineUrl = `https://line.me/R/oaMessage/%40${cleanOaId}/?${encodedMessage}`

            // Open in external browser (works on both LIFF and regular browser)
            window.open(lineUrl, '_blank')
        } catch (error) {
            console.error('Failed to open LINE chat:', error)
            // Fallback: Open LINE OA add friend page
            const cleanOaId = LINE_OA_ID.replace('@', '')
            window.open(`https://line.me/R/ti/p/%40${cleanOaId}`, '_blank')
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations - Soft Rose/Red Theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-100 blur-[120px] opacity-50" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-50 blur-[100px] opacity-60" />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-amber-50 blur-[80px] opacity-40" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 p-8 text-center relative overflow-hidden">

                    {/* Decorative Pattern */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400" />

                    {/* User Profile */}
                    <div className="mt-4 mb-6">
                        {user?.picture_url ? (
                            <div className="relative inline-block">
                                <div className="p-1 bg-gradient-to-br from-rose-200 to-orange-200 rounded-full">
                                    <img
                                        src={user.picture_url}
                                        alt={user.display_name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <span className="text-lg">😔</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-4xl">😔</span>
                            </div>
                        )}
                    </div>

                    {/* Status Icon Animation */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center shadow-inner">
                                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                        ขออภัยค่ะ 💔
                    </h1>

                    <div className="bg-rose-50/80 rounded-2xl p-5 mb-6 border border-rose-100">
                        <p className="text-gray-700 font-semibold mb-2">
                            การสมัครของคุณไม่ได้รับการอนุมัติ
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            ข้อมูลที่ให้มาอาจไม่ครบถ้วนหรือไม่ตรงตามเกณฑ์
                            <br />
                            กรุณาติดต่อทีมงานเพื่อสอบถามเพิ่มเติม
                        </p>
                    </div>

                    {/* Reason (if available) */}
                    {user?.rejection_reason && (
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                เหตุผล
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {user.rejection_reason}
                            </p>
                        </div>
                    )}

                    {/* Contact Button Only */}
                    <button
                        onClick={handleContactSupport}
                        className="w-full h-14 rounded-2xl font-black text-white text-base bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.03 2 10.86c0 2.67 1.38 5.06 3.55 6.67.15.11.25.29.25.49l-.02 1.72c-.01.42.47.68.81.44l2.01-1.41c.15-.1.33-.14.51-.11.62.11 1.26.17 1.89.17 5.52 0 10-4.03 10-8.86C22 6.03 17.52 2 12 2z" />
                        </svg>
                        ติดต่อทีมงาน
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                    Powered by ORBIT • Ver 1.0
                </p>
            </div>
        </div>
    )
}

export default Rejected
