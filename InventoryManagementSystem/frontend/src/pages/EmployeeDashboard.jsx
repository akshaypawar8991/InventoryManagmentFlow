import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './EmployeeDashboard.css'

function EmployeeDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))

  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')

  const [cart, setCart] = useState([])
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')

  const fetchData = async () => {
    try {
      const [itemsRes, requestsRes] = await Promise.all([
        api.get('/items'),
        api.get(`/stockrequests/employee/${user.id}`)
      ])
      setItems(itemsRes.data)
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

  const formatReqNum = (id) => String(id).padStart(4, '0')

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!itemId || !qty) return

    const item = items.find(i => i.id === Number(itemId))
    setCart([...cart, {
      itemId: Number(itemId),
      itemName: item.name,
      qty: Number(qty),
      reason,
    }])

    setItemId('')
    setQty('')
    setReason('')
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handleSubmitCart = async () => {
    if (cart.length === 0) return

    try {
      const response = await api.post('/stockrequests/bulk', {
        employeeId: user.id,
        items: cart.map(c => ({
          itemId: c.itemId,
          requestedQty: c.qty,
          reason: c.reason,
        })),
      })

      setSuccessMsg(response.data.message)
      setTimeout(() => setSuccessMsg(''), 4000)
      setCart([])
      fetchData()
    } catch (err) {
      alert('Failed to submit requests')
    }
  }

  const pendingCount = requests.filter(r => r.status === 'Pending').length
  const approvedCount = requests.filter(r => r.status === 'Approved' || r.status === 'Assigned').length
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length

  if (loading) return <Layout title="Employee Dashboard" roleLabel={user?.role}><p>Loading...</p></Layout>

  return (
    <Layout title="Employee Dashboard" roleLabel={user?.role}>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">{requests.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value pending">{pendingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value approved">{approvedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value rejected">{rejectedCount}</span>
        </div>
      </div>

      <div className="panel">
        <h2>New Stock Request</h2>
        {successMsg && <div className="success-banner">{successMsg}</div>}

        <form className="request-form" onSubmit={handleAddToCart}>
          <div className="form-row">
            <div className="field">
              <label>Item</label>
              <select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
                <option value="">Select an item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="field qty-field">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                placeholder="10"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Reason</label>
            <textarea
              placeholder="Why do you need this?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="2"
            />
          </div>
          <button type="submit" className="add-cart-btn">+ Add Item to Request</button>
        </form>

        {cart.length > 0 && (
          <div className="cart-list">
            <h3>Items to Request ({cart.length})</h3>
            {cart.map((c, index) => (
              <div className="cart-item" key={index}>
                <span>{c.itemName} — Qty {c.qty}</span>
                <button className="remove-cart-btn" onClick={() => removeFromCart(index)}>Remove</button>
              </div>
            ))}
            <button className="submit-btn" onClick={handleSubmitCart}>
              Submit All Requests ({cart.length})
            </button>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>My Requests</h2>
        <table className="requests-table">
          <thead>
            <tr>
              <th>Request Number</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{formatReqNum(r.id)}</td>
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

export default EmployeeDashboard