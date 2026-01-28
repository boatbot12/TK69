import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Utensils, Sparkles, Plane, Palette, Shirt, Home, TrendingUp, Radio, Heart, PawPrint } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import ConfirmModal from '../components/common/ConfirmModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Loading Spinner Component
const LoadingSpinner = ({ message = 'กำลังโหลด...' }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-500 text-sm">{message}</p>
    </div>
)

const cleanText = (text) => {
    if (!text) return ''
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

// Social Media Icon Component
const SocialIcon = ({ platform }) => {
    const p = platform?.toLowerCase()
    const iconClass = "w-6 h-6 transition-transform hover:scale-110 drop-shadow-sm"

    switch (p) {
        case 'tiktok':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#000000" />
                    <path d="M12.43 4.1a.63.63 0 0 0-.63.63v7.08a3.17 3.17 0 1 1-3.17-3.17.63.63 0 0 0 .63-.63V5.18a.63.63 0 0 0-.75-.62 5.68 5.68 0 1 0 5.8 5.56V6.98a.63.63 0 0 0-.63-.63h-.05a4.39 4.39 0 0 1-1.2-.17z" fill="#25F4EE" />
                    <path d="M16.5 6.5a.63.63 0 0 0 .55-.83 4.38 4.38 0 0 0-3.3-3.1.63.63 0 0 0-.76.62v2.24a.63.63 0 0 0 .82.6c.92.27 1.7.9 2.18 1.74a.63.63 0 0 0 .5.3z" fill="#FE2C55" />
                    <path d="M16.5 7.5c-1.5 0-2.9-.6-3.9-1.6v6.9c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c.3 0 .6.04.9.1V5.7a6.8 6.8 0 0 0-.9-.1c-3.8 0-6.9 3.1-6.9 6.9s3.1 6.9 6.9 6.9 6.9-3.1 6.9-6.9V4.5c1.7 1.2 3.7 1.9 5.9 1.9v2.4c-1.5-.1-2.9-.6-4.3-1.3z" fill="#FFFFFF" />
                </svg>
            )
        case 'instagram':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="ig-gradient-icon" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#f09433" offset="0%" />
                            <stop stopColor="#e6683c" offset="25%" />
                            <stop stopColor="#dc2743" offset="50%" />
                            <stop stopColor="#cc2366" offset="75%" />
                            <stop stopColor="#bc1888" offset="100%" />
                        </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient-icon)" />
                    <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" fill="white" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                </svg>
            )
        case 'facebook':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8543V15.4688H7.07813V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.3398 7.875 13.875 8.79961 13.875 9.74883V12H17.2031L16.6711 15.4688H13.875V23.8543C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2" />
                </svg>
            )
        case 'youtube':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#FF0000" />
                    <path d="M9.5 15.5V8.5L15.5 12L9.5 15.5Z" fill="white" />
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
        case 'lemon8':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Lemon Body */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#FCE919" />
                    {/* Leaf */}
                    <path d="M18.5 7.5S17 2 12 4c0 0 3.5-1.5 6.5 3.5z" fill="#4CAF50" />
                    {/* Slice Segments */}
                    <circle cx="12" cy="12.5" r="7" fill="#FFF" fillOpacity="0.4" />
                    <circle cx="12" cy="12.5" r="5.5" fill="#FCE919" />
                    <path d="M12 12.5 L12 7 M12 12.5 L16.5 9.5 M12 12.5 L17 14 M12 12.5 L13.5 17.5 M12 12.5 L9 17 M12 12.5 L7 14.5 M12 12.5 L7.5 9.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                </svg>
            )
        default:
            return <span className="text-lg">🔗</span>
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

