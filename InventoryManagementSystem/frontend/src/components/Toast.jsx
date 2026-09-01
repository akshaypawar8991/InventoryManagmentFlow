import { useEffect } from 'react'
import './Toast.css'

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`toast toast-${toast.type || 'success'}`} role="status">
      <span className="toast-icon">{toast.type === 'error' ? '⚠' : '✓'}</span>
      <span className="toast-message">{toast.message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  )
}

export default Toast
