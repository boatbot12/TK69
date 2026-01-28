
import { useState, useEffect } from 'react'
import { X, Phone, MapPin, Instagram, Youtube, Facebook, Music, Utensils, Sparkles, Plane, Palette, Shirt, Home, TrendingUp, Radio, Heart, PawPrint, Image as ImageIcon, Link, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const cleanText = (text) => {
    if (!text) return ''
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

const InterestIcon = ({ id, size = 12 }) => {
    switch (id) {
        case 'food_drink': return <Utensils size={size} />
        case 'lifestyle': return <Sparkles size={size} />
        case 'travel': return <Plane size={size} />
        case 'beauty': return <Palette size={size} />
        case 'fashion': return <Shirt size={size} />
        case 'real_estate': return <Home size={size} />
        case 'finance': return <TrendingUp size={size} />
        case 'live_stream': return <Radio size={size} />
        case 'health': return <Heart size={size} />
        case 'pet': return <PawPrint size={size} />
        default: return <Sparkles size={size} />
    }
}

const ParticipantDetailModal = ({ isOpen, onClose, participant, onApprove, onReject, onReviewWork }) => {
    const [feedback, setFeedback] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        setFeedback('')
    }, [participant?.id])

    if (!isOpen || !participant) return null

    const profile = participant.profile || {}
    const socialAccounts = participant.social_accounts || []

    // Workflow Badge Logic (same as AdminCampaignProject but specific for modal)
    const getStatusBadge = (status) => {
        const map = {
            'WAITING': 'bg-amber-100 text-amber-700',
            'APPROVED': 'bg-blue-100 text-blue-700',
            'SUBMITTED_SCRIPT': 'bg-purple-100 text-purple-700',
            'SCRIPT_APPROVED': 'bg-indigo-100 text-indigo-700',
            'REVISE_SCRIPT': 'bg-amber-100 text-amber-700',
            'SUBMITTED_DRAFT': 'bg-pink-100 text-pink-700',
            'DRAFT_APPROVED': 'bg-rose-100 text-rose-700',
            'REVISE_DRAFT': 'bg-rose-100 text-rose-700',
            'SUBMITTED_FINAL': 'bg-cyan-100 text-cyan-700',
            'FINAL_APPROVED': 'bg-teal-100 text-teal-700',
            'REVISE_FINAL': 'bg-rose-100 text-rose-700',
            'SUBMITTED_INSIGHT': 'bg-orange-100 text-orange-700',
            'REVISE_INSIGHT': 'bg-rose-100 text-rose-700',
            'INSIGHT_APPROVED': 'bg-teal-100 text-teal-700',
            'COMPLETED': 'bg-emerald-100 text-emerald-700',
            'PAYMENT_TRANSFERRED': 'bg-green-100 text-green-700',
            'REJECTED': 'bg-red-100 text-red-700'
        }
        return map[status] || 'bg-gray-100 text-gray-700'
    }

    const getStatusLabel = (status) => {
        const map = {
            'WAITING': 'รออนุมัติสมัคร',
            'APPROVED': 'เริ่มงาน (รอสคริปต์)',
            'SUBMITTED_SCRIPT': 'ส่งสคริปต์แล้ว',
            'SCRIPT_APPROVED': 'อนุมัติสคริปต์ (รอส่งดราฟ)',
            'REVISE_SCRIPT': 'แก้ไขสคริปต์',
            'SUBMITTED_DRAFT': 'ส่งดราฟต์แล้ว',
            'DRAFT_APPROVED': 'อนุมัติดราฟต์ (รอส่ง Final Video)',
            'REVISE_DRAFT': 'แก้ไขดราฟต์',
            'SUBMITTED_FINAL': 'ส่งไฟนอลแล้ว',
            'FINAL_APPROVED': 'รอ Insight',
            'REVISE_FINAL': 'แก้ไข Final Video',
            'SUBMITTED_INSIGHT': 'ส่ง Insight แล้ว',
            'REVISE_INSIGHT': 'แก้ไข Insight',
            'INSIGHT_APPROVED': 'อนุมัติ Insight',
            'COMPLETED': 'เสร็จสิ้น (รอจ่าย)',
            'PAYMENT_TRANSFERRED': 'โอนเงินแล้ว',
            'REJECTED': 'ปฏิเสธ',
        }
        return map[status] || status
    }

    const platformIcon = (platform) => {
        const iconClass = "w-4 h-4 transition-transform hover:scale-110"
        switch (platform?.toLowerCase()) {
            case 'instagram': return <Instagram size={16} className="text-[#E1306C]" />
            case 'youtube': return <Youtube size={16} className="text-[#FF0000]" />
            case 'facebook': return <Facebook size={16} className="text-[#1877F2]" />
            case 'tiktok':
                return (
                    <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="12" fill="#000000" />
                        <path d="M12.43 4.1a.63.63 0 0 0-.63.63v7.08a3.17 3.17 0 1 1-3.17-3.17.63.63 0 0 0 .63-.63V5.18a.63.63 0 0 0-.75-.62 5.68 5.68 0 1 0 5.8 5.56V6.98a.63.63 0 0 0-.63-.63h-.05a4.39 4.39 0 0 1-1.2-.17z" fill="#25F4EE" />
                        <path d="M16.5 6.5a.63.63 0 0 0 .55-.83 4.38 4.38 0 0 0-3.3-3.1.63.63 0 0 0-.76.62v2.24a.63.63 0 0 0 .82.6c.92.27 1.7.9 2.18 1.74a.63.63 0 0 0 .5.3z" fill="#FE2C55" />
                        <path d="M16.5 7.5c-1.5 0-2.9-.6-3.9-1.6v6.9c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c.3 0 .6.04.9.1V5.7a6.8 6.8 0 0 0-.9-.1c-3.8 0-6.9 3.1-6.9 6.9s3.1 6.9 6.9 6.9 6.9-3.1 6.9-6.9V4.5c1.7 1.2 3.7 1.9 5.9 1.9v2.4c-1.5-.1-2.9-.6-4.3-1.3z" fill="#FFFFFF" />
                    </svg>
                )
            case 'lemon8':
                return (
                    <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#FCE919" />
                        <path d="M18.5 7.5S17 2 12 4c0 0 3.5-1.5 6.5 3.5z" fill="#4CAF50" />
                        <circle cx="12" cy="12.5" r="7" fill="#FFF" fillOpacity="0.4" />
                        <circle cx="12" cy="12.5" r="5.5" fill="#FCE919" />
                        <path d="M12 12.5 L12 7 M12 12.5 L16.5 9.5 M12 12.5 L17 14 M12 12.5 L13.5 17.5 M12 12.5 L9 17 M12 12.5 L7 14.5 M12 12.5 L7.5 9.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                )
            case 'twitter':
            case 'x':
                return (
                    <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="black" />
                        <path d="M16.99 8.5H19.5L14.04 13.79L20.46 20.5H15.3L11.26 16.27L6.63 20.5H4.12L9.93 14.88L3.77 8.5H9.08L12.76 12.35L16.99 8.5ZM16.11 19.65H17.5L8.25 9.97H6.76L16.11 19.65Z" fill="white" />
                    </svg>
                )
            default: return <div className="w-4 h-4 rounded-full bg-gray-200" />
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={participant.picture_url || '/default-avatar.png'}
                                        className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white"
                                        alt=""
                                    />
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">{cleanText(participant.display_name)}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusBadge(participant.status)}`}>
                                                {getStatusLabel(participant.status)}
                                            </span>
                                            <span className="text-sm text-gray-500">#{participant.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Review Area (If pending submission) */}
                                {['SUBMITTED_SCRIPT', 'SUBMITTED_DRAFT', 'SUBMITTED_FINAL', 'SUBMITTED_INSIGHT'].includes(participant.status) && (
                                    <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm animate-fade-in">
                                        <h3 className="text-sm font-black text-purple-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                            รอการตรวจสอบผลงาน
                                        </h3>

                                        {(() => {
                                            const stageMap = {
                                                'SUBMITTED_SCRIPT': 'script',
                                                'SUBMITTED_DRAFT': 'draft',
                                                'SUBMITTED_FINAL': 'final',
                                                'SUBMITTED_INSIGHT': 'insight'
                                            }
                                            const stage = stageMap[participant.status]

                                            // Determine submission data and round count based on stage
                                            let submission = {}
                                            let isFinalRound = false
                                            let submissionList = []

                                            if (stage === 'insight') {
                                                // Insight uses top-level fields, no list history
                                                submission = {
                                                    submitted_at: participant.insight_submitted_at,
                                                    link: participant.insight_image,
                                                    notes: null // Insight doesn't have notes currently
                                                }
                                                isFinalRound = false // Insight can be revised indefinitely (rewrites)
                                            } else {
                                                // Standard stages (script, draft, final) use list history
                                                submission = participant.submissions?.[stage] || {}

                                                // Check for list vs single dict legacy
                                                if (Array.isArray(participant.submissions?.[stage])) {
                                                    submissionList = participant.submissions[stage]
                                                    submission = submissionList[submissionList.length - 1]
                                                } else if (participant.submissions?.[stage]) {
                                                    submissionList = [participant.submissions[stage]]
                                                    submission = participant.submissions[stage]
                                                }

                                                isFinalRound = submissionList.length >= 3
                                            }

                                            const handleReview = async (action) => {
                                                if (isProcessing) return
                                                setIsProcessing(true)
                                                try {
                                                    await onReviewWork(participant.id, stage, action, feedback)
                                                } finally {
                                                    setIsProcessing(false)
                                                }
                                            }

                                            return (
                                                <div className="space-y-4">
                                                    {/* Final Round Warning */}
                                                    {isFinalRound && (
                                                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex gap-3 animate-pulse">
                                                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                                                <span className="text-xl">⚠️</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-rose-700">นี่คือการส่งงานรอบสุดท้าย (Round {submissionList.length})</h4>
                                                                <p className="text-xs text-rose-600">Influencer ได้แก้ไขงานครบตามกำหนดแล้ว ไม่สามารถส่งกลับแก้ไขได้อีก</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-gray-400">ขั้นตอน: <span className="text-purple-600 uppercase">{stage}</span></span>
                                                            <span className="text-xs text-gray-400">
                                                                {stage === 'insight' && participant.insight_submitted_at
                                                                    ? new Date(participant.insight_submitted_at).toLocaleString()
                                                                    : submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '-'
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* Show Insight Image Preview (Enhanced Gallery) */}
                                                        {stage === 'insight' && (
                                                            <div className="mb-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                        <ImageIcon size={12} className="text-purple-500" />
                                                                        หลักฐาน Insight ({participant.insight_files?.length || 1} รูป)
                                                                    </p>
                                                                    <span className="text-[10px] text-gray-400">คลิกที่รูปเพื่อขยายใหญ่</span>
                                                                </div>

                                                                {/* Dynamic Grid Layout */}
                                                                <div className={`grid gap-3 ${(participant.insight_files?.length || 1) === 1 ? 'grid-cols-1' :
                                                                    (participant.insight_files?.length || 1) === 2 ? 'grid-cols-2' :
                                                                        'grid-cols-2 sm:grid-cols-3'
                                                                    }`}>
                                                                    {(participant.insight_files && participant.insight_files.length > 0
                                                                        ? participant.insight_files
                                                                        : participant.insight_image ? [participant.insight_image] : []
                                                                    ).map((imgUrl, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={imgUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 aspect-[9/16] bg-gray-50"
                                                                        >
                                                                            <img
                                                                                src={imgUrl}
                                                                                alt={`Insight ${idx + 1}`}
                                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                                onError={(e) => {
                                                                                    e.target.parentElement.style.display = 'none'
                                                                                }}
                                                                            />
                                                                            {/* Overlay on hover */}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                                                    <Link size={14} className="text-purple-600" />
                                                                                </div>
                                                                            </div>
                                                                            {/* Badge */}
                                                                            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                                                                                #{idx + 1}
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* AI Insight Analysis (Review Mode - Top Position) */}
                                                        {stage === 'insight' && participant.insight_data && Object.keys(participant.insight_data).length > 0 && (
                                                            <div className="mb-4 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F5F5F7] to-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-purple-100 ring-1 ring-black/5">
                                                                {/* Decorative Background Elements */}
                                                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                                                                <div className="flex items-center justify-between mb-6 relative z-10">
                                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 tracking-tight">
                                                                        <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                                                                            <Sparkles size={12} className="text-white" />
                                                                        </div>
                                                                        AI Insight Analysis
                                                                    </h4>
                                                                    <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-[10px] font-bold text-indigo-600 tracking-wide uppercase">
                                                                        Review Mode
                                                                    </div>
                                                                </div>

                                                                {/* Main Stats Grid (Bento Box Style) */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 relative z-10">
                                                                    {/* Highlights Card */}
                                                                    <div className="col-span-2 bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                                                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                                                                        <div>
                                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Engagement Rate</p>
                                                                            <div className="flex items-baseline gap-1">
                                                                                <span className="text-3xl font-black text-gray-900 tracking-tight">{participant.insight_data.engagement_rate}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 mt-2">
                                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                                <TrendingUp size={10} /> Excellent
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Stat Cards */}
                                                                    <div className="bg-white rounded-3xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center gap-1 hover:shadow-md transition-shadow">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                                                                            <span className="text-lg">👁️</span>
                                                                        </div>
                                                                        <p className="text-xl font-black text-gray-900 tracking-tight">{participant.insight_data.metrics?.views?.toLocaleString() || '-'}</p>
                                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Views</p>
                                                                    </div>

                                                                    <div className="bg-white rounded-3xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center gap-1 hover:shadow-md transition-shadow">
                                                                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-2">
                                                                            <Heart size={16} className="fill-current" />
                                                                        </div>
                                                                        <p className="text-xl font-black text-gray-900 tracking-tight">{participant.metrics?.total_likes?.toLocaleString() || participant.insight_data.metrics?.likes?.toLocaleString() || '-'}</p>
                                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Likes</p>
                                                                    </div>
                                                                </div>

                                                                {/* Secondary Details Grid */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                                                    {/* Audience Demographics */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm col-span-1 md:col-span-2">
                                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                            <TrendingUp size={12} className="text-indigo-500" /> Retention & Growth
                                                                        </p>
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div className="bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100">
                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Avg. Watch</p>
                                                                                <p className="text-lg font-black text-gray-900">{participant.insight_data.retention?.average_watch_time || '-'}</p>
                                                                            </div>
                                                                            <div className="bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100">
                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">% Finished</p>
                                                                                <p className="text-lg font-black text-emerald-600">{participant.insight_data.retention?.watched_full_video_percentage || '-'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Viewer Types & Segments */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm">
                                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Viewer Segmentation</p>
                                                                        <div className="space-y-4">
                                                                            {/* New vs Returning */}
                                                                            <div>
                                                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                                                    <span className="text-indigo-600">New {participant.insight_data.audience?.viewer_types?.new_viewers_percentage}%</span>
                                                                                    <span className="text-gray-400">Returning {participant.insight_data.audience?.viewer_types?.returning_viewers_percentage}%</span>
                                                                                </div>
                                                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                                                    <div className="h-full bg-indigo-500" style={{ width: `${participant.insight_data.audience?.viewer_types?.new_viewers_percentage || 50}%` }} />
                                                                                </div>
                                                                            </div>
                                                                            {/* Followers vs Non-Followers */}
                                                                            <div>
                                                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                                                    <span className="text-purple-600">Non-Followers {participant.insight_data.audience?.viewer_types?.non_followers_percentage}%</span>
                                                                                    <span className="text-gray-400">Followers {participant.insight_data.audience?.viewer_types?.followers_percentage}%</span>
                                                                                </div>
                                                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                                                    <div className="h-full bg-purple-500" style={{ width: `${participant.insight_data.audience?.viewer_types?.non_followers_percentage || 50}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Gender & Audience */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm">
                                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                            Gender Distribution
                                                                        </p>
                                                                        <div className="space-y-4">
                                                                            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                                                                <div
                                                                                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 relative group"
                                                                                    style={{ width: `${participant.insight_data.audience?.gender_split?.female || 50}%` }}
                                                                                >
                                                                                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors" />
                                                                                </div>
                                                                                <div
                                                                                    className="h-full bg-gradient-to-r from-blue-400 to-sky-400 relative group"
                                                                                    style={{ width: `${participant.insight_data.audience?.gender_split?.male || 45}%` }}
                                                                                >
                                                                                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors" />
                                                                                </div>
                                                                                <div
                                                                                    className="h-full bg-gray-400 relative group"
                                                                                    style={{ width: `${participant.insight_data.audience?.gender_split?.other || 5}%` }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-[10px]">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                                                                    <span className="font-bold text-gray-700">Female {participant.insight_data.audience?.gender_split?.female}%</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                                    <span className="font-bold text-gray-700">Male {participant.insight_data.audience?.gender_split?.male}%</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Traffic Sources */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm">
                                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Traffic Sources</p>
                                                                        <div className="space-y-3">
                                                                            {participant.insight_data.traffic?.sources?.slice(0, 4).map((source, i) => (
                                                                                <div key={i} className="space-y-1">
                                                                                    <div className="flex justify-between text-[10px]">
                                                                                        <span className="font-bold text-gray-700">{source.name}</span>
                                                                                        <span className="text-gray-500">{source.percentage}%</span>
                                                                                    </div>
                                                                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                                        <div className="h-full bg-indigo-400/60" style={{ width: `${source.percentage}%` }} />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Top Locations */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm">
                                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Top Locations</p>
                                                                        <div className="space-y-2">
                                                                            {participant.insight_data.audience?.top_locations?.slice(0, 5).map((loc, i) => (
                                                                                <div key={i} className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <MapPin size={10} className="text-gray-400" />
                                                                                        <span className="text-[10px] font-bold text-gray-700">{loc.name}</span>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{loc.percentage}%</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Age Groups & Search Queries */}
                                                                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-sm md:col-span-2">
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                            <div>
                                                                                <div className="flex flex-col h-full">
                                                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                                        Age Groups
                                                                                    </p>
                                                                                    <div className="space-y-3 flex-1 justify-center flex flex-col pt-1">
                                                                                        {participant.insight_data.audience?.top_age_ranges?.map((range, i) => (
                                                                                            <div key={i} className="space-y-1">
                                                                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                                                                    <span className="text-gray-600">{range.range}</span>
                                                                                                    <span className="text-indigo-600 font-mono">{range.percentage}%</span>
                                                                                                </div>
                                                                                                <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
                                                                                                    <div
                                                                                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-700 ease-out"
                                                                                                        style={{ width: `${range.percentage}%` }}
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Top Search Queries</p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {participant.insight_data.traffic?.search_queries?.map((query, i) => (
                                                                                        <span key={i} className="px-2 py-1 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-gray-600 shadow-sm italic transition-transform hover:scale-105">
                                                                                            "{query}"
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}


                                                        {/* Show Link for other stages (Premium Card Design) */}
                                                        {stage !== 'insight' && submission.link && (
                                                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-4 flex items-center justify-between group hover:bg-blue-50 transition-colors">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                                        <Link size={20} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">ลิงก์ผลงาน (Submission Link)</p>
                                                                        <a href={submission.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 transition-colors block hover:underline">
                                                                            {submission.link}
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={submission.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
                                                                >
                                                                    เปิดดู
                                                                </a>
                                                            </div>
                                                        )}
                                                        {stage !== 'insight' && submission.notes && (
                                                            <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">ข้อความจาก Influencer:</p>
                                                                <p className="text-sm text-gray-700 italic">"{submission.notes}"</p>
                                                            </div>
                                                        )}

                                                        {/* Insight Note */}
                                                        {stage === 'insight' && participant.insight_note && (
                                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">Note from Influencer (Insight):</p>
                                                                <p className="text-sm text-gray-700 italic">"{participant.insight_note}"</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 pl-1">Feedback ถึง Influencer (จะแสดงให้เขาเห็น)</label>
                                                        <textarea
                                                            placeholder={isFinalRound ? "ใส่คำแนะนำเพิ่มเติม (ถ้ามี)..." : "ใส่คอมเม้นท์เพื่อให้แก้ไข หรือคำชม..."}
                                                            className="w-full border border-purple-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm disabled:bg-gray-50"
                                                            rows={3}
                                                            value={feedback}
                                                            onChange={e => setFeedback(e.target.value)}
                                                            disabled={isProcessing}
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {/* Hide Reject Button if Final Round */}
                                                        {!isFinalRound && (
                                                            <button
                                                                onClick={() => handleReview('REJECT')}
                                                                disabled={isProcessing}
                                                                className={`flex-1 py-3 bg-white border border-rose-200 text-rose-600 font-black rounded-xl hover:bg-rose-50 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {isProcessing ? <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" /> : null}
                                                                ส่งกลับแก้ไข
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleReview('APPROVE')}
                                                            disabled={isProcessing}
                                                            className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                            อนุมัติผ่าน
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}

                                {/* Interests */}
                                {profile.interests?.length > 0 && (
                                    <section>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ความสนใจ</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.interests.map(int => (
                                                <span key={int.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                                                    <InterestIcon id={int.id} />
                                                    {cleanText(int.name)}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Personal Info */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลส่วนตัว</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">ชื่อ-นามสกุล</p>
                                            <p className="font-bold text-gray-900">{cleanText(profile.fullname) || '-'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">เบอร์โทรศัพท์</p>
                                                <p className="font-bold text-gray-900">{profile.phone || '-'}</p>
                                            </div>
                                            <Phone size={18} className="text-gray-300" />
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                                            <p className="text-xs text-gray-400 mb-1">LINE Display Name</p>
                                            <p className="font-bold text-gray-900">{cleanText(participant.display_name) || '-'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Social Stats */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">ผู้ติดตาม</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {socialAccounts.map((acc, idx) => (
                                            <a
                                                key={idx}
                                                href={acc.profile_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white border border-gray-100 p-3 rounded-xl text-center hover:shadow-md transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                    {platformIcon(acc.platform)}
                                                </div>
                                                <p className="text-xs font-bold text-gray-900">{acc.followers_formatted}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">{acc.platform}</p>
                                            </a>
                                        ))}
                                        {socialAccounts.length === 0 && (
                                            <div className="col-span-4 text-center text-gray-400 text-sm py-2">
                                                ไม่พบข้อมูล Social Media
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Submission Data (If Any) */}
                                {Object.keys(participant.submissions || {}).length > 0 && (
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">ประวัติการส่งงาน</h3>
                                        <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
                                            {Object.entries(participant.submissions).map(([stage, rawData]) => {
                                                // Handle Array (History) vs Single Object
                                                const history = Array.isArray(rawData) ? rawData : [rawData]

                                                return (
                                                    <div key={stage} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center font-bold text-[10px] uppercase text-gray-500">
                                                                {stage.substring(0, 2)}
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900 capitalize">{stage}</p>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {history.map((att, idx) => (
                                                                <div key={idx} className="flex flex-col gap-2 relative pl-4 border-l-2 border-gray-200">
                                                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300"></div>

                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <span className="text-xs font-bold text-gray-700">Round {idx + 1}</span>
                                                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${att.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                                                att.status === 'revision_requested' ? 'bg-rose-100 text-rose-600' :
                                                                                    'bg-gray-200 text-gray-500'
                                                                                }`}>
                                                                                {att.status}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-400">
                                                                            {new Date(att.submitted_at).toLocaleString('th-TH', {
                                                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </div>

                                                                    {att.link && (
                                                                        <a href={att.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate max-w-[200px]">
                                                                            🔗 {att.link}
                                                                        </a>
                                                                    )}

                                                                    {att.feedback && (
                                                                        <div className="bg-white p-2 rounded border border-gray-100 text-xs text-rose-600 italic">
                                                                            <span className="font-bold not-italic">Admin Feedback:</span> {att.feedback}
                                                                        </div>
                                                                    )}

                                                                    {att.notes && (
                                                                        <div className="bg-gray-50 p-2 rounded border border-gray-100/50 text-xs text-gray-500 italic flex items-center gap-1.5">
                                                                            <span className="text-[10px] uppercase font-bold text-gray-400 not-italic">Influencer Note:</span>
                                                                            "{att.notes}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Persistent Insight Gallery (Always visible if data exists) */}
                                {(participant.insight_files?.length > 0 || participant.insight_image) && !['SUBMITTED_INSIGHT'].includes(participant.status) && (
                                    <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                                <ImageIcon size={16} className="text-purple-500" />
                                                รูปภาพ Insight ที่ส่งแล้ว
                                            </h3>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 uppercase tracking-tighter">
                                                {participant.insight_files?.length || 1} รูปภาพ
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {(participant.insight_files && participant.insight_files.length > 0
                                                ? participant.insight_files
                                                : participant.insight_image ? [participant.insight_image] : []
                                            ).map((imgUrl, idx) => (
                                                <a
                                                    key={idx}
                                                    href={imgUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all aspect-[9/16] bg-gray-50"
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`Insight ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                    <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                                        #{idx + 1}
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {/* AI Insight Analysis (Moved to Bottom - Shows only if NOT in Review Mode) */}
                                {participant.insight_data && Object.keys(participant.insight_data).length > 0 && participant.status !== 'SUBMITTED_INSIGHT' && (
                                    <div className="mb-6 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F5F5F7] to-[#FFFFFF] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/50 ring-1 ring-black/5">
                                        {/* Decorative Background Elements */}
                                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                                        <div className="flex items-center justify-between mb-6 relative z-10">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 tracking-tight">
                                                <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                                                    <Sparkles size={12} className="text-white" />
                                                </div>
                                                AI Insight Analysis
                                            </h4>
                                            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-[10px] font-bold text-indigo-600 tracking-wide uppercase">
                                                Beta 2.0
                                            </div>
                                        </div>

                                        {/* Main Stats Grid (Bento Box Style) */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                                            {/* Highlights Card */}
                                            <div className="col-span-2 bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                                                <div>
                                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Engagement Rate</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-black text-gray-900 tracking-tight">{participant.insight_data.engagement_rate}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        <TrendingUp size={10} /> Excellent
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">vs industry avg.</span>
                                                </div>
                                            </div>

                                            {/* Stat Cards */}
                                            <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center gap-1 hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                                                    <span className="text-lg">👁️</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 tracking-tight">{participant.insight_data.metrics?.views?.toLocaleString() || '-'}</p>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Views</p>
                                            </div>

                                            <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center gap-1 hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-2">
                                                    <Heart size={16} className="fill-current" />
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 tracking-tight">{participant.metrics?.total_likes?.toLocaleString() || participant.insight_data.metrics?.likes?.toLocaleString() || '-'}</p>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Likes</p>
                                            </div>
                                        </div>

                                        {/* Secondary Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                            {/* Audience Demographics */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm col-span-1 md:col-span-2">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <TrendingUp size={12} className="text-indigo-500" /> Retention & Growth
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Avg. Watch Time</p>
                                                        <p className="text-xl font-black text-gray-900">{participant.insight_data.retention?.average_watch_time || '-'}</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Watched Full Video</p>
                                                        <p className="text-xl font-black text-emerald-600">{participant.insight_data.retention?.watched_full_video_percentage || '-'}</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Play Time</p>
                                                        <p className="text-xl font-black text-gray-900">{participant.insight_data.retention?.total_play_time || '-'}</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">New Followers</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xl font-black text-indigo-600">+{participant.insight_data.growth?.new_followers || 0}</p>
                                                            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">Growth</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Viewer Types & Segments */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Viewer Segmentation</p>
                                                <div className="space-y-4">
                                                    {/* New vs Returning */}
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold mb-1">
                                                            <span className="text-indigo-600">New {participant.insight_data.audience?.viewer_types?.new_viewers_percentage}%</span>
                                                            <span className="text-gray-400">Returning {participant.insight_data.audience?.viewer_types?.returning_viewers_percentage}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                            <div className="h-full bg-indigo-500" style={{ width: `${participant.insight_data.audience?.viewer_types?.new_viewers_percentage || 50}%` }} />
                                                        </div>
                                                    </div>
                                                    {/* Followers vs Non-Followers */}
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold mb-1">
                                                            <span className="text-purple-600">Non-Followers {participant.insight_data.audience?.viewer_types?.non_followers_percentage}%</span>
                                                            <span className="text-gray-400">Followers {participant.insight_data.audience?.viewer_types?.followers_percentage}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                            <div className="h-full bg-purple-500" style={{ width: `${participant.insight_data.audience?.viewer_types?.non_followers_percentage || 50}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gender & Audience */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    Gender Distribution
                                                </p>
                                                <div className="space-y-4">
                                                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 relative group"
                                                            style={{ width: `${participant.insight_data.audience?.gender_split?.female || 50}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors" />
                                                        </div>
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-400 to-sky-400 relative group"
                                                            style={{ width: `${participant.insight_data.audience?.gender_split?.male || 45}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors" />
                                                        </div>
                                                        <div
                                                            className="h-full bg-gray-400 relative group"
                                                            style={{ width: `${participant.insight_data.audience?.gender_split?.other || 5}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                                            <span className="font-bold text-gray-700">Female {participant.insight_data.audience?.gender_split?.female}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                            <span className="font-bold text-gray-700">Male {participant.insight_data.audience?.gender_split?.male}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Traffic Sources */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Traffic Sources</p>
                                                <div className="space-y-3">
                                                    {participant.insight_data.traffic?.sources?.slice(0, 4).map((source, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="font-bold text-gray-700">{source.name}</span>
                                                                <span className="text-gray-500">{source.percentage}%</span>
                                                            </div>
                                                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-indigo-400/60" style={{ width: `${source.percentage}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Top Locations */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Top Locations</p>
                                                <div className="space-y-2">
                                                    {participant.insight_data.audience?.top_locations?.slice(0, 5).map((loc, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={10} className="text-gray-400" />
                                                                <span className="text-[10px] font-bold text-gray-700">{loc.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{loc.percentage}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Age Groups & Search Queries */}
                                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm md:col-span-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="flex flex-col h-full">
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                Age Groups
                                                            </p>
                                                            <div className="space-y-3 flex-1 justify-center flex flex-col pt-1">
                                                                {participant.insight_data.audience?.top_age_ranges?.map((range, i) => (
                                                                    <div key={i} className="space-y-1">
                                                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                                                            <span className="text-gray-600">{range.range}</span>
                                                                            <span className="text-indigo-600 font-mono">{range.percentage}%</span>
                                                                        </div>
                                                                        <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-700 ease-out"
                                                                                style={{ width: `${range.percentage}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Top Search Queries</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {participant.insight_data.traffic?.search_queries?.map((query, i) => (
                                                                <span key={i} className="px-2 py-1 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-gray-600 shadow-sm italic transition-transform hover:scale-105">
                                                                    "{query}"
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                {participant.status === 'WAITING' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onReject(participant.id)}
                                            className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all text-sm"
                                        >
                                            ปฏิเสธสมัคร
                                        </button>
                                        <button
                                            onClick={() => onApprove(participant.id)}
                                            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:shadow-lg shadow-purple-200 transition-all text-sm"
                                        >
                                            อนุมัติรับเข้าแคมเปญ
                                        </button>
                                    </div>
                                ) : (
                                    <div />
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors bg-white border border-gray-200"
                                >
                                    ปิดหน้าต่าง
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ParticipantDetailModal
