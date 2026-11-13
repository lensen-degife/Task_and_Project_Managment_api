export interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface createProjectInput {
  name: string,
  description?: string
}