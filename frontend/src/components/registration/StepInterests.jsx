/**
 * Step 1: Interest Selection - Vibrant Gen Z Design
 * Playful Layout, Big Icons, Interactive Feedback
 * Uses LOCAL static images for fast loading
 */

import { useState, useEffect } from 'react'
import { registerAPI } from '../../services/api'

// Local static images mapping by keywords (supports both Thai and English names)
// Local static images mapping by keywords (supports both Thai and English names)
const LOCAL_IMAGES = {
    // 1. Food & Drink
    food: '/images/interests/food_drink.png',
    drink: '/images/interests/food_drink.png',
    'อาหาร': '/images/interests/food_drink.png',
    'เครื่องดื่ม': '/images/interests/food_drink.png',

    // 2. Lifestyle
    lifestyle: '/images/interests/lifestyle.png',
    'ไลฟ์สไตล์': '/images/interests/lifestyle.png',

    // 3. Travel
    travel: '/images/interests/travel.png',
    'ท่องเที่ยว': '/images/interests/travel.png',

    // 4. Beauty
    beauty: '/images/interests/beauty.png',
    'ความงาม': '/images/interests/beauty.png',

    // 5. Fashion
    fashion: '/images/interests/fashion.png',
    'แฟชั่น': '/images/interests/fashion.png',

    // 6. Real Estate
    estate: '/images/interests/real_estate.png',
    property: '/images/interests/real_estate.png',
    'อสังหา': '/images/interests/real_estate.png',

    // 7. Personal Finance
    finance: '/images/interests/finance.png',
    money: '/images/interests/finance.png',
    'การเงิน': '/images/interests/finance.png',
    'ลงทุน': '/images/interests/finance.png',

    // 8. Live Streamers
    live: '/images/interests/live_stream.png',
    stream: '/images/interests/live_stream.png',
    'ไลฟ์': '/images/interests/live_stream.png',

    // 9. Health
    health: '/images/interests/health.png',
    fitness: '/images/interests/health.png',
    'สุขภาพ': '/images/interests/health.png',

    // 10. Pet
    pet: '/images/interests/pet.png',
    'สัตว์': '/images/interests/pet.png',
    'หมา': '/images/interests/pet.png',
    'แมว': '/images/interests/pet.png',
}

// Fallback interests with local images
const FALLBACK_INTERESTS = [
    { id: 'food_drink', name: 'Food & Drink', name_th: 'อาหารและเครื่องดื่ม', icon: '🍱', color: 'bg-orange-100 text-orange-500' },
    { id: 'lifestyle', name: 'Lifestyle', name_th: 'ไลฟ์สไตล์', icon: '✨', color: 'bg-purple-100 text-purple-500' },
    { id: 'travel', name: 'Travel', name_th: 'ท่องเที่ยว', icon: '🗺️', color: 'bg-sky-100 text-sky-500' },
    { id: 'beauty', name: 'Beauty', name_th: 'ความงาม', icon: '💄', color: 'bg-rose-100 text-rose-500' },
    { id: 'fashion', name: 'Fashion', name_th: 'แฟชั่น', icon: '🧥', color: 'bg-pink-100 text-pink-500' },
    { id: 'real_estate', name: 'Real Estate', name_th: 'อสังหาริมทรัพย์', icon: '🏡', color: 'bg-gray-100 text-gray-500' },
    { id: 'personal_finance', name: 'Personal Finance', name_th: 'การเงินส่วนบุคคล', icon: '💹', color: 'bg-green-100 text-green-500' },
    { id: 'live_streamers', name: 'Live Streamers', name_th: 'ไลฟ์สตรีมเมอร์', icon: '🎙️', color: 'bg-red-100 text-red-500' },
    { id: 'health', name: 'Health', name_th: 'สุขภาพ', icon: '🧘', color: 'bg-emerald-100 text-emerald-500' },
    { id: 'pet', name: 'Pet', name_th: 'สัตว์เลี้ยง', icon: '🐾', color: 'bg-yellow-100 text-yellow-500' },
]

// Smart image matcher - matches by ID, name, or name_th keywords
const getLocalImage = (interest) => {
    if (!interest) return null

    // If interest is just an ID string
    if (typeof interest === 'string') {
        const lowerInterest = interest.toLowerCase()
        for (const [key, url] of Object.entries(LOCAL_IMAGES)) {
            if (lowerInterest.includes(key.toLowerCase())) return url
        }
        return null
    }

    // If interest is an object with id, name, name_th
    const searchTexts = [
        interest.id?.toString().toLowerCase(),
        interest.name?.toLowerCase(),
        interest.name_th
    ].filter(Boolean)

    for (const text of searchTexts) {
        for (const [key, url] of Object.entries(LOCAL_IMAGES)) {
            if (text.includes(key.toLowerCase()) || key.toLowerCase().includes(text)) {
                return url
            }
        }
    }

    return null
}

const MAX_SELECTIONS = 3
const CACHE_KEY = 'interests_cache_v5' // v5 to force refresh for new images matches
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (longer since we use local images)

