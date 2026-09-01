import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function ForgotPassword() {
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setInfo('A reset code has been sent to your email.')
      setStep('reset')
    } catch (err) {
      setError(err.response?.data || 'Could not find an account with that email')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      setInfo('Password reset successfully. Redirecting to sign in...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data || 'Invalid or expired code')
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
          {step === 'request' ? (
            <>
              <h2>Reset your password</h2>
              <p className="login-sub">Enter your email and we'll send you a reset code</p>

              {error && <div className="login-error">{error}</div>}
              {info && <div className="login-success">{info}</div>}

              <form onSubmit={handleRequestCode}>
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

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Enter reset code</h2>
              <p className="login-sub">Check your email for the code we sent to {email}</p>

              {error && <div className="login-error">{error}</div>}
              {info && <div className="login-success">{info}</div>}

              <form onSubmit={handleResetPassword}>
                <div className="field">
                  <label htmlFor="otp">Reset Code</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>

              <p className="login-footer">
                <button type="button" className="link-btn" onClick={() => setStep('request')}>
                  Didn't get a code? Try again
                </button>
              </p>
            </>
          )}

          <p className="login-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
