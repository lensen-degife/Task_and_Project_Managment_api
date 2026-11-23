import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { HeaderNav } from '../components/HeaderNav';
import { AppSidebar } from '../components/AppSidebar';
import ProjectList from '../components/ProjectList';

interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string
}

function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

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
        <div className="min-h-screen bg-[#edf1fa] dark:bg-gray-950 flex transition-colors relative overflow-x-clip">
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
                    </div>
                    <ProjectList
                        projects={filteredProjects}
                        loading={loading}
                        error={error}
                        search={search}
                    />

                </div>
            </main>
        </div>
    );
}

export default ProjectsPage;