const StepInterests = ({ selected = [], onChange, onNext }) => {
    const [interests, setInterests] = useState(FALLBACK_INTERESTS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Sanitize existing selected interests to be only IDs
        if (selected && selected.length > 0) {
            const sanitized = selected.map(item =>
                (typeof item === 'object' && item !== null) ? item.id : item
            ).filter(Boolean)

            if (JSON.stringify(sanitized) !== JSON.stringify(selected)) {
                console.log('[StepInterests] Sanitizing legacy selection objects -> IDs')
                onChange(sanitized)
            }
        }
        loadInterests()
    }, [])

    const loadInterests = async () => {
        // 1. Try Cache First
        const savedCache = localStorage.getItem(CACHE_KEY)
        if (savedCache) {
            try {
                const { data, timestamp } = JSON.parse(savedCache)
                const isExpired = Date.now() - timestamp > CACHE_DURATION

                if (data && data.length > 0 && !isExpired) {
                    console.log('[StepInterests] Using cached interests ⚡️')
                    setInterests(data)
                    setLoading(false)
                    return
                } else {
                    console.log('[StepInterests] Cache expired, refreshing...')
                    localStorage.removeItem(CACHE_KEY)
                }
            } catch (e) {
                console.error('Cache parse error', e)
                localStorage.removeItem(CACHE_KEY)
            }
        }

        // 2. Fetch from API (only for category metadata, not images)
        try {
            console.log('[StepInterests] Fetching interests from server 🌐')
            const response = await registerAPI.getInterests()
            const data = response.data.results || (Array.isArray(response.data) ? response.data : [])

            if (data.length > 0) {
                // Merge API data with local images and fallback colors
                const mappedData = data.map((item, i) => ({
                    ...item,
                    localImage: getLocalImage(item), // Use smart matcher with full item
                    color: FALLBACK_INTERESTS[i % FALLBACK_INTERESTS.length].color
                }))

                // Only use API data, don't merge with fallback
                setInterests(mappedData)

                // Cache the merged data
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: mappedData,
                    timestamp: Date.now()
                }))
                console.log('[StepInterests] Cached interests for 7 days ✅')
            } else {
                // Use fallback with local images
                const fallbackWithImages = FALLBACK_INTERESTS.map(item => ({
                    ...item,
                    localImage: getLocalImage(item)
                }))
                setInterests(fallbackWithImages)
            }
        } catch (error) {
            console.log('[StepInterests] Using fallback interests:', error.message)
            // Use fallback with local images
            const fallbackWithImages = FALLBACK_INTERESTS.map(item => ({
                ...item,
                localImage: getLocalImage(item)
            }))
            setInterests(fallbackWithImages)
        } finally {
            setLoading(false)
        }
    }


    const toggleInterest = (id) => {
        // Ensure id is a string/ID
        const targetId = (typeof id === 'object' && id !== null) ? id.id : id

        if (selected.includes(targetId)) {
            onChange(selected.filter(i => i !== targetId))
        } else if (selected.length < MAX_SELECTIONS) {
            onChange([...selected, targetId])
        }
    }

    return (
        <div className="flex flex-col pb-32 relative z-10 overflow-y-auto">

            {/* Dynamic Header */}
            <div className="px-6 pt-6 pb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    สนใจเรื่องไหน? <span className="text-3xl animate-bounce inline-block">👀</span>
                </h1>
                <p className="text-gray-500 font-medium text-lg">
                    เลือกมาเลย 3 อย่างที่เป็นตัวคุณ!
                </p>

                {/* Fun Counter */}
                <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-gradient transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${(selected.length / MAX_SELECTIONS) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-brand-start bg-emerald-50 px-3 py-1 rounded-full">
                        {selected.length}/{MAX_SELECTIONS}
                    </span>
                </div>
            </div>

            {/* Grid of Awesome - Modern Card Layout */}
            <div className="p-5 grid grid-cols-2 gap-5 pb-28">
                {interests.map((interest, index) => {
                    const interestId = interest.id
                    const isSelected = selected.some(s => {
                        const sId = (typeof s === 'object' && s !== null) ? s.id : s
                        return sId === interestId
                    })
                    const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS
                    const imageUrl = interest.localImage || getLocalImage(interest)

                    return (
                        <button
                            key={interestId}
                            onClick={() => toggleInterest(interestId)}
                            disabled={isDisabled}
                            className={`
                                flex flex-col items-center gap-2 p-0 border-0 bg-transparent
                                transition-all duration-300 ease-spring
                                ${isDisabled ? 'opacity-40 grayscale-[0.6] cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Image Card */}
                            <div className={`
                                relative w-full aspect-square rounded-[20px] overflow-hidden
                                shadow-lg transition-all duration-300
                                ${isSelected
                                    ? 'ring-[3px] ring-brand-start ring-offset-2 scale-[1.02]'
                                    : 'hover:scale-[1.03] hover:shadow-xl'
                                }
                            `}>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={interest.name_th}
                                        className="w-full h-full object-cover transition-transform duration-500"
                                    />
                                ) : (
                                    <div className={`w-full h-full ${interest.color} flex items-center justify-center text-5xl`}>
                                        {interest.icon}
                                    </div>
                                )}

                                {/* Subtle overlay on selection */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-brand-start/10" />
                                )}

                                {/* Checkmark Badge */}
                                {isSelected && (
                                    <div className="absolute top-2.5 right-2.5 bg-brand-start text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-pop">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Label - Below Image */}
                            <span className={`
                                text-sm font-semibold text-center leading-tight px-1
                                transition-colors duration-200
                                ${isSelected ? 'text-brand-start' : 'text-gray-700'}
                            `}>
                                {interest.name_th}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Floating Action Button Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent backdrop-blur-[2px] z-50">
                <button
                    onClick={onNext}
                    disabled={selected.length === 0}
                    className="btn-primary w-full text-lg shadow-lg shadow-emerald-200/50 bg-brand-gradient hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    ไปต่อเลย! 🚀
                </button>
            </div>
        </div>
    )
}

export default StepInterests
