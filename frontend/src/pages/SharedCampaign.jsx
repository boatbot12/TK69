/**
 * SharedCampaign - Public page for clients/brands to view campaign progress
 * No authentication required - uses share token from URL
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp, ExternalLink, Music, FileText } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const cleanText = (text) => {
    if (!text) return ''
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

const getStatusBadge = (status) => {
    const config = {
        'WAITING': { label: 'รอพิจารณา', color: 'bg-amber-100 text-amber-700', icon: Clock },
        'APPROVED': { label: 'อนุมัติแล้ว', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
        'WORK_IN_PROGRESS': { label: 'กำลังทำงาน', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
        'SUBMITTED_SCRIPT': { label: 'ส่งสคริปต์แล้ว', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
        'SCRIPT_APPROVED': { label: 'สคริปต์ผ่าน (รอส่งดราฟ)', color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle },
        'REVISE_SCRIPT': { label: 'แก้ไขสคริปต์', color: 'bg-amber-100 text-amber-700', icon: Clock },
        'SUBMITTED_DRAFT': { label: 'ส่งดราฟท์แล้ว', color: 'bg-violet-100 text-violet-700', icon: Clock },
        'DRAFT_APPROVED': { label: 'อนุมัติดราฟต์ (รอส่ง Final Video)', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
        'REVISE_DRAFT': { label: 'แก้ไขดราฟต์', color: 'bg-rose-100 text-rose-700', icon: Clock },
        'SUBMITTED_FINAL': { label: 'ส่งไฟนอลแล้ว', color: 'bg-pink-100 text-pink-700', icon: Clock },
        'FINAL_APPROVED': { label: 'ไฟนอลผ่าน', color: 'bg-lime-100 text-lime-700', icon: CheckCircle },
        'REVISE_FINAL': { label: 'แก้ไข Final Video', color: 'bg-rose-100 text-rose-700', icon: Clock },
        'SUBMITTED_INSIGHT': { label: 'ส่ง Insight แล้ว', color: 'bg-orange-100 text-orange-700', icon: Clock },
        'REVISE_INSIGHT': { label: 'แก้ไข Insight', color: 'bg-rose-100 text-rose-700', icon: Clock },
        'INSIGHT_APPROVED': { label: 'Insight ผ่าน', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
        'COMPLETED': { label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
        'PAYMENT_TRANSFERRED': { label: 'โอนเงินแล้ว', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        'REJECTED': { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    }

    const cfg = config[status] || { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock }
    const Icon = cfg.icon

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
        </span>
    )
}

const SharedCampaign = () => {
    const { token } = useParams()
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchCampaignData()
    }, [token])

    const fetchCampaignData = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`${API_BASE}/shared/campaign/${token}/`)

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('ไม่พบแคมเปญนี้ หรือลิงก์หมดอายุแล้ว')
                }
                throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
            }

            const json = await res.json()
            setData(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500 font-medium">กำลังโหลดข้อมูลแคมเปญ...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่สามารถเข้าถึงได้</h1>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    const { campaign, stats, participants } = data

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">{cleanText(campaign.title)}</h1>
                            <p className="text-gray-500 font-medium">{cleanText(campaign.brand_name)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={`${API_BASE}/shared/campaign/${token}/export/`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm"
                            >
                                <ExternalLink size={16} />
                                Export Excel
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Users size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-400 font-bold">ทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Clock size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.waiting}</p>
                                <p className="text-xs text-gray-400 font-bold">รอพิจารณา</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <TrendingUp size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.approved}</p>
                                <p className="text-xs text-gray-400 font-bold">กำลังทำงาน</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Clock size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.pending_review}</p>
                                <p className="text-xs text-gray-400 font-bold">รอตรวจงาน</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <CheckCircle size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
                                <p className="text-xs text-gray-400 font-bold">เสร็จสิ้น</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deadlines */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">กำหนดการ</h2>
                    <div className="flex flex-wrap gap-6">
                        <div>
                            <p className="text-xs text-gray-400">ปิดรับสมัคร</p>
                            <p className="font-bold text-gray-900">
                                {format(new Date(campaign.application_deadline), 'd MMMM yyyy', { locale: th })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">กำหนดส่งงาน</p>
                            <p className="font-bold text-gray-900">
                                {format(new Date(campaign.content_deadline), 'd MMMM yyyy', { locale: th })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participants Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">รายชื่อ Influencer ({participants.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Influencer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">TikTok</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Links</th>
                                    {campaign.show_slip && (
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Slip</th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">อัปเดตล่าสุด</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {participants.map((p, idx) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.picture_url || '/default-avatar.png'}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                                                />
                                                <span className="font-semibold text-gray-900">{cleanText(p.display_name)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.tiktok ? (
                                                <a
                                                    href={p.tiktok.profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                                                >
                                                    <Music size={14} />
                                                    @{p.tiktok.username}
                                                    <ExternalLink size={12} className="opacity-50" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(p.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {p.work_links?.script && (
                                                    <a
                                                        href={p.work_links.script}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
                                                        title="Script Link"
                                                    >
                                                        <FileText size={14} />
                                                    </a>
                                                )}
                                                {p.work_links?.draft && (
                                                    <a
                                                        href={p.work_links.draft}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-100 transition-colors"
                                                        title="Draft Video"
                                                    >
                                                        <TrendingUp size={14} />
                                                    </a>
                                                )}
                                                {p.work_links?.final && (
                                                    <a
                                                        href={p.work_links.final}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-colors"
                                                        title="Final Video"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </a>
                                                )}
                                                {(!p.work_links?.script && !p.work_links?.draft && !p.work_links?.final) && (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        {campaign.show_slip && (
                                            <td className="px-6 py-4 text-center">
                                                {p.payment_slip_url ? (
                                                    <a
                                                        href={p.payment_slip_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                                                    >
                                                        📄 View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {format(new Date(p.updated_at), 'd MMM HH:mm', { locale: th })}
                                        </td>
                                    </tr>
                                ))}
                                {participants.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            ยังไม่มี Influencer ในแคมเปญนี้
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8">
                    <p className="text-xs text-gray-400">
                        Powered by <span className="font-bold text-purple-600">ORBIT</span>
                    </p>
                </div>
            </main>
        </div>
    )
}

export default SharedCampaign
