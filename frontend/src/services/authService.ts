import api from './api'
import type { LoginCredentials, RegisterCredentials, AuthUser } from '../types/auth'

export type { LoginCredentials, RegisterCredentials, AuthUser }

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const registerUser = async (credentials: RegisterCredentials) => {
  const response = await api.post('/auth/register', credentials)
  return response.data
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  // Backend auth.routes.ts defines router.post('/me', authenticate, getMe)
  const response = await api.post('/auth/me')
  return response.data.data
}

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = sessionStorage.getItem('authUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setStoredUser = (user: AuthUser): void => {
  sessionStorage.setItem('authUser', JSON.stringify(user))
}

export const logoutUser = (): void => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('authUser')
}
