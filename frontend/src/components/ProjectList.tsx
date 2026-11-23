import ProjectCard from './ProjectCard';
import type { Project } from '../types/project'
import { FolderOpen, Loader2 } from 'lucide-react'

interface ProjectListProps {
    projects: Project[];
    loading: boolean;
    error: string;
    search: string;
}

function ProjectList({
    projects,
    loading,
    error,
    search
}: ProjectListProps) {
    return (
        <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#071030] dark:text-white">
                        All Projects
                    </h2>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Select a project to view its details.
                    </p>
                </div>

                <span className="rounded-full shadow bg-[#99alaf] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl  p-10 text-center text-[#071030] dark:bg-slate-800/40 dark:text-slate-300">
                    <Loader2 className="h-6 w-6 animate-spin text-[#637ef6] dark:text-blue-400" />
                    <p className="text-sm font-medium">Loading projects...</p>
                </div>
            ) : error ? (
                <div className="rounded-2xl bg-red-50 p-5 sm:p-6 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-2xl p-6 sm:p-10 text-center shadow dark:bg-gray-900 dark:border dark:border-gray-800">

                    <div className="mb-3 flex justify-center text-[#637ef6] dark:text-blue-400">
                        <FolderOpen className="h-10 w-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#071030] dark:text-white">
                        {search ? 'No matching projects' : 'No projects yet'}
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {search
                            ? 'Try searching with a different name.'
                            : 'Create your first project to get started.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default ProjectList;
