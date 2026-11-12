import { useState } from 'react'
import api from '../services/api'

function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await api.post('/auth/login', { email, password })

            const payload = response.data.data ?? response.data
            console.log('login response fields:', Object.keys(payload))
           

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
                {error &&  <p className="error-message">{error}</p>}
                <button>{loading? "Signing in...":"Sign in"}</button>
            </form>
        </div>
    )


}

export default LoginPage;