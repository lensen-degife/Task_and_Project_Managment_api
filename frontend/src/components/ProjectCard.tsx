
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';
import { FolderKanban, Layers, FileCode2, ArrowUpRight } from 'lucide-react'

interface ProjectCardProps {
    project: Project;
    index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
    const navigate = useNavigate();


    const projectIcons = [FolderKanban, FileCode2, Layers];
    const IconComponent = projectIcons[index % 3];

    return (
        <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group w-full min-w-0 rounded-2xl bg-[#99alaf] p-5 sm:p-6 text-left shadow-md text-[#071030] transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl shadow text-[#637ef6] dark:bg-blue-900/40 dark:text-blue-400">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                </div>

                <span className="rounded-full shadow bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-[#637ef6] dark:bg-blue-900/40 dark:text-blue-300">
                    Project
                </span>
            </div>

            <h3 className="mt-4 sm:mt-5 truncate text-base sm:text-lg font-bold text-[#071030]   transition group-hover:text-[#637ef6] dark:text-white dark:group-hover:text-blue-400">
                {project.name}
            </h3>

            <p className="mt-2 min-h-10 line-clamp-2 wrap-break text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {project.description || 'No description provided.'}
            </p>

            <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 dark:border-gray-800">
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    View details
                </span>

                <ArrowUpRight
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#637ef6] transition-transform duration-200 group-hover:translate-x-1 dark:text-blue-400"
                    strokeWidth={2}
                />
            </div>
        </button>
    );
}

export default ProjectCard;
