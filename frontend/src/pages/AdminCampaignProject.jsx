import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Download, Upload, Filter, CheckCircle, XCircle, Search, MoreHorizontal, FileText, Video, Image as ImageIcon, CheckSquare, Square, ThumbsUp, ThumbsDown, Instagram, Youtube, Facebook, Music, Share2, Link, Check, Utensils, Sparkles, Plane, Palette, Shirt, Home, TrendingUp, Radio, Heart, PawPrint, Edit3, Loader2, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticipantDetailModal from '../components/admin/ParticipantDetailModal'
import FollowUpModal from '../components/admin/FollowUpModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// --- HELPER COMPONENTS & FUNCTIONS ---
// ... (existing helpers)

// --- MAIN COMPONENT ---
const cleanText = (text) => {
    if (!text) return ''
    // Remove sequences of 2 or more question marks anywhere
    // and also remove single question marks if they are at the start or end
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

const getStageBadge = (participant) => {
    const status = participant.status
    const submissions = participant.submissions || {}
    const inRevision = Object.values(submissions).some(s => s.status === 'revision_requested')

    if (inRevision) {
        return (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap border border-rose-200">
                ⚠️ ให้แก้ไขงาน
            </span>
        )
    }

    const map = {
        'WAITING': { color: 'amber', label: 'รออนุมัติสมัคร' },
        'APPROVED': { color: 'blue', label: 'เริ่มงาน (รอสคริปต์)' },
        'SUBMITTED_SCRIPT': { color: 'purple', label: 'ส่งสคริปต์แล้ว' },
        'SCRIPT_APPROVED': { color: 'indigo', label: 'อนุมัติสคริปต์ (รอส่งดราฟ)' },
        'REVISE_SCRIPT': { color: 'amber', label: 'แก้ไขสคริปต์' },
        'SUBMITTED_DRAFT': { color: 'pink', label: 'ส่งดราฟต์แล้ว' },
        'DRAFT_APPROVED': { color: 'rose', label: 'อนุมัติดราฟต์ (รอส่ง Final Video)' },
        'REVISE_DRAFT': { color: 'rose', label: 'แก้ไขดราฟต์' },
        'SUBMITTED_FINAL': { color: 'cyan', label: 'ส่งไฟนอลแล้ว' },
        'FINAL_APPROVED': { color: 'teal', label: 'รอ Insight' },
        'REVISE_FINAL': { color: 'rose', label: 'แก้ไข Final Video' },
        'REJECTED': { color: 'red', label: 'ปฏิเสธ' },
        'SUBMITTED_INSIGHT': { color: 'orange', label: 'ส่ง Insight แล้ว' },
        'REVISE_INSIGHT': { color: 'rose', label: 'แก้ไข Insight' },
        'INSIGHT_APPROVED': { color: 'teal', label: 'อนุมัติ Insight' },
        'COMPLETED': { color: 'emerald', label: 'เสร็จสิ้น (รอจ่าย)' },
        'PAYMENT_TRANSFERRED': { color: 'green', label: 'โอนเงินแล้ว' },
    }
    const item = map[status] || { color: 'gray', label: status }
    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-${item.color}-50 text-${item.color}-700 whitespace-nowrap border border-${item.color}-100`}>
            {item.label}
        </span>
    )
}

const platformIcon = (platform) => {
    const iconClass = "w-3.5 h-3.5 transition-transform hover:scale-110"
    switch (platform?.toLowerCase()) {
        case 'instagram': return <Instagram size={14} className="text-[#E1306C]" />
        case 'youtube': return <Youtube size={14} className="text-[#FF0000]" />
        case 'facebook': return <Facebook size={14} className="text-[#1877F2]" />
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
        default: return <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
    }
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

const BulkReviewModal = ({ isOpen, onClose, action, stage, count, feedback, setFeedback, onConfirm, isProcessing }) => {
    if (!isOpen) return null
    const isApprove = action === 'APPROVE'

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-900">
                        {isApprove ? '✅ อนุมัติงานเป็นกลุ่ม' : '↩️ ส่งกลับแก้ไขเป็นกลุ่ม'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <XCircle size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className={`p-4 rounded-xl text-sm font-bold ${isApprove ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    กำลังดำเนินการกับ Influencer จำนวน {count} ท่าน ในขั้นตอน {stage?.toUpperCase()}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">หมายเหตุ / Feedback (ส่งให้ทุกคนเหมือนกัน)</label>
                    <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        rows={3}
                        placeholder={isApprove ? "เช่น ผลงานดีมากครับ อนุมัติผ่าน..." : "รบกวนแก้ไขตรงจุดนี้..."}
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`flex-1 py-3 font-black text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isApprove ? 'bg-emerald-500 shadow-emerald-100 hover:bg-emerald-600' : 'bg-rose-500 shadow-rose-100 hover:bg-rose-600'
                            }`}
                    >
                        {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        ยืนยันดำเนินการ ({count})
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// --- MAIN COMPONENT ---
const AdminCampaignProject = () => {
    const { id } = useParams()
    const { token } = useAuth()
    const { success, error } = useToast()
    const navigate = useNavigate()
    const fileInputRef = useRef()

    const [campaign, setCampaign] = useState(null)
    const [participants, setParticipants] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [isImporting, setIsImporting] = useState(false)

    const [showSlip, setShowSlip] = useState(false)
    const [selectedIds, setSelectedIds] = useState([])
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    const [isProcessingBulk, setIsProcessingBulk] = useState(false)
    const [isCopyingNoSlips, setIsCopyingNoSlips] = useState(false)
    const [isCopyingWithSlips, setIsCopyingWithSlips] = useState(false)
    const [bulkReviewModal, setBulkReviewModal] = useState({ isOpen: false, action: null, stage: null })
    const [bulkFeedback, setBulkFeedback] = useState('')
    const [showFollowUpModal, setShowFollowUpModal] = useState(false)

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setCampaign(data.campaign)
            setParticipants(data.participants)
            setShowSlip(data.campaign.show_slip_to_client) // Initialize state
        } catch (err) {
            console.error(err)
            error('Failed to load project data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleShowSlip = async () => {
        try {
            const newStatus = !showSlip
            // Optimistic update
            setShowSlip(newStatus)

            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ show_slip_to_client: newStatus })
            })

            if (!res.ok) throw new Error('Update failed')
            success(`Show Slip is now ${newStatus ? 'ON' : 'OFF'}`)

        } catch (err) {
            console.error(err)
            error('Failed to update settings')
            setShowSlip(!showSlip) // Revert on error
        }
    }

    const handleCopyShareLink = async (withSlips = false) => {
        const setIsCopying = withSlips ? setIsCopyingWithSlips : setIsCopyingNoSlips
        try {
            setIsCopying(true)
            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/share-link/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.shareUrl) {
                // Append slips parameter
                const url = new URL(data.shareUrl)
                url.searchParams.set('slips', withSlips ? '1' : '0')
                await navigator.clipboard.writeText(url.toString())
                success(withSlips ? '✅ คัดลอกลิงก์ (พร้อมสลิป) แล้ว!' : '✅ คัดลอกลิงก์ (ไม่มีสลิป) แล้ว!')
                setTimeout(() => setIsCopying(false), 2000)
            }
        } catch (err) {
            console.error(err)
            error('ไม่สามารถคัดลอกลิงก์ได้')
            setIsCopying(false)
        }
    }

    const handleExport = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/export/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `campaign_${id}_participants.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            success('Exported successfully')
        } catch (err) {
            error('Export failed')
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!confirm('ยืนยันการนำเข้าข้อมูล? สถานะจะถูกอัปเดตตามไฟล์ที่อัปโหลด')) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            setIsImporting(true)
            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/import/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()

            if (data.success) {
                success(`✅ อัปเดตสำเร็จ ${data.updated} รายการ`)
                loadData()
            } else {
                error('เกิดข้อผิดพลาด: ' + (data.error || 'Unknown error'))
            }
        } catch (err) {
            error('Import failed: ' + err.message)
        } finally {
            setIsImporting(false)
            e.target.value = null // Reset input
        }
    }

    // Bulk Actions
    const handleBulkAction = async (action, feedback = '', stage = null) => {
        if (selectedIds.length === 0) return

        try {
            setIsProcessingBulk(true)
            const res = await fetch(`${API_BASE}/admin/campaigns/applications/bulk-action/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    application_ids: selectedIds,
                    action: action,
                    stage: stage,
                    feedback: feedback
                })
            })
            const data = await res.json()

            if (data.success) {
                success(`✅ ทำรายการสำเร็จ ${data.updated_count} รายการ`)
                setSelectedIds([])
                setBulkReviewModal({ isOpen: false, action: null, stage: null })
                setBulkFeedback('')
                loadData()
            } else {
                error('เกิดข้อผิดพลาด: ' + (data.message || 'Unknown error'))
            }
        } catch (err) {
            console.error(err)
            error('Bulk action failed')
        } finally {
            setIsProcessingBulk(false)
        }
    }

    const triggerBulkReview = (action) => {
        const selectedParticipants = participants.filter(p => selectedIds.includes(p.id))
        const statuses = [...new Set(selectedParticipants.map(p => p.status))]

        const stageMap = {
            'SUBMITTED_SCRIPT': 'script',
            'SUBMITTED_DRAFT': 'draft',
            'SUBMITTED_FINAL': 'final',
            'SUBMITTED_INSIGHT': 'insight'
        }

        const firstStatus = statuses[0]
        const stage = stageMap[firstStatus]

        if (stage) {
            setBulkReviewModal({ isOpen: true, action, stage })
        } else {
            handleBulkAction(action)
        }
    }

    const toggleSelectAll = () => {
        const eligible = filteredParticipants.filter(p => !['REJECTED', 'PAYMENT_TRANSFERRED'].includes(p.status))

        if (selectedIds.length === eligible.length && eligible.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(eligible.map(p => p.id))
        }
    }

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id))
        } else {
            setSelectedIds(prev => [...prev, id])
        }
    }

    const handleWorkReview = async (applicationId, stage, action, feedback) => {
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns/applications/${applicationId}/review/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stage, action, feedback })
            })
            const data = await res.json()
            if (data.success) {
                success(`✅ ${action === 'APPROVE' ? 'อนุมัติ' : 'ส่งกลับแก้ไข'} สำเร็จ`)
                setSelectedParticipant(prev => prev ? { ...prev, status: data.status, submissions: { ...prev.submissions, [stage]: data.submission } } : null)
                loadData()
            } else {
                error('เกิดข้อผิดพลาด: ' + (data.error || 'Unknown error'))
            }
        } catch (err) {
            error('Action failed')
        }
    }

    const handleIndividualAction = async (id, action) => {
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns/applications/bulk-action/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    application_ids: [id],
                    action: action
                })
            })
            const data = await res.json()
            if (data.success) {
                if (selectedParticipant && selectedParticipant.id === id) {
                    setSelectedParticipant(null)
                }
                loadData()
                success('Action completed')
            } else {
                error('Failed: ' + data.message)
            }
        } catch (err) {
            error('Action failed')
        }
    }

    const filteredParticipants = participants.filter(p => {
        if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return p.display_name.toLowerCase().includes(query) ||
                p.profile.fullname.toLowerCase().includes(query)
        }
        return true
    })

    if (isLoading || !campaign) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" /></div>

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
            <ParticipantDetailModal
                isOpen={!!selectedParticipant}
                onClose={() => setSelectedParticipant(null)}
                participant={selectedParticipant}
                onApprove={(id) => handleIndividualAction(id, 'APPROVE')}
                onReject={(id) => handleIndividualAction(id, 'REJECT')}
                onReviewWork={handleWorkReview}
            />

            <BulkReviewModal
                isOpen={bulkReviewModal.isOpen}
                onClose={() => setBulkReviewModal({ isOpen: false, action: null, stage: null })}
                action={bulkReviewModal.action}
                stage={bulkReviewModal.stage}
                count={selectedIds.length}
                feedback={bulkFeedback}
                setFeedback={setBulkFeedback}
                onConfirm={() => handleBulkAction(bulkReviewModal.action, bulkFeedback, bulkReviewModal.stage)}
                isProcessing={isProcessingBulk}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/campaigns')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{cleanText(campaign.title)}</h1>
                        <p className="text-gray-500">{cleanText(campaign.brand_name)} • {participants.length} Participants</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => handleCopyShareLink(true)}
                        disabled={isCopyingWithSlips}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-all active:scale-95 text-xs shadow-sm"
                    >
                        {isCopyingWithSlips ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                        {isCopyingWithSlips ? 'Copying...' : 'Share Link'}
                    </button>

                    <button
                        onClick={() => navigate(`/admin/campaigns/${id}/edit`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all active:scale-95 text-xs shadow-sm"
                    >
                        <Edit3 size={14} className="text-purple-500" />
                        Edit
                    </button>

                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all text-xs shadow-sm">
                        <Download size={14} />
                        Export
                    </button>
                    <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md shadow-purple-100 transition-all text-xs">
                        {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {isImporting ? 'Importing...' : 'Import'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">ผู้สมัครทั้งหมด</p>
                    <p className="text-2xl font-black text-gray-900">{participants.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">รอตรวจสอบ (งาน)</p>
                    <p className="text-2xl font-black text-amber-500">
                        {participants.filter(p => p.status.startsWith('SUBMITTED')).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">เสร็จสิ้น</p>
                    <p className="text-2xl font-black text-emerald-500">
                        {participants.filter(p => ['COMPLETED', 'PAYMENT_TRANSFERRED'].includes(p.status)).length}
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ Influencer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                >
                    <option value="ALL">สถานะทั้งหมด</option>
                    <option value="WAITING">รออนุมัติสมัคร</option>
                    <option value="SUBMITTED_SCRIPT">ส่งสคริปต์แล้ว</option>
                    <option value="REVISE_SCRIPT">แก้ไขสคริปต์</option>
                    <option value="SUBMITTED_DRAFT">ส่งดราฟต์แล้ว</option>
                    <option value="REVISE_DRAFT">แก้ไขดราฟต์</option>
                    <option value="SUBMITTED_FINAL">ส่งไฟนอลแล้ว</option>
                    <option value="REVISE_FINAL">แก้ไข Final</option>
                    <option value="SUBMITTED_INSIGHT">ส่ง Insight แล้ว</option>
                    <option value="REVISE_INSIGHT">แก้ไข Insight</option>
                    <option value="COMPLETED">เสร็จสิ้น (รอจ่าย)</option>
                    <option value="PAYMENT_TRANSFERRED">โอนเงินแล้ว</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-purple-600 transition-colors">
                                        {selectedIds.length > 0 && selectedIds.length === filteredParticipants.length ? <CheckSquare size={20} className="text-purple-600" /> : <Square size={20} />}
                                    </button>
                                </th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Influencer</th>
                                <th className="px-6 py-4">ความสนใจ</th>
                                <th className="px-6 py-4">ผู้ติดตาม</th>
                                <th className="px-6 py-4 text-center">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredParticipants.map(row => (
                                <tr
                                    key={row.id}
                                    className={`transition-colors cursor-pointer group ${selectedIds.includes(row.id) ? 'bg-purple-50/50' : 'hover:bg-gray-50/50'}`}
                                    onClick={() => setSelectedParticipant(row)}
                                >
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                        {/* Allow selection for most statuses except fully finished/rejected if needed, or allow ALL for flexibility */}
                                        {!['REJECTED', 'PAYMENT_TRANSFERRED'].includes(row.status) ? (
                                            <button onClick={() => toggleSelect(row.id)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                                {selectedIds.includes(row.id) ? <CheckSquare size={20} className="text-purple-600" /> : <Square size={20} />}
                                            </button>
                                        ) : (
                                            <div className="flex justify-center text-gray-200"><CheckCircle size={20} className="text-emerald-500/30" /></div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{row.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={row.picture_url || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white" alt="" />
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{cleanText(row.display_name)}</p>
                                                <p className="text-xs text-gray-500">{cleanText(row.profile.fullname || row.profile.full_name_th)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                                            {row.profile.interests?.map(int => (
                                                <span key={int.id} className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200 transition-all hover:bg-gray-200">
                                                    <span className="text-purple-500">
                                                        <InterestIcon id={int.id} />
                                                    </span>
                                                    <span>{cleanText(int.name)}</span>
                                                </span>
                                            ))}
                                            {(!row.profile.interests || row.profile.interests.length === 0) && <span className="text-xs text-gray-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {row.social_accounts?.map(acc => (
                                                <div key={acc.platform} className="flex items-center gap-1.5">
                                                    <span className="opacity-70 scale-75 origin-left">{platformIcon(acc.platform)}</span>
                                                    <span className="text-[11px] font-black text-gray-700">{acc.followers_formatted}</span>
                                                </div>
                                            ))}
                                            {(!row.social_accounts || row.social_accounts.length === 0) && <span className="text-xs text-gray-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-center justify-center">
                                            {getStageBadge(row)}
                                            {(row.insight_files?.length > 0 || row.insight_image) && (
                                                <div className="flex -space-x-2 mt-1 overflow-hidden">
                                                    {(row.insight_files?.length > 0 ? row.insight_files : [row.insight_image]).slice(0, 3).map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img}
                                                            className="inline-block h-6 w-6 rounded-md ring-2 ring-white object-cover shadow-sm"
                                                            alt=""
                                                        />
                                                    ))}
                                                    {(row.insight_files?.length || 1) > 3 && (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-[8px] font-black text-gray-500 ring-2 ring-white shadow-sm">
                                                            +{(row.insight_files?.length || 1) - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredParticipants.length === 0 && <div className="p-12 text-center text-gray-400 font-medium">ไม่พบข้อมูลผู้สมัคร</div>}
            </div>

            {
                selectedIds.length > 0 && (() => {
                    const selectedParticipants = participants.filter(p => selectedIds.includes(p.id))
                    const allReviewable = selectedParticipants.every(p => p.status === 'WAITING' || p.status.startsWith('SUBMITTED_'))

                    return (
                        <motion.div
                            initial={{ y: 100, x: '-50%', opacity: 0 }}
                            animate={{ y: 0, x: '-50%', opacity: 1 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl px-4 py-3 md:px-6 md:py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 z-40 flex items-center gap-3 md:gap-6 min-w-[280px] md:min-w-0"
                        >
                            <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-6 border-r border-gray-200/50">
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-md shadow-purple-200">
                                    {selectedIds.length}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-wider">คัดเลือกแล้ว</span>
                                    <span className="text-sm font-bold text-gray-700 -mt-0.5 whitespace-nowrap">รายการ</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3">
                                <button
                                    onClick={() => setShowFollowUpModal(true)}
                                    disabled={isProcessingBulk}
                                    className="relative group overflow-hidden px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <Sparkles size={16} className="text-blue-100 group-hover:rotate-12 transition-transform" />
                                    <span className="relative">ทวงงาน (AI)</span>
                                </button>

                                {allReviewable && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-px bg-gray-200/50 mx-1 hidden md:block" />
                                        <button
                                            onClick={() => triggerBulkReview('APPROVE')}
                                            disabled={isProcessingBulk}
                                            className="px-4 md:px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 text-sm hover:bg-emerald-600 transition-all active:scale-95 hidden sm:block"
                                        >
                                            อนุมัติ
                                        </button>
                                        <button
                                            onClick={() => triggerBulkReview('REJECT')}
                                            disabled={isProcessingBulk}
                                            className="px-4 md:px-5 py-2.5 bg-white border border-rose-100 text-rose-500 font-bold rounded-2xl text-sm hover:bg-rose-50 transition-all active:scale-95 hidden sm:block"
                                        >
                                            ปฏิเสธ
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all ml-1 md:ml-2"
                                    title="ยกเลิกการเลือก"
                                >
                                    <XCircle size={22} />
                                </button>
                            </div>
                        </motion.div>
                    )
                })()
            }

            <FollowUpModal
                isOpen={showFollowUpModal}
                onClose={() => setShowFollowUpModal(false)}
                selectedUsers={participants.filter(p => selectedIds.includes(p.id))}
                campaign={campaign}
                token={token}
                onSuccess={(count) => {
                    success(`ส่งข้อความสำเร็จ ${count} รายการ`)
                    setSelectedIds([])
                }}
            />
        </div >
    )
}

export default AdminCampaignProject