const AdminInfluencerApprovals = () => {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    // State
    const [influencers, setInfluencers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('PENDING')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [activeInfluencer, setActiveInfluencer] = useState(null)
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)
    const fetchId = useRef(0)

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'info'
    })

    // Auth headers
    const getHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }), [token])

    // Load influencers
    const loadInfluencers = useCallback(async () => {
        const requestId = ++fetchId.current
        try {
            setIsLoading(true)
            setError(null)
            const res = await fetch(`${API_BASE}/admin/approvals/influencers/?status=${statusFilter}`, {
                headers: getHeaders()
            })

            if (requestId !== fetchId.current) return

            if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้')
            const data = await res.json()
            setInfluencers(data.results || data)
            setSelectedUsers([])
        } catch (err) {
            if (requestId === fetchId.current) {
                setError(err.message)
            }
        } finally {
            if (requestId === fetchId.current) {
                setIsLoading(false)
            }
        }
    }, [getHeaders, statusFilter])

    useEffect(() => {
        if (user && !(user.is_superuser || user.is_staff)) {
            navigate('/jobs')
            return
        }
        loadInfluencers()
    }, [user, navigate, loadInfluencers])

    // Bulk action execution
    const executeBulkAction = async (action, userIds) => {
        try {
            setIsBulkProcessing(true)
            const res = await fetch(`${API_BASE}/admin/approvals/bulk-action/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    user_ids: userIds,
                    action: action
                })
            })

            if (!res.ok) throw new Error('การดำเนินการล้มเหลว')

            toast.success(`✅ ดำเนินการสำเร็จสำหรับ ${userIds.length} รายการ`)
            loadInfluencers()
            if (activeInfluencer && userIds.includes(activeInfluencer.id)) {
                setActiveInfluencer(null)
            }
        } catch (err) {
            toast.error(`❌ เกิดข้อผิดพลาด: ${err.message}`)
        } finally {
            setIsBulkProcessing(false)
        }
    }

    // Bulk action handler (shows modal)
    const handleBulkAction = (action) => {
        if (selectedUsers.length === 0) return

        const isApprove = action === 'APPROVE'

        setConfirmModal({
            isOpen: true,
            title: isApprove ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ',
            message: isApprove
                ? `คุณแน่ใจว่าต้องการอนุมัติผู้สมัครทั้ง ${selectedUsers.length} รายการที่เลือกใช่หรือไม่?`
                : `คุณแน่ใจว่าต้องการปฏิเสธผู้สมัครทั้ง ${selectedUsers.length} รายการที่เลือกใช่หรือไม่?`,
            type: isApprove ? 'success' : 'danger',
            confirmText: isApprove ? 'อนุมัติทั้งหมด' : 'ปฏิเสธทั้งหมด',
            onConfirm: () => executeBulkAction(action, selectedUsers)
        })
    }

    // Update profile handler (OCR Correction)
    const handleUpdateProfile = async (userId, updates) => {
        try {
            const res = await fetch(`${API_BASE}/admin/influencers/${userId}/update/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || errorData.detail || `Status ${res.status}`)
            }

            // Update local state
            setInfluencers(prev => prev.map(inf => {
                if (inf.id === userId) {
                    return { ...inf, profile: { ...inf.profile, ...updates } }
                }
                return inf
            }))

            // Also update activeInfluencer if it's the same
            if (activeInfluencer?.id === userId) {
                setActiveInfluencer(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }))
            }

            // console.log('Saved:', updates)
            // alert('บันทึกข้อมูลเรียบร้อย ✅')
            toast.success('บันทึกข้อมูลเรียบร้อย ✅')
        } catch (err) {
            console.error('Update failed:', err)
            toast.error(`ไม่สามารถบันทึกข้อมูลได้: ${err.message}`)
        }
    }

    // Toggle selection
    const toggleSelect = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === influencers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(influencers.map(i => i.id))
        }
    }

    // Status badge styles
    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels = {
            PENDING: 'รออนุมัติ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ปฏิเสธ'
        }
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        )
    }

    // Filter tabs
    const tabs = [
        { key: 'PENDING', label: 'รออนุมัติ', emoji: '⏳' },
        { key: 'APPROVED', label: 'อนุมัติแล้ว', emoji: '✅' },
        { key: 'REJECTED', label: 'ปฏิเสธ', emoji: '❌' },
        { key: 'ALL', label: 'ทั้งหมด', emoji: '📋' }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                                    Influencer Verification
                                </h1>
                                <p className="text-xs md:text-sm text-gray-500">ระบบตรวจสอบและอนุมัติผู้สมัครใหม่</p>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        if (statusFilter !== tab.key) {
                                            setIsLoading(true)
                                            setInfluencers([])
                                            setStatusFilter(tab.key)
                                        }
                                    }}
                                    disabled={isLoading}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${statusFilter === tab.key
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span>{tab.emoji}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Bulk Action Bar */}
            {selectedUsers.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-3 sticky top-[72px] md:top-[76px] z-20">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="font-bold flex items-center gap-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                ✓ เลือก {selectedUsers.length} รายการ
                            </span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkAction('REJECT')}
                                disabled={isBulkProcessing}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
                            >
                                ปฏิเสธ
                            </button>
                            <button
                                onClick={() => handleBulkAction('APPROVE')}
                                disabled={isBulkProcessing}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
                            >
                                อนุมัติทั้งหมด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                            <button onClick={loadInfluencers} className="ml-auto text-sm underline">ลองใหม่</button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <LoadingSpinner message={`กำลังโหลดรายชื่อ ${tabs.find(t => t.key === statusFilter)?.label || ''}...`} />
                    ) : influencers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">ไม่มีข้อมูล</h3>
                            <p className="text-gray-500">ไม่พบรายการในหมวดหมู่ที่เลือก</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.length === influencers.length && influencers.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-5 h-5 rounded border-gray-300"
                                                />
                                            </th>
                                            <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">ผู้สมัคร</th>
                                            <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">ติดต่อ</th>
                                            <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">โซเชียล</th>
                                            <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase">สถานะ</th>
                                            <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase">ตรวจสอบ</th>
                                            <th className="p-4 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {influencers.map(inf => (
                                            <tr
                                                key={inf.id}
                                                onClick={() => setActiveInfluencer(inf)}
                                                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                                            >
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(inf.id)}
                                                        onChange={() => toggleSelect(inf.id)}
                                                        className="w-5 h-5 rounded border-gray-300"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={inf.picture_url || '/default-avatar.png'}
                                                            className="w-10 h-10 rounded-full object-cover bg-gray-100"
                                                            alt=""
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{inf.display_name}</div>
                                                            <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                                                {inf.profile?.full_name_th || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {inf.profile?.phone || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {inf.social_accounts?.map((acc, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={acc.profile_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                                                                title={`${acc.platform}: ${acc.username}`}
                                                            >
                                                                <SocialIcon platform={acc.platform} />
                                                                <span className="hidden lg:inline">{acc.followers_count ? `${(acc.followers_count / 1000).toFixed(1)}K` : ''}</span>
                                                            </a>
                                                        ))}
                                                        {(!inf.social_accounts || inf.social_accounts.length === 0) && (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {getStatusBadge(inf.status)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {inf.blacklist_matches?.length > 0 ? (
                                                        <span className="text-red-500 font-bold text-xs">⚠️ แบล็คลิสต์</span>
                                                    ) : (
                                                        <span className="text-emerald-500 text-xs">✓ ปกติ</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => setActiveInfluencer(inf)}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {influencers.map(inf => (
                                    <div
                                        key={inf.id}
                                        onClick={() => setActiveInfluencer(inf)}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(inf.id)}
                                                onChange={() => toggleSelect(inf.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 rounded border-gray-300 mt-1"
                                            />
                                            <img
                                                src={inf.picture_url || '/default-avatar.png'}
                                                className="w-12 h-12 rounded-full object-cover bg-gray-100"
                                                alt=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{cleanText(inf.display_name)}</h3>
                                                    {getStatusBadge(inf.status)}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">{cleanText(inf.profile?.full_name_th)}</p>
                                                <p className="text-sm text-gray-400">{inf.profile?.phone}</p>

                                                {/* Social Links */}
                                                {inf.social_accounts?.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {inf.social_accounts.map((acc, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={acc.profile_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                                            >
                                                                <SocialIcon platform={acc.platform} />
                                                                <span>{acc.username}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {inf.blacklist_matches?.length > 0 && (
                                                    <div className="mt-2 text-red-500 text-xs font-bold">⚠️ พบในแบล็คลิสต์</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setActiveInfluencer(inf)}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Detail Drawer */}
            {activeInfluencer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setActiveInfluencer(null)}
                    ></div>

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        {/* Drawer Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <img
                                    src={activeInfluencer.picture_url || '/default-avatar.png'}
                                    className="w-14 h-14 rounded-full object-cover ring-4 ring-gray-100"
                                    alt=""
                                />
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900">{cleanText(activeInfluencer.display_name)}</h2>
                                    <p className="text-sm text-gray-500">{cleanText(activeInfluencer.profile?.full_name_th)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveInfluencer(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Blacklist Warning */}
                            {activeInfluencer.blacklist_matches?.length > 0 && (
                                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-red-600 mb-2">
                                        <span className="text-xl">⚠️</span>
                                        <h3 className="font-bold">พบในแบล็คลิสต์!</h3>
                                    </div>
                                    {activeInfluencer.blacklist_matches.map((m, idx) => (
                                        <div key={idx} className="bg-white/50 p-3 rounded-xl border border-red-100 mt-2">
                                            <div className="text-xs font-bold text-red-500 uppercase">ตรวจพบจาก: {m.type} ({m.info})</div>
                                            <div className="text-sm text-red-700 mt-1">{m.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Social Media Links */}
                            {activeInfluencer.social_accounts?.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">โซเชียลมีเดีย</h3>
                                    <div className="space-y-2">
                                        {activeInfluencer.social_accounts.map((acc, idx) => (
                                            <a
                                                key={idx}
                                                href={acc.profile_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                            >
                                                <SocialIcon platform={acc.platform} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900">{acc.username}</div>
                                                    <div className="text-xs text-gray-500 truncate">{acc.profile_url}</div>
                                                </div>
                                                {acc.followers_count > 0 && (
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {acc.followers_count >= 1000000
                                                            ? `${(acc.followers_count / 1000000).toFixed(1)}M`
                                                            : `${(acc.followers_count / 1000).toFixed(1)}K`
                                                        }
                                                    </span>
                                                )}
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Interests */}
                            {activeInfluencer.profile?.interests?.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ความสนใจ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {activeInfluencer.profile.interests.map(int => (
                                            <span key={int.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                                                <InterestIcon id={int.id} />
                                                {cleanText(int.name)}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Verification Data (OCR) */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Verification Data (AI OCR)
                                    </h3>
                                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">แก้ไขได้ (Auto-save)</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">เลขบัตรประชาชน</label>
                                        <input
                                            type="text"
                                            defaultValue={activeInfluencer.profile?.identification_number || ''}
                                            className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-mono text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="1-2345-67890-12-3"
                                            onBlur={(e) => {
                                                if (e.target.value !== activeInfluencer.profile?.identification_number) {
                                                    handleUpdateProfile(activeInfluencer.id, { identification_number: e.target.value })
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">ธนาคาร</label>
                                            <input
                                                type="text"
                                                defaultValue={activeInfluencer.profile?.bank_name || ''}
                                                className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-medium text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                placeholder="KBANK"
                                                onBlur={(e) => {
                                                    if (e.target.value !== activeInfluencer.profile?.bank_name) {
                                                        handleUpdateProfile(activeInfluencer.id, { bank_name: e.target.value })
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">เลขบัญชี</label>
                                            <input
                                                type="text"
                                                defaultValue={activeInfluencer.profile?.bank_account_number || ''}
                                                className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-mono text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                placeholder="123-4-56789-0"
                                                onBlur={(e) => {
                                                    if (e.target.value !== activeInfluencer.profile?.bank_account_number) {
                                                        handleUpdateProfile(activeInfluencer.id, { bank_account_number: e.target.value })
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลส่วนตัว</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-blue-300 transition-colors">
                                        <div className="text-xs text-gray-400 mb-1">ชื่อ-นามสกุล</div>
                                        <input
                                            defaultValue={activeInfluencer.profile?.full_name_th || ''}
                                            className="w-full bg-transparent font-semibold text-gray-900 border-none p-0 focus:ring-0"
                                            onBlur={(e) => handleUpdateProfile(activeInfluencer.id, { full_name_th: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <div className="text-xs text-gray-400 mb-1">เบอร์โทร</div>
                                        <div className="font-semibold text-gray-900">{activeInfluencer.profile?.phone || '-'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-blue-300">
                                        <div className="text-xs text-gray-400 mb-1">จังหวัด</div>
                                        <input
                                            defaultValue={activeInfluencer.profile?.province || ''}
                                            className="w-full bg-transparent font-semibold text-gray-900 border-none p-0 focus:ring-0 truncate"
                                            onBlur={(e) => handleUpdateProfile(activeInfluencer.id, { province: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-blue-300">
                                        <div className="text-xs text-gray-400 mb-1">ที่อยู่ (House No, Street, etc.)</div>
                                        {/* Simplified address edit - just specific fields or display full? 
                                            User asked for address. Let's make full_address read-only summary, 
                                            and maybe link to a full edit modal if needed. 
                                            But for now, I'll just keep it read-only but highlight Verified Address if present.
                                        */}
                                        <div className="font-medium text-gray-700 text-sm">{activeInfluencer.profile?.full_address || '-'}</div>
                                    </div>
                                </div>
                            </section>

                            {/* Documents */}
                            <section>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">เอกสารยืนยัน</h3>
                                <div className="space-y-4">
                                    {activeInfluencer.profile?.id_card_front_url && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-semibold text-gray-700">บัตรประชาชน</span>
                                                <a href={activeInfluencer.profile?.id_card_front_url} target="_blank" className="text-xs text-blue-600 hover:underline">ดูขนาดเต็ม</a>
                                            </div>
                                            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video">
                                                <img
                                                    src={`${API_BASE}/utils/proxy-image/?url=${encodeURIComponent(activeInfluencer.profile?.id_card_front_url)}`}
                                                    className="w-full h-full object-contain"
                                                    alt="ID Card"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeInfluencer.profile?.bank_book_url && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-semibold text-gray-700">สมุดบัญชี</span>
                                                <a href={activeInfluencer.profile?.bank_book_url} target="_blank" className="text-xs text-blue-600 hover:underline">ดูขนาดเต็ม</a>
                                            </div>
                                            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video">
                                                <img
                                                    src={`${API_BASE}/utils/proxy-image/?url=${encodeURIComponent(activeInfluencer.profile?.bank_book_url)}`}
                                                    className="w-full h-full object-contain"
                                                    alt="Bank Book"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="h-20"></div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                            {activeInfluencer.status === 'PENDING' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setConfirmModal({
                                                isOpen: true,
                                                title: 'ยืนยันการปฏิเสธ',
                                                message: `คุณต้องการปฏิเสธผู้สมัคร "${activeInfluencer.display_name}" ใช่หรือไม่?`,
                                                type: 'danger',
                                                confirmText: 'ยืนยันการปฏิเสธ',
                                                onConfirm: () => executeBulkAction('REJECT', [activeInfluencer.id])
                                            })
                                        }}
                                        className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
                                    >
                                        ปฏิเสธ
                                    </button>
                                    <button
                                        onClick={() => {
                                            setConfirmModal({
                                                isOpen: true,
                                                title: 'ยืนยันการอนุมัติ',
                                                message: `คุณต้องการอนุมัติผู้สมัคร "${activeInfluencer.display_name}" ใช่หรือไม่?`,
                                                type: 'success',
                                                confirmText: 'ยืนยันการอนุมัติ',
                                                onConfirm: () => executeBulkAction('APPROVE', [activeInfluencer.id])
                                            })
                                        }}
                                        className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                                    >
                                        ✓ อนุมัติ
                                    </button>
                                </>
                            ) : activeInfluencer.status === 'APPROVED' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setConfirmModal({
                                                isOpen: true,
                                                title: 'ยืนยันการบล็อก',
                                                message: `คุณต้องการบล็อกผู้ใช้ "${activeInfluencer.display_name}" ใช่หรือไม่? (เขาสามารถเข้าสู่ระบบได้แต่จะไม่สามารถสมัครงานได้)`,
                                                type: 'danger',
                                                confirmText: 'ยืนยันการบล็อก',
                                                onConfirm: () => executeBulkAction('REJECT', [activeInfluencer.id])
                                            })
                                        }}
                                        className="flex-1 py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors"
                                    >
                                        ⚠️ บล็อก (Reject)
                                    </button>
                                    <button
                                        onClick={() => setActiveInfluencer(null)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200"
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setConfirmModal({
                                                isOpen: true,
                                                title: 'ยืนยันการคืนสถานะ',
                                                message: `ต้องการคืนสถานะออนไลน์ให้คุณ "${activeInfluencer.display_name}" ใช่หรือไม่?`,
                                                type: 'info',
                                                confirmText: 'ยืนยันคืนสถานะ',
                                                onConfirm: () => executeBulkAction('APPROVE', [activeInfluencer.id])
                                            })
                                        }}
                                        className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                                    >
                                        🔄 คืนสถานะออนไลน์
                                    </button>
                                    <button
                                        onClick={() => setActiveInfluencer(null)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200"
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />

            {/* Custom Styles */}
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}

export default AdminInfluencerApprovals
