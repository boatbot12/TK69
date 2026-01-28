import React from 'react'
import { ExternalLink, AlertCircle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const ReadOnlySubmission = ({ submission, history, stageId, appStatus }) => {
    // If we have a history array, use it. Otherwise fall back to single submission
    const submissions = Array.isArray(history) ? history : (submission ? [submission] : [])

    if (submissions.length === 0) return null

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return format(new Date(dateStr), 'd MMM yyyy HH:mm', { locale: th })
    }

    // Get the latest submission for Insight (simplified view)
    const latestSubmission = submissions[submissions.length - 1]

    // Special handling for Insight - show image preview only (no history)
    if (stageId === 'insight') {
        const isApproved = latestSubmission.status === 'approved'
        const isRevision = latestSubmission.status === 'revision_requested'
        const isPending = latestSubmission.status === 'pending'

        return (
            <div className="space-y-4">
                {/* Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-sm font-bold flex items-center gap-2 ${isApproved ? 'text-emerald-700' : isRevision ? 'text-rose-700' : 'text-gray-700'}`}>
                        {isApproved ? <CheckCircle size={16} /> : isRevision ? <AlertCircle size={16} /> : <Clock size={16} />}
                        {isApproved ? 'อนุมัติแล้ว' : isRevision ? 'ต้องแก้ไข' : 'รอตรวจสอบ'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {formatDate(latestSubmission.submitted_at)}
                    </span>
                </div>

                {/* Insight Image Preview */}
                <div className={`bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${isApproved ? 'border-emerald-100 ring-1 ring-emerald-50' : isRevision ? 'border-rose-100' : 'border-indigo-50 ring-1 ring-indigo-50'}`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <ImageIcon size={12} />
                        รูปภาพ Insight ที่ส่ง
                    </p>

                    {/* Insight Image(s) Preview - Premium Grid */}
                    {latestSubmission.files && latestSubmission.files.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {latestSubmission.files.map((imgUrl, idx) => (
                                <a
                                    key={idx}
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group aspect-[9/16] bg-gray-50"
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`Insight ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Badge */}
                                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                        #{idx + 1}
                                    </div>

                                    {/* Action Hint */}
                                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="flex items-center gap-1">
                                            <ImageIcon size={12} />
                                            <span>เปิดดูรูปภาพ</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <a
                            href={latestSubmission.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group"
                        >
                            <img
                                src={latestSubmission.link}
                                alt="Insight"
                                className="w-full max-h-[400px] object-contain bg-gray-50 group-hover:scale-[1.02] transition-transform"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.parentElement.innerHTML = '<div class="p-8 text-center text-gray-400 bg-gray-50">ไม่สามารถโหลดรูปภาพได้</div>'
                                }}
                            />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                คลิกเพื่อดูขนาดเต็ม
                            </div>
                        </a>
                    )}

                    {latestSubmission.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-50/80">
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Note:</p>
                            <p className="text-xs text-gray-600 leading-relaxed">"{latestSubmission.notes}"</p>
                        </div>
                    )}
                </div>

                {/* Feedback Box (if revision requested or approved with feedback) */}
                {(latestSubmission.feedback || latestSubmission.reviewed_at) && (
                    <div className={`rounded-2xl p-4 text-sm ${isApproved ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-rose-50/50 border border-rose-100'}`}>
                        <div className="flex justify-end mb-2">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-mono text-gray-500/80">
                                <Clock size={10} />
                                {formatDate(latestSubmission.reviewed_at)}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className={`mt-0.5 shrink-0 ${isApproved ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isApproved ? <CheckCircle size={20} className="drop-shadow-sm" /> : <AlertCircle size={20} className="drop-shadow-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold mb-1 text-xs uppercase tracking-wide ${isApproved ? 'text-emerald-800' : 'text-rose-800'}`}>
                                    {isApproved ? 'Approved' : 'ต้องแก้ไข'}
                                </p>
                                <p className={`text-sm leading-relaxed ${isApproved ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {latestSubmission.feedback || (isApproved ? 'Insight เรียบร้อยดี' : '-')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Default behavior for other stages (script, draft, final) - show full history timeline
    return (
        <div className="space-y-8 pl-2">
            {submissions.map((item, index) => {
                const isLatest = index === submissions.length - 1
                const roundNum = index + 1
                const isApproved = item.status === 'approved'
                const isRevision = item.status === 'revision_requested'
                const isPending = item.status === 'pending'

                return (
                    <div key={index} className={`relative flex gap-4 ${!isLatest ? 'opacity-70 grayscale-[30%]' : ''}`}>
                        {/* Timeline Connector */}
                        {index < submissions.length - 1 && (
                            <div className="absolute left-[15px] top-10 bottom-[-32px] w-[2px] bg-gray-100" />
                        )}

                        {/* Round indicator */}
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[3px] z-10 bg-white shadow-sm mt-1
                            ${isApproved ? 'border-emerald-500 text-emerald-600' :
                                isRevision ? 'border-rose-500 text-rose-600' :
                                    'border-gray-200 text-gray-400'}
                        `}>
                            <span className="font-extrabold text-[10px]">{roundNum}</span>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 min-w-0 space-y-3">
                            {/* Header: Status & Time */}
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className={`text-sm font-bold ${isApproved ? 'text-emerald-700' : isRevision ? 'text-rose-700' : 'text-gray-700'}`}>
                                    {isApproved ? 'อนุมัติแล้ว' : isRevision ? 'ต้องแก้ไข' : 'รอตรวจสอบ'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                    {formatDate(item.submitted_at)}
                                </span>
                            </div>

                            {/* Main Submission Box */}
                            <div className={`bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${isLatest ? 'border-indigo-50 ring-1 ring-indigo-50' : 'border-gray-100 bg-gray-50/50'}`}>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-500 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-blue-100 transition-all shadow-sm shrink-0">
                                        <ExternalLink size={18} />
                                    </div>
                                    <div className="overflow-hidden min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                GOOGLE DRIVE / DOCS
                                            </p>
                                            {!isLatest && <span className="text-[9px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">OLD</span>}
                                        </div>
                                        <p className={`text-sm font-bold truncate underline-offset-2 decoration-indigo-200 group-hover:underline ${isLatest ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {item.link}
                                        </p>
                                    </div>
                                </a>
                                {item.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-50/80">
                                        <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Note:</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">"{item.notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Feedback Box (if exists) */}
                            {(item.feedback || item.reviewed_at) && (
                                <div className={`rounded-2xl p-4 text-sm relative overflow-hidden ${isApproved ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-rose-50/50 border border-rose-100'}`}>
                                    {/* Admin Action Timestamp - Moved to prevent overlap */}
                                    <div className="flex justify-end mb-2">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-mono text-gray-500/80">
                                            <Clock size={10} />
                                            {formatDate(item.reviewed_at)}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className={`mt-0.5 shrink-0 ${isApproved ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isApproved ? <CheckCircle size={20} className="drop-shadow-sm" /> : <AlertCircle size={20} className="drop-shadow-sm" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold mb-1 text-xs uppercase tracking-wide ${isApproved ? 'text-emerald-800' : 'text-rose-800'}`}>
                                                {isApproved ? 'Approved by Admin' : 'Change Requested'}
                                            </p>
                                            <p className={`text-sm leading-relaxed ${isApproved ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {item.feedback || (isApproved ? 'งานเรียบร้อยดี ผ่านการตรวจสอบ' : '-')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ReadOnlySubmission

