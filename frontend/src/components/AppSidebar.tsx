import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'

export function AppSidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    const isDashboardActive = location.pathname === '/dashboard'
    const isProjectsActive = location.pathname.startsWith('/projects') && !location.pathname.includes('/projects/')

    const handleLogout = () => {
        logoutUser()
        navigate('/login')
    }

    return (
        <>
            <aside className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen w-64 flex-col bg-[#071030] px-5 py-7 text-[#f4f2f2] z-30 overflow-y-auto">
                {/* BRAND */}
                <Link
                    to="/dashboard"
                    className="mb-10 text-2xl font-bold tracking-wide hover:opacity-95 transition shrink-0 flex  "
                >
                    <span className="text-[#637ef6]" >◀|</span> <p className="font-semibold p-0 text-[#c2c6dc] pt-1"> PlanWithMe</p>
                </Link>

                <p className="mb-3 text-xs uppercase tracking-wider text-[#f4f2f2] shrink-0">
                    Workspace
                </p>

                {/* NAV LINKS */}
                <nav className="space-y-2 flex-1">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isDashboardActive
                            ? 'bg-linear-to-r from-[#16222b] to-[#0f54a2] text-white shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="text-base">▦</span>
                        Overview
                    </Link>

                    <Link
                        to="/projects"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isProjectsActive
                            ? 'bg-linear-to-r from-[#16222b] to-[#0f54a2] text-white shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="text-base">▣</span>
                        Projects
                    </Link>
                </nav>

                {/* LOGOUT */}
                <div className="mt-auto border-[#f4f2f2] border-t pt-5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#f4f2f2] transition hover:bg-white/10 hover:text-white"
                    >
                        <span>↪</span>
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    )
}
