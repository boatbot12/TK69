import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, HelpCircle, User } from 'lucide-react'

const MainLayout = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-brand-start/20">
            {children}

            {/* Premium Floating "Freeze Bar" Navigation */}
            <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
                <div className="max-w-md mx-auto h-18 bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/50 pointer-events-auto flex items-center justify-between px-2 overflow-hidden relative">

                    {/* Campaigns Tab */}
                    <button
                        onClick={() => navigate('/jobs')}
                        className={`group flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 ${location.pathname === '/jobs' ? 'text-brand-start' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <LayoutGrid className={`w-6 h-6 transition-transform ${location.pathname === '/jobs' ? 'scale-110' : 'group-active:scale-95'}`} />
                        <span className={`text-[10px] font-bold tracking-tight transition-all ${location.pathname === '/jobs' ? 'opacity-100' : 'opacity-70'}`}>
                            Campaigns
                        </span>
                    </button>

                    {/* Central Floating Profile Button */}
                    <div className="relative flex-1 flex justify-center h-full items-center">
                        <button
                            onClick={() => navigate('/profile')}
                            className={`
                                relative -top-3 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform
                                shadow-lg shadow-brand-start/30 active:scale-90
                                ${location.pathname === '/profile'
                                    ? 'bg-brand-gradient scale-110 shadow-brand-start/40'
                                    : 'bg-white border border-gray-100 text-gray-400 shadow-gray-200/50 hover:border-brand-start/30'
                                }
                            `}
                        >
                            <User className={`w-7 h-7 transition-all ${location.pathname === '/profile' ? 'text-white' : 'text-gray-400 group-hover:text-brand-start'}`} />
                            {/* Glow effect when active */}
                            {location.pathname === '/profile' && (
                                <div className="absolute inset-0 rounded-2xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] opacity-20"></div>
                            )}
                        </button>
                    </div>

                    {/* Help Tab */}
                    <button
                        onClick={() => navigate('/help')}
                        className={`group flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 ${location.pathname === '/help' ? 'text-brand-start' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <HelpCircle className={`w-6 h-6 transition-transform ${location.pathname === '/help' ? 'scale-110' : 'group-active:scale-95'}`} />
                        <span className={`text-[10px] font-bold tracking-tight transition-all ${location.pathname === '/help' ? 'opacity-100' : 'opacity-70'}`}>
                            Help
                        </span>
                    </button>

                </div>
            </div>

            {/* Safe Area Spacer for Content */}
            <div className="h-28" />
        </div>
    )
}

export default MainLayout
