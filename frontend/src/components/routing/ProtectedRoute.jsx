/**
 * Protected Route Component
 * 
 * Redirects users based on their status:
 * - NEW -> /register
 * - PENDING -> /waiting
 * - APPROVED -> /jobs
 * - REJECTED -> /rejected
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../common/LoadingScreen'

const ProtectedRoute = ({ children, requiredStatus = ['APPROVED'] }) => {
    const { user, isLoading, isAuthenticated } = useAuth()

    // Still loading
    if (isLoading) {
        return <LoadingScreen message="กำลังตรวจสอบสิทธิ์..." />
    }

    // Not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user status matches required status
    if (!requiredStatus.includes(user.status)) {
        // Redirect based on actual status
        switch (user.status) {
            case 'NEW':
                return <Navigate to="/register" replace />
            case 'PENDING':
                return <Navigate to="/waiting" replace />
            case 'REJECTED':
                return <Navigate to="/rejected" replace />
            case 'APPROVED':
                return <Navigate to="/jobs" replace />
            default:
                return <Navigate to="/login" replace />
        }
    }

    // Status matches, render children
    return children
}

export default ProtectedRoute
