/**
 * LIFF Context - Manages LINE LIFF SDK initialization and state
 * 
 * Features:
 * - Mock LIFF mode for local development
 * - Real LIFF SDK integration for production
 */

import { createContext, useContext, useState, useEffect } from 'react'
import liff from '@line/liff'

// Mock user for development
const MOCK_USER = {
    userId: 'U_DEV_12345',
    displayName: 'Dev User',
    pictureUrl: 'https://via.placeholder.com/150',
    statusMessage: 'Testing in dev mode'
}

const MOCK_MODE = import.meta.env.VITE_MOCK_LIFF === 'true'
const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''

const LiffContext = createContext({
    isInitialized: false,
    isLoggedIn: false,
    isMock: false,
    liffError: null,
    profile: null,
    getAccessToken: () => null,
    getIdToken: () => null,
    logout: () => { },
    liff: null
})

export const useLiff = () => useContext(LiffContext)

export const LiffProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState(null)
    const [liffError, setLiffError] = useState(null)

    useEffect(() => {
        initializeLiff()
    }, [])

    const initializeLiff = async () => {
        // Mock mode for development
        if (MOCK_MODE) {
            console.log('[LIFF] Running in Mock Mode')
            setIsLoggedIn(true)
            setProfile(MOCK_USER)
            setIsInitialized(true)
            return
        }

        // Real LIFF initialization
        try {
            await liff.init({ liffId: LIFF_ID })

            if (!liff.isLoggedIn()) {
                // Just set initialized, AuthContext will handle login if needed
                setIsInitialized(true)
                return
            }

            // Get user profile
            const userProfile = await liff.getProfile()
            setProfile(userProfile)
            setIsLoggedIn(true)
            setIsInitialized(true)
        } catch (error) {
            console.error('[LIFF] Initialization failed:', error)
            setLiffError(error.message || 'LIFF initialization failed')
            setIsInitialized(true) // Still set initialized to show error
        }
    }

    const getAccessToken = () => {
        if (MOCK_MODE) return 'mock_access_token'
        return liff.getAccessToken()
    }

    const getIdToken = () => {
        if (MOCK_MODE) return 'mock_id_token'
        return liff.getIDToken()
    }

    const logout = () => {
        if (MOCK_MODE) {
            // Clear local storage and reload
            localStorage.clear()
            window.location.reload()
            return
        }
        liff.logout()
        window.location.reload()
    }

    return (
        <LiffContext.Provider value={{
            isInitialized,
            isLoggedIn,
            isMock: MOCK_MODE,
            liffError,
            profile,
            getAccessToken,
            getIdToken,
            logout,
            liff
        }}>
            {children}
        </LiffContext.Provider>
    )
}

export default LiffContext
