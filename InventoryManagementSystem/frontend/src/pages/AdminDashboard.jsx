import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'
import './AdminDashboard.css'

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))

  const [items, setItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [managers, setManagers] = useState([])
  const [logs, setLogs] = useState([])
  const [assignmentRequests, setAssignmentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('items')

  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemStock, setItemStock] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)

  const [empName, setEmpName] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empPassword, setEmpPassword] = useState('')
  const [empRole, setEmpRole] = useState('Employee')
  const [empCode, setEmpCode] = useState('')
  const [empManagerId, setEmpManagerId] = useState('')
  const [editingEmpId, setEditingEmpId] = useState(null)

  // ---------- CONFIRM DIALOG STATE ----------
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }))

  const askConfirm = ({ title, message, onConfirm }) => {
    setConfirmState({ open: true, title, message, onConfirm })
  }

  const fetchAll = async () => {
    try {
      const [itemsRes, empRes, mgrRes, requestsRes, assignRes] = await Promise.all([
        api.get('/items'),
        api.get('/employees'),
        api.get('/employees/managers'),
        api.get('/stockrequests'),
        api.get('/stockrequests/approved'),
      ])
      setItems(itemsRes.data)
      setEmployees(empRes.data)
      setManagers(mgrRes.data)
      setLogs(requestsRes.data)
      setAssignmentRequests(assignRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ---------- ITEM HANDLERS ----------
  const resetItemForm = () => {
    setItemName(''); setItemCategory(''); setItemStock(''); setEditingItemId(null)
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault()
    const payload = { name: itemName, category: itemCategory || 'General', stock: Number(itemStock), reorderLevel: 10 }
    try {
      if (editingItemId) {
        await api.put(`/items/${editingItemId}`, payload)
      } else {
        await api.post('/items', payload)
      }
      resetItemForm()
      fetchAll()
    } catch (err) {
      alert('Failed to save item')
    }
  }

  const handleEditItem = (item) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemCategory(item.category)
    setItemStock(item.stock)
  }

  const deleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`)
      fetchAll()
    } catch (err) {
      alert('Failed to delete item')
    } finally {
      closeConfirm()
    }
  }

  const handleDeleteItem = (item) => {
    askConfirm({
      title: 'Delete item?',
      message: `This will permanently delete "${item.name}" from inventory.`,
      onConfirm: () => deleteItem(item.id),
    })
  }

  // ---------- EMPLOYEE HANDLERS ----------
  const resetEmpForm = () => {
    setEmpName(''); setEmpEmail(''); setEmpPassword(''); setEmpRole('Employee')
    setEmpCode(''); setEmpManagerId(''); setEditingEmpId(null)
  }

  const handleEmpSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEmpId) {
        await api.put(`/employees/${editingEmpId}`, {
          name: empName, email: empEmail, role: empRole,
          empCode: Number(empCode), managerId: empRole === 'Employee' ? empManagerId || null : null,
        })
      } else {
        await api.post('/employees', {
          name: empName, email: empEmail, password: empPassword, role: empRole,
          empCode: Number(empCode), managerId: empRole === 'Employee' ? empManagerId || null : null,
        })
      }
      resetEmpForm()
      fetchAll()
    } catch (err) {
      alert(err.response?.data || 'Failed to save employee')
    }
  }

  const handleEditEmp = (emp) => {
    setEditingEmpId(emp.id)
    setEmpName(emp.name)
    setEmpEmail(emp.email)
    setEmpRole(emp.role)
    setEmpCode(emp.empCode)
    setEmpManagerId(emp.managerId || '')
  }

  const deleteEmp = async (id) => {
    try {
      await api.delete(`/employees/${id}`)
      fetchAll()
    } catch (err) {
      alert('Failed to delete employee')
    } finally {
      closeConfirm()
    }
  }

  const handleDeleteEmp = (emp) => {
    askConfirm({
      title: 'Delete employee?',
      message: `This will permanently delete "${emp.name}" (${emp.role}) from the system.`,
      onConfirm: () => deleteEmp(emp.id),
    })
  }

  // ---------- ASSIGNMENT HANDLERS ----------
  const handleAssign = async (id) => {
    try {
      await api.put(`/stockrequests/${id}/assign`, { assignedBy: user.id })
      fetchAll()
    } catch (err) {
      alert(err.response?.data || 'Failed to assign item')
    }
  }

  const handleHold = async (id) => {
    try {
      await api.put(`/stockrequests/${id}/hold`, { assignedBy: user.id })
      fetchAll()
    } catch (err) {
      alert(err.response?.data || 'Failed to put on hold')
    }
  }

  const getManagerName = (id) => managers.find(m => m.id === id)?.name || '—'
  const lowStockCount = items.filter(i => i.stock <= i.reorderLevel).length
  const pendingAssignCount = assignmentRequests.filter(r => r.status === 'Approved').length

  const getStockSummary = () => {
    return items.map((item) => {
      const itemRequests = logs.filter(r => r.itemId === item.id)
      const totalRequested = itemRequests.reduce((sum, r) => sum + r.requestedQty, 0)
      const totalUsed = itemRequests
        .filter(r => r.status === 'Assigned')
        .reduce((sum, r) => sum + r.requestedQty, 0)
      const pendingQty = itemRequests
        .filter(r => r.status === 'Pending' || r.status === 'Approved' || r.status === 'OnHold')
        .reduce((sum, r) => sum + r.requestedQty, 0)

      return { ...item, totalRequested, totalUsed, pendingQty }
    })
  }

  if (loading) return <Layout title="Admin Dashboard" roleLabel={user?.role}><p>Loading...</p></Layout>

  return (
    <Layout title="Admin Dashboard" roleLabel={user?.role}>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{items.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Alerts</span>
          <span className="stat-value low">{lowStockCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{employees.length}</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Item Master</button>
        <button className={`tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>Employee Master</button>
        <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
          Assets/Item Assignments {pendingAssignCount > 0 && <span className="tab-badge">{pendingAssignCount}</span>}
        </button>
        <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Activity Logs</button>
      </div>

      {activeTab === 'items' && (
        <>
          <div className="panel">
            <h2>{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
            <form className="item-form" onSubmit={handleItemSubmit}>
              <div className="field">
                <label>Item Name</label>
                <input type="text" placeholder="e.g. Mouse" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Category</label>
                <input type="text" placeholder="e.g. Electronics" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} />
              </div>
              <div className="field qty-field">
                <label>Stock Qty</label>
                <input type="number" min="0" placeholder="50" value={itemStock} onChange={(e) => setItemStock(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn">{editingItemId ? 'Update' : 'Add'} Item</button>
              {editingItemId && <button type="button" className="cancel-btn" onClick={resetItemForm}>Cancel</button>}
            </form>
          </div>

          <div className="panel">
            <h2>Stock Inventory</h2>
            <table className="requests-table">
              <thead>
                <tr><th>Item</th><th>Category</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td>{i.category}</td>
                    <td>{i.stock}</td>
                    <td>
                      {i.stock <= i.reorderLevel
                        ? <span className="badge badge-rejected">Low Stock</span>
                        : <span className="badge badge-approved">In Stock</span>}
                    </td>
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => handleEditItem(i)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteItem(i)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'employees' && (
        <>
          <div className="panel">
            <h2>{editingEmpId ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form className="item-form" onSubmit={handleEmpSubmit}>
              <div className="field">
                <label>Name</label>
                <input type="text" value={empName} onChange={(e) => setEmpName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} required />
              </div>
              {!editingEmpId && (
                <div className="field">
                  <label>Password</label>
                  <input type="password" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} required />
                </div>
              )}
              <div className="field qty-field">
                <label>Emp Code</label>
                <input type="number" value={empCode} onChange={(e) => setEmpCode(e.target.value)} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={empRole} onChange={(e) => setEmpRole(e.target.value)}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {empRole === 'Employee' && (
                <div className="field">
                  <label>Assign Manager</label>
                  <select value={empManagerId} onChange={(e) => setEmpManagerId(e.target.value)}>
                    <option value="">-- Select Manager --</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" className="submit-btn">{editingEmpId ? 'Update' : 'Add'} Employee</button>
              {editingEmpId && <button type="button" className="cancel-btn" onClick={resetEmpForm}>Cancel</button>}
            </form>
          </div>

          <div className="panel">
            <h2>Employee Master</h2>
            <table className="requests-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Emp Code</th><th>Manager</th><th></th></tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td><span className="badge badge-approved">{e.role}</span></td>
                    <td>{e.empCode}</td>
                    <td>{e.role === 'Employee' ? getManagerName(e.managerId) : '—'}</td>
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => handleEditEmp(e)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteEmp(e)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'assignments' && (
        <div className="panel">
          <h2>Assignment Queue</h2>
          <p className="panel-subtitle">Requests approved by managers — assign stock or put on hold if unavailable.</p>
          {assignmentRequests.length === 0 ? (
            <p className="empty-state">No requests waiting for assignment.</p>
          ) : (
            <div className="request-cards">
              {assignmentRequests.map((r) => (
                <div className="request-card" key={r.id}>
                  <div className="request-card-header">
                    <div>
                      <div className="employee-name">
                        {r.itemName} <span className="request-id">--{String(r.id).padStart(4, '0')}</span>
                      </div>
                      <div className="request-meta">
                        For <strong>{r.employeeName}</strong> · Approved on {new Date(r.approvedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status === 'OnHold' ? 'On Hold' : r.status}</span>
                  </div>

                  <div className="stock-compare">
                    <span>Requested Qty: <strong>{r.requestedQty}</strong></span>
                    <span>Available Stock: <strong>{r.availableStock}</strong></span>
                    {r.requestedQty > r.availableStock && (
                      <span className="stock-warning">⚠ Not enough stock</span>
                    )}
                  </div>

                  <div className="request-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleAssign(r.id)}
                      disabled={r.requestedQty > r.availableStock}
                    >
                      Assign Now
                    </button>
                    {r.status === 'Approved' && (
                      <button className="reject-btn" onClick={() => handleHold(r.id)}>
                        Put On Hold
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <>
          <div className="panel">
            <h2>Stock Usage Summary</h2>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Current Stock</th>
                  <th>Total Used (Assigned)</th>
                  <th>In Progress Qty</th>
                </tr>
              </thead>
              <tbody>
                {getStockSummary().map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.stock}</td>
                    <td>{s.totalUsed}</td>
                    <td>{s.pendingQty > 0 ? <span className="badge badge-pending">{s.pendingQty}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>Activity Logs (All Requests)</h2>
            {logs.length === 0 ? (
              <p className="empty-state">No activity yet.</p>
            ) : (
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
                  {[...logs].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).map((log) => (
                    <tr key={log.id}>
                      <td>{String(log.id).padStart(4, '0')}</td>
                      <td>{log.employeeName}</td>
                      <td>{log.itemName}</td>
                      <td>{log.requestedQty}</td>
                      <td><span className={`badge badge-${log.status.toLowerCase()}`}>{log.status === 'OnHold' ? 'On Hold' : log.status}</span></td>
                      <td>{new Date(log.requestDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </Layout>
  )
}

export default AdminDashboard