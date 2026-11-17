import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjectById, updateProject, deleteProject } from '../services/projectService'
import { type TaskPagination, type Task, type TaskStatus, type TaskPriority } from '../types/task'
import {
    getProjectTasks,
    createTask,
    updateTask,
    deleteTask
} from '../services/taskService'
import {
    getProjectMembers,
    addProjectMember,
    updateMemberRole,
    removeProjectMember
} from '../services/memberService'
import type { Project } from '../types/project'
import type { ProjectMember, ProjectRole } from '../types/projectMember'
import {
    getTaskComments,
    createTaskComment,
    updateTaskComment,
    deleteTaskComment,
    type TaskComment
} from '../services/commentService'
import { HeaderNav } from '../components/HeaderNav'
import { AppSidebar } from '../components/AppSidebar'
import { getStoredUser } from '../services/authService'
import axios from 'axios'

type Tab = 'overview' | 'tasks' | 'members'

function ProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()

    const currentUser = getStoredUser()

    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [members, setMembers] = useState<ProjectMember[]>([])

    // Search query for tasks
    const [taskSearch, setTaskSearch] = useState('')

    // Project edit state
    const [showEditProjectModal, setShowEditProjectModal] = useState(false)
    const [editProjectName, setEditProjectName] = useState('')
    const [editProjectDescription, setEditProjectDescription] = useState('')
    const [savingProject, setSavingProject] = useState(false)
    const [editProjectError, setEditProjectError] = useState('')

    // Project delete state
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)
    const [deletingProject, setDeletingProject] = useState(false)

    // Task creation state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
    const [assigneeId, setAssigneeId] = useState<string>('')
    const [dueDate, setDueDate] = useState<string>('')
    const [creatingTask, setCreatingTask] = useState(false)

    // Member addition state
    const [newMemberEmail, setNewMemberEmail] = useState('')
    const [addingMember, setAddingMember] = useState(false)

    const [loading, setLoading] = useState(true)
    const [loadingTasks, setLoadingTasks] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Task editing state
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [savingTask, setSavingTask] = useState(false)
    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as TaskPriority,
        assigneeId: '',
        dueDate: ''
    })

    // Pagination
    const [pagination, setPagination] = useState<TaskPagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assigneeId: ''
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [taskRefresh, setTaskRefresh] = useState(0)

    // Task selection & comments
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [comments, setComments] = useState<TaskComment[]>([])
    const [commentContent, setCommentContent] = useState('')
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [submittingComment, setSubmittingComment] = useState(false)
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editedCommentContent, setEditedCommentContent] = useState('')

    const inputClass =
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20'

    const buttonClass =
        'rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'

    // Determine user RBAC
    const currentUserRole: ProjectRole = useMemo(() => {
        if (!currentUser) return 'MEMBER'
        if (project?.ownerId === currentUser.id) return 'OWNER'
        const memberRecord = members.find(
            m => m.userId === currentUser.id || m.user?.id === currentUser.id
        )
        return memberRecord?.role || 'MEMBER'
    }, [currentUser, project, members])

    const isOwner = currentUserRole === 'OWNER'
    const canManageTasks = isOwner || currentUserRole === 'ADMIN'

    // Load project and members
    useEffect(() => {
        if (!projectId) return

        const loadInitialData = async () => {
            try {
                setLoading(true)
                setError('')

                const projectData = await getProjectById(projectId)
                setProject(projectData)
                setEditProjectName(projectData.name)
                setEditProjectDescription(projectData.description || '')

                if (projectData.members && projectData.members.length > 0) {
                    setMembers(projectData.members)
                } else {
                    const memberData = await getProjectMembers(projectId)
                    setMembers(memberData)
                }
            } catch (err: unknown) {
                console.error(err)
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to load project details.')
                } else {
                    setError('Failed to load project details.')
                }
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [projectId])

    // Load filtered tasks
    useEffect(() => {
        if (!projectId) return

        const loadFilteredTasks = async () => {
            try {
                setLoadingTasks(true)

                const result = await getProjectTasks(projectId, {
                    status: (filters.status as TaskStatus) || undefined,
                    priority: (filters.priority as TaskPriority) || undefined,
                    assigneeId: filters.assigneeId || undefined,
                    page: currentPage,
                    limit: 10
                })

                setTasks(result.tasks)
                setPagination(result.pagination)
            } catch (err: unknown) {
                console.error(err)
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to load tasks.')
                } else {
                    setError('Failed to load tasks.')
                }
            } finally {
                setLoadingTasks(false)
            }
        }

        loadFilteredTasks()
    }, [projectId, filters, currentPage, taskRefresh])

    // Load comments for selected task
    const selectedTaskId = selectedTask?.id
    useEffect(() => {
        if (!projectId || !selectedTaskId) return

        let isMounted = true
        const loadComments = async () => {
            try {
                setCommentsLoading(true)
                const result = await getTaskComments(projectId, selectedTaskId)
                if (isMounted) {
                    setComments(result || [])
                }
            } catch (err) {
                console.error(err)
                if (isMounted) {
                    setError('Failed to load comments.')
                }
            } finally {
                if (isMounted) {
                    setCommentsLoading(false)
                }
            }
        }

        loadComments()
        return () => {
            isMounted = false
        }
    }, [projectId, selectedTaskId])

    // Project Actions: Edit Project
    const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!projectId || !project) return

        const trimmed = editProjectName.trim()
        if (!trimmed) {
            setEditProjectError('Project name cannot be empty.')
            return
        }

        try {
            setSavingProject(true)
            setEditProjectError('')

            await updateProject(projectId, {
                name: trimmed,
                description: editProjectDescription.trim() || null,
                version: project.version ?? 0
            })

            setProject(prev =>
                prev
                    ? {
                        ...prev,
                        name: trimmed,
                        description: editProjectDescription.trim() || null,
                        version: (prev.version ?? 0) + 1
                    }
                    : null
            )

            setMessage('Project details updated successfully.')
            setShowEditProjectModal(false)
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    setEditProjectError('This project was modified by another user. Please refresh and try again.')
                } else {
                    setEditProjectError(err.response?.data?.message || 'Failed to update project.')
                }
            } else {
                setEditProjectError('Failed to update project.')
            }
        } finally {
            setSavingProject(false)
        }
    }

    // Project Actions: Delete Project
    const handleDeleteProject = async () => {
        if (!projectId) return

        try {
            setDeletingProject(true)
            await deleteProject(projectId)
            navigate('/projects')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to delete project.')
            } else {
                setError('Failed to delete project.')
            }
            setShowDeleteProjectModal(false)
        } finally {
            setDeletingProject(false)
        }
    }

    // Task Actions: Create Task
    const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!projectId || !title.trim()) return

        try {
            setCreatingTask(true)
            await createTask(projectId, {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                assigneeId: assigneeId || null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            })

            setTitle('')
            setDescription('')
            setPriority('MEDIUM')
            setAssigneeId('')
            setDueDate('')
            setMessage('Task created successfully.')
            setError('')
            setTaskRefresh(prev => prev + 1)
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to create task.')
            } else {
                setError('Failed to create task.')
            }
        } finally {
            setCreatingTask(false)
        }
    }

    // Task Actions: Status Change
    const handleStatusChange = async (task: Task, status: TaskStatus) => {
        if (!projectId) return

        try {
            const updated = await updateTask(projectId, task.id, {
                status,
                version: task.version
            })

            setTasks(prev =>
                prev.map(item => (item.id === updated.id ? updated : item))
            )

            if (selectedTask?.id === updated.id) {
                setSelectedTask(updated)
            }

            setMessage('Task status updated.')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    setError('Task was modified by another user. Refreshing task list...')
                    setTaskRefresh(prev => prev + 1)
                } else {
                    setError(err.response?.data?.message || 'Failed to update task status.')
                }
            } else {
                setError('Failed to update task.')
            }
        }
    }

    // Task Actions: Delete Task
    const handleDeleteTask = async (taskId: string) => {
        if (!projectId || !window.confirm('Are you sure you want to delete this task?')) return

        try {
            await deleteTask(projectId, taskId)

            setTasks(prev => prev.filter(t => t.id !== taskId))
            if (selectedTask?.id === taskId) {
                setSelectedTask(null)
            }

            setMessage('Task deleted successfully.')
            setError('')
            setTaskRefresh(prev => prev + 1)
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to delete task.')
            } else {
                setError('Failed to delete task.')
            }
        }
    }

    // Task Actions: Start Edit
    const startEditingTask = (task: Task) => {
        setEditingTaskId(task.id)
        setEditTaskForm({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            assigneeId: task.assigneeId ?? '',
            dueDate: task.dueDate?.slice(0, 10) ?? ''
        })
    }

    // Task Actions: Save Edit
    const saveTaskChanges = async (task: Task) => {
        if (!projectId) return

        try {
            setSavingTask(true)
            const updated = await updateTask(projectId, task.id, {
                title: editTaskForm.title.trim(),
                description: editTaskForm.description.trim() || null,
                priority: editTaskForm.priority,
                assigneeId: editTaskForm.assigneeId || null,
                dueDate: editTaskForm.dueDate ? new Date(editTaskForm.dueDate).toISOString() : null,
                version: task.version
            })

            setTasks(prev =>
                prev.map(item => (item.id === task.id ? updated : item))
            )

            if (selectedTask?.id === task.id) {
                setSelectedTask(updated)
            }

            setEditingTaskId(null)
            setMessage('Task updated successfully.')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    setError('Task was modified concurrently by another user. Refreshing...')
                    setTaskRefresh(prev => prev + 1)
                } else {
                    setError(err.response?.data?.message || 'Could not update task.')
                }
            } else {
                setError('Could not update task.')
            }
        } finally {
            setSavingTask(false)
        }
    }

    // Member Actions: Add Member
    const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!projectId || !newMemberEmail.trim()) return

        try {
            setAddingMember(true)
            const newMember = await addProjectMember(projectId, newMemberEmail.trim())

            setMembers(prev => [...prev, newMember])
            setNewMemberEmail('')
            setMessage('Member added successfully.')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to add member.')
            } else {
                setError('Failed to add member.')
            }
        } finally {
            setAddingMember(false)
        }
    }

    // Member Actions: Role Change
    const handleRoleChange = async (member: ProjectMember, role: ProjectRole) => {
        if (!projectId) return

        try {
            const updated = await updateMemberRole(projectId, member.userId, role)
            setMembers(prev =>
                prev.map(item => (item.userId === updated.userId ? updated : item))
            )
            setMessage('Member role updated.')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to update member role.')
            } else {
                setError('Failed to update member role.')
            }
        }
    }

    // Member Actions: Remove Member
    const handleRemoveMember = async (memberId: string) => {
        if (!projectId || !window.confirm('Are you sure you want to remove this member from the project?')) return

        try {
            await removeProjectMember(projectId, memberId)
            setMembers(prev => prev.filter(m => m.userId !== memberId && m.id !== memberId))
            setMessage('Member removed successfully.')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to remove member.')
            } else {
                setError('Failed to remove member.')
            }
        }
    }

    // Comment Actions: Create
    const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!projectId || !selectedTask || !commentContent.trim()) return

        try {
            setSubmittingComment(true)
            const newComment = await createTaskComment(
                projectId,
                selectedTask.id,
                commentContent.trim()
            )

            setComments(prev => [...prev, newComment])
            setCommentContent('')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to create comment.')
            } else {
                setError('Failed to create comment.')
            }
        } finally {
            setSubmittingComment(false)
        }
    }

    // Comment Actions: Update
    const handleUpdateComment = async (commentId: string) => {
        if (!projectId || !selectedTask || !editedCommentContent.trim()) return

        try {
            const updated = await updateTaskComment(
                projectId,
                selectedTask.id,
                commentId,
                editedCommentContent.trim()
            )

            setComments(prev =>
                prev.map(c => (c.id === commentId ? updated : c))
            )
            setEditingCommentId(null)
            setEditedCommentContent('')
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to update comment.')
            } else {
                setError('Failed to update comment.')
            }
        }
    }

    // Comment Actions: Delete
    const handleDeleteComment = async (commentId: string) => {
        if (!projectId || !selectedTask) return
        if (!window.confirm('Are you sure you want to delete this comment?')) return

        try {
            await deleteTaskComment(projectId, selectedTask.id, commentId)
            setComments(prev => prev.filter(c => c.id !== commentId))
            setError('')
        } catch (err: unknown) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to delete comment.')
            } else {
                setError('Failed to delete comment.')
            }
        }
    }

    // Client-side search filtering on loaded tasks
    const filteredTasks = useMemo(() => {
        const query = taskSearch.trim().toLowerCase()
        if (!query) return tasks
        return tasks.filter(
            t =>
                t.title.toLowerCase().includes(query) ||
                (t.description || '').toLowerCase().includes(query)
        )
    }, [tasks, taskSearch])

    // Derived statistics
    const completedTasks = tasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const progress =
        pagination.total > 0
            ? Math.round((completedTasks / pagination.total) * 100)
            : 0

    const statusClass = (status: TaskStatus) => {
        switch (status) {
            case 'DONE':
                return 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
            case 'IN_PROGRESS':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            case 'REVIEW':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#edf1fa] dark:bg-gray-950">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading project details...</p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#edf1fa] dark:bg-gray-950 p-6 text-center">
                <p className="text-base text-red-600 dark:text-red-400">{error || 'Project not found or you are not a member.'}</p>
                <Link
                    to="/projects"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                    ← Back to Projects
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex-col bg-[#edf1fa] dark:bg-gray-950 flex transition-colors relative overflow-x-clip">
            {/* SIDEBAR */}
            <AppSidebar />
            <HeaderNav
                searchQuery={taskSearch}
                onSearchChange={setTaskSearch}
                searchPlaceholder={`Search tasks in ${project.name}...`}
            />

            <main className="min-w-0 flex-1 flex flex-col md:ml-64">

                <div className="space-y-5 sm:space-y-6 p-4 sm:p-6 md:p-8 flex-1 max-w-full">
                    {/* BREADCRUMB & HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                                    Dashboard
                                </Link>
                                <span>›</span>
                                <Link to="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                                    Projects
                                </Link>
                                <span>›</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{project.name}</span>
                            </div>

                            <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                                {project.name}
                            </h1>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 wrap-break-word">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => navigate('/projects')}
                                className="rounded-xl border border-gray-200 bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                            >
                                ← All Projects
                            </button>

                            {canManageTasks && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditProjectName(project.name)
                                        setEditProjectDescription(project.description || '')
                                        setEditProjectError('')
                                        setShowEditProjectModal(true)
                                    }}
                                    className="rounded-xl border border-gray-200 bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                                >
                                    ✎ Edit Project
                                </button>
                            )}

                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteProjectModal(true)}
                                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40 transition"
                                >
                                    🗑 Delete Project
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ALERTS */}
                    {message && (
                        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                            <span>{message}</span>
                            <button type="button" onClick={() => setMessage('')} className="font-bold">
                                ✕
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                            <span>{error}</span>
                            <button type="button" onClick={() => setError('')} className="font-bold">
                                ✕
                            </button>
                        </div>
                    )}

                    {/* PROJECT SUMMARY STATS */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {project.name}
                                            </h2>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                                v{project.version ?? 0}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {project.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 max-w-lg">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Project progress</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{progress}%</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                        <div
                                            className="h-full rounded-full bg-orange-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Total tasks</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">In progress</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Team members</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TABS */}
                    <div className="flex gap-4 sm:gap-7 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-0.5">
                        {(['overview', 'tasks', 'members'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`border-b-2 px-1 pb-3 text-sm font-semibold capitalize transition whitespace-nowrap ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300'
                                    }`}
                            >
                                {tab === 'overview' ? 'Overview' : tab === 'tasks' ? `Tasks (${pagination.total})` : `Members (${members.length})`}
                            </button>
                        ))}
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                            <div className="space-y-6 xl:col-span-2">
                                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <h2 className="font-bold text-gray-900 dark:text-white">
                                        About Project
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                                        {project.description || 'No project description has been added yet.'}
                                    </p>
                                </section>

                                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h2 className="font-bold text-gray-900 dark:text-white">
                                            Recent Tasks
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('tasks')}
                                            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            View all tasks →
                                        </button>
                                    </div>

                                    {tasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No tasks created for this project yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {tasks.slice(0, 5).map(task => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => {
                                                        setSelectedTask(task)
                                                        setActiveTab('tasks')
                                                    }}
                                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-4 transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:bg-gray-800"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {task.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                            {task.priority} priority • {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                                                        </p>
                                                    </div>

                                                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(task.status)}`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* RIGHT OVERVIEW COLUMN */}
                            <div className="space-y-6">
                                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <h2 className="font-bold text-gray-900 dark:text-white">
                                        Completion Status
                                    </h2>

                                    <div className="mt-6 flex justify-center">
                                        <div
                                            className="flex h-36 w-36 items-center justify-center rounded-full"
                                            style={{
                                                background: `conic-gradient(#2563eb ${progress}%, #e5e7eb ${progress}% 100%)`
                                            }}
                                        >
                                            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
                                                <span className="text-xs text-gray-400">Completed</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>Completed</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{completedTasks}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>In progress</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{inProgressTasks}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>Team members</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{members.length}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="font-bold text-gray-900 dark:text-white">
                                            Team
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('members')}
                                            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Manage →
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {members.slice(0, 4).map(member => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                        {member.user.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            {/* CREATE TASK SECTION */}
                            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 font-bold text-gray-900 dark:text-white">
                                    Create a New Task
                                </h2>

                                <form onSubmit={handleCreateTask} className="space-y-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Task title (e.g. Design wireframes)"
                                        required
                                        className={inputClass}
                                    />

                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Optional task description and deliverables..."
                                        rows={3}
                                        className={inputClass}
                                    />

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Priority
                                            </label>
                                            <select
                                                value={priority}
                                                onChange={e => setPriority(e.target.value as TaskPriority)}
                                                className={inputClass}
                                            >
                                                <option value="LOW">Low priority</option>
                                                <option value="MEDIUM">Medium priority</option>
                                                <option value="HIGH">High priority</option>
                                                <option value="URGENT">Urgent priority</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Assignee
                                            </label>
                                            <select
                                                value={assigneeId}
                                                onChange={e => setAssigneeId(e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Unassigned</option>
                                                {members.map(member => (
                                                    <option key={member.userId} value={member.userId}>
                                                        {member.user.name} ({member.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={e => setDueDate(e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={creatingTask || !title.trim()}
                                            className={buttonClass}
                                        >
                                            {creatingTask ? 'Creating...' : '+ Add Task'}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* FILTERS SECTION */}
                            <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Filters:
                                </span>

                                <select
                                    value={filters.status}
                                    onChange={e => {
                                        setFilters(f => ({ ...f, status: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                        setFilters(f => ({ ...f, priority: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                        setFilters(f => ({ ...f, assigneeId: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">All assignees</option>
                                    {members.map(member => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.user.name}
                                        </option>
                                    ))}
                                </select>

                                {(filters.status || filters.priority || filters.assigneeId || taskSearch) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilters({ status: '', priority: '', assigneeId: '' })
                                            setTaskSearch('')
                                            setCurrentPage(1)
                                        }}
                                        className="ml-auto text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </section>

                            {/* TASK LIST */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Tasks ({pagination.total})
                                    </h2>
                                    {loadingTasks && (
                                        <span className="text-xs text-gray-400">Updating tasks...</span>
                                    )}
                                </div>

                                {filteredTasks.length === 0 && !loadingTasks ? (
                                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">No tasks found</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {taskSearch
                                                ? `No tasks match search "${taskSearch}".`
                                                : 'Try adjusting your filters or create a new task.'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTasks.map(task => {
                                        const assigneeMember = members.find(m => m.userId === task.assigneeId)
                                        const isAssignedToMe = task.assigneeId === currentUser?.id
                                        const canEditThisTask = canManageTasks || isAssignedToMe

                                        return (
                                            <article
                                                key={task.id}
                                                className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${selectedTask?.id === task.id
                                                    ? 'ring-2 ring-blue-500/50 border-blue-500'
                                                    : 'border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedTask(task)}
                                                                className="text-left text-base font-bold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition"
                                                            >
                                                                {task.title}
                                                            </button>
                                                            <span className="text-[11px] text-gray-400">
                                                                v{task.version}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                                            {task.description || 'No description provided.'}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                            <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                                                                {task.priority}
                                                            </span>

                                                            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                👤 {assigneeMember ? assigneeMember.user.name : 'Unassigned'}
                                                            </span>

                                                            {task.dueDate && (
                                                                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                    📅 {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <select
                                                            value={task.status}
                                                            onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                                                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                        >
                                                            <option value="TODO">To do</option>
                                                            <option value="IN_PROGRESS">In progress</option>
                                                            <option value="REVIEW">Review</option>
                                                            <option value="DONE">Done</option>
                                                        </select>

                                                        {canEditThisTask && (
                                                            <button
                                                                type="button"
                                                                onClick={() => startEditingTask(task)}
                                                                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}

                                                        {canManageTasks && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTask(task)}
                                                            className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 transition"
                                                        >
                                                            Comments
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* INLINE EDIT FORM */}
                                                {editingTaskId === task.id && (
                                                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                            Editing Task
                                                        </h4>
                                                        <input
                                                            value={editTaskForm.title}
                                                            onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                                                            placeholder="Task title"
                                                            className={inputClass}
                                                        />

                                                        <textarea
                                                            value={editTaskForm.description}
                                                            onChange={e => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                                                            placeholder="Description"
                                                            rows={2}
                                                            className={inputClass}
                                                        />

                                                        <div className="grid gap-3 sm:grid-cols-3">
                                                            <select
                                                                value={editTaskForm.priority}
                                                                onChange={e => setEditTaskForm({ ...editTaskForm, priority: e.target.value as TaskPriority })}
                                                                className={inputClass}
                                                            >
                                                                <option value="LOW">Low</option>
                                                                <option value="MEDIUM">Medium</option>
                                                                <option value="HIGH">High</option>
                                                                <option value="URGENT">Urgent</option>
                                                            </select>

                                                            <select
                                                                value={editTaskForm.assigneeId}
                                                                onChange={e => setEditTaskForm({ ...editTaskForm, assigneeId: e.target.value })}
                                                                className={inputClass}
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
                                                                onChange={e => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                                                                className={inputClass}
                                                            />
                                                        </div>

                                                        <div className="flex gap-2 pt-1">
                                                            <button
                                                                type="button"
                                                                disabled={savingTask || !editTaskForm.title.trim()}
                                                                onClick={() => saveTaskChanges(task)}
                                                                className={buttonClass}
                                                            >
                                                                {savingTask ? 'Saving...' : 'Save Changes'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingTaskId(null)}
                                                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </article>
                                        )
                                    })
                                )}

                                {/* PAGINATION CONTROLS */}
                                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <button
                                        type="button"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        ← Previous
                                    </button>

                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ({pagination.total} total)
                                    </span>

                                    <button
                                        type="button"
                                        disabled={currentPage >= pagination.totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </section>

                            {/* SELECTED TASK & COMMENTS SECTION */}
                            {selectedTask && (
                                <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
                                        <div className="min-w-0 flex-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                Selected Task
                                            </span>
                                            <h3 className="mt-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                                                {selectedTask.title}
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTask(null)
                                                setComments([])
                                            }}
                                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 shrink-0"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>

                                    <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">
                                        {selectedTask.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Status: <strong className="text-gray-800 dark:text-gray-200">{selectedTask.status}</strong></span>
                                        <span>Priority: <strong className="text-gray-800 dark:text-gray-200">{selectedTask.priority}</strong></span>
                                        <span>
                                            Due date: <strong className="text-gray-800 dark:text-gray-200">
                                                {selectedTask.dueDate
                                                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                                                    : 'No due date'}
                                            </strong>
                                        </span>
                                    </div>

                                    {/* COMMENTS */}
                                    <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5">
                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                            Comments ({comments.length})
                                        </h4>

                                        {commentsLoading ? (
                                            <p className="mt-4 text-xs text-gray-400">Loading discussion...</p>
                                        ) : comments.length === 0 ? (
                                            <p className="mt-4 text-xs text-gray-400">No comments yet. Start the conversation!</p>
                                        ) : (
                                            <div className="mt-4 space-y-3">
                                                {comments.map(comment => {
                                                    const isAuthor = comment.authorId === currentUser?.id

                                                    return (
                                                        <div
                                                            key={comment.id}
                                                            className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                                                        >
                                                            <div className="flex flex-wrap justify-between gap-2">
                                                                <strong className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                                    {comment.author?.name || 'Team member'}
                                                                </strong>
                                                                <span className="text-[11px] text-gray-400">
                                                                    {new Date(comment.createdAt).toLocaleString()}
                                                                </span>
                                                            </div>

                                                            {editingCommentId === comment.id ? (
                                                                <div className="mt-3">
                                                                    <textarea
                                                                        value={editedCommentContent}
                                                                        onChange={e => setEditedCommentContent(e.target.value)}
                                                                        className={inputClass}
                                                                        rows={2}
                                                                    />
                                                                    <div className="mt-2 flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleUpdateComment(comment.id)}
                                                                            disabled={!editedCommentContent.trim()}
                                                                            className={buttonClass}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingCommentId(null)}
                                                                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                                                                        {comment.content}
                                                                    </p>

                                                                    {isAuthor && (
                                                                        <div className="mt-3 flex gap-3 text-xs">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setEditingCommentId(comment.id)
                                                                                    setEditedCommentContent(comment.content)
                                                                                }}
                                                                                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                className="font-medium text-red-600 hover:underline dark:text-red-400"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        <form onSubmit={handleCreateComment} className="mt-5 space-y-3">
                                            <textarea
                                                value={commentContent}
                                                onChange={e => setCommentContent(e.target.value)}
                                                placeholder="Write a comment..."
                                                maxLength={2000}
                                                required
                                                rows={2}
                                                className={inputClass}
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment || !commentContent.trim()}
                                                    className={buttonClass}
                                                >
                                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            {canManageTasks && (
                                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <h2 className="mb-4 font-bold text-gray-900 dark:text-white">
                                        Add a Team Member
                                    </h2>

                                    <form onSubmit={handleAddMember} className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            type="email"
                                            value={newMemberEmail}
                                            onChange={e => setNewMemberEmail(e.target.value)}
                                            placeholder="Enter team member's email address..."
                                            required
                                            className={inputClass}
                                        />

                                        <button
                                            type="submit"
                                            disabled={addingMember || !newMemberEmail.trim()}
                                            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                        >
                                            {addingMember ? 'Adding...' : '+ Add Member'}
                                        </button>
                                    </form>
                                </section>
                            )}

                            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-bold text-gray-900 dark:text-white">
                                        Project Members
                                    </h2>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        {members.length} members
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {members.map(member => (
                                        <div
                                            key={member.id}
                                            className="flex flex-wrap items-center justify-between gap-4 py-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                        {member.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {member.user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={member.role}
                                                    disabled={member.role === 'OWNER' || !isOwner}
                                                    onChange={e => handleRoleChange(member, e.target.value as ProjectRole)}
                                                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/40"
                                                >
                                                    <option value="OWNER">Owner</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="MEMBER">Member</option>
                                                </select>

                                                {member.role !== 'OWNER' && canManageTasks && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {members.length === 0 && (
                                        <p className="py-6 text-center text-xs text-gray-400">
                                            No project members found.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* EDIT PROJECT MODAL */}
            {showEditProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Edit Project Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowEditProjectModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveProject} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editProjectName}
                                    onChange={e => setEditProjectName(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                    Description
                                </label>
                                <textarea
                                    value={editProjectDescription}
                                    onChange={e => setEditProjectDescription(e.target.value)}
                                    rows={3}
                                    className={inputClass}
                                />
                            </div>

                            {editProjectError && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {editProjectError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProjectModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProject || !editProjectName.trim()}
                                    className={buttonClass}
                                >
                                    {savingProject ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE PROJECT CONFIRMATION MODAL */}
            {showDeleteProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
                    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                                Delete Project
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowDeleteProjectModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <p>
                                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{project.name}</strong>?
                            </p>
                            <p className="text-xs text-red-500">
                                This action is permanent and will delete all associated tasks, comments, and member associations.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setShowDeleteProjectModal(false)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deletingProject}
                                onClick={handleDeleteProject}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingProject ? 'Deleting...' : 'Yes, Delete Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProjectDetailsPage
