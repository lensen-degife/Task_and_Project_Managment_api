import api from './api'
import type { Project, createProjectInput } from '../types/project'

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects')

  return response.data.data
}

export const createProject = async (data: createProjectInput): Promise<Project> => {
  const response = await api.post('/projects', data)
  return response.data.data
}