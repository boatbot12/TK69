import { useState, useEffect, useRef, useCallback } from 'react'
import { campaignAPI } from '../services/api'
import JobCard from '../components/jobs/JobCard'
import { Search, LayoutGrid } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MainLayout from '../layouts/MainLayout'

const CACHE_KEY = 'campaign_dashboard_v3'
// const CACHE_DURATION = 5 * 60 * 1000 // Unused for now

const JobDashboard = () => {
    const { user } = useAuth()

    // State for all tabs -> { all: { data: [], page: 1, hasMore: true, lastFetched: 0, isLoaded: false, isFetchingMore: false }, ... }
    const [campaignData, setCampaignData] = useState({
        all: { data: [], page: 1, hasMore: true, lastFetched: 0, isLoaded: false, isFetchingMore: false },
        active: { data: [], page: 1, hasMore: true, lastFetched: 0, isLoaded: false, isFetchingMore: false },
        history: { data: [], page: 1, hasMore: true, lastFetched: 0, isLoaded: false, isFetchingMore: false }
    })

    const [activeTab, setActiveTab] = useState('all')
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchingTabs = useRef(new Set())

    // 1. Load from SessionStorage on Mount
    useEffect(() => {
        const loadCache = () => {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    console.log('[Dashboard] Loaded session cache 📦')
                    setCampaignData(parsed)
                }
            } catch (e) {
                console.error('[Dashboard] Cache load failed', e)
                sessionStorage.removeItem(CACHE_KEY)
            }
        }
        loadCache()
    }, [])

    // 2. Save to SessionStorage whenever data changes
    useEffect(() => {
        const shouldSave = Object.values(campaignData).some(tab => tab.isLoaded)
        if (shouldSave) {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(campaignData))
        }
    }, [campaignData])

    // 3. Main Data Fetcher
    const fetchCampaigns = useCallback(async (tab, pageNum, isBackground = false) => {
        if (fetchingTabs.current.has(tab) && !isBackground) return

        try {
            fetchingTabs.current.add(tab)

            // Set Loading States
            if (pageNum === 1 && !isBackground) setIsLoading(true)
            if (pageNum > 1) {
                setCampaignData(prev => ({
                    ...prev,
                    [tab]: { ...prev[tab], isFetchingMore: true }
                }))
            }

            // Map tab to API param
            let statusParam = undefined
            if (tab === 'active') statusParam = 'active'
            else if (tab === 'history') statusParam = 'history'

            console.log(`[Dashboard] Fetching ${tab} page ${pageNum} (bg:${isBackground})... 🌐`)

            const response = await campaignAPI.list({
                page: pageNum,
                status: statusParam,
                limit: 10
            })

            const newItems = response.data.results || response.data || []
            const hasNext = !!response.data.next

            setCampaignData(prev => {
                const currentTab = prev[tab]
                let updatedList

                if (pageNum === 1) {
                    updatedList = newItems
                } else {
                    const existingIds = new Set(currentTab.data.map(c => c.id))
                    const uniqueNew = newItems.filter(c => !existingIds.has(c.id))
                    updatedList = [...currentTab.data, ...uniqueNew]
                }

                return {
                    ...prev,
                    [tab]: {
                        data: updatedList,
                        page: pageNum,
                        hasMore: hasNext,
                        lastFetched: Date.now(),
                        isLoaded: true,
                        isFetchingMore: false
                    }
                }
            })

        } catch (err) {
            console.error('[Dashboard] Fetch failed:', err)
            // Reset fetching state on error
            setCampaignData(prev => ({
                ...prev,
                [tab]: { ...prev[tab], isFetchingMore: false, hasMore: false }
            }))
        } finally {
            if (pageNum === 1 && !isBackground) setIsLoading(false)
            fetchingTabs.current.delete(tab)
        }
    }, [])

    // 4. Smart Load Logic
    useEffect(() => {
        const currentData = campaignData[activeTab]
        if (!currentData.isLoaded) {
            fetchCampaigns(activeTab, 1, false)
        } else {
            fetchCampaigns(activeTab, 1, true)
        }
    }, [activeTab])

    // 5. Load More Handler
    const handleLoadMore = () => {
        const currentTab = campaignData[activeTab]
        if (currentTab.hasMore && !currentTab.isFetchingMore && !isLoading && !fetchingTabs.current.has(activeTab)) {
            fetchCampaigns(activeTab, currentTab.page + 1)
        }
    }

    // Intersection Observer
    useEffect(() => {
        if (isLoading) return

        const observer = new IntersectionObserver(
            entries => {
                const currentTab = campaignData[activeTab]
                if (entries[0].isIntersecting && currentTab.hasMore && !currentTab.isFetchingMore) {
                    handleLoadMore()
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        )

        const sentinel = document.getElementById('sentinel')
        if (sentinel) observer.observe(sentinel)

        return () => observer.disconnect()
    }, [campaignData, activeTab, isLoading])


    // Filter Logic
    const filteredCampaigns = campaignData[activeTab].data.filter(campaign => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return campaign.title.toLowerCase().includes(query) ||
            campaign.brand_name.toLowerCase().includes(query)
    })

    const tabs = [
        { id: 'all', label: 'งานทั้งหมด' },
        { id: 'active', label: 'งานของฉัน' },
        { id: 'history', label: 'ประวัติ' },
    ]

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-brand-start/20">
                {/* Premium Glassmorphism Header */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
                    <div className="px-4 pt-4 pb-2 max-w-md mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400 group-focus-within:text-brand-start transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ค้นหาแคมเปญ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-gray-100/80 rounded-xl border-none text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-start/20 focus:shadow-sm transition-all duration-300 ease-out"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pb-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id)
                                        setSearchQuery('')
                                        window.scrollTo(0, 0)
                                    }}
                                    className={`
                                    relative flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out
                                    ${activeTab === tab.id
                                            ? 'bg-brand-gradient text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm border border-gray-100'}
                                `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Campaign List */}
                <div className="max-w-md mx-auto px-4 pt-4 space-y-4 pb-24">
                    {!isLoading && filteredCampaigns.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <LayoutGrid size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">ยังไม่มีแคมเปญ</h3>
                            <p className="text-sm text-gray-500">รอติดตามแคมเปญใหม่ๆ เร็วๆ นี้นะครับ</p>
                        </div>
                    )}

                    {filteredCampaigns.map(job => (
                        <div key={job.id} className="animate-fade-in-up">
                            <JobCard job={job} />
                        </div>
                    ))}

                    {/* Infinite Scroll Sentinel & Loading */}
                    <div id="sentinel" className="h-16 flex items-center justify-center mt-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-brand-start border-t-transparent animate-spin" />
                        ) : (
                            <>
                                {campaignData[activeTab].isFetchingMore && (
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        <div className="w-3 h-3 border-2 border-brand-start border-t-transparent rounded-full animate-spin" />
                                        กำลังโหลดเพิ่ม...
                                    </div>
                                )}
                                {!campaignData[activeTab].hasMore && filteredCampaigns.length > 0 && (
                                    <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                                        <div className="h-px w-8 bg-gray-200" />
                                        ครบทุกรายการแล้ว
                                        <div className="h-px w-8 bg-gray-200" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout >
    )
}

export default JobDashboard
