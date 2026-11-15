import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import { type TaskPagination } from '../types/task'
import {
    getProjectTasks,
    createTask,
    updateTask,
    deleteTask
} from '../services/taskService';

import {
    getProjectMembers,
    addProjectMember,
    updateMemberRole,
    removeProjectMember
} from '../services/memberService';

import type { Project } from '../types/project';
import type {
    Task,
    TaskStatus,
    TaskPriority
} from '../types/task';
import type {
    ProjectMember,
    ProjectRole
} from '../types/projectMember';

function ProjectDetailsPage() {

    const { projectId } = useParams<{ projectId: string }>();

    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as TaskPriority,
        assigneeId: '',
        dueDate: ''
    });

    const [pagination, setPagination] = useState<TaskPagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assigneeId: ''
    });

    const [currentPage, setCurrentPage] = useState(1);

    const [loadingTasks, setLoadingTasks] = useState(false);

    const [taskRefresh, setTaskRefresh] = useState(0);

    useEffect(() => {
        if (!projectId) return;
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError('');
                const projectData = await getProjectById(projectId)
                setProject(projectData);
                if (projectData.members) {
                    setMembers(projectData.members)
                } else {
                    const memberData = await getProjectMembers(projectId);
                    setMembers(memberData)
                }


            } catch (e) {
                console.error(e);
                setError('Failed to load project details.')
            } finally {
                setLoading(false);
            }

        }
        loadInitialData();
    }, [projectId])

    useEffect(() => {
        if (!projectId) return;

        const loadFilteredTasks = async () => {
            try {
                setLoadingTasks(true);
                const result = await getProjectTasks(projectId, {
                    status: filters.status as TaskStatus || undefined,
                    priority: filters.priority as TaskPriority || undefined,
                    assigneeId: filters.assigneeId || undefined,
                    page: currentPage,
                    limit: 10
                });
                setTasks(result.tasks);
                setPagination(result.pagination);
            } catch (err) {
                console.error(err);
                setError('Failed to load tasks');
            } finally {
                setLoadingTasks(false);
            }
        };

        loadFilteredTasks();
    }, [projectId, filters, currentPage, taskRefresh]);

    const handleCreateTask = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!projectId || !title.trim()) return;

        try {
            const newTask = await createTask(projectId, {
                title,
                description,
                priority
            });

            setTasks((previous) => [...previous, newTask]);

            setTitle('');
            setDescription('');
            setPriority('MEDIUM');
            setMessage('Task created successfully.');
            setTaskRefresh(previous => previous + 1);
            setError('')
        } catch {
            setError('Failed to create task.');
        }
    };

    const handleStatusChange = async (
        task: Task,
        status: TaskStatus
    ) => {
        if (!projectId) return;

        try {
            const updatedTask = await updateTask(
                projectId,
                task.id,
                {
                    status,
                    version: task.version
                }
            );

            setTasks((previous) =>
                previous.map((item) =>
                    item.id === updatedTask.id
                        ? updatedTask
                        : item
                )
            );
            setMessage('Task status updated.');
        } catch {
            setError(
                'Failed to update task. It may have been modified by another user. Refresh and try again.'
            );
        }
    };
    const handleDeleteTask = async (taskId: string) => {
        if (!projectId) return;

        if (!window.confirm('Delete this task?')) return;

        try {
            await deleteTask(projectId, taskId);

            setTasks((previous) =>
                previous.filter((task) => task.id !== taskId)
            );

            setMessage('Task deleted successfully.');
            setTaskRefresh(previous => previous + 1);
            setError('');
        } catch {
            setError('Failed to delete task.');
        }
    };

    const handleAddMember = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!projectId || !newMemberEmail.trim()) return;

        try {
            const member = await addProjectMember(
                projectId,
                newMemberEmail.trim()
            );

            setMembers((previous) => [...previous, member]);
            setNewMemberEmail('');

            setMessage('Member added successfully.');
        } catch {
            setError('Failed to add member.');
        }
    };
    const handleRoleChange = async (
        member: ProjectMember,
        role: ProjectRole
    ) => {
        if (!projectId) return;

        try {
            const updatedMember = await updateMemberRole(
                projectId,
                member.userId,
                role
            );

            setMembers((previous) =>
                previous.map((item) =>
                    item.userId === updatedMember.userId
                        ? updatedMember
                        : item
                )
            );

            setMessage('Member role updated.');
        } catch {
            setError('Failed to update member role.');
        }
    };
    const handleRemoveMember = async (memberId: string) => {
        if (!projectId) return;

        if (!window.confirm('Remove this member?')) return;

        try {
            await removeProjectMember(projectId, memberId);

            setMembers((previous) =>
                previous.filter(
                    (member) => member.userId !== memberId
                )
            );

            setMessage('Member removed successfully.');
        } catch {
            setError('Failed to remove member.');
        }
    };

    const startEditingTask = (task: Task) => {
        setEditingTaskId(task.id);

        setEditTaskForm({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            assigneeId: task.assigneeId ?? '',
            dueDate: task.dueDate?.slice(0, 10) ?? ''
        });
    };

    const saveTaskChanges = async (task: Task) => {
        try {
            const updatedTask = await updateTask(projectId!, task.id, {
                title: editTaskForm.title,
                description: editTaskForm.description,
                priority: editTaskForm.priority,
                assigneeId: editTaskForm.assigneeId || null,
                dueDate: editTaskForm.dueDate || null,
                version: task.version
            });

            setTasks(previous =>
                previous.map(item =>
                    item.id === task.id ? updatedTask : item
                )
            );

            setEditingTaskId(null);
            setError('');
        } catch (e) {
            console.log(e);
            setError('Could not update task. It may have been changed by someone else. Refresh and try again.');
        }
    };

    if (loading) {
        return <p className="p-6">Loading project...</p>;
    }

    if (error && !project) {
        return <p className="p-6 text-red-600">{error}</p>;
    }

    if (!project) {
        return <p className="p-6">Project not found.</p>;
    }

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">

            <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:underline"
            >
                ← Back to Dashboard
            </button>

            {message && (
                <p className="text-green-600">{message}</p>
            )}

            {error && (
                <p className="text-red-600">{error}</p>
            )}

            <section className="border rounded-xl p-6">
                <h1 className="text-3xl font-bold">
                    {project.name}
                </h1>

                <p className="text-gray-500 mt-2">
                    {project.description || 'No description provided.'}
                </p>
            </section>

            <div className="flex flex-wrap gap-3">

                <select
                    value={filters.status}
                    onChange={e => {
                        setFilters({ ...filters, status: e.target.value });
                        setCurrentPage(1);
                    }}
                    className="rounded border p-2"
                >
                    <option value="">All statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={e => {
                        setFilters({ ...filters, priority: e.target.value });
                        setCurrentPage(1);
                    }}
                    className="rounded border p-2"
                >
                    <option value="">All priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>

                <select
                    value={filters.assigneeId}
                    onChange={e => {
                        setFilters({ ...filters, assigneeId: e.target.value });
                        setCurrentPage(1);
                    }}
                    className="rounded border p-2"
                >
                    <option value="">All members</option>

                    {members.map(member => (
                        <option key={member.userId} value={member.userId}>
                            {member.user.name}
                        </option>
                    ))}
                </select>

            </div>

            <section className="space-y-4">
                {loadingTasks && <p>Loading tasks...</p>}
                <h2 className="text-2xl font-semibold">
                    Tasks ({pagination.total})
                </h2>


                <form
                    onSubmit={handleCreateTask}
                    className="border rounded-xl p-4 space-y-3"
                >
                    <h3 className="font-semibold">Create a task</h3>

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title"
                        required
                        className="w-full border rounded-lg p-2"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Task description"
                        className="w-full border rounded-lg p-2"
                    />


                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value as TaskPriority)
                        }
                        className="border rounded-lg p-2"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Create Task
                    </button>
                </form>

                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <p className="text-gray-500">No tasks yet.</p>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="border rounded-xl p-4 flex flex-wrap justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-semibold">
                                        {task.title}
                                    </h3>

                                    <button
                                        onClick={() => startEditingTask(task)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>

                                    <p className="text-sm text-gray-500">
                                        {task.description}
                                    </p>

                                    <p className="text-sm mt-2">
                                        Priority: {task.priority}
                                    </p>
                                    <span>
                                        Assignee: {members.find(m => m.userId === task.assigneeId)?.user.name || 'Unassigneed'}
                                    </span>
                                    {task.dueDate && (
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                                {editingTaskId === task.id && (
                                    <div className="mt-4 space-y-3 rounded-lg border p-4">

                                        <input
                                            type="text"
                                            value={editTaskForm.title}
                                            onChange={e =>
                                                setEditTaskForm({
                                                    ...editTaskForm,
                                                    title: e.target.value
                                                })
                                            }
                                            placeholder="Task title"
                                            className="w-full rounded border p-2"
                                        />

                                        <textarea
                                            value={editTaskForm.description}
                                            onChange={e =>
                                                setEditTaskForm({
                                                    ...editTaskForm,
                                                    description: e.target.value
                                                })
                                            }
                                            placeholder="Description"
                                            className="w-full rounded border p-2"
                                        />

                                        <select
                                            value={editTaskForm.priority}
                                            onChange={e =>
                                                setEditTaskForm({
                                                    ...editTaskForm,
                                                    priority: e.target.value as TaskPriority
                                                })
                                            }
                                            className="w-full rounded border p-2"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>

                                        <select
                                            value={editTaskForm.assigneeId}
                                            onChange={e =>
                                                setEditTaskForm({
                                                    ...editTaskForm,
                                                    assigneeId: e.target.value
                                                })
                                            }
                                            className="w-full rounded border p-2"
                                        >
                                            <option value="">Unassigned</option>

                                            {members.map(member => (
                                                <option key={member.userId} value={member.userId}>
                                                    {member.user.name}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="date"
                                            value={editTaskForm.dueDate}
                                            onChange={e =>
                                                setEditTaskForm({
                                                    ...editTaskForm,
                                                    dueDate: e.target.value
                                                })
                                            }
                                            className="w-full rounded border p-2"
                                        />

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => saveTaskChanges(task)}
                                                className="rounded bg-blue-600 px-4 py-2 text-white"
                                            >
                                                Save Changes
                                            </button>

                                            <button
                                                onClick={() => setEditingTaskId(null)}
                                                className="rounded border px-4 py-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <select
                                        value={task.status}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                task,
                                                e.target.value as TaskStatus
                                            )
                                        }
                                        className="border rounded-lg p-2"
                                    >
                                        <option value="TODO">To do</option>
                                        <option value="IN_PROGRESS">In progress</option>
                                        <option value="REVIEW">Review</option>
                                        <option value="DONE">Done</option>
                                    </select>

                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
            <div className="mt-5 flex items-center justify-between">

                <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(page => page - 1)}
                    className="rounded border px-4 py-2 disabled:opacity-40"
                >
                    Previous
                </button>

                <span>
                    Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage(page => page + 1)}
                    className="rounded border px-4 py-2 disabled:opacity-40"
                >
                    Next
                </button>

            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Members ({members.length})
                </h2>

                <form
                    onSubmit={handleAddMember}
                    className="border rounded-xl p-4 flex flex-wrap gap-3"
                >
                    <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter user ID"
                        required
                        className="flex-1 min-w-0 border rounded-lg p-2"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Add Member
                    </button>
                </form>

                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="border rounded-xl p-4 flex flex-wrap justify-between gap-3"
                        >
                            <div>
                                <h3 className="font-semibold">
                                    {member.user.name}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {member.user.email}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={member.role}
                                    disabled={member.role === 'OWNER'}
                                    onChange={(e) =>
                                        handleRoleChange(
                                            member,
                                            e.target.value as ProjectRole
                                        )
                                    }
                                    className="border rounded-lg p-2"
                                >
                                    <option value="OWNER">Owner</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MEMBER">Member</option>
                                </select>

                                {member.role !== 'OWNER' && (
                                    <button
                                        onClick={() =>
                                            handleRemoveMember(member.userId)
                                        }
                                        className="text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default ProjectDetailsPage;
