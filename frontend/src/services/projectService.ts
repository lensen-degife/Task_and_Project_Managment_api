import api from './api'
import type { Project, CreateProjectInput } from '../types/project'

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
  });

  return {
    project: response.data.data,
    replayed: response.headers['idempotency-replayed'] === 'true'
  };
};