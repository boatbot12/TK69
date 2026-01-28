import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { Clock, MapPin, ChevronRight, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const JobCard = ({ job }) => {
    const navigate = useNavigate()

    const getStatusBadge = (status, userStatus) => {
        // Priority: User Status > Campaign Status
        if (userStatus) {
            switch (userStatus) {
                case 'WAITING':
                    return <span className="px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-black border border-yellow-100 flex items-center gap-1.5 shadow-sm">⏳ รออนุมัติ</span>
                case 'APPROVED':
                case 'WORK_IN_PROGRESS':
                case 'SUBMITTED_SCRIPT':
                case 'SCRIPT_APPROVED':
                case 'SUBMITTED_DRAFT':
                case 'DRAFT_APPROVED':
                case 'SUBMITTED_FINAL':
                    return <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100 flex items-center gap-1.5 shadow-sm">🔨 กำลังทำงาน</span>
                case 'REJECTED':
                    return <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100 flex items-center gap-1.5 shadow-sm">❌ ไม่ผ่าน</span>
                case 'COMPLETED':
                    return <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-100 flex items-center gap-1.5 shadow-sm">💰 รอรับเงิน</span>
                case 'PAYMENT_TRANSFERRED':
                    return <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-100 flex items-center gap-1.5 shadow-sm">✅ จบงาน</span>
                default:
                    return null
            }
        }

        // Campaign Status
        switch (status) {
            case 'OPEN':
                return <span className="px-3 py-1.5 rounded-full bg-white text-emerald-600 text-[10px] font-black border border-emerald-100 flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> เปิดรับสมัคร</span>
            case 'IN_PROGRESS':
                return <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100 flex items-center gap-1.5 shadow-sm">🔒 ปิดรับสมัคร</span>
            case 'CLOSED':
                return <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black border border-gray-200">แคมเปญปิดไปแล้ว</span>
            default:
                return null
        }
    }

    const timeLeft = job.application_deadline
        ? formatDistanceToNow(new Date(job.application_deadline), { addSuffix: true, locale: th })
        : ''

    // Helper to resolve image URL
    const getImageUrl = (path) => {
        if (!path) return null
        if (path.startsWith('http')) return path
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '')
        let cleanPath = path
        if (!path.startsWith('/media/') && !path.startsWith('media/')) cleanPath = `/media/${path}`
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
        return `${baseUrl}/${cleanPath}`
    }

    return (
        <div
            onClick={() => navigate(`/campaign/${job.uuid || job.id}`)}
            className="group relative bg-white rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 transition-all duration-500 active:scale-[0.98] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] cursor-pointer overflow-hidden mb-2"
        >
            {/* Image Container */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[24px] bg-gray-50 mb-5">
                {(job.cover_image || job.brand_logo) ? (
                    <img
                        src={getImageUrl(job.cover_image || job.brand_logo)}
                        alt={job.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-200">
                        ✨
                    </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-2 border border-white/50">
                        <div className="w-6 h-6 rounded-lg bg-brand-gradient flex items-center justify-center text-[10px] text-white font-black">
                            {job.brand_name?.charAt(0)}
                        </div>
                        <span className="text-gray-900 text-[11px] font-black uppercase tracking-tight">
                            {job.brand_name}
                        </span>
                    </div>
                    {getStatusBadge(job.status, job.user_status)}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
            </div>

            {/* Content Container */}
            <div className="px-2 pb-2">
                <h3 className="text-[18px] font-black text-gray-900 leading-[1.3] mb-4 line-clamp-2 transition-colors group-hover:text-brand-start">
                    {job.title}
                </h3>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ค่าตอบแทน (Budget)</span>
                        <div className="text-xl font-black text-brand-start">
                            ฿{parseInt(job.budget || 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {job.location && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                <MapPin size={12} className="text-brand-start" />
                                <span>{job.location}</span>
                            </div>
                        )}
                        {timeLeft && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                                <Clock size={12} />
                                <span>{timeLeft}</span>
                            </div>
                        )}
                    </div>
                </div>

                {job.followers_required > 0 && (
                    <div className="mt-4 p-3 bg-brand-gradient/5 rounded-2xl flex items-center gap-3 border border-brand-start/10">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-start shadow-sm flex-shrink-0">
                            <UserIcon size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">เงื่อนไขผู้ติดตาม</p>
                            <p className="text-sm font-black text-gray-800">{job.followers_required.toLocaleString()}+ <span className="text-[10px] font-bold text-gray-400">FOLLOWERS</span></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default JobCard
