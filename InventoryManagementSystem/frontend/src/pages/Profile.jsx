import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './Profile.css'

function Profile() {
  const user = JSON.parse(localStorage.getItem('user'))

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const response = await api.post('/auth/reset-password', {
        email: user.email,
        newPassword,
      })
      setMessage(response.data.message)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data || 'Failed to update password')
    }
  }

  return (
    <Layout title="Profile" roleLabel={user?.role}>
      <div className="panel profile-panel">
        <h2>Account Details</h2>
        <div className="profile-info">
          <div className="profile-row">
            <span className="profile-label">Name</span>
            <span className="profile-value">{user?.name}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user?.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Role</span>
            <span className="badge badge-approved">{user?.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Employee Code</span>
            <span className="profile-value">{user?.empCode}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Change Password</h2>
        {message && <div className="success-banner">{message}</div>}
        {error && <div className="login-error">{error}</div>}

        <form className="request-form" onSubmit={handleChangePassword}>
          <div className="field">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Update Password</button>
        </form>
      </div>
    </Layout>
  )
}

export default Profile