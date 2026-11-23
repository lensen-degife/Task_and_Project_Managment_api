import { useState, useEffect, useRef } from 'react'
import type { Project } from '../types/project'
import { getProjects, createProject } from '../services/projectService'
import { AppSidebar } from '../components/AppSidebar'
import { HeaderNav } from '../components/HeaderNav'
import SummaryCard from '../components/SummaryCard';
import ProjectCard from '../components/ProjectCard'
import CreateProjectForm from '../components/CreateProjectForm'

function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)

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
        name: string,
        description: string
    ) => {
        const payload = {
            name: name.trim(),
            description: description.trim()
        };

        let pending = pendingCreateRef.current;

        if (
            !pending ||
            pending.payload.name !== payload.name ||
            pending.payload.description !== payload.description
        ) {
            pending = {
                key: crypto.randomUUID(),
                payload
            };

            pendingCreateRef.current = pending;
        }

        try {
            const result = await createProject(payload, pending.key);

            pendingCreateRef.current = null;

            setProjects(previous => [
                result.project,
                ...previous
            ]);

            setShowCreateForm(false);

        } catch (e) {
            console.error(e);
            throw e;
        }
    };

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
                {showCreateForm && (
                    <CreateProjectForm
                        onSubmit={handleCreateProject}
                        onClose={() => setShowCreateForm(false)}
                    />
                )}

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

                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full sm:w-auto text-center rounded-xl bg-[#071030] px-5 py-2.5 sm:py-3 text-sm font-semibold text-[#f4f2f2] shadow-sm transition hover:bg-[#071030cb] active:scale-95 shrink-0"
                        >
                            + Create Project
                        </button>
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

                            <span className="rounded-full bg-[#99alaf] shadow px-4 py-2 text-sm text-[#071030]">
                                {recentProjects.length} recent projects
                            </span>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl bg-[#99alaf] p-10 text-center text-[#071030]">
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
                        ) : (<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                            {recentProjects.map((project, index) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                />
                            ))}
                        </div>)}
                    </section>

                </div>
            </main>
        </div>
    )
}

export default DashboardPage
