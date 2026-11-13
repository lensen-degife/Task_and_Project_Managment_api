import { useState, useEffect } from 'react'
import type { Project } from '../types/project'
import { getProjects, createProject } from '../services/projectService'
import type { FormEvent } from 'react'

function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('');

    const handleCreateProject = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        try {
            setCreating(true)

            const newProject = await createProject({
                name,
                description,
            })

            setProjects((previousProjects) => [
                newProject,
                ...previousProjects,
            ])

            setName('')
            setDescription('')
        } catch (error) {
            setCreateError('Failed to create project:')
            console.error(error)
        } finally {
            setCreating(false)
        }
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {

                const result = await getProjects();
                setProjects(result);

            } catch (e) {
                setError('failed to load projects')
                console.log(e);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, [])
    if (loading) {
        return <p>Loading projects...</p>
    }
    if (error) {
        return <p>{error}</p>
    }

    return (
        <div>
            <h1>My Projects</h1>
            {projects.length === 0 ? (
                <p>you have not created any projects yet.</p>
            ) : (projects.map((project) => (
                <div key={project.id}>
                    <h2>{project.name}</h2>
                    <p>{project.description || 'no description'}</p>
                </div>
            )))
            }
            <form onSubmit={handleCreateProject}>
                <h2>Create a project</h2>

                <input
                    type="text"
                    placeholder="Project name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <textarea
                    placeholder="Project description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                <button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Project'}
                </button>
                {createError && <p>{createError}</p>}
            </form>
        </div>


    );

}

export default DashboardPage