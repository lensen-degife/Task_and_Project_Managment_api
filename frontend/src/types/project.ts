import type { ProjectMember } from './projectMember'
import type { Task } from './task'

export interface Project {
  id: string
  name: string
  description: string | null
  version?: number
  ownerId?: string
  owner?: {
    id: string
    name: string
    email: string
  }
  members?: ProjectMember[]
  tasks?: Task[]
  _count?: {
    members: number
    tasks: number
  }
}

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string | null
  version: number
}

export interface AuditLog {
  id: string
  actorId: string | null
  projectId: string | null
  action: string
  entityType: string
  entityId: string | null
  details: Record<string, unknown> | null
  createdAt: string
  actor?: {
    id: string
    name: string
    email: string
  } | null
}
