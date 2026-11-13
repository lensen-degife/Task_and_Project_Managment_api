import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import type { Project } from '../types/project';

function ProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!projectId) return;

                const data = await getProjectById(projectId);
                setProject(data);
            } catch (error) {
                setError('Failed to load project details.');
                console.log(error)

            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) return <p>Loading project...</p>;
    if (error) return <p>{error}</p>;
    if (!project) return <p>Project not found.</p>;

    return (
        <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
        </div>
    );
}

export default ProjectDetailsPage;