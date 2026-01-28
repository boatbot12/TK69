import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const cleanText = (text) => {
    if (!text) return ''
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

const AdminCampaigns = () => {
    const { token } = useAuth()
    const navigate = useNavigate()

    // State for Infinite Scroll
    const [campaigns, setCampaigns] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(true) // Initial Load
    const [isFetchingMore, setIsFetchingMore] = useState(false) // Background Load
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchCampaigns(1)
    }, [])

    const fetchCampaigns = async (pageNum) => {
        try {
            if (pageNum === 1) setIsLoading(true)
            else setIsFetchingMore(true)

            console.log(`[AdminCampaigns] Fetching page ${pageNum}...`)
            const res = await api.get(`/admin/campaigns/?page=${pageNum}`)
            const data = res.data
            const newItems = data.results || data || []
            const nextLink = data.next

            setCampaigns(prev => {
                if (pageNum === 1) return newItems
                // Filter out duplicates just in case
                const existingIds = new Set(prev.map(c => c.id))
                const uniqueNew = newItems.filter(c => !existingIds.has(c.id))
                return [...prev, ...uniqueNew]
            })

            setHasMore(!!nextLink)
            setPage(pageNum)

        } catch (err) {
            console.error('[AdminCampaigns] Error:', err)
            setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}`)
            setHasMore(false)
        } finally {
            if (pageNum === 1) setIsLoading(false)
            else setIsFetchingMore(false)
        }
    }

    // Intersection Observer for Load More
    useEffect(() => {
        if (isLoading) return // Don't observe if initial loading

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
                    fetchCampaigns(page + 1)
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        )

        const sentinel = document.getElementById('admin-sentinel')
        if (sentinel) observer.observe(sentinel)

        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, isLoading, page])

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">จัดการแคมเปญ</h1>
                    <p className="text-gray-500">เลือกแคมเปญเพื่อจัดการผู้สมัครและตรวจงาน ({campaigns.length} รายการ)</p>
                </div>
                <button
                    onClick={() => navigate('/admin/campaigns/create')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>+</span> สร้างแคมเปญ
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-sm font-bold flex flex-col items-center gap-3">
                    <p>{error}</p>
                    <button onClick={() => fetchCampaigns(1)} className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-xs">ลองใหม่อีกครั้ง</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <div
                        key={campaign.id}
                        onClick={() => navigate(`/admin/campaigns/${campaign.uuid || campaign.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group overflow-hidden flex flex-col h-full"
                    >
                        {/* Status Bar */}
                        <div className={`h-1.5 w-full ${campaign.status === 'OPEN' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                campaign.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                    'bg-gray-300'
                            }`} />


                        <div className="p-5 flex-1">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shadow-inner border border-white shrink-0">
                                    {campaign.brand_logo ? (
                                        <img src={campaign.brand_logo} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : '🏢'}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${campaign.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                                    campaign.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200' :
                                        campaign.status === 'CLOSED' ? 'bg-gray-100 text-gray-500' :
                                            campaign.status === 'DRAFT' ? 'bg-slate-100 text-slate-500 border border-dashed border-slate-300' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {campaign.status === 'IN_PROGRESS' ? '🔥 IN PROGRESS' : campaign.status}
                                </span>

                            </div>

                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                                {cleanText(campaign.title)}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-1">{cleanText(campaign.brand_name)}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl mt-auto">
                                <div>
                                    <p className="font-bold text-gray-900">฿{parseFloat(campaign.budget).toLocaleString()}</p>
                                    <p className="text-[10px] uppercase text-gray-400">Budget</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {format(new Date(campaign.application_deadline), 'd MMM', { locale: th })}
                                    </p>
                                    <p className="text-[10px] uppercase text-gray-400">Deadline</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm group-hover:bg-purple-50 transition-colors">
                            <span className="text-gray-500 font-medium group-hover:text-purple-700">จัดการผู้สมัคร</span>
                            <span className="text-gray-400 group-hover:text-purple-700">&raquo;</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sentinel for Infinite Scroll */}
            <div id="admin-sentinel" className="h-20 flex items-center justify-center mt-8">
                {isFetchingMore && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        กำลังโหลดข้อมูลเพิ่มเติม...
                    </div>
                )}
                {!hasMore && campaigns.length > 0 && (
                    <div className="text-gray-400 text-sm">
                        • แสดงข้อมูลทั้งหมดแล้ว ({campaigns.length}) •
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminCampaigns
