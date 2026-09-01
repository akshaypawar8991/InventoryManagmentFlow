import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [empCode, setEmpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // New self-registrations default to the Employee role.
      // Admin / Manager accounts are still created via the Admin dashboard.
      await api.post('/auth/register', {
        name,
        email,
        password,
        empCode: Number(empCode),
        role: 'Employee',
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
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
          <h2>Create your account</h2>
          <p className="login-sub">Register as an employee to get started</p>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">Account created! Redirecting to sign in...</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              <label htmlFor="empCode">Employee Code</label>
              <input
                id="empCode"
                type="number"
                placeholder="e.g. 1042"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="login-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
