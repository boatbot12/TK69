/**
 * AdminLayout - Shared layout for all admin pages
 * 
 * Features:
 * - Professional left sidebar with navigation
 * - Responsive: Collapsible on mobile
 * - Active state highlighting
 * - Smooth transitions
 */

import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Icons as SVG components for clean design
const Icons = {
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    ClipboardCheck: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    CurrencyDollar: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    X: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    ChevronLeft: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    Home: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Shield: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    )
}

// Navigation items configuration
const navItems = [
    {
        path: '/admin/approvals',
        label: 'Influencer Approvals',
        labelTh: 'อนุมัติ Influencer',
        icon: Icons.Users,
        badge: null // Can be used for notification counts
    },
    {
        path: '/admin/campaigns',
        label: 'Campaigns',
        labelTh: 'จัดการแคมเปญ',
        icon: Icons.ClipboardCheck,
        badge: null
    },
    {
        path: '/admin/finance',
        label: 'Finance',
        labelTh: 'การเงิน',
        icon: Icons.CurrencyDollar,
        badge: null,
        requiresSuperadmin: true
    },
    {
        path: '/admin/activity-logs',
        label: 'Activity Log',
        labelTh: 'บันทึกกิจกรรม',
        icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        badge: null,
        requiresSuperadmin: true
    }
]

const AdminLayout = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    // Note: Admin access check is now handled by AdminProtectedRoute

    return (

        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                bg-white border-r border-gray-200 shadow-sm
                transform transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${collapsed ? 'w-20' : 'w-64'}
            `}>
                {/* Logo Header */}
                <div className={`
                    h-16 flex items-center justify-between px-4 border-b border-gray-100
                    bg-gradient-to-r from-blue-600 to-indigo-600
                `}>
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <Icons.Shield />
                            </div>
                            <div className="text-white">
                                <h1 className="font-black text-sm">Admin Panel</h1>
                                <p className="text-[10px] text-white/70">ORBIT</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                <Icons.Shield />
                            </div>
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                    >
                        <Icons.X />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1.5 flex-1">
                    {navItems.map((item) => {
                        // Hide restricted items if not superadmin
                        if (item.requiresSuperadmin && !user?.is_superuser) return null

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-all duration-200 group relative
                                ${isActive
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                                        )}

                                        <span className={`
                                        flex-shrink-0 transition-colors
                                        ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                                    `}>
                                            <item.icon />
                                        </span>

                                        {!collapsed && (
                                            <span className="text-sm truncate">{item.labelTh}</span>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {collapsed && (
                                            <div className="
                                            absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg
                                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                            transition-all duration-200 whitespace-nowrap z-50
                                        ">
                                                {item.labelTh}
                                            </div>
                                        )}

                                        {/* Badge */}
                                        {item.badge && !collapsed && (
                                            <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Collapse Toggle (Desktop Only) */}
                <div className="hidden lg:block p-3 border-t border-gray-100">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            text-gray-400 hover:text-gray-600 hover:bg-gray-50
                            transition-all duration-200
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <span className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
                            <Icons.ChevronLeft />
                        </span>
                        {!collapsed && <span className="text-sm">Collapse</span>}
                    </button>
                </div>

                {/* User Info */}
                <div className={`p-3 border-t border-gray-100 ${collapsed ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-3 px-3 py-2">
                        <img
                            src={user?.picture_url || '/default-avatar.png'}
                            alt={user?.display_name}
                            className="w-9 h-9 rounded-full object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.display_name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {user?.is_superuser ? 'Super Admin' : (user?.is_staff ? 'Staff' : 'User')}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                        >
                            <Icons.Menu />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Icons.Shield />
                            </div>
                            <span className="font-bold text-gray-900">Admin</span>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 -mr-2"
                        >
                            <img
                                src={user?.picture_url || '/default-avatar.png'}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
