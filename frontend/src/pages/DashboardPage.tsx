
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Project } from '../types/project'
import { getProjects, createProject } from '../services/projectService'
import type { FormEvent } from 'react'
import { AppSidebar } from '../components/AppSidebar'
import { HeaderNav } from '../components/HeaderNav'
import SummaryCard from '../components/SummaryCard';

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

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase())
    )

    const recentProjects = [...filteredProjects]
        .sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt).getTime();

            return dateB - dateA;
        })
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-[#edf1fa] dark:bg-gray-950 flex transition-colors relative overflow-x-hidden">
            <AppSidebar />
            {/* MAIN CONTENT */}
            <main className="min-w-0 flex-1 flex flex-col md:ml-64">

                <HeaderNav
                    searchQuery={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search..."
                />

                {/* DASHBOARD CONTENT */}
                <div className="p-5 sm:p-8 space-y-7">

                    {/* PAGE TITLE */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                Dashboard / Overview
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-gray-900">
                                Project Dashboard
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage and track all your projects in one place.
                            </p>
                        </div>

                        <Link
                            to="/dashboard"
                            className="w-full sm:w-auto text-center rounded-xl bg-[#071030] px-5 py-2.5 sm:py-3 text-sm font-semibold text-[#f4f2f2] shadow-sm transition hover:bg-[#071030cb] active:scale-95 shrink-0"
                        >
                            + Create Project
                        </Link>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

                        <SummaryCard
                            label="Total Projects"
                            value={projects.length}
                            description="All your projects"
                        />
                        <SummaryCard
                            label="Projects Found"
                            value={filteredProjects.length}
                            description="Based on your search"
                        />
                        <SummaryCard
                            label="Workspace"
                            value="PlanWithMe"
                            description="Your project management space"
                        />
                    </section>

                    {/* CREATE PROJECT FORM */}
                    {showCreateForm && (
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-semibold">
                                    Create a Project
                                </h2>

                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateProject}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Project Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter project name"
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe your project"
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {createError && (
                                    <p className="text-sm text-red-600">
                                        {createError}
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create Project'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* PROJECTS */}
                    <section className="space-y-5">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Recent
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    projects
                                </p>
                            </div>

                            <span className="rounded-full bg-white px-4 py-2 text-sm text-gray-500">
                                {recentProjects.length} recent projects
                            </span>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
                                Loading projects...
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                                <div className="text-4xl mb-3">▤</div>

                                <h3 className="font-semibold text-gray-800">
                                    {search
                                        ? 'No matching projects'
                                        : 'No projects yet'}
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    {search
                                        ? 'Try another search.'
                                        : 'Create your first project to get started.'}
                                </p>

                                {!search && (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Create your first project
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                                {recentProjects.map((project, index) => (
                                    <button
                                        key={project.id}
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="group rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                                                {['▦', '◈', '▤', '◇'][index % 4]}
                                            </div>

                                            <span className="text-gray-400 group-hover:text-blue-600">
                                                ↗
                                            </span>
                                        </div>

                                        <h3 className="mt-5 text-lg font-semibold text-gray-900">
                                            {project.name}
                                        </h3>

                                        <p className="mt-2 min-h-10 text-sm leading-relaxed text-gray-500">
                                            {project.description || 'No description provided.'}
                                        </p>

                                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                            <span className="text-xs text-gray-400">
                                                Open project
                                            </span>

                                            <span className="text-sm font-medium text-blue-600">
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
