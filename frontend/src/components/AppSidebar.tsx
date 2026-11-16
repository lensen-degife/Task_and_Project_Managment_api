import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'

interface AppSidebarProps {
    mobileOpen?: boolean
    onMobileClose?: () => void
    extraLinks?: {
        label: string
        icon: string
        active?: boolean
        onClick: () => void
    }[]
}

export function AppSidebar({ mobileOpen = false, onMobileClose, extraLinks }: AppSidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const isDashboardActive = location.pathname === '/dashboard'
    const isProjectsActive = location.pathname.startsWith('/projects') && !location.pathname.includes('/projects/')

    const handleLogout = () => {
        onMobileClose?.()
        logoutUser()
        navigate('/login')
    }

    const handleNavClick = (path: string) => {
        onMobileClose?.()
        navigate(path)
    }

    return (
        <>
            {/* MOBILE BACKDROP */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* MOBILE SIDEBAR DRAWER */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-[#102326] px-5 py-6 text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Mobile Navigation"
            >
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/dashboard"
                        onClick={onMobileClose}
                        className="text-2xl font-bold tracking-wide hover:opacity-95 transition"
                    >
                        <span className="text-orange-400">◀</span> PlanWithMe
                    </Link>
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
                        aria-label="Close navigation menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="mb-3 text-xs uppercase tracking-wider text-gray-400">
                    Workspace
                </p>

                <nav className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleNavClick('/dashboard')}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition text-left ${
                            isDashboardActive
                                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <span className="text-base">▦</span>
                        Overview
                    </button>

                    <button
                        type="button"
                        onClick={() => handleNavClick('/projects')}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition text-left ${
                            isProjectsActive
                                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <span className="text-base">▣</span>
                        Projects
                    </button>

                    {extraLinks?.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                onMobileClose?.()
                                item.onClick()
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                                item.active
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/10 pt-5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <span>↪</span>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen w-64 flex-col bg-[#102326] px-5 py-7 text-white z-30 overflow-y-auto">
                {/* BRAND */}
                <Link
                    to="/dashboard"
                    className="mb-10 text-2xl font-bold tracking-wide hover:opacity-95 transition shrink-0"
                >
                    <span className="text-orange-400">◀</span> PlanWithMe
                </Link>

                <p className="mb-3 text-xs uppercase tracking-wider text-gray-400 shrink-0">
                    Workspace
                </p>

                {/* NAV LINKS */}
                <nav className="space-y-2 flex-1">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                            isDashboardActive
                                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <span className="text-base">▦</span>
                        Overview
                    </Link>

                    <Link
                        to="/projects"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                            isProjectsActive
                                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <span className="text-base">▣</span>
                        Projects
                    </Link>

                    {/* EXTRA CONTEXTUAL LINKS (e.g. for Project Details) */}
                    {extraLinks?.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={item.onClick}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                                item.active
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* LOGOUT */}
                <div className="mt-auto border-t border-white/10 pt-5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <span>↪</span>
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    )
}
