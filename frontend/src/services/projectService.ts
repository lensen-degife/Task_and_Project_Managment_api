import api from './api'
import type { Project, CreateProjectInput, UpdateProjectInput, AuditLog } from '../types/project'

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects')
  return response.data.data
}

export const createProject = async (
  data: CreateProjectInput,
  idempotencyKey: string
) => {
  const response = await api.post('/projects', data, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  })

  return {
    project: response.data.data,
    replayed: response.headers['idempotency-replayed'] === 'true'
  }
}

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`)
  return response.data.data
}

export const updateProject = async (
  projectId: string,
  data: UpdateProjectInput
): Promise<Project | void> => {
  const response = await api.patch(`/projects/${projectId}`, data)
  return response.data.data
}

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`)
}

export const getProjectAuditLogs = async (
  projectId: string,
  page = 1,
  limit = 10
): Promise<{ auditLogs: AuditLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
  const response = await api.get(`/projects/${projectId}/audit-logs`, {
    params: { page, limit }
  })
  return response.data.data
}
