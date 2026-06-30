import React, { useState, useEffect } from 'react';
import { Users, Activity, Calendar, FileText, Search, Plus, Filter, Edit2, ShieldAlert, RotateCcw, Power, ShieldCheck, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllSystemUsers, toggleUserStatus, provisionAccount, getAuditLogs, updateUserDetails } from '../services/adminService';
import '../index.css';

export default function AdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('users'); // 'users', 'logs'
  const [userStatusTab, setUserStatusTab] = useState('Active'); // 'Active', 'Disabled'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ role: 'Patient', fullName: '', email: '', password: '', department: '' });
  const [adding, setAdding] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', role: '', fullName: '', department: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([
        getAllSystemUsers(),
        getAuditLogs()
      ]);
      setUsers(u);
      setLogs(l);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (uid, isCurrentlyActive) => {
    try {
      await toggleUserStatus(uid, isCurrentlyActive);
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Failed to toggle user", error);
      alert("Error changing user status");
    }
  };

  const handleProvisionSubmit = async () => {
    if (!addForm.fullName || !addForm.email || !addForm.password) {
      alert("Please fill out all fields.");
      return;
    }
    setAdding(true);
    try {
      await provisionAccount(addForm.email, addForm.password, addForm.role, addForm.fullName, addForm.department);
      setShowAddModal(false);
      setAddForm({ role: 'Patient', fullName: '', email: '', password: '', department: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to provision account", error);
      alert("Failed to provision account: " + error.message);
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (u) => {
    setEditForm({
      id: u.id,
      role: u.role,
      fullName: u.name,
      department: u.dept,
      email: u.email,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editForm.fullName) {
      alert("Full name cannot be empty.");
      return;
    }
    setEditing(true);
    try {
      await updateUserDetails(editForm.id, editForm.role, editForm.fullName, editForm.department, editForm.email, editForm.password);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to update user", error);
      alert("Failed to update user: " + error.message);
    } finally {
      setEditing(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchStatus = u.status === userStatusTab;
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchRole && matchSearch;
  });

  return (
    <div className="dash-container tech-theme">
      {/* Background Decorative Elements */}
      <div className="dash-decor" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="ark-line-h" style={{ top: '22%' }}></div>
        <div className="ark-line-h" style={{ top: '88%' }}></div>
        <div className="ark-line-v" style={{ left: '35%' }}></div>
        <div className="ark-line-v" style={{ left: '80%' }}></div>
        <div className="ark-dot-matrix" style={{ top: '10%', left: '40%' }}></div>
        <div className="ark-dot-matrix" style={{ bottom: '10%', right: '10%', top: 'auto', left: 'auto' }}></div>
        <div className="ark-square solid" style={{ width: '90px', height: '90px', top: '8%', right: '30%' }}></div>
        <div className="ark-square outline" style={{ width: '150px', height: '150px', top: '35%', right: '8%' }}></div>
        <div className="ark-square solid" style={{ width: '110px', height: '110px', bottom: '12%', left: '45%' }}></div>
        <div className="ark-stripes" style={{ bottom: '8%', left: '35%' }}>
          <div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo-box">
          <svg className="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00bfff" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="snakeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0066ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00bfff" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 V10 Z" fill="url(#crossGrad)" />
            
            <path d="M 40 90 C 60 95, 75 80, 50 65 C 20 50, 30 30, 55 25 C 70 20, 70 5, 45 10" fill="none" stroke="url(#snakeGrad)" strokeWidth="4.5" strokeLinecap="round" />
            <g opacity="0.8">
              <path d="M 45 7 C 35 3, 25 9, 30 15 C 35 17, 42 15, 45 13 Z" fill="#00bfff" />
              <circle cx="35" cy="10" r="1.5" fill="#ffffff" />
              <path d="M 30 15 L 24 17 L 21 15 M 24 17 L 22 20" fill="none" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <div className="logo-text">MEDITECH</div>
        </div>

        <nav className="dash-nav">
          <button className={`nav-btn ${activeNav === 'users' ? 'active' : ''}`} onClick={() => setActiveNav('users')}>
            <Users size={16} className="nav-icon" />
            <div className="nav-text-group">
              <span className="nav-title">USER MANAGEMENT</span>
              <span className="nav-sub">// PERSONNEL LIST</span>
            </div>
          </button>
          <button className={`nav-btn ${activeNav === 'logs' ? 'active' : ''}`} onClick={() => setActiveNav('logs')}>
            <Activity size={16} className="nav-icon" />
            <div className="nav-text-group">
              <span className="nav-title">AUDIT LOGS</span>
              <span className="nav-sub">// SYSTEM OUTPUT</span>
            </div>
          </button>
        </nav>

        <div className="system-status-box">
          <div className="status-header">SYSTEM STATUS</div>
          <div className="status-row">
            <span className="status-label">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="status-list">
            <div className="status-item"><span>NETWORK</span><span className="dots"></span><span className="text-success">ONLINE</span></div>
            <div className="status-item"><span>AUTH SERVICE</span><span className="dots"></span><span className="text-success">ONLINE</span></div>
            <div className="status-item"><span>DATA NODES</span><span className="dots"></span><span className="text-success">ONLINE</span></div>
            <div className="status-item"><span>ENCRYPTION</span><span className="dots"></span><span className="text-active">ACTIVE</span></div>
          </div>
        </div>

        <div className="dash-user-card">
          <div className="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminRoot" alt="avatar" />
          </div>
          <div className="info">
            <div className="name">Admin Root</div>
            <div className="role">CLEARANCE: OMEGA-7</div>
          </div>
          <button className="btn-icon" onClick={onLogout} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <header className="dash-header">
          <div className="header-left">
            <h2 className="page-title">{activeNav === 'users' ? 'USER MANAGEMENT' : 'AUDIT LOGS'}</h2>
            <div className="breadcrumb">MEDITECH://ADMIN_NODE <span className="text-muted">// {activeNav === 'users' ? 'PERSONNEL_DATA' : 'SYSTEM_RECORDS'}</span></div>
          </div>
          
          <div className="header-right">
            <div className="connection-status">
              <div className="clearance-level">
                <span className="cl-title">CLEARANCE LEVEL</span>
                <span className="cl-value"><ShieldAlert size={12}/> OMEGA-7</span>
              </div>
              <div className="uplink-status">
                <span className="up-title">CONNECTION STATUS</span>
                <span className="up-value"><span className="status-dot active"></span> SECURE UPLINK ESTABLISHED</span>
              </div>
            </div>
          </div>
        </header>

        {activeNav === 'users' && (
          <div className="content-card">
            {/* Controls */}
            <div className="table-controls">
              <div className="tabs">
                {['Active', 'Disabled'].map(tab => (
                  <button 
                    key={tab} 
                    className={`tab-btn ${userStatusTab === tab ? 'active' : ''}`}
                    onClick={() => setUserStatusTab(tab)}
                  >
                    {tab} Users
                  </button>
                ))}
              </div>
              
              <div className="filters">
                <div className="input-with-icon">
                  <Search size={14} className="icon" />
                  <input 
                    type="text" 
                    placeholder="Search ID, Name, Email..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div className="input-with-icon">
                  <Filter size={14} className="icon" />
                  <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)}
                    className="filter-input"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Patient">Patient</option>
                  </select>
                </div>
                <button className="btn-primary" style={{ margin: 0 }} onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> PROVISION ACCOUNT
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID_RECORD</th>
                    <th>FULL_NAME</th>
                    <th>SYS.ROLE</th>
                    <th>DEPARTMENT</th>
                    <th>IDENTIFIER</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                          <Loader2 size={24} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                          Fetching records from databanks...
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="tech-font">{u.id}</td>
                      <td className="font-bold">{u.name}</td>
                      <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                      <td>{u.dept}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-dot ${u.status.toLowerCase()}`}></span>
                        {u.status}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit User" onClick={() => openEditModal(u)}><Edit2 size={16} /></button>
                          {u.status === 'Active' && <button className="btn-icon text-danger" title="Deactivate" onClick={() => handleToggleStatus(u.id, true)}><Power size={16} /></button>}
                          {u.status === 'Disabled' && <button className="btn-icon text-success" title="Reactivate" onClick={() => handleToggleStatus(u.id, false)}><RotateCcw size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">No records found matching current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeNav === 'logs' && (
          <div className="content-card">
            <div className="table-responsive">
              <table className="data-table terminal-style">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>LOG_ID</th>
                    <th>ACTION_TYPE</th>
                    <th>TARGET_RECORD</th>
                    <th>EXECUTING_USER</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                          <Loader2 size={24} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                          Fetching logs from databanks...
                        </div>
                      </td>
                    </tr>
                  ) : logs.length > 0 ? logs.map(log => {
                    const date = new Date(log.time);
                    const formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                    return (
                      <tr key={log.id}>
                        <td className="text-primary">{formattedTime}</td>
                        <td className="text-muted">{log.id}</td>
                        <td className={log.action.includes('DEACTIVATE') ? 'text-danger' : 'text-success'}>[{log.action}]</td>
                        <td>{log.targetRecord}</td>
                        <td>{log.user}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">No audit logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal (Slide-Out Panel) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay" 
            onClick={() => setShowAddModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="modal-content slide-panel" 
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="modal-header">
                <h3 className="auth-title" style={{fontSize: '1.25rem', marginBottom: 0, color: '#0f172a'}}>PROVISION ACCOUNT</h3>
                <button className="btn-icon" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-body auth-form" style={{animation: 'none', gap: '1.5rem', flex: 1, overflowY: 'auto'}}>
                <div className="form-group">
                  <label>SYSTEM ROLE</label>
                  <select className="form-input" value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}}>
                    <option value="Patient">Patient</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input type="text" className="form-input" placeholder="e.g. Jane Doe" value={addForm.fullName} onChange={e => setAddForm({...addForm, fullName: e.target.value})} style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
                </div>
                {addForm.role === 'Staff' && (
                  <div className="form-group">
                    <label>DEPARTMENT / SPECIALIZATION</label>
                    <input type="text" className="form-input" placeholder="e.g. Cardiology" value={addForm.department} onChange={e => setAddForm({...addForm, department: e.target.value})} style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
                  </div>
                )}
                <div className="form-group">
                  <label>EMAIL (@gmail.com)</label>
                  <input type="email" className="form-input" placeholder="user@gmail.com" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
                </div>
                <div className="form-group">
                  <label>DEFAULT PASSCODE</label>
                  <input type="text" className="form-input" placeholder="e.g. Password123!" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
                  <span className="error-text" style={{color: '#64748b'}}>Minimum 6 characters required by Auth system.</span>
                </div>
              </div>
              <div className="modal-footer" style={{display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#ffffff'}}>
                <button className="btn-secondary" style={{flex: 1, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'}} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-submit" disabled={adding} style={{flex: 2, marginTop: 0, background: '#0f172a', opacity: adding ? 0.7 : 1, cursor: adding ? 'not-allowed' : 'pointer'}} onClick={handleProvisionSubmit}>
                  {adding ? 'Initializing...' : 'Initialize Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div 
            className="modal-overlay" 
            onClick={() => setShowEditModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="modal-content slide-panel" 
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="modal-header">
                <h3 className="auth-title" style={{fontSize: '1.25rem', marginBottom: 0, color: '#0f172a'}}>EDIT RECORD</h3>
                <button className="btn-icon" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              <div className="modal-body auth-form" style={{animation: 'none', gap: '1.5rem', flex: 1, overflowY: 'auto'}}>
                <div className="form-group">
                  <label>SYSTEM ROLE (LOCKED)</label>
                  <input type="text" className="form-input" value={editForm.role} disabled style={{background: '#f1f5f9', borderColor: '#e2e8f0', color: '#64748b'}} />
                </div>
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input type="text" className="form-input" placeholder="e.g. Jane Doe" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} style={{background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a'}} />
                </div>
                {editForm.role === 'Staff' && (
                  <div className="form-group">
                    <label>DEPARTMENT / SPECIALIZATION</label>
                    <input type="text" className="form-input" placeholder="e.g. Cardiology" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} style={{background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a'}} />
                  </div>
                )}
                <div className="form-group">
                  <label>CONTACT EMAIL</label>
                  <input type="email" className="form-input" placeholder="user@gmail.com" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a'}} />
                </div>
                <div className="form-group">
                  <label>NEW PASSCODE (OPTIONAL)</label>
                  <input type="text" className="form-input" placeholder="Leave blank to keep current" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} style={{background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a'}} />
                  <span className="error-text" style={{color: '#64748b'}}>Updating auth credentials natively requires backend Admin SDK.</span>
                </div>
              </div>
              <div className="modal-footer" style={{display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#ffffff'}}>
                <button className="btn-secondary" style={{flex: 1, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'}} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-submit" disabled={editing} style={{flex: 2, marginTop: 0, background: '#0f172a', opacity: editing ? 0.7 : 1, cursor: editing ? 'not-allowed' : 'pointer'}} onClick={handleEditSubmit}>
                  {editing ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
