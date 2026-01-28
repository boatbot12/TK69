/**
 * localStorage persistence hook for registration form
 */

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'registration_draft'
const DEBOUNCE_MS = 1000

const defaultData = {
    step: 1,
    data: {
        interests: [],
        workConditions: {
            boostPrice: '',
            originalFilePrice: '',
            socialAccounts: []
        },
        personalInfo: {
            fullNameTh: '',
            phone: '',
            email: '',
            dateOfBirth: '',
            houseNo: '',
            village: '',
            moo: '',
            soi: '',
            road: '',
            subDistrict: '',
            district: '',
            province: '',
            zipcode: ''
        }
    },
    lastUpdated: null
}

export const useRegistrationStorage = () => {
    const [data, setData] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                return { ...defaultData, ...parsed }
            }
            return defaultData
        } catch (error) {
            console.error('[Storage] Failed to load registration draft:', error)
            return defaultData
        }
    })

    const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved'

    // Debounced save function
    useEffect(() => {
        // Set status to saving immediately when data changes (if it's not already saving or saved)
        if (data.lastUpdated && saveStatus !== 'saving' && saveStatus !== 'saved') {
            setSaveStatus('saving')
        }

        const timer = setTimeout(() => {
            if (data.lastUpdated) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
                    setSaveStatus('saved')
                    // Auto-hide the "Saved" message after 2 seconds
                    setTimeout(() => setSaveStatus('idle'), 2000)
                } catch (error) {
                    console.error('[Storage] Failed to save registration draft:', error)
                }
            }
        }, DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [data])

    // Update step
    const setStep = useCallback((step) => {
        setData(prev => ({
            ...prev,
            step,
            lastUpdated: new Date().toISOString()
        }))
        setSaveStatus('saving')
    }, [])

    // Update interests
    const updateInterests = useCallback((interests) => {
        setData(prev => ({
            ...prev,
            data: {
                ...prev.data,
                interests
            },
            lastUpdated: new Date().toISOString()
        }))
        setSaveStatus('saving')
    }, [])

    // Update work conditions
    const updateWorkConditions = useCallback((updates) => {
        setData(prev => ({
            ...prev,
            data: {
                ...prev.data,
                workConditions: {
                    ...prev.data.workConditions,
                    ...updates
                }
            },
            lastUpdated: new Date().toISOString()
        }))
        setSaveStatus('saving')
    }, [])

    // Update personal info
    const updatePersonalInfo = useCallback((updates) => {
        setData(prev => ({
            ...prev,
            data: {
                ...prev.data,
                personalInfo: {
                    ...prev.data.personalInfo,
                    ...updates
                }
            },
            lastUpdated: new Date().toISOString()
        }))
        setSaveStatus('saving')
    }, [])

    // Clear storage
    const clearStorage = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setData(defaultData)
    }, [])

    return {
        step: data.step,
        interests: data.data.interests,
        workConditions: data.data.workConditions,
        personalInfo: data.data.personalInfo,
        lastUpdated: data.lastUpdated,
        saveStatus,
        setStep,
        updateInterests,
        updateWorkConditions,
        updatePersonalInfo,
        clearStorage
    }
}

export default useRegistrationStorage
