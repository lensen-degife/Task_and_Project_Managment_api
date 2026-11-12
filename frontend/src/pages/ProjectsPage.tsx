import { useState, useEffect } from 'react'
import api from '../services/api'

interface Project {
    id: string
    name: string,
    description: string | null
}

function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                setProjects(response.data.data);

            } catch (e) {
                setError("failed to fetch products");
                console.log(e);

            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);
    if (loading) {
        return <p>loading projects...</p>
    }
    if (error) {
        return <p>{error}</p>
    }

    return (
        <div>
            <h1>My Projects</h1>
            {projects.map((project) => (
                <div key={project.id}>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                </div>
            ))}
        </div>

    )
}

export default ProjectsPage;