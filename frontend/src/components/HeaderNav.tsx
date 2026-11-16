import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { getStoredUser, logoutUser, getCurrentUser } from '../services/authService'
import type { AuthUser } from '../types/auth'

interface HeaderNavProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    searchPlaceholder?: string
    onMenuClick?: () => void
}

interface NotificationItem {
    id: string
    title: string
    time: string
    read: boolean
}

export function HeaderNav({
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    onMenuClick
}: HeaderNavProps) {
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: '1',
            title: 'Welcome to PlanWithMe! Your workspace is ready.',
            time: 'Just now',
            read: false
        },
        {
            id: '2',
            title: 'Tip: Create projects and invite team members to collaborate.',
            time: '5m ago',
            read: false
        }
    ])

    const profileMenuRef = useRef<HTMLDivElement>(null)
    const notificationMenuRef = useRef<HTMLDivElement>(null)

    // Load user profile if not in storage
    useEffect(() => {
        if (!user) {
            getCurrentUser()
                .then(u => {
                    setUser(u)
                })
                .catch(() => {
                    // Ignore if unauthorized
                })
        }
    }, [user])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
                setShowProfileMenu(false)
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        logoutUser()
        navigate('/login')
    }

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

    return (
        <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 bg-white px-4 py-3 sm:px-8 sm:py-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
            
            {/* TOP ROW ON MOBILE / LEFT SECTION */}
            <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    {/* MOBILE HAMBURGER BUTTON */}
                    {onMenuClick && (
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="md:hidden p-2 -ml-1 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition shrink-0"
                            aria-label="Open navigation menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    {/* MOBILE BRAND LOGO */}
                    <Link
                        to="/dashboard"
                        className="md:hidden text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-1 shrink-0"
                    >
                        <span className="text-orange-400">◀</span> PlanWithMe
                    </Link>
                </div>

                {/* MOBILE CONTROLS (Theme, Notifs, Avatar) */}
                <div className="flex items-center gap-2 sm:hidden">
                    {/* THEME TOGGLE */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf1fa] text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-sm"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>

                    {/* USER INITIAL */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowProfileMenu(prev => !prev)
                            setShowNotifications(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs shadow-xs"
                        aria-label="Open profile menu"
                    >
                        {userInitial}
                    </button>
                </div>
            </div>

            {/* SEARCH FIELD */}
            <div className="relative w-full sm:flex-1 sm:max-w-md">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ⌕
                </span>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-full bg-[#edf1fa] py-2 sm:py-2.5 pl-9 pr-9 text-xs sm:text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-500"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* DESKTOP CONTROLS */}
            <div className="hidden sm:flex items-center gap-3">
                {/* THEME TOGGLE */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf1fa] text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀' : '☾'}
                </button>

                {/* NOTIFICATIONS DROPDOWN */}
                <div className="relative" ref={notificationMenuRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setShowNotifications(prev => !prev)
                            setShowProfileMenu(false)
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#edf1fa] text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        <span>🔔</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-xs">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Notifications
                                </h4>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllRead}
                                        className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 max-h-64 space-y-2.5 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="py-6 text-center text-xs text-gray-400">
                                        No notifications right now.
                                    </p>
                                ) : (
                                    notifications.map(item => (
                                        <div
                                            key={item.id}
                                            className={`group relative rounded-xl p-3 text-left transition ${
                                                item.read
                                                    ? 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
                                                    : 'bg-blue-50/70 text-gray-800 font-medium dark:bg-blue-900/20 dark:text-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs leading-relaxed break-words">
                                                    {item.title}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => clearNotification(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                                                    aria-label="Dismiss notification"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <span className="mt-1 block text-[10px] text-gray-400">
                                                {item.time}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setShowProfileMenu(prev => !prev)
                            setShowNotifications(false)
                        }}
                        className="flex items-center gap-3 rounded-full p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="User menu"
                        aria-expanded={showProfileMenu}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            {userInitial}
                        </div>
                        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 lg:block max-w-[120px] truncate">
                            {user?.name || 'My Account'}
                        </span>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
                            <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email || ''}
                                </p>
                            </div>

                            <div className="mt-2 space-y-1">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    <span>▦</span>
                                    Dashboard
                                </Link>

                                <Link
                                    to="/projects"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    <span>▣</span>
                                    My Projects
                                </Link>
                            </div>

                            <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <span>↪</span>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE PROFILE DROPDOWN IF OPEN */}
            {showProfileMenu && (
                <div className="sm:hidden absolute right-4 top-14 w-60 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50" ref={profileMenuRef}>
                    <div className="border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || ''}
                        </p>
                    </div>

                    <div className="mt-2 space-y-1">
                        <Link
                            to="/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span>▦</span> Dashboard
                        </Link>
                        <Link
                            to="/projects"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span>▣</span> My Projects
                        </Link>
                    </div>

                    <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                            <span>↪</span> Log Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}
