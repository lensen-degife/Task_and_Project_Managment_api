export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data?: AuthUser
  token?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser
  }
}
