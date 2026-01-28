/**
 * Step 2: Social Connections & Optional Pricing
 * Premium UI with platform cards and collapsible pricing section
 */

import { useState, useEffect } from 'react'
import { socialAPI } from '../../services/api'

// Platform configuration with icons and colors
// Platform configuration with icons and colors
const PLATFORMS = [
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
        ),
        color: 'from-gray-900 to-gray-800',
        bgColor: 'bg-black',
        borderColor: 'border-gray-800',
        placeholder: 'https://tiktok.com/@yourusername',
        textColor: 'text-white',
        pillBg: 'bg-white/20',
        pillText: 'text-gray-200'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
        ),
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
        borderColor: 'border-pink-200',
        placeholder: 'https://instagram.com/yourusername',
        textColor: 'text-white',
        pillBg: 'bg-white/20',
        pillText: 'text-white'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
        ),
        color: 'from-blue-600 to-blue-700',
        bgColor: 'bg-blue-600',
        borderColor: 'border-blue-200',
        placeholder: 'https://facebook.com/yourpage',
        textColor: 'text-white',
        pillBg: 'bg-white/20',
        pillText: 'text-white'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02l5.75-3.27-5.75-3.27z"></path>
            </svg>
        ),
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-600',
        borderColor: 'border-red-200',
        placeholder: 'https://youtube.com/@yourchannel',
        textColor: 'text-white',
        pillBg: 'bg-white/20',
        pillText: 'text-white'
    },
    {
        id: 'lemon8',
        name: 'Lemon8',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M21.16 8.16l-3.32-3.32a2.35 2.35 0 0 0-3.32 0l-1.68 1.68a2.35 2.35 0 0 0 0 3.32l3.32 3.32a2.35 2.35 0 0 0 3.32 0l1.68-1.68a2.35 2.35 0 0 0 0-3.32zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
        ),
        color: 'from-yellow-400 to-lime-500',
        bgColor: 'bg-yellow-400',
        borderColor: 'border-yellow-200',
        placeholder: 'https://lemon8-app.com/@yourusername',
        textColor: 'text-gray-900',
        pillBg: 'bg-black/10',
        pillText: 'text-gray-700'
    }
]

