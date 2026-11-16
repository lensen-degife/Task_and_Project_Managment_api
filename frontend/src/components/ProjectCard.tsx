interface ProjectCardProps {
    name: string
    status: string
}

function ProjectCard({ name, status }: ProjectCardProps) {
    return (
        <div className="w-full rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 transition hover:shadow-md min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {name}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Status: <span className="font-medium text-gray-700">{status}</span>
            </p>
        </div>
    )
}

export default ProjectCard
