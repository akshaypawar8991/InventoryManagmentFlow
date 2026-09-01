import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/auth/login', { email, password })
      const { id, name, role, empCode, token } = response.data

      localStorage.setItem('user', JSON.stringify({ id, name, role, empCode, token, email }))

      if (role === 'Admin') navigate('/admin')
      else if (role === 'Manager') navigate('/manager')
      else navigate('/employee')

    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-grid" aria-hidden="true"></div>
        <div className="brand-content">
          <div className="brand-mark">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="14" height="14" rx="3" fill="#F5A623" />
              <rect x="22" y="4" width="14" height="14" rx="3" fill="#F5A623" opacity="0.5" />
              <rect x="4" y="22" width="14" height="14" rx="3" fill="#F5A623" opacity="0.5" />
              <rect x="22" y="22" width="14" height="14" rx="3" fill="#F5A623" />
            </svg>
            <span>StockFlow</span>
          </div>
          <h1>Inventory, tracked end to end.</h1>
          <p>Request, approve, and audit stock movement across your organization — every action logged, every step visible.</p>
          <div className="brand-stat">
            <span className="stat-dot"></span>
            <span>Live tracking across Employee, Manager and Admin roles</span>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to continue to your dashboard</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="forgot-link">
              <Link to="/reset-password">Forgot password?</Link>
            </div>

            <button type="submit" className="submit-btn">Sign in</button>
          </form>

          <p className="login-footer">Need access? Contact your administrator.</p>
        </div>
      </div>
    </div>
  )
}

export default Login