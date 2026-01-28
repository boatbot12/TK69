import React, { useState } from 'react'
import { utilityAPI } from '../../../services/api'
import { CheckCircle, AlertCircle, Loader2, Send, Link as LinkIcon, AlertTriangle } from 'lucide-react'

const SubmissionForm = ({ stageId, onSubmit, isSubmitting, existingSubmission, attemptCount = 1 }) => {
    const [link, setLink] = useState(existingSubmission?.link || '')
    const [notes, setNotes] = useState(existingSubmission?.notes || '')
    const [verificationStatus, setVerificationStatus] = useState('idle') // idle, verifying, success, error
    const [errorMessage, setErrorMessage] = useState('')

    const handleVerify = async () => {
        if (!link) return

        // Basic URL validation
        try {
            new URL(link)
        } catch {
            setVerificationStatus('error')
            setErrorMessage('ลิงก์ไม่ถูกต้อง')
            return
        }

        setVerificationStatus('verifying')
        try {
            const response = await utilityAPI.validateDriveLink(link)
            const result = response.data

            // Check the accessible field from API response
            if (result.accessible === true) {
                setVerificationStatus('success')
                setErrorMessage('')
            } else {
                setVerificationStatus('error')
                setErrorMessage(result.message || 'ลิงก์นี้ต้องขอสิทธิ์เข้าถึง กรุณาเปลี่ยนการแชร์เป็น "Anyone with the link"')
            }
        } catch (err) {
            setVerificationStatus('error')
            setErrorMessage(err.response?.data?.message || 'ไม่สามารถเข้าถึงลิงก์ได้ กรุณาเปิดสิทธิ์เป็น "Anyone with the link"')
        }
    }

    const handleSubmit = () => {
        if (!link) return
        if (verificationStatus === 'error') return
        onSubmit(stageId, link, notes)

        // Reset form
        setLink('')
        setNotes('')
        setVerificationStatus('idle')
    }

    // Auto-reset verification when link changes
    const handleLinkChange = (e) => {
        setLink(e.target.value)
        if (verificationStatus !== 'idle') {
            setVerificationStatus('idle')
        }
    }

    return (
        <div className="bg-gray-50/50 rounded-2xl p-5 border border-white/50 shadow-inner space-y-5">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">
                        ลิงก์ผลงาน (Google Drive / Docs)
                    </label>
                    <span className="inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full">
                        Round {attemptCount}/3
                    </span>
                </div>
                <div className="space-y-3">
                    {/* Input Field Area */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${verificationStatus === 'success' ? 'bg-emerald-400 shadow-glow-emerald' :
                                verificationStatus === 'error' ? 'bg-rose-400 shadow-glow-rose' :
                                    'bg-gray-300'
                                }`} />
                        </div>
                        <input
                            type="url"
                            value={link}
                            onChange={handleLinkChange}
                            placeholder="วางลิงก์ผลงานที่นี่..."
                            className={`
                                w-full pl-10 pr-4 py-4 rounded-2xl border-0 bg-white transition-all outline-none text-sm font-medium placeholder-gray-400
                                shadow-soft focus:shadow-lg focus:ring-2 focus:ring-brand-start/20
                            `}
                        />
                    </div>

                    {/* Action Button: Check/Verify */}
                    <button
                        onClick={handleVerify}
                        disabled={!link || verificationStatus === 'verifying'}
                        className={`
                            w-full py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 flex items-center justify-center gap-2
                            ${!link || verificationStatus === 'verifying'
                                ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#06C755] to-[#00B900] shadow-[0_4px_15px_rgba(6,199,85,0.3)] hover:shadow-[0_8px_20px_rgba(6,199,85,0.4)] active:scale-[0.97]'}
                        `}
                    >
                        {verificationStatus === 'verifying' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>กำลังตรวจสอบลิงก์...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                <span>ตรวจสอบการเข้าถึงลิงก์</span>
                            </>
                        )}
                    </button>

                    {/* Validation Feedback */}
                    {verificationStatus === 'error' && (
                        <div className="flex items-start gap-2 p-3.5 bg-rose-50 rounded-xl text-xs text-rose-500 font-bold border border-rose-100 animate-shake">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                    {verificationStatus === 'success' && (
                        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 rounded-xl text-xs text-emerald-500 font-bold border border-emerald-100 animate-fade-in">
                            <CheckCircle size={14} />
                            <span>ยอดเยี่ยม! ลิงก์พร้อมส่งแล้ว</span>
                        </div>
                    )}
                </div>

                {/* Permission Warning Note */}
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-xs text-amber-700 leading-relaxed shadow-sm">
                    <AlertTriangle size={18} className="shrink-0 text-amber-500" />
                    <p>
                        <span className="font-bold block mb-0.5">⚠️ ข้อควรระวังสำคัญ:</span>
                        กรุณาตรวจสอบให้แน่ใจว่าเปิดสิทธิ์การเข้าถึงไฟล์เป็น <span className="font-bold underline text-amber-800">"Anyone with the link" (ทุกคนที่มีลิงก์)</span> ก่อนกดส่งงาน เพื่อให้แอดมินสามารถตรวจสอบได้ทันที
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest pl-1">
                    หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="ข้อความเพิ่มเติมถึงแอดมิน..."
                    className="w-full px-5 py-4 rounded-2xl border-0 bg-white focus:ring-2 focus:ring-brand-start/20 transition-all outline-none text-sm resize-none placeholder-gray-400 shadow-soft focus:shadow-lg"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!link || isSubmitting || verificationStatus !== 'success'}
                className={`
                    w-full py-5 rounded-2xl font-black text-white transition-all duration-300 active:scale-[0.98] relative overflow-hidden group
                    ${!link || isSubmitting || verificationStatus !== 'success'
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-brand-gradient hover:shadow-glow-lg hover:-translate-y-1'}
                `}
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                        <>
                            <Loader2 size={22} className="animate-spin" />
                            <span className="text-lg">กำลังส่งข้อมูล...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xl">ส่งงานตรวจสอบ</span>
                            <Send size={22} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </>
                    )}
                </div>
                {/* Visual Glow Effect */}
                {verificationStatus === 'success' && !isSubmitting && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
            </button>
        </div>
    )
}

export default SubmissionForm
