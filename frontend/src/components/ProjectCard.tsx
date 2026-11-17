
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';

interface ProjectCardProps {
    project: Project;
    index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group w-full min-w-0 rounded-2xl bg-[#f1fbffe7] p-5 sm:p-6 text-left shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border dark:border-gray-800"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    {['▦', '◈', '◇'][index % 3]}
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    Project
                </span>
            </div>

            <h3 className="mt-4 sm:mt-5 truncate text-base sm:text-lg font-bold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {project.name}
            </h3>

            <p className="mt-2 min-h-10 line-clamp-2 wrap-break text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {project.description || 'No description provided.'}
            </p>

            <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 dark:border-gray-800">
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    View details
                </span>

                <span className="text-base sm:text-lg text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400">
                    →
                </span>
            </div>
        </button>
    );
}

export default ProjectCard;
