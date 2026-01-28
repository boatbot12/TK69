/**
 * API Service - Axios instance with authentication
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            // Optionally redirect to login
        }
        return Promise.reject(error)
    }
)

export default api

// API functions
export const authAPI = {
    lineLogin: (data) => api.post('/auth/line-login/', data),
    getCurrentUser: () => api.get('/auth/me/')
}

export const registerAPI = {
    getInterests: () => api.get('/register/interests/'),
    submit: (formData) => api.post('/register/submit/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const profileAPI = {
    update: (formData) => api.put('/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const campaignAPI = {
    list: ({ page, limit, ...params }) => {
        let url = '/campaigns/?'
        if (page) url += `page=${page}&`
        if (limit) url += `page_size=${limit}&`
        return api.post(url, { ...params, _t: Date.now() })
    },
    get: (id) => api.get(`/campaigns/${id}/`),
    apply: (id, data) => api.post(`/campaigns/${id}/apply/`, data)
}

export const applicationAPI = {
    list: () => api.get('/applications/'),
    submitWork: (id, data) => {
        if (data instanceof FormData) {
            return api.post(`/applications/${id}/submit/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
        return api.post(`/applications/${id}/submit/`, data)
    }
}

export const utilityAPI = {
    validateDriveLink: (link) => api.post('/validate-drive-link/', { link })
}

export const socialAPI = {
    listAccounts: () => api.get('/social/accounts/'),
    connect: (platform, profileUrl, extraData = {}) => api.post('/social/connect/', {
        platform,
        profile_url: profileUrl,
        ...extraData
    }),
    disconnect: (id) => api.delete(`/social/accounts/${id}/`),
    sync: (id) => api.post(`/social/accounts/${id}/sync/`),
    fetchInfo: (platform, url) => api.get(`/utils/fetch-social-info/?platform=${platform}&url=${encodeURIComponent(url)}`)
}
