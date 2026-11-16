import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/project'
import { getProjects, createProject } from '../services/projectService'
import { HeaderNav } from '../components/HeaderNav'
import { AppSidebar } from '../components/AppSidebar'
import type { FormEvent } from 'react'

function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [search, setSearch] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navigate = useNavigate()

    const pendingCreateRef = useRef<{
        key: string
        payload: {
            name: string
            description: string
        }
    } | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setError('')
                const result = await getProjects()
                setProjects(result)
            } catch (e) {
                setError('Failed to load projects.')
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    const handleCreateProject = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()
        setCreateError('')

        if (!name.trim()) return

        try {
            setCreating(true)

            const payload = {
                name: name.trim(),
                description: description.trim()
            }

            let pending = pendingCreateRef.current

            if (
                !pending ||
                pending.payload.name !== payload.name ||
                pending.payload.description !== payload.description
            ) {
                pending = {
                    key: crypto.randomUUID(),
                    payload
                }

                pendingCreateRef.current = pending
            }

            const result = await createProject(payload, pending.key)

            pendingCreateRef.current = null

            setProjects(previous => [
                result.project,
                ...previous
            ])

            setName('')
            setDescription('')
            setShowCreateForm(false)
        } catch (e) {
            setCreateError('Failed to create project. Please try again.')
            console.error(e)
        } finally {
            setCreating(false)
        }
    }

    const normalizedQuery = search.trim().toLowerCase()

    const filteredProjects = projects.filter(project => {
        if (!normalizedQuery) return true

        const matchesName = project.name.toLowerCase().includes(normalizedQuery)
        const matchesDescription = (project.description || '')
            .toLowerCase()
            .includes(normalizedQuery)

        return matchesName || matchesDescription
    })

    return (
        <div className="min-h-screen bg-[#edf1fa] dark:bg-gray-950 flex transition-colors relative overflow-x-hidden">
            {/* SIDEBAR (Desktop & Mobile Drawer) */}
            <AppSidebar
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* MAIN CONTENT */}
            <main className="min-w-0 flex-1 flex flex-col md:ml-64">
                {/* TOP HEADER */}
                <HeaderNav
                    searchQuery={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search projects by name or description..."
                    onMenuClick={() => setMobileMenuOpen(true)}
                />

                {/* DASHBOARD CONTENT */}
                <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 flex-1 max-w-full">
                    {/* PAGE TITLE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Dashboard / Overview
                            </p>

                            <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Project Dashboard
                            </h1>

                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Manage and track all your projects in one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCreateForm(previous => !previous)}
                            className="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 shrink-0"
                        >
                            {showCreateForm ? '✕ Close Form' : '+ Create Project'}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* SUMMARY CARDS: 1 col on mobile, 2 on tablet, 3 on desktop */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Total Projects
                            </p>

                            <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {projects.length}
                            </h2>

                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Projects in your workspace
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Project Workspace
                            </p>

                            <h2 className="mt-2 sm:mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                                Stay Organized
                            </h2>

                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Keep your projects and tasks together.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800 md:col-span-2 lg:col-span-1">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Quick Action
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowCreateForm(true)}
                                className="mt-2 sm:mt-3 text-lg sm:text-xl font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 block text-left"
                            >
                                + New Project
                            </button>

                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Start organizing a new project.
                            </p>
                        </div>
                    </section>

                    {/* CREATE PROJECT FORM */}
                    {showCreateForm && (
                        <section className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                            <div className="flex justify-between items-center mb-4 sm:mb-5">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                    Create a Project
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    aria-label="Close form"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateProject}
                                className="space-y-3.5 sm:space-y-4"
                            >
                                <div>
                                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter project name"
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>

                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe your project"
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                                    />
                                </div>

                                {createError && (
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                                        {createError}
                                    </p>
                                )}

                                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="w-full sm:w-auto text-center rounded-xl border border-gray-200 px-5 py-2.5 sm:py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={creating || !name.trim()}
                                        className="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        {creating ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* PROJECTS */}
                    <section className="space-y-4 sm:space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                    My Projects
                                </h2>

                                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Your project workspace
                                </p>
                            </div>

                            <span className="rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 shadow-xs dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl bg-white p-8 sm:p-10 text-center text-sm text-gray-500 shadow-xs dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                                Loading projects...
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="rounded-2xl bg-white p-6 sm:p-10 text-center shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                                <div className="text-3xl sm:text-4xl mb-3">▤</div>

                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg">
                                    {search
                                        ? 'No matching projects'
                                        : 'No projects yet'}
                                </h3>

                                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    {search
                                        ? 'Try another search query.'
                                        : 'Create your first project to get started.'}
                                </p>

                                {!search && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(true)}
                                        className="mt-4 sm:mt-5 rounded-xl bg-blue-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                                    >
                                        Create your first project
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                {filteredProjects.map((project, index) => (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="group rounded-2xl bg-white p-5 sm:p-6 text-left shadow-xs transition hover:-translate-y-1 hover:shadow-md dark:bg-gray-900 dark:border dark:border-gray-800 w-full min-w-0"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
                                                {['▦', '◈', '▤', '◇'][index % 4]}
                                            </div>

                                            <span className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                                ↗
                                            </span>
                                        </div>

                                        <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {project.name}
                                        </h3>

                                        <p className="mt-2 min-h-10 text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                                            {project.description || 'No description provided.'}
                                        </p>

                                        <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 dark:border-gray-800">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                Open project
                                            </span>

                                            <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                                                View details →
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage
