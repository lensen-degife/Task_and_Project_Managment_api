import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { HeaderNav } from '../components/HeaderNav';
import { AppSidebar } from '../components/AppSidebar';

interface Project {
    id: string;
    name: string;
    description: string | null;
}

function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                setProjects(response.data.data);
            } catch (e) {
                console.error(e);
                setError('Failed to load projects. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            (project.description ?? '').toLowerCase().includes(search.toLowerCase())
        );
    }, [projects, search]);

    return (
        <div className="min-h-screen bg-[#edf1fa] dark:bg-gray-950 flex transition-colors relative overflow-x-hidden">
             <AppSidebar />
            <main className="min-w-0 flex-1 flex flex-col md:ml-64">
                <HeaderNav
                    searchQuery={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search..."
                />
                <div className="space-y-6 sm:space-y-7 p-4 sm:p-6 md:p-8 flex-1 max-w-full">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Dashboard <span className="mx-1 sm:mx-2">›</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">Projects</span>
                        </p>

                        <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    My Projects
                                </h1>
                                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Manage and track all your projects in one place.
                                </p>
                            </div>

                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 shrink-0"
                            >
                                + Create Project
                            </Link>
                        </div>
                    </div>

                    {/* SUMMARY CARDS: 1 col on mobile, 2 on tablet, 3 on desktop */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                            <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {projects.length}
                            </h2>
                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                All your projects
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Projects Found</p>
                            <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {filteredProjects.length}
                            </h2>
                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Based on your search
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800 md:col-span-2 lg:col-span-1">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                            <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                PlanWithMe
                            </h2>
                            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Your project management space
                            </p>
                        </div>
                    </section>

                    {/* PROJECT LIST */}
                    <section className="space-y-4 sm:space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                    All Projects
                                </h2>
                                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Select a project to view its details.
                                </p>
                            </div>

                            <span className="rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 shadow-xs dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl bg-white p-8 sm:p-10 text-center text-sm text-gray-500 shadow-xs dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                                Loading projects...
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl bg-red-50 p-5 sm:p-6 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                {error}
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="rounded-2xl bg-white p-6 sm:p-10 text-center shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">
                                <div className="text-3xl sm:text-4xl mb-3">📁</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                                    {search ? 'No matching projects' : 'No projects yet'}
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    {search
                                        ? 'Try searching with a different name.'
                                        : 'Create your first project to get started.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                {filteredProjects.map((project, index) => (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="group rounded-2xl bg-white p-5 sm:p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-lg text-left w-full min-w-0 dark:bg-gray-900 dark:border dark:border-gray-800"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
                                                {['▦', '◈', '◇'][index % 3]}
                                            </div>

                                            <span className="rounded-full bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                                                Project
                                            </span>
                                        </div>

                                        <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-bold text-gray-900 dark:text-white transition group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                            {project.name}
                                        </h3>

                                        <p className="mt-2 min-h-10 text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 wrap-break">
                                            {project.description || 'No description provided.'}
                                        </p>

                                        <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 dark:border-gray-800">
                                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                                View details
                                            </span>

                                            <span className="text-base sm:text-lg text-blue-600 dark:text-blue-400 transition group-hover:translate-x-1">
                                                →
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
    );
}

export default ProjectsPage;
