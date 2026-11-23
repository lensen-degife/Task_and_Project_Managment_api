import ProjectCard from './ProjectCard';
import type { Project } from '../types/project'

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

                <span className="rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 shadow-xs dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
            </div>

            {loading ? (
                <div className="rounded-2xl bg-[#99alaf] p-10 text-center text-[#071030]">
                    Loading projects...
                </div>
            ) : error ? (
                <div className="rounded-2xl bg-red-50 p-5 sm:p-6 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 sm:p-10 text-center shadow-xs dark:bg-gray-900 dark:border dark:border-gray-800">

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
