
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { campaignAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import JobCard from '../components/jobs/JobCard'
import { Search, Filter, Bell, Sparkles, Briefcase, User } from 'lucide-react'

const Jobs = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [campaigns, setCampaigns] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadCampaigns()
    }, [])

    const loadCampaigns = async () => {
        try {
            setIsLoading(true)
            const response = await campaignAPI.list()
            setCampaigns(response.data.results || response.data || [])
        } catch (err) {
            console.error('[Jobs] Failed to load campaigns:', err)
            setError('ไม่สามารถโหลดแคมเปญได้')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCampaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#F8F9FD] pb-32">
            {/* Premium Mobile Header */}
            <div className="bg-white px-6 pt-14 pb-8 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">ยินดีต้อนรับ</p>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            {user?.display_name || 'Influencer'} <span className="animate-bounce">👋</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90 transition-all">
                            <Bell size={20} />
                        </button>
                        {user?.picture_url && (
                            <img
                                src={user.picture_url}
                                alt={user.display_name}
                                className="w-10 h-10 rounded-full border-2 border-brand-start shadow-sm"
                                referrerPolicy="no-referrer"
                                onClick={() => navigate('/profile')}
                            />
                        )}
                    </div>
                </div>

                {/* Search Bar Container */}
                <div className="relative z-10 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาแคมเปญ หรือ แบรนด์..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-start/20 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <button className="w-12 h-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-brand-start/20 active:scale-90 transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Campaign Categories / Quick Filters (Premium UI) */}
            <div className="px-6 py-8 overflow-x-auto no-scrollbar flex gap-4">
                <button className="px-6 py-2.5 rounded-full bg-brand-gradient text-white text-sm font-black shadow-md shadow-brand-start/10 whitespace-nowrap">🔥 ทั้งหมด</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-500 text-sm font-bold border border-gray-100 whitespace-nowrap">📸 งานถ่ายภาพ</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-500 text-sm font-bold border border-gray-100 whitespace-nowrap">🎬 งานวิดีโอ</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-500 text-sm font-bold border border-gray-100 whitespace-nowrap">🏠 รีวิวสินค้า</button>
            </div>

            {/* Featured Section */}
            <div className="px-6 mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        แคมเปญที่น่าสนใจ <Sparkles size={16} className="text-amber-400" />
                    </h2>
                    <span className="text-xs font-bold text-brand-start">ทั้งหมด {campaigns.length}</span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[24px] aspect-[16/11] animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-rose-100">
                        <p className="text-rose-500 font-bold mb-4">{error}</p>
                        <button onClick={loadCampaigns} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold">ลองใหม่</button>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📭</div>
                        <p className="text-gray-400 font-bold tracking-tight">ไม่พบแคมเปญที่คุณต้องการ</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredCampaigns.map((campaign) => (
                            <JobCard key={campaign.uuid || campaign.id} job={campaign} />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Floating Nav - Premium Experience */}
            <div className="fixed bottom-6 inset-x-6 z-40 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 px-8 py-4 flex justify-between items-center transition-all">
                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-2 bg-brand-gradient rounded-xl text-white shadow-lg shadow-brand-start/20">
                        <Briefcase size={22} />
                    </div>
                    <span className="text-[10px] font-black text-brand-start uppercase tracking-tighter">แคมเปญ</span>
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex flex-col items-center gap-1 group text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <div className="p-2 bg-transparent rounded-xl">
                        <User size={22} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">โปรไฟล์</span>
                </button>
            </div>
        </div>
    )
}

export default Jobs
