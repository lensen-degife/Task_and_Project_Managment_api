import { useState } from 'react'
import { loginUser } from '../services/authService'
import { useNavigate, Link } from 'react-router-dom'
import { EyeOff, Eye } from 'lucide-react'
import { BrandingPanel } from '../components/BrandingPanel';

function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setError('');
        try {
            const response = await loginUser({ email, password })

            const payload = response.data ?? response
            const token = payload.token
            if (!token) {
                throw new Error('Access token was not returned')
            }
            sessionStorage.setItem('accessToken', token)
            navigate('/dashboard')


        } catch (e) {
            setError('Login failed, please check your credentials');
            console.error('login response fields:', e)
        } finally {
            setLoading(false);
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
                                Welcome Back!
                            </h2>

                            <p className="title_sub">
                                Enter your credentials to access your workspace.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="field"
                                >
                                    Email<span className="req">*</span>
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
                                    Password<span className="req">*</span>
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="auth-input"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>

                                <div className="mt-2.5 sm:mt-3 text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="forgot"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="error">
                                    {error}
                                </div>
                            )}

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="main_btn"
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>
                        <div className="mt-4 sm:mt-5">
                            <Link
                                to="/register"
                                className="sub_btn"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );


}

export default LoginPage;
