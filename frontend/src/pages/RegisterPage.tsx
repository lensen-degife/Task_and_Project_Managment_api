import { useState, useEffect, useRef } from 'react'
import { registerUser } from '../services/authService'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { BrandingPanel } from '../components/BrandingPanel'

function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const navigate = useNavigate()
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current)
            }
        }
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        const trimmedName = name.trim()
        const trimmedEmail = email.trim()

        // Required field validation
        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            setError('Please fill in all required fields.')
            return
        }

        // Name validation
        if (trimmedName.length < 2) {
            setError('Name must be at least 2 characters long.')
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
            setError('Please enter a valid email address.')
            return
        }

        // Password length validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)

        try {
            const response = await registerUser({
                name: trimmedName,
                email: trimmedEmail,
                password
            })

            const payload = response.data ?? response
            const token = payload?.token

            if (token) {
                sessionStorage.setItem('accessToken', token)
                setSuccess('Account created successfully! Redirecting to dashboard...')
                redirectTimeoutRef.current = setTimeout(() => {
                    navigate('/dashboard')
                }, 1500)
            } else {
                setSuccess('Account created successfully! Redirecting to login...')
                redirectTimeoutRef.current = setTimeout(() => {
                    navigate('/login')
                }, 1500)
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const backendMessage = e.response?.data?.message
                if (typeof backendMessage === 'string' && backendMessage.trim()) {
                    setError(backendMessage)
                } else if (e.response?.status === 409) {
                    setError('An account with this email already exists.')
                } else if (e.response?.status === 400) {
                    setError('Invalid registration data. Please verify your inputs.')
                } else {
                    setError('Registration failed. Please try again.')
                }
            } else if (e instanceof Error) {
                setError(e.message)
            } else {
                setError('Registration failed. Please try again.')
            }
            console.error('Registration failed:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="sub_body">
            <div className="sub_sub_body">

                <BrandingPanel />
                <div className="flex items-center justify-center px-2 py-8 sm:px-8 lg:px-14">

                    <div className="w-full max-w-md mx-auto">

                        <div className="mb-6 sm:mb-8 text-left">
                            <h2 className="title">
                                Create an account
                            </h2>

                            <p className="title_sub">
                                Enter your details below to get started with your workspace.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">

                            {/* FULL NAME */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="field">
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="auth-input"
                                />
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="field"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                    className="auth-input"
                                />
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="field"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password (min. 6 characters)"
                                        required
                                        className="auth-input"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="field"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        required
                                        className="auth-input"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="toggle" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="error">
                                    {error}
                                </div>
                            )}

                            {/* SUCCESS */}
                            {success && (
                                <div className="rounded-lg bg-green-50 p-3 text-xs sm:text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            {/* REGISTER BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="main_btn"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>

                        {/* NAVIGATION TO LOGIN */}
                        <div className="mt-4 sm:mt-5">
                            <Link
                                to="/login"
                                className="sub_btn"
                            >
                                Already have an account? Log in
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default RegisterPage
