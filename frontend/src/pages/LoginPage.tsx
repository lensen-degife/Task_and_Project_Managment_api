import { useState } from 'react'
import { loginUser } from '../services/authService'
import {useNavigate} from 'react-router-dom'

function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await loginUser({ email, password })

            const payload = response.data ?? response
            const token = payload.token
            if (!token) {
                throw new Error('Access token was not returned')
            }
            sessionStorage.setItem('accessToken', token)
            navigate('/dashboard')
            alert(`Welcome, ${payload.user.name}!`)


        } catch (e) {
            setError('Login failed, please check your credentials');
            console.error('login response fields:', e)
        } finally {
            setLoading(false);
        }

    }
    return (
        <div className="login-container">
            <form className='login-form' onSubmit={handleSubmit}>
                <h1>Welcome back</h1>
                <p>sign in to your project management account.</p>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <label>Password</label>
                <input
                    id='password'
                    type="password"
                    placeholder='enter your password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <button>{loading ? "Signing in..." : "Sign in"}</button>
            </form>
        </div>
    )


}

export default LoginPage;