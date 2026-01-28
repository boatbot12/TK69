/**
 * Waiting Page
 * Professional Status Monitor
 * Auto-polls for status changes
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const POLL_INTERVAL = 5000 // 5 seconds

const Waiting = () => {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()

    const checkStatus = useCallback(async () => {
        try {
            const updatedUser = await refreshUser()
            if (updatedUser) {
                if (updatedUser.status === 'APPROVED') {
                    navigate('/jobs', { replace: true })
                } else if (updatedUser.status === 'REJECTED') {
                    navigate('/rejected', { replace: true })
                }
            }
        } catch (error) {
            console.error('[Waiting] Status check failed:', error)
        }
    }, [refreshUser, navigate])

    // Poll for status changes
    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, POLL_INTERVAL)
        return () => clearInterval(interval)
    }, [checkStatus])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background blobs similar to Register page */}
            <div className="bg-blob w-[400px] h-[400px] -top-20 -left-20 bg-teal-200/40" />
            <div className="bg-blob w-[300px] h-[300px] bottom-20 -right-20 bg-blue-200/30" style={{ animationDelay: '-2s' }} />
            <div className="bg-blob w-[250px] h-[250px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-100/20" style={{ animationDelay: '-5s' }} />

            <div className="relative z-10 w-full max-w-sm animate-spring-up">
                {/* Header User Badge - Floating style */}
                <div className="flex flex-col items-center mb-8">
                    {user?.picture_url && (
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-blue-500 shadow-2xl animate-pop">
                                <img
                                    src={user.picture_url}
                                    alt={user.display_name}
                                    className="w-full h-full rounded-full object-cover border-4 border-white"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-teal-50">
                                <span className="text-xl animate-pulse">✨</span>
                            </div>
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                        {user?.display_name || 'สวัสดี!'}
                    </h2>
                </div>

                {/* Main Glass Card */}
                <div className="card relative overflow-hidden group">
                    {/* Inner glowing effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/10 blur-[40px] rounded-full group-hover:bg-teal-400/20 transition-all duration-700" />

                    <div className="relative z-10 py-4">
                        {/* Premium Status Visual */}
                        <div className="mb-10 flex flex-col items-center">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                {/* Moving Rings */}
                                <div className="absolute inset-0 border-b-2 border-l-2 border-teal-400/30 rounded-full animate-[spin_4s_linear_infinite]" />
                                <div className="absolute inset-2 border-t-2 border-r-2 border-blue-400/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />

                                {/* Core Icon Container */}
                                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full flex items-center justify-center shadow-inner">
                                    <div className="text-4xl animate-bounce">
                                        🛡️
                                    </div>
                                </div>

                                {/* Orbiting dots */}
                                <div className="absolute top-0 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-[spin_3s_linear_infinite]" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center space-y-3">
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700 tracking-tight">
                                กำลังตรวจสอบข้อมูล
                            </h3>
                            <p className="text-gray-500 font-medium leading-relaxed px-2">
                                ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา! <br />
                                <span className="text-gray-400 text-sm">เรากำลังตรวจสอบใบสมัครของคุณอย่างตั้งใจ</span>
                            </p>
                        </div>

                        {/* Modern Status Badge */}
                        <div className="mt-12 flex justify-center">
                            <div className="px-5 py-2.5 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex items-center gap-3">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] font-bold text-teal-600/70 uppercase tracking-[0.2em]">
                                    System Syncing
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
                    <p className="text-gray-400 text-xs font-medium flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        ความปลอดภัยระดับ LINE Standard
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    </p>
                    <p className="mt-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest opacity-50">
                        Platform Version 2.0 • Premium Edition
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Waiting
