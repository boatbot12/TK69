import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useLiff } from './contexts/LiffContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Waiting from './pages/Waiting'
import Rejected from './pages/Rejected'
import JobDashboard from './pages/JobDashboard'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import HelpPage from './pages/HelpPage'
import AdminFinance from './pages/AdminFinance'
import AdminInfluencerApprovals from './pages/AdminInfluencerApprovals'

import AdminCampaigns from './pages/AdminCampaigns'
import AdminCampaignProject from './pages/AdminCampaignProject'
import AdminCreateCampaign from './pages/AdminCreateCampaign'
import AdminEditCampaign from './pages/AdminEditCampaign'
import SharedCampaign from './pages/SharedCampaign'
import AdminActivityLog from './pages/AdminActivityLog'

// Components
import LoadingScreen from './components/common/LoadingScreen'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminProtectedRoute from './components/routing/AdminProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminAccessDenied from './pages/AdminAccessDenied'

function App() {
    const { isInitialized } = useLiff()
    const { isLoading } = useAuth()

    // Show loading screen while LIFF initializes
    if (!isInitialized || isLoading) {
        return <LoadingScreen message="กำลังโหลด..." />
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/shared/campaign/:token" element={<SharedCampaign />} />

                    {/* Registration - for NEW users */}
                    <Route
                        path="/register"
                        element={
                            <ProtectedRoute requiredStatus={['NEW']}>
                                <Register />
                            </ProtectedRoute>
                        }
                    />

                    {/* Waiting - for PENDING users */}
                    <Route
                        path="/waiting"
                        element={
                            <ProtectedRoute requiredStatus={['PENDING']}>
                                <Waiting />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rejected - for REJECTED users */}
                    <Route
                        path="/rejected"
                        element={
                            <ProtectedRoute requiredStatus={['REJECTED']}>
                                <Rejected />
                            </ProtectedRoute>
                        }
                    />

                    {/* Jobs - for APPROVED users */}
                    <Route
                        path="/jobs"
                        element={
                            <ProtectedRoute requiredStatus={['APPROVED']}>
                                <JobDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Campaign Detail - for APPROVED users */}
                    <Route
                        path="/campaign/:id"
                        element={
                            <ProtectedRoute requiredStatus={['APPROVED']}>
                                <JobDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Profile - for APPROVED users */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute requiredStatus={['APPROVED']}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Edit Profile - for APPROVED users */}
                    <Route
                        path="/profile/edit"
                        element={
                            <ProtectedRoute requiredStatus={['APPROVED']}>
                                <EditProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Help Page - for APPROVED users */}
                    <Route
                        path="/help"
                        element={
                            <ProtectedRoute requiredStatus={['APPROVED']}>
                                <HelpPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes - wrapped in AdminLayout with Sidebar */}
                    <Route
                        path="/admin"
                        element={
                            <AdminProtectedRoute>
                                <AdminLayout />
                            </AdminProtectedRoute>
                        }
                    >
                        <Route path="approvals" element={<AdminInfluencerApprovals />} />

                        <Route path="campaigns" element={<AdminCampaigns />} />
                        <Route path="campaigns/create" element={<AdminCreateCampaign />} />
                        <Route path="campaigns/:id/edit" element={<AdminEditCampaign />} />
                        <Route path="campaigns/:id" element={<AdminCampaignProject />} />
                        <Route path="finance" element={<AdminFinance />} />
                        <Route path="activity-logs" element={<AdminActivityLog />} />
                        <Route index element={<Navigate to="approvals" replace />} />
                    </Route>

                    {/* Admin Access Denied - shown when user lacks admin rights */}
                    <Route path="/admin/access-denied" element={<AdminAccessDenied />} />


                    {/* Default redirect - go to login first, it will redirect based on user status */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    {/* Default redirect to root (which checks auth) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App