const StepSocialAndPricing = ({ data, onChange, onNext, onBack }) => {
    const {
        allowBoost,
        boostPrice,
        allowOriginalFile,
        originalFilePrice,
        socialAccounts = [],
        acceptGiftedVideo = false,
        acceptAffiliate = false
    } = data

    const [connectingPlatform, setConnectingPlatform] = useState(null)
    const [urlInput, setUrlInput] = useState('')
    const [manualFollowers, setManualFollowers] = useState('') // Generic manual followers input
    const [syncingPlatforms, setSyncingPlatforms] = useState({}) // { platformId: boolean }
    const [disconnectingAccountId, setDisconnectingAccountId] = useState(null) // New state for disconnection animation
    const [confirmDisconnect, setConfirmDisconnect] = useState(null) // { accountId, platformId, platformName }
    const [imageErrors, setImageErrors] = useState({}) // { accountId: boolean }
    const [error, setError] = useState('')
    const [showPricing, setShowPricing] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    // Check if a platform is already connected
    const isConnected = (platformId) => {
        if (!Array.isArray(socialAccounts)) return false
        return socialAccounts.some(acc => acc.platform === platformId)
    }

    const getConnectedAccount = (platformId) => {
        if (!Array.isArray(socialAccounts)) return null
        return socialAccounts.find(acc => acc.platform === platformId)
    }

    // Extract username from URL for cleaner display
    const extractUsername = (platformId, url) => {
        try {
            if (!url) return ''
            // If it's already just a username (no slashes), return it
            if (!url.includes('/')) return url.replace('@', '')

            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
            const pathParts = urlObj.pathname.split('/').filter(p => p)

            // Handle specific platforms
            if (platformId === 'youtube') {
                if (pathParts[0] === 'channel') return 'Channel'
                if (urlObj.pathname.includes('@')) return urlObj.pathname.split('@')[1]
            }

            // Generic fallback: take last non-empty segment, handling @
            let lastPart = pathParts[pathParts.length - 1]
            if (lastPart && lastPart.startsWith('@')) lastPart = lastPart.substring(1)
            return lastPart || url
        } catch (e) {
            return url // Fallback to original if parsing fails
        }
    }

    const handleConnect = async (platformId) => {
        if (!urlInput.trim()) {
            setError('กรุณากรอก URL โปรไฟล์')
            return
        }

        if (!manualFollowers) {
            setError('กรุณากรอกจำนวนผู้ติดตาม')
            return
        }

        // Parse followers count (handle K, M, commas)
        let followers = 0
        const followersStr = manualFollowers.toUpperCase().replace(/,/g, '')
        if (followersStr.includes('K')) {
            followers = parseFloat(followersStr.replace('K', '')) * 1000
        } else if (followersStr.includes('M')) {
            followers = parseFloat(followersStr.replace('M', '')) * 1000000
        } else {
            followers = parseInt(followersStr)
        }

        if (isNaN(followers)) {
            setError('กรุณากรอกจำนวนผู้ติดตามเป็นตัวเลขที่ถูกต้อง')
            return
        }

        const url = urlInput.trim()
        const cleanUsername = extractUsername(platformId, url)

        // Prepare local account object
        // NOTE: We do not call API here anymore. We save to state, and submit all at once.
        const newAccount = {
            id: `temp_${Date.now()}`, // Temporary ID
            platform: platformId,
            username: cleanUsername,
            profile_url: url,
            followers_count: followers,
            is_verified: false,
            // Add other fields to make UI happy
            posts_count: 0,
            following_count: 0
        }

        // Check if exists, replace it
        const existingIndex = socialAccounts.findIndex(acc => acc.platform === platformId)
        let newAccounts = [...socialAccounts]

        if (existingIndex >= 0) {
            newAccounts[existingIndex] = { ...newAccounts[existingIndex], ...newAccount }
        } else {
            newAccounts.push(newAccount)
        }

        // Move this platform to syncing state and close input
        setSyncingPlatforms(prev => ({ ...prev, [platformId]: true }))

        // Simulate "saving" to local state
        setTimeout(() => {
            onChange({
                ...data,
                socialAccounts: newAccounts
            })
            // Clear inputs and success
            setUrlInput('')
            setManualFollowers('')
            setConnectingPlatform(null)
            setError('')
            setSyncingPlatforms(prev => ({ ...prev, [platformId]: false }))
        }, 500)
    }

    const handleDisconnect = async (accountId) => {
        // Just remove from local state
        setDisconnectingAccountId(accountId)
        setConfirmDisconnect(null)

        setTimeout(() => {
            onChange({
                ...data,
                socialAccounts: socialAccounts.filter(acc => acc.id !== accountId)
            })
            setDisconnectingAccountId(null)
        }, 300)
    }

    const updateField = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    // Format follower count
    const formatFollowers = (count) => {
        if (count === undefined || count === null) return '0'
        const numCount = typeof count === 'string' ? parseInt(count) : count
        if (isNaN(numCount)) return '0'
        if (numCount >= 1000000) return `${(numCount / 1000000).toFixed(1)}M`
        if (numCount >= 1000) return `${(numCount / 1000).toFixed(1)}K`
        return numCount.toString()
    }

    // Proxy social images to bypass hotlinking protection
    const getProxyUrl = (url) => {
        if (!url) return ''
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        return `${baseUrl}/utils/proxy-image/?url=${encodeURIComponent(url)}`
    }

    const checkUrl = async (platformId) => {
        if (!urlInput.trim()) {
            setError(platformId + ': กรุณากรอก URL ก่อน')
            return
        }

        setIsFetching(true)
        setError('')

        try {
            const res = await socialAPI.fetchInfo(platformId, urlInput)
            if (res.data.success) {
                const data = res.data.data
                // Auto-fill followers
                setManualFollowers(data.followers_count.toString())

                // Optional: Update URL if normalized/different?
                // setUrlInput(data.profile_url) 

                // Show temporary success feedback?
                // For now, the filled input is feedback enough.
            } else {
                if (res.data.error) setError(platformId + ': ' + res.data.error)
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.error || err.message
            setError(platformId + ': ' + msg)
        } finally {
            setIsFetching(false)
        }
    }

    // SVG Icons for Work Preferences
    const Icons = {
        Gifted: () => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12V8H4v4M20 12v8H4v-8M20 12H4M12 8V4M7 4h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        Affiliate: () => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20l7-7M21 3l-7 7M9 3H4v5M4 3l7 7M16 21h5v-5M21 21l-7-7M9 21H4v-5M4 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    return (
        <div className="flex flex-col min-h-screen relative z-10 pb-32">
            {/* 1. Header Section */}
            <div className="px-6 pt-8 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Step 02
                    </span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                    ช่องทางโซเชียล <br />
                    <span className="text-transparent bg-clip-text bg-brand-gradient">& ค่าตอบแทน</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-medium leading-relaxed">
                    เพิ่มข้อมูลช่องทางของคุณเพื่อให้ระบบ AI <br /> คัดเลือกงานที่เหมาะสมกับคุณที่สุด
                </p>
            </div>

            <div className="px-4 space-y-8">
                {/* 2. Social Accounts Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            บัญชีโซเชียลมีเดีย
                        </h2>
                        <span className="text-[10px] items-center gap-1 text-primary-500 font-bold bg-primary-50 px-2 py-1 rounded-lg">
                            SYNCING AUTO 🔄
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {PLATFORMS.map((platform) => {
                            const connected = isConnected(platform.id)
                            const account = getConnectedAccount(platform.id)
                            const isSyncing = syncingPlatforms[platform.id]
                            const isConnecting = connectingPlatform === platform.id

                            return (
                                <div
                                    key={platform.id}
                                    className={`
                                        relative rounded-[2rem] p-4 transition-all duration-500
                                        ${connected
                                            ? `${platform.bgColor} border-2 ${platform.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
                                            : isSyncing
                                                ? 'bg-gray-50 border-2 border-dashed border-gray-200 animate-pulse'
                                                : 'bg-white border-2 border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg hover:scale-[1.02]'
                                        }
                                        ${isConnecting ? 'col-span-2 ring-4 ring-primary-100 border-primary-400' : ''}
                                    `}
                                >
                                    {/* Syncing State */}
                                    {isSyncing ? (
                                        <div className="flex flex-col items-center justify-center py-2 space-y-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                                <div className="absolute inset-0 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                กำลังดึงข้อมูล...
                                            </p>
                                        </div>
                                    ) : connected && account ? (
                                        /* Connected State */
                                        <div
                                            className={`flex flex-col items-center text-center gap-2 cursor-pointer group transition-all ${disconnectingAccountId === account.id ? 'opacity-30 scale-95 pointer-events-none' : ''}`}
                                            onClick={() => setConfirmDisconnect({
                                                accountId: account.id,
                                                platformId: platform.id,
                                                platformName: platform.name
                                            })}
                                        >
                                            <div className="relative">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-100 ${platform.bgColor}`}>
                                                    <div className="w-8 h-8 text-white">
                                                        {platform.icon}
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-sm border-2 border-white">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="min-w-0 w-full px-1">
                                                <p className={`text-xs font-black truncate mb-0.5 block max-w-full ${platform.textColor || 'text-gray-800'}`}>
                                                    @{(account.username || '').replace(/^@+/, '') || 'Username'}
                                                </p>
                                                <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${platform.pillText || 'text-gray-400'} ${platform.pillBg || 'bg-black/5'}`}>
                                                    {formatFollowers(account.followers_count)} Followers
                                                </p>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-red-500 text-white rounded-full p-1 shadow-lg shadow-red-200 scale-75">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ) : isConnecting ? (
                                        /* Connecting State - Professional Input Form */
                                        <div className="space-y-4 py-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platform.bgColor}`}>
                                                        <div className="w-5 h-5 text-white">
                                                            {platform.icon}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-gray-800">{platform.name} Connection</h3>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect your profile</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setConnectingPlatform(null)
                                                        setUrlInput('')
                                                        setError('')
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <input
                                                        type="url"
                                                        placeholder={platform.placeholder}
                                                        value={urlInput}
                                                        onChange={(e) => setUrlInput(e.target.value)}
                                                        className="w-full px-4 py-4 text-sm rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium text-gray-700"
                                                        autoFocus
                                                    />

                                                    {/* AI Auto-Fill Button */}
                                                    {(platform.id === 'youtube' || platform.id === 'tiktok' || platform.id === 'instagram' || platform.id === 'facebook') && (
                                                        <button
                                                            onClick={() => checkUrl(platform.id)}
                                                            className="absolute right-2 top-2 bottom-2 bg-white/80 backdrop-blur text-[10px] font-bold text-gray-400 hover:text-primary-500 hover:bg-white px-3 py-1 rounded-xl border border-gray-100 transition-all flex items-center gap-1 shadow-sm"
                                                            disabled={isFetching}
                                                        >
                                                            {isFetching ? (
                                                                <>
                                                                    <span className="w-3 h-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                                                                    Scanning...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>✨ AI Scan</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="relative animate-spring-up">
                                                    <input
                                                        type="text"
                                                        placeholder="จำนวนผู้ติดตาม (เช่น 10K, 1.5M, 5000)"
                                                        value={manualFollowers}
                                                        onChange={(e) => setManualFollowers(e.target.value)}
                                                        className="w-full px-4 py-4 text-sm rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all font-black text-primary-600"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Followers</span>
                                                </div>

                                                {error && error.startsWith(platform.id) && (
                                                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex gap-2 items-center text-red-500 animate-shake">
                                                        <span className="text-xs">⚠️</span>
                                                        <p className="text-[10px] font-bold leading-tight">{error.split(': ')[1]}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleConnect(platform.id)}
                                                    className={`
                                                        w-full py-4 rounded-2xl text-sm font-black text-white
                                                        bg-gradient-to-r ${platform.color}
                                                        shadow-lg shadow-black/10 hover:shadow-xl active:scale-[0.98] transition-all
                                                    `}
                                                >
                                                    บันทึกข้อมูล 💾
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Default State - Professional Card */
                                        <button
                                            onClick={() => {
                                                setConnectingPlatform(platform.id)
                                                setError('')
                                                setManualFollowers('') // Clear previous input
                                            }}
                                            disabled={Object.values(syncingPlatforms).some(v => v)}
                                            className="w-full flex flex-col items-center justify-center gap-3 py-3 group disabled:opacity-50"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-100/50 ${platform.bgColor}`}>
                                                <div className="w-7 h-7 text-white">
                                                    {platform.icon}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-black text-gray-800 block">
                                                    {platform.name}
                                                </span>
                                                <span className="text-[10px] text-primary-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    + Add Data
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 3. Work Preferences (Professional Action Cards) */}
                <section className="space-y-6">
                    <div className="px-2">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                            รูปแบบการรับงาน
                        </h2>
                        <p className="text-[10px] font-bold text-primary-500">
                            * ติ๊กถูกเพื่อเพิ่มโอกาสในการถูกคัดเลือกจากแบรนด์
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Gifted Action Card */}
                        <button
                            onClick={() => updateField('acceptGiftedVideo', !acceptGiftedVideo)}
                            className={`
                                w-full flex items-center gap-4 p-5 rounded-[2rem] text-left transition-all duration-300 border-2
                                ${acceptGiftedVideo
                                    ? 'bg-primary-50/50 border-primary-400 shadow-[0_10px_30px_rgb(16,185,129,0.1)]'
                                    : 'bg-white border-gray-50 shadow-sm hover:border-gray-100'
                                }
                            `}
                        >
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                                ${acceptGiftedVideo ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-400'}
                            `}>
                                <Icons.Gifted />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-black mb-0.5 ${acceptGiftedVideo ? 'text-gray-900' : 'text-gray-700'}`}>
                                    รับรูปแบบ Gifted (VDO)
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 leading-normal">
                                    ยินดีรับสินค้ามูลค่าสูงเพื่อทำรีวิว <br /> โดยไม่รับค่าจ้างเป็นเงิน
                                </p>
                            </div>
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${acceptGiftedVideo ? 'bg-primary-500 border-primary-500 scale-110' : 'border-gray-100'}
                            `}>
                                {acceptGiftedVideo && <span className="text-white text-xs font-black">✓</span>}
                            </div>
                        </button>

                        {/* Affiliate Action Card */}
                        <button
                            onClick={() => updateField('acceptAffiliate', !acceptAffiliate)}
                            className={`
                                w-full flex items-center gap-4 p-5 rounded-[2rem] text-left transition-all duration-300 border-2
                                ${acceptAffiliate
                                    ? 'bg-blue-50/50 border-blue-400 shadow-[0_10px_30px_rgb(59,130,246,0.1)]'
                                    : 'bg-white border-gray-50 shadow-sm hover:border-gray-100'
                                }
                            `}
                        >
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                                ${acceptAffiliate ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}
                            `}>
                                <Icons.Affiliate />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-black mb-0.5 ${acceptAffiliate ? 'text-gray-900' : 'text-gray-700'}`}>
                                    รับรูปแบบ Affiliate
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 leading-normal">
                                    ยินดีรับส่วนแบ่งค่าคอมมิชชั่น <br /> จากยอดขายที่เกิดขึ้นจริง
                                </p>
                            </div>
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${acceptAffiliate ? 'bg-blue-500 border-blue-500 scale-110' : 'border-gray-100'}
                            `}>
                                {acceptAffiliate && <span className="text-white text-xs font-black">✓</span>}
                            </div>
                        </button>
                    </div>
                </section>

                {/* 4. Optional Pricing Section (Premium Light Glassmorphism) */}
                <section className="pb-10">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border-2 border-gray-100 relative overflow-hidden group">
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-400/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 blur-[40px] translate-y-1/2 -translate-x-1/2" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-gray-800 tracking-tight">เงื่อนไขเพิ่มเติม</h3>
                                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-0.5">Optional Settings</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center shrink-0">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Boost Post Pricing */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                        ค่า Boost Post
                                    </label>
                                    <span className="text-[10px] font-bold bg-primary-50 px-2 py-0.5 rounded-full text-primary-600 border border-primary-100">
                                        แนะให้: ฟรี
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white/80 backdrop-blur border-2 border-gray-100 focus:border-primary-400 focus:bg-white rounded-2xl py-4 px-10 text-xl font-black text-gray-800 placeholder:text-gray-300 outline-none transition-all shadow-inner"
                                        value={boostPrice === null || boostPrice === undefined ? '' : boostPrice}
                                        onChange={e => {
                                            const val = e.target.value
                                            onChange({
                                                ...data,
                                                boostPrice: val,
                                                allowBoost: val !== '' && val !== null
                                            })
                                        }}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400 tracking-tighter">฿</span>
                                    {(!boostPrice || parseFloat(boostPrice) === 0) && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">FREE SERVICE</span>
                                    )}
                                </div>
                            </div>

                            {/* Raw File Pricing */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                        ค่าไฟล์ต้นฉบับ
                                    </label>
                                    <span className="text-[10px] font-bold bg-primary-50 px-2 py-0.5 rounded-full text-primary-600 border border-primary-100">
                                        แนะให้: ฟรี
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white/80 backdrop-blur border-2 border-gray-100 focus:border-primary-400 focus:bg-white rounded-2xl py-4 px-10 text-xl font-black text-gray-800 placeholder:text-gray-300 outline-none transition-all shadow-inner"
                                        value={originalFilePrice === null || originalFilePrice === undefined ? '' : originalFilePrice}
                                        onChange={e => {
                                            const val = e.target.value
                                            onChange({
                                                ...data,
                                                originalFilePrice: val,
                                                allowOriginalFile: val !== '' && val !== null
                                            })
                                        }}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400 tracking-tighter">฿</span>
                                    {(!originalFilePrice || parseFloat(originalFilePrice) === 0) && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">FREE SERVICE</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center relative z-10">
                            <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">
                                * การระบุราคา "0" หรือว่างไว้ หมายถึงการยินดีร่วมงานโดยไม่มีค่าใช้จ่ายเพิ่มเติม <br />
                                <span className="text-primary-500 not-italic">ซึ่งช่วยเพิ่มโอกาสในการร่วมงานกับแบรนด์ชั้นนำ</span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Premium Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent backdrop-blur-md z-50">
                <div className="flex gap-4 max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 active:scale-95 transition-all text-sm uppercase tracking-widest border border-gray-100"
                    >
                        ย้อนกลับ
                    </button>
                    <button
                        onClick={onNext}
                        className="flex-[2] py-4 bg-brand-gradient text-white font-black rounded-3xl shadow-[0_20px_40px_rgb(16,185,129,0.3)] hover:shadow-[0_25px_50px_rgb(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        ดำเนินการต่อ
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Disconnect Confirmation Modal (Professional UI) */}
            {confirmDisconnect && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white w-[90%] max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-spring-up overflow-hidden">
                        <div className="p-8 text-center bg-white relative">
                            {/* Icon Backdrop */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-red-200 text-white border-[6px] border-white ring-4 ring-red-50">
                                🗑️
                            </div>

                            <div className="mt-12 mb-6">
                                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                                    ยกเลิกการเชื่อมต่อ?
                                </h3>
                                <p className="text-gray-400 text-[11px] font-bold leading-relaxed px-2 uppercase tracking-tight">
                                    คุณต้องการยกเลิกบัญชี <span className="text-red-500">{confirmDisconnect.platformName}</span> ใช่หรือไม่? ข้อมูลประวัติการทำงานจะถูกลบถาวร
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleDisconnect(confirmDisconnect.accountId)}
                                    className="w-full py-5 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-black rounded-full transition-all shadow-xl shadow-red-200 text-sm tracking-widest uppercase"
                                >
                                    ยืนยันการลบ ❌
                                </button>
                                <button
                                    onClick={() => setConfirmDisconnect(null)}
                                    className="w-full py-5 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] text-gray-400 font-black rounded-full transition-all text-sm tracking-widest uppercase"
                                >
                                    ปิดหน้าต่างนี้
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StepSocialAndPricing
