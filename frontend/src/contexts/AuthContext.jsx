/**
 * Auth Context - Manages user authentication state
 * 
 * Features:
 * - Authenticates with backend using LINE tokens
 * - Manages JWT token storage
 * - Provides user state and status
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLiff } from './LiffContext'
import api from '../services/api'

const AuthContext = createContext({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    login: async () => { },
    logout: () => { },
    refreshUser: async () => { }
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const { isInitialized, isLoggedIn, profile, getIdToken, getAccessToken, isMock, logout: liffLogout, liff } = useLiff()
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sessionChecked, setSessionChecked] = useState(false)

    // Phase 1: Local Session Check (On Mount)
    useEffect(() => {
        const checkLocalSession = async () => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                try {
                    console.log('[Auth] Phase 1: Checking local session...')
                    const response = await authAPI.getCurrentUser()
                    setUser(response.data)
                    console.log('[Auth] Phase 1: Session valid, user restored.')
                    setIsLoading(false)
                    setSessionChecked(true)
                    return // Fast path success
                } catch (err) {
                    console.warn('[Auth] Phase 1: Local token invalid, clearing...')
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('refresh_token')
                }
            }
            console.log('[Auth] Phase 1 complete: Moving to Phase 2 (LIFF)')
            setSessionChecked(true)
        }
        checkLocalSession()
    }, [])

    // Phase 2: LIFF Initialization (Only if Phase 1 didn't find a user)
    useEffect(() => {
        if (sessionChecked && !user && isInitialized) {
            if (isLoggedIn && profile) {
                console.log('[Auth] Phase 2: LIFF logged in, authenticating with backend...')
                authenticateWithBackend()
            } else if (!isLoggedIn) {
                console.log('[Auth] Phase 2: LIFF not logged in, triggering liff.login()...')
                const timer = setTimeout(() => {
                    // Use current URL as redirectUri to skip LINE's confirmation page
                    liff?.login({ redirectUri: window.location.href })
                }, 500)
                return () => clearTimeout(timer)
            }
        } else if (sessionChecked && user) {
            setIsLoading(false)
        }
    }, [sessionChecked, user, isInitialized, isLoggedIn, profile])

    const authenticateWithBackend = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const idToken = getIdToken()
            const accessToken = getAccessToken()

            const requestData = {
                id_token: idToken,
                access_token: accessToken
            }

            if (isMock) {
                requestData.line_user_id = profile.userId
                requestData.display_name = profile.displayName
                requestData.picture_url = profile.pictureUrl
            }

            const response = await api.post('/auth/line-login/', requestData)

            localStorage.setItem('auth_token', response.data.token)
            if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh)
            }

            setUser(response.data.user)
        } catch (err) {
            console.error('[Auth] Authentication failed:', err)
            setError(err.response?.data?.message || 'Authentication failed')
        } finally {
            setIsLoading(false)
        }
    }

    const refreshUser = useCallback(async () => {
        try {
            const response = await authAPI.getCurrentUser()
            setUser(response.data)
            return response.data
        } catch (err) {
            console.error('[Auth] Failed to refresh user:', err)
            return null
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        liffLogout()
    }, [liffLogout])

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            token: localStorage.getItem('auth_token'),
            error,
            login: authenticateWithBackend,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
