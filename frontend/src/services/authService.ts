import api from './api'

interface LoginCredentials {
  email: string
  password: string
}

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials)

  return response.data
}