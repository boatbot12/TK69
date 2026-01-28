import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignAPI, applicationAPI } from '../services/api'
import JobWorkflow from '../components/jobs/JobWorkflow'
import PolicyModal from '../components/common/PolicyModal'
import { ArrowLeft, Clock, ShieldCheck, FileText, Info, X, CheckCircle, MapPin, Users, AlertTriangle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'

const JobDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [campaign, setCampaign] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isApplying, setIsApplying] = useState(false)
    const [isSubmittingWork, setIsSubmittingWork] = useState(false)
    const [legalAccepted, setLegalAccepted] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showPolicyModal, setShowPolicyModal] = useState(false)

    useEffect(() => {
        loadCampaign()
    }, [id])

    const loadCampaign = async () => {
        try {
            setIsLoading(true)
            const response = await campaignAPI.get(id)
            setCampaign(response.data)
        } catch (err) {
            console.error('[JobDetail] Failed to load:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = async () => {
        try {
            setIsApplying(true)
            await campaignAPI.apply(id, { note: '' })
            await loadCampaign()
        } catch (err) {
            alert('ไม่สามารถสมัครได้: ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด'))
        } finally {
            setIsApplying(false)
        }
    }

    const handleSubmitWork = async (stage, link, notes, fileOrFiles) => {
        try {
            setIsSubmittingWork(true)
            let data

            // Check if fileOrFiles is present (single file or array)
            if (fileOrFiles) {
                data = new FormData()
                data.append('stage', stage)
                if (link) data.append('link', link)
                if (notes) data.append('notes', notes)

                // Handle Array of Files (Multi-upload) or Kept Files (Strings)
                if (Array.isArray(fileOrFiles)) {
                    fileOrFiles.forEach(f => {
                        if (f instanceof File) {
                            data.append('files', f) // New file upload
                        } else if (typeof f === 'string') {
                            data.append('kept_files', f) // Existing file to keep
                        }
                    })
                }
                // Handle Single File (Legacy)
                else {
                    data.append('file', fileOrFiles)
                }
            } else {
                data = { stage, link, notes }
            }

            await applicationAPI.submitWork(campaign.user_application.id, data)
            await loadCampaign()
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'โปรดลองใหม่'
            alert(`ส่งงานไม่สำเร็จ: ${errorMsg}\n(Code: ${err.response?.status})`)
        } finally {
            setIsSubmittingWork(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>
    if (!campaign) return null

    const hasApplied = !!campaign.user_application
    const timeLeft = campaign.application_deadline ? formatDistanceToNow(new Date(campaign.application_deadline), { addSuffix: true, locale: th }) : ''

    const renderRequirements = (req) => {
        if (!req) return null;

        let parsed = req;
        if (typeof req === 'string') {
            try {
                parsed = JSON.parse(req);
            } catch (e) {
                // Not JSON, handle as list or lines
                return req.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-600 text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        <span className="text-emerald-500 mt-1">●</span>
                        <span>{line.trim()}</span>
                    </div>
                ));
            }
        }

        if (typeof parsed === 'object' && parsed !== null) {
            return Object.entries(parsed).map(([key, val]) => (
                <span key={key} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 uppercase">
                    {key}: {Array.isArray(val) ? val.join(', ') : val.toString()}
                </span>
            ));
        }

        return <p className="text-gray-600 text-sm">{String(req)}</p>;
    }

    const renderStats = () => (
        <div className="flex flex-wrap gap-3 mb-6">
            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm">
                    💰
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">ค่าตอบแทน</p>
                    <p className="text-sm font-bold text-gray-900">฿{parseInt(campaign.budget).toLocaleString()}</p>
                </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                    <Clock size={16} />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">ระยะเวลา</p>
                    <p className="text-sm font-bold text-gray-900">{timeLeft}</p>
                </div>
            </div>
            {campaign.location && (
                <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-sm">
                        <MapPin size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">สถานที่</p>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{campaign.location}</p>
                    </div>
                </div>
            )}
            {campaign.followers_required > 0 && (
                <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">ผู้ติดตาม</p>
                        <p className="text-sm font-bold text-gray-900">{campaign.followers_required.toLocaleString()}+</p>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Premium Hero Section */}
            <div className="relative bg-white rounded-b-[2.5rem] shadow-soft overflow-hidden z-10">
                {/* Hero Cover Image */}
                <div className="relative aspect-[16/7] md:aspect-[16/5] w-full overflow-hidden bg-gray-100">
                    {campaign.cover_image ? (
                        <img
                            src={campaign.cover_image}
                            alt="Campaign Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-brand-gradient opacity-20" />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />

                    {/* Floating Navigation & Badge */}
                    <div className="absolute top-6 left-0 right-0 px-4 flex items-center justify-between z-20">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-lg text-gray-700 hover:text-brand-start transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        {(hasApplied || campaign.status !== 'OPEN') && (
                            <div className={`px-4 py-1.5 ${hasApplied ? 'bg-brand-gradient text-white shadow-lg' : 'bg-white/90 text-amber-700 border border-amber-100'} backdrop-blur-md text-xs font-black rounded-full shadow-xl`}>
                                {hasApplied ? (
                                    campaign.user_application.status === 'COMPLETED' || campaign.user_application.status === 'PAYMENT_TRANSFERRED'
                                        ? '🎉 งานเสร็จสิ้น'
                                        : '⚡️ กำลังดำเนินการ'
                                ) : (
                                    campaign.status === 'IN_PROGRESS' ? '🔒 ปิดรับสมัคร' : '🚫 แคมเปญปิดไปแล้ว'
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 mt-6 pb-12">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <span className="inline-block text-sm font-bold text-transparent bg-clip-text bg-brand-gradient mb-1">
                                {campaign.brand_name}
                            </span>
                            <h1 className="text-2xl font-black text-gray-900 leading-tight">
                                {campaign.title}
                            </h1>
                        </div>
                        <div className="shrink-0">
                            {campaign.brand_logo ? (
                                <img
                                    src={campaign.brand_logo}
                                    alt={campaign.brand_name}
                                    className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white transform hover:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-3xl bg-brand-gradient flex items-center justify-center text-6xl shadow-2xl text-white border-4 border-white transform hover:scale-105 transition-transform">
                                    🏢
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* STATE B: Workflow Mode - Logic Split */}
            {hasApplied ? (
                <div className="px-5 py-6 space-y-6">
                    {renderStats()}
                    {/* Status: WAITING FOR APPROVAL */}
                    {campaign.user_application.status === 'WAITING' && (
                        <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-yellow-100 animate-fade-in-up">
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <Clock size={40} className="text-yellow-500" />
                                <span className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 rounded-full animate-ping" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">รอการอนุมัติ</h2>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                ใบสมัครของคุณถูกส่งเรียบร้อยแล้ว<br />
                                แบรนด์กำลังพิจารณาโปรไฟล์และผลงานของคุณ
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 font-medium">
                                ⏳ โดยปกติจะใช้เวลาพิจารณา 1-3 วัน
                            </div>
                        </div>
                    )
                    }

                    {/* Status: REJECTED */}
                    {campaign.user_application.status === 'REJECTED' && (
                        <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-rose-100 animate-fade-in-up">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X size={40} className="text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">ไม่ผ่านการคัดเลือก</h2>
                            <p className="text-gray-500 leading-relaxed">
                                ขอบคุณที่สนใจร่วมงานกับเรา<br />
                                แต่อาจจะยังไม่ตรงกับความต้องการในครั้งนี้
                            </p>
                        </div>
                    )}

                    {/* Status: APPROVED (Show Workflow) */}
                    {['APPROVED', 'WORK_IN_PROGRESS', 'SUBMITTED_SCRIPT', 'SCRIPT_APPROVED', 'REVISE_SCRIPT', 'SUBMITTED_DRAFT', 'DRAFT_APPROVED', 'REVISE_DRAFT', 'SUBMITTED_FINAL', 'FINAL_APPROVED', 'REVISE_FINAL', 'SUBMITTED_INSIGHT', 'REVISE_INSIGHT', 'INSIGHT_APPROVED', 'COMPLETED', 'PAYMENT_TRANSFERRED'].includes(campaign.user_application.status) && (
                        <>
                            {/* Status-Based Confirmation Banner */}
                            {(() => {
                                const status = campaign.user_application.status
                                const bannerConfig = {
                                    'APPROVED': {
                                        title: '🎉 ยินดีด้วย! คุณได้รับเลือกแล้ว',
                                        subtitle: 'ส่งสคริปต์เพื่อเริ่มต้นทำงานได้เลย',
                                        gradient: 'from-emerald-500 to-teal-600',
                                        shadowColor: 'shadow-emerald-200'
                                    },
                                    'WORK_IN_PROGRESS': {
                                        title: '📝 กำลังทำงาน: ส่งสคริปต์',
                                        subtitle: 'กรุณาส่งสคริปต์เพื่อให้แอดมินตรวจสอบ',
                                        gradient: 'from-blue-500 to-indigo-600',
                                        shadowColor: 'shadow-blue-200'
                                    },
                                    'SUBMITTED_SCRIPT': {
                                        title: '⏳ รอตรวจสอบสคริปต์',
                                        subtitle: 'สคริปต์ถูกส่งแล้ว รอแอดมินตรวจสอบ',
                                        gradient: 'from-amber-500 to-orange-500',
                                        shadowColor: 'shadow-amber-200'
                                    },
                                    'SCRIPT_APPROVED': {
                                        title: '✅ สคริปต์ผ่านแล้ว! ส่ง Draft ต่อ',
                                        subtitle: 'สคริปต์ได้รับการอนุมัติ ส่งดราฟต์วิดีโอได้เลย',
                                        gradient: 'from-emerald-500 to-green-600',
                                        shadowColor: 'shadow-emerald-200'
                                    },
                                    'SUBMITTED_DRAFT': {
                                        title: '⏳ รอตรวจสอบดราฟต์',
                                        subtitle: 'ดราฟต์ถูกส่งแล้ว รอแอดมินตรวจสอบ',
                                        gradient: 'from-amber-500 to-orange-500',
                                        shadowColor: 'shadow-amber-200'
                                    },
                                    'DRAFT_APPROVED': {
                                        title: '✅ ดราฟต์ผ่านแล้ว! ส่งงานจริง',
                                        subtitle: 'ดราฟต์ได้รับการอนุมัติ ส่งงานตัวจริงได้เลย',
                                        gradient: 'from-emerald-500 to-green-600',
                                        shadowColor: 'shadow-emerald-200'
                                    },
                                    'SUBMITTED_FINAL': {
                                        title: '⏳ รอตรวจสอบงานจริง',
                                        subtitle: 'งานตัวจริงถูกส่งแล้ว รอการยืนยันสุดท้าย',
                                        gradient: 'from-amber-500 to-orange-500',
                                        shadowColor: 'shadow-amber-200'
                                    },
                                    'COMPLETED': {
                                        title: '💰 งานเสร็จสมบูรณ์! รอรับเงิน',
                                        subtitle: 'รอแอดมินอัพโหลดหลักฐานการโอนเงิน',
                                        gradient: 'from-purple-500 to-pink-500',
                                        shadowColor: 'shadow-purple-200'
                                    },
                                    'PAYMENT_TRANSFERRED': {
                                        title: '🎊 จบงานเรียบร้อย!',
                                        subtitle: 'ได้รับเงินแล้ว ขอบคุณที่ร่วมงานกับเรา',
                                        gradient: 'from-gray-600 to-gray-800',
                                        shadowColor: 'shadow-gray-300'
                                    },
                                    'REVISE_SCRIPT': {
                                        title: '⚠️ แก้ไขงาน: สคริปต์',
                                        subtitle: 'กรุณาแก้ไขสคริปต์ตามคอมเมนต์จากแอดมิน',
                                        gradient: 'from-amber-500 to-orange-600',
                                        shadowColor: 'shadow-amber-200'
                                    },
                                    'REVISE_DRAFT': {
                                        title: '⚠️ แก้ไขงาน: ดราฟต์',
                                        subtitle: 'กรุณาแก้ไขดราฟต์วิดีโอตามคอมเมนต์',
                                        gradient: 'from-amber-500 to-orange-600',
                                        shadowColor: 'shadow-amber-200'
                                    },
                                    'REVISE_FINAL': {
                                        title: '⚠️ แก้ไขงาน: Final Video',
                                        subtitle: 'กรุณาแก้ไขวิดีโอ Final ตามคอมเมนต์จากแอดมิน',
                                        gradient: 'from-rose-500 to-orange-600',
                                        shadowColor: 'shadow-rose-200'
                                    },
                                    'FINAL_APPROVED': {
                                        title: '✅ Final ผ่านแล้ว! ส่ง Insight',
                                        subtitle: 'กรุณาส่งรูป Insight ของคอนเทนต์',
                                        gradient: 'from-indigo-500 to-purple-600',
                                        shadowColor: 'shadow-indigo-200'
                                    },
                                    'SUBMITTED_INSIGHT': {
                                        title: '⏳ รอตรวจสอบ Insight',
                                        subtitle: 'Insight ถูกส่งแล้ว รอแอดมินตรวจสอบ',
                                        gradient: 'from-orange-500 to-amber-500',
                                        shadowColor: 'shadow-orange-200'
                                    },
                                    'REVISE_INSIGHT': {
                                        title: '⚠️ แก้ไขงาน: Insight',
                                        subtitle: 'กรุณาอัพโหลดรูป Insight ใหม่ตามคอมเมนต์',
                                        gradient: 'from-rose-500 to-pink-600',
                                        shadowColor: 'shadow-rose-200'
                                    },
                                    'INSIGHT_APPROVED': {
                                        title: '✅ Insight ผ่านแล้ว!',
                                        subtitle: 'รอแอดมินดำเนินการโอนเงิน',
                                        gradient: 'from-teal-500 to-emerald-600',
                                        shadowColor: 'shadow-teal-200'
                                    }
                                }
                                const config = bannerConfig[status] || bannerConfig['APPROVED']

                                return (
                                    <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-4 text-white shadow-lg ${config.shadowColor} animate-fade-in flex items-center gap-4`}>
                                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur">
                                            <ShieldCheck size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{config.title}</h3>
                                            <p className="text-white/90 text-sm">{config.subtitle}</p>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Top Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowDetailModal(true)}
                                    className="flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100/80 hover:border-blue-200 hover:shadow-md active:scale-95 transition-all text-gray-700 font-bold text-sm group"
                                >
                                    <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <Info size={20} className="text-blue-600" />
                                    </div>
                                    รายละเอียดงาน
                                </button>
                                <a
                                    href={campaign.brief_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl shadow-sm border border-gray-100/80 transition-all font-bold text-sm group ${campaign.brief_url
                                        ? 'bg-white hover:border-emerald-200 hover:shadow-md active:scale-95 text-gray-700'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    onClick={(e) => !campaign.brief_url && e.preventDefault()}
                                >
                                    <div className={`p-2 rounded-full transition-colors ${campaign.brief_url ? 'bg-emerald-50 group-hover:bg-emerald-100' : 'bg-gray-100'}`}>
                                        <FileText size={20} className={campaign.brief_url ? 'text-emerald-600' : 'text-gray-400'} />
                                    </div>
                                    บรีฟงาน {campaign.brief_url && <ExternalLink size={12} className="inline ml-1" />}
                                </a>
                            </div>

                            {/* Workflow */}
                            <div>
                                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 ml-1">
                                    ขั้นตอนการทำงาน
                                </h2>
                                <JobWorkflow
                                    application={campaign.user_application}
                                    campaign={campaign}
                                    onSubmitWork={handleSubmitWork}
                                    isSubmitting={isSubmittingWork}
                                />
                            </div>

                            {/* Payment Info (Only if Completed) */}
                            {campaign.user_application.status === 'COMPLETED' && (
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="font-bold opacity-90">ยอดเงินที่จะได้รับ</p>
                                            <h3 className="text-3xl font-black mt-1">฿{parseInt(campaign.budget).toLocaleString()}</h3>
                                        </div>
                                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur">
                                            <CheckCircle size={24} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* STATE A: Pre-Application Content */
                <div className="px-5 py-8 pb-64 space-y-8 bg-white rounded-t-[32px] -mt-6 relative z-10 shadow-[-4px_0_20px_rgba(0,0,0,0.05)]">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />

                    {renderStats()}

                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-gray-900">รายละเอียดแคมเปญ</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                            {campaign.full_description || campaign.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-gray-900">ข้อกำหนด (Requirements)</h3>
                        <div className="flex flex-wrap gap-2">
                            {renderRequirements(campaign.requirements)}
                        </div>
                    </div>

                    {/* Sticky Bottom Action - Redesigned */}
                    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-30">
                        {/* Warning & Agreement (Only if OPEN) */}
                        {campaign.status === 'OPEN' && (
                            <div className="px-5 pt-4 pb-3">
                                <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-4 border border-rose-100 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                                            <AlertTriangle size={20} className="text-rose-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-rose-700 mb-1">⚠️ คำเตือนสำคัญ</h4>
                                            <p className="text-xs text-rose-600 leading-relaxed">
                                                หากไม่ส่งงานตามกำหนดหรือเชิดสินค้า บริษัทจะ<span className="font-bold">ดำเนินคดีตามกฎหมายถึงที่สุด</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group mb-4">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={legalAccepted}
                                            onChange={(e) => setLegalAccepted(e.target.checked)}
                                            className="peer w-6 h-6 rounded-lg border-2 border-gray-200 bg-white checked:border-transparent checked:bg-brand-gradient transition-all cursor-pointer appearance-none"
                                        />
                                        <svg className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600 leading-relaxed select-none">
                                        ฉันยอมรับ{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setShowPolicyModal(true)
                                            }}
                                            className="bg-brand-gradient bg-clip-text text-transparent font-black underline decoration-primary-400/50 underline-offset-2 hover:decoration-primary-500"
                                        >
                                            เงื่อนไขบริษัท
                                        </button>
                                        {' '}และยินดีปฏิบัติตามอย่างเคร่งครัด
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Apply Button / Status Message */}
                        <div className="p-5">
                            {campaign.status === 'OPEN' ? (
                                <button
                                    onClick={handleApply}
                                    disabled={!legalAccepted || isApplying}
                                    className={`
                                        w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98]
                                        ${!legalAccepted || isApplying
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-brand-gradient text-white shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    {isApplying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังสมัคร...
                                        </span>
                                    ) : (
                                        'สมัครรับงานทันที ⚡'
                                    )}
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-center text-lg border border-gray-200">
                                    {campaign.status === 'IN_PROGRESS' ? '🔒 ปิดรับสมัครแล้ว' : '🚫 แคมเปญนี้ปิดไปแล้ว'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                    <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-3xl overflow-hidden flex flex-col animate-scale-in">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">รายละเอียดงานทั้งหมด</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-rose-500"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                {campaign.full_description || campaign.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Policy Modal */}
            <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
        </div>
    )
}

export default JobDetail
