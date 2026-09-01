import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './ManagerDashboard.css'

function ManagerDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const requestsRes = await api.get('/stockrequests')
      setRequests(requestsRes.data)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.put(`/stockrequests/${id}/approve`, { reviewedBy: user.id })
      fetchData()
    } catch (err) {
      alert(err.response?.data || 'Failed to approve request')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/stockrequests/${id}/reject`, { reviewedBy: user.id })
      fetchData()
    } catch (err) {
      alert(err.response?.data || 'Failed to reject request')
    }
  }

  const formatReqNum = (id) => String(id).padStart(4, '0')

  const pending = requests.filter(r => r.status === 'Pending')
  const approved = requests.filter(r => r.status === 'Approved' || r.status === 'Assigned' || r.status === 'OnHold')
  const rejected = requests.filter(r => r.status === 'Rejected')

  if (loading) return <Layout title="Manager Dashboard" roleLabel={user?.role}><p>Loading...</p></Layout>

  return (
    <Layout title="Manager Dashboard" roleLabel={user?.role}>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Pending Approval</span>
          <span className="stat-value pending">{pending.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value approved">{approved.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value rejected">{rejected.length}</span>
        </div>
      </div>

      <div className="panel">
        <h2>Pending Requests</h2>
        {pending.length === 0 ? (
          <p className="empty-state">No pending requests right now.</p>
        ) : (
          <div className="request-cards">
            {pending.map((r) => (
              <div className="request-card" key={r.id}>
                <div className="request-card-header">
                  <div>
                    <div className="employee-name">
                      {r.itemName} <span className="request-id">{formatReqNum(r.id)}</span>
                    </div>
                    <div className="request-meta">
                      Requested by <strong>{r.employeeName}</strong> · {new Date(r.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>

                <div className="stock-compare">
                  <span>Requested Qty: <strong>{r.requestedQty}</strong></span>
                  <span>Available Stock: <strong>{r.availableStock}</strong></span>
                  {r.requestedQty > r.availableStock && (
                    <span className="stock-warning">⚠ Exceeds available stock</span>
                  )}
                </div>

                <p className="request-reason">"{r.reason}"</p>
                <div className="request-actions">
                  <button className="approve-btn" onClick={() => handleApprove(r.id)}>
                    Approve
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(r.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Request History</h2>
        <table className="requests-table">
          <thead>
            <tr>
              <th>Request Number</th>
              <th>Employee</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.filter(r => r.status !== 'Pending').map((r) => (
              <tr key={r.id}>
                <td>{formatReqNum(r.id)}</td>
                <td>{r.employeeName}</td>
                <td>{r.itemName}</td>
                <td>{r.requestedQty}</td>
                <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status === 'OnHold' ? 'On Hold' : r.status}</span></td>
                <td>{new Date(r.requestDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export default ManagerDashboard