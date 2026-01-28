/**
 * Profile Page - Premium iOS/Line Design
 * "World-class Designer" Edition
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    User, Phone, Mail, MapPin, Edit3, ChevronRight,
    Sparkles, ShieldCheck, Heart, CreditCard, Star,
    HelpCircle
} from 'lucide-react'
import MainLayout from '../layouts/MainLayout'

// Interest Mapping (Keep in sync with StepInterests)
const INTEREST_MAP = {
    // New IDs (Sync with StepInterests fallbacks)
    'food_drink': { icon: '🍱', color: 'bg-orange-100 text-orange-500', name: 'Food & Drink' },
    'lifestyle': { icon: '✨', color: 'bg-purple-100 text-purple-500', name: 'Lifestyle' },
    'travel': { icon: '🗺️', color: 'bg-sky-100 text-sky-500', name: 'Travel' },
    'beauty': { icon: '💄', color: 'bg-rose-100 text-rose-500', name: 'Beauty' },
    'fashion': { icon: '🧥', color: 'bg-pink-100 text-pink-500', name: 'Fashion' },
    'real_estate': { icon: '🏡', color: 'bg-gray-100 text-gray-500', name: 'Real Estate' },
    'personal_finance': { icon: '💹', color: 'bg-green-100 text-green-500', name: 'Personal Finance' },
    'live_streamers': { icon: '🎙️', color: 'bg-red-100 text-red-500', name: 'Live Streamers' },
    'health': { icon: '🧘', color: 'bg-emerald-100 text-emerald-500', name: 'Health' },
    'pet': { icon: '🐾', color: 'bg-yellow-100 text-yellow-500', name: 'Pet' },

    // Old IDs / Aliases / Extended
    'food': { icon: '🍕', color: 'bg-orange-100 text-orange-500', name: 'Food & Dining' },
    'pets': { icon: '🐶', color: 'bg-amber-100 text-amber-600', name: 'Pets' },
    'investment': { icon: '💸', color: 'bg-yellow-100 text-yellow-600', name: 'Investment' },
    'tech': { icon: '👾', color: 'bg-violet-100 text-violet-500', name: 'Tech & Gaming' },
    'entertainment': { icon: '🎬', color: 'bg-pink-100 text-pink-500', name: 'Entertainment' },
    'home': { icon: '🌵', color: 'bg-green-100 text-green-600', name: 'Home & Living' },
    'education': { icon: '🧠', color: 'bg-blue-100 text-blue-500', name: 'Education' }
}

const Profile = () => {
    const navigate = useNavigate()
    const { user, logout, refreshUser } = useAuth()
    const profile = user?.profile

    // 🔄 Refresh user data on mount to ensure latest profile details
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    // Helper: Formatted Address
    const getFormattedAddress = () => {
        if (!profile) return 'ยังไม่มีข้อมูลที่อยู่'
        const parts = [
            profile.house_no,
            profile.village,
            profile.moo && `หมู่ ${profile.moo}`,
            profile.soi && `ซ. ${profile.soi}`,
            profile.road && `ถ. ${profile.road}`,
            profile.sub_district,
            profile.district,
            profile.province,
            profile.zipcode
        ].filter(Boolean)
        return parts.join(' ') || 'ยังไม่มีข้อมูลที่อยู่'
    }

    const isApproved = user?.status === 'APPROVED'

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#F8F9FD] pb-32 font-sans relative overflow-x-hidden">

                {/* 🎨 Dynamic Background Blobs */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-start/20 rounded-full blur-3xl opacity-60 animate-pulse-slow" />
                    <div className="absolute top-40 -left-20 w-72 h-72 bg-brand-end/20 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
                </div>

                {/* 🟢 Header / Cover */}
                <div className="relative z-10 bg-white shadow-sm rounded-b-[40px] px-6 pt-12 pb-16 overflow-hidden">
                    {/* Top Navigation */}
                    <div className="flex justify-between items-center mb-8 relative z-20">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
                    </div>

                    <div className="flex flex-col items-center relative z-20">
                        {/* Avatar Ring */}
                        <div className="relative mb-5 group cursor-pointer">
                            <div className={`absolute -inset-1 rounded-full blur opacity-70 transition-opacity duration-500 group-hover:opacity-100
                            ${isApproved
                                    ? 'bg-gradient-to-r from-teal-400 to-brand-end'
                                    : 'bg-gradient-to-r from-amber-300 to-orange-400'
                                }`}
                            />
                            <div className="relative w-28 h-28 rounded-full p-1 bg-white shadow-xl">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                                    {user?.picture_url ? (
                                        <img src={user.picture_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-4xl">😎</div>
                                    )}
                                </div>
                                {/* Verification Badge */}
                                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md">
                                    {isApproved ? (
                                        <ShieldCheck className="w-5 h-5 text-teal-500 fill-teal-50" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white">!</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Name & Title */}
                        <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">
                            {user?.display_name || 'Influencer'}
                        </h2>
                        <p className="text-gray-500 font-medium text-sm mb-4">
                            {profile?.full_name_th || '@username'}
                        </p>

                        {/* Status Pill */}
                        <div className={`
                        px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-sm
                        ${isApproved
                                ? 'bg-teal-50 text-teal-600 border border-teal-100'
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }
                    `}>
                            {isApproved ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                    VERIFIED INFLUENCER
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    PENDING APPROVAL
                                </>
                            )}
                        </div>
                    </div>

                    {/* Decorative background elements in header */}
                    <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 z-0" />
                </div>

                {/* 📝 Main Content */}
                <div className="px-5 -mt-8 relative z-20 space-y-5">

                    {/* ✏️ Edit Action */}
                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="w-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-gray-200/50 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-teal-500/30 text-white font-bold group-hover:scale-110 transition-transform">
                                <Edit3 className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
                                <p className="text-xs text-gray-500">Update your portfolio & rates</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </button>

                    {/* 🛠 Admin Actions */}
                    {(user?.is_superuser || user?.is_staff) && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-gray-900 leading-none">Admin Controls</h3>
                            </div>
                            <button
                                onClick={() => navigate('/admin/approvals')}
                                className="w-full h-12 bg-white border border-emerald-100 rounded-xl flex items-center justify-between px-4 hover:bg-emerald-50 transition-all duration-300 group active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🛡️</span>
                                    <span className="font-bold text-gray-800 text-sm">Influencer Approvals</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>
                            <button
                                onClick={() => navigate('/admin/finance')}
                                className="w-full h-12 bg-white border border-emerald-100 rounded-xl flex items-center justify-between px-4 hover:bg-emerald-50 transition-all duration-300 group active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">💰</span>
                                    <span className="font-bold text-gray-800 text-sm">Financial Dashboard</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* 🛠 Support Action */}
                    <button
                        onClick={() => navigate('/help')}
                        className="w-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-gray-200/50 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-300">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Report a Problem</h3>
                                <p className="text-xs text-gray-500">แจ้งปัญหาการใช้งาน</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </button>

                    {/* ⭐️ Interests */}
                    {profile?.interests && profile.interests.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-gray-900">My Style & Interests</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {profile.interests.map((interest, idx) => {
                                    const id = typeof interest === 'object' ? interest.id : interest
                                    const display = INTEREST_MAP[id]

                                    // Skip if unknown interest ID
                                    if (!display) return null

                                    return (
                                        <span key={idx} className={`
                                        ${display.color} px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm
                                        hover:scale-105 transition-transform cursor-default
                                    `}>
                                            <span className="text-base">{display.icon}</span>
                                            {display.name}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 👤 Personal Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                        <div className="flex items-center gap-2 mb-5">
                            <User className="w-5 h-5 text-teal-500" />
                            <h3 className="font-bold text-gray-900">Personal Info</h3>
                        </div>
                        <div className="space-y-4">
                            <InfoRow icon={User} label="Full Name" value={profile?.full_name_th} />
                            <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                            {profile?.email && <InfoRow icon={Mail} label="Email" value={profile.email} />}
                            <div className="pt-2 border-t border-gray-50">
                                <div className="flex items-start gap-4 mt-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Shipping Address</p>
                                        <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                            {getFormattedAddress()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 💼 Work Conditions */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                        <div className="flex items-center gap-2 mb-5">
                            <CreditCard className="w-5 h-5 text-violet-500" />
                            <h3 className="font-bold text-gray-900">Work Terms</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <ConditionCard
                                active={profile?.allow_boost}
                                label="Ad Boost"
                                price={profile?.boost_price}
                                icon={<Star className="w-4 h-4" />}
                            />
                            <ConditionCard
                                active={profile?.allow_original_file}
                                label="Original Files"
                                price={profile?.original_file_price}
                                icon={<ShieldCheck className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

// ✨ Sub-components for cleaner code
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 border-b border-gray-50 pb-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-gray-900 font-medium">{value || '-'}</p>
        </div>
    </div>
)

const ConditionCard = ({ active, label, price, icon }) => (
    <div className={`
        p-4 rounded-2xl border transition-all duration-300
        ${active
            ? 'bg-emerald-50/50 border-emerald-100 shadow-sm'
            : 'bg-gray-50 border-transparent opacity-60 grayscale'
        }
    `}>
        <div className="flex justify-between items-start mb-2">
            <span className={`p-1.5 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                {icon}
            </span>
            {active && <span className="text-emerald-500 text-xs font-bold">✓ Active</span>}
        </div>
        <p className="text-sm font-bold text-gray-900 mb-0.5">{label}</p>
        <p className={`text-xs ${active ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
            {active ? `+฿${Number(price).toLocaleString()}` : 'Not available'}
        </p>
    </div>
)

export default Profile
