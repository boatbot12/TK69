/**
 * AdminProtectedRoute - Protected route for Admin pages
 * 
 * Flow:
 * 1. If not authenticated → Trigger LINE LIFF Login (uses AuthContext session)
 * 2. If authenticated but not admin (is_staff/is_superuser = false) → Show Access Denied
 * 3. If admin → Render children
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../common/LoadingScreen'

const AdminProtectedRoute = ({ children }) => {
    const { user, isLoading, isAuthenticated } = useAuth()

    // Still loading - show loading screen
    if (isLoading) {
        return <LoadingScreen message="กำลังตรวจสอบสิทธิ์..." />
    }

    // Not authenticated - redirect to login
    // AuthContext will handle LINE LIFF login automatically
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Authenticated but NOT admin - show access denied page
    if (!(user.is_superuser || user.is_staff)) {
        return <Navigate to="/admin/access-denied" replace />
    }

    // Is admin - render the protected content
    return children
}

export default AdminProtectedRoute
