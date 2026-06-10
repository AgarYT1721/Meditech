import React, { useState } from 'react';
import { Users, Activity, Calendar, FileText, Search, Plus, Filter, Edit2, ShieldAlert, RotateCcw, Power, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import '../index.css';

const mockUsers = [
  { id: 'USR-1001', name: 'Dr. Sarah Connor', role: 'Staff', dept: 'Cardiology', status: 'Active', email: 's.connor@meditech.org', joined: '2026-01-15' },
  { id: 'USR-1002', name: 'John Doe', role: 'Patient', dept: 'N/A', status: 'Active', email: 'johndoe@gmail.com', joined: '2026-02-20' },
  { id: 'USR-1003', name: 'Nurse Joy', role: 'Staff', dept: 'Pediatrics', status: 'Disabled', email: 'n.joy@meditech.org', joined: '2025-11-05' },
  { id: 'USR-1004', name: 'Admin Root', role: 'Admin', dept: 'IT', status: 'Active', email: 'admin@meditech.org', joined: '2024-05-10' },
  { id: 'USR-1005', name: 'Jane Smith', role: 'Patient', dept: 'N/A', status: 'Deactivated', email: 'j.smith99@gmail.com', joined: '2026-03-01' },
];

const mockLogs = [
  { id: 'LOG-001', time: '2026-06-10 09:15:22', action: 'CREATE_USER', record: 'USR-1006', user: 'Admin Root' },
  { id: 'LOG-002', time: '2026-06-10 09:42:01', action: 'UPDATE_EMR', record: 'EMR-P-1002', user: 'Dr. Sarah Connor' },
  { id: 'LOG-003', time: '2026-06-10 10:05:18', action: 'FAILED_LOGIN', record: 'AUTH_SYS', user: 'Unknown (IP: 192.168.1.5)' },
  { id: 'LOG-004', time: '2026-06-10 11:30:45', action: 'DEACTIVATE_USER', record: 'USR-1005', user: 'Admin Root' },
];

export default function AdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('users'); // 'users', 'logs', 'appointments', 'records'
  const [userStatusTab, setUserStatusTab] = useState('Active'); // 'Active', 'Disabled', 'Deactivated'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter users
  const filteredUsers = mockUsers.filter(u => {
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
                {['Active', 'Disabled', 'Deactivated'].map(tab => (
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
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
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
                          <button className="btn-icon" title="Edit User"><Edit2 size={16} /></button>
                          {u.status === 'Active' && <button className="btn-icon text-danger" title="Deactivate"><Power size={16} /></button>}
                          {u.status === 'Disabled' && <button className="btn-icon text-warning" title="Recover Account"><RotateCcw size={16} /></button>}
                          {u.status === 'Deactivated' && <button className="btn-icon text-success" title="Reactivate"><RotateCcw size={16} /></button>}
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
                    <th>EVENT_HASH</th>
                    <th>ACTION_TYPE</th>
                    <th>TARGET_RECORD</th>
                    <th>EXECUTING_USER</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLogs.map(log => (
                    <tr key={log.id}>
                      <td className="text-primary">{log.time}</td>
                      <td className="text-muted">{log.id}</td>
                      <td className={log.action.includes('FAILED') ? 'text-danger' : 'text-success'}>[{log.action}]</td>
                      <td>{log.record}</td>
                      <td>{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal (Slide-Out Panel) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content slide-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="auth-title" style={{fontSize: '1.25rem', marginBottom: 0, color: '#0f172a'}}>PROVISION ACCOUNT</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body auth-form" style={{animation: 'none', gap: '1.5rem', flex: 1, overflowY: 'auto'}}>
              <div className="form-group">
                <label>SYSTEM ROLE</label>
                <select className="form-input" style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}}>
                  <option>Patient</option>
                  <option>Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>FULL NAME</label>
                <input type="text" className="form-input" placeholder="e.g. Jane Doe" style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
              </div>
              <div className="form-group">
                <label>EMAIL (@gmail.com)</label>
                <input type="email" className="form-input" placeholder="user@gmail.com" style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
              </div>
              <div className="form-group">
                <label>DEFAULT PASSCODE</label>
                <input type="text" className="form-input" placeholder="e.g. YYYYMMDD" style={{background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a'}} />
                <span className="error-text" style={{color: '#64748b'}}>User will be forced to change this upon first login.</span>
              </div>
            </div>
            <div className="modal-footer" style={{display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#ffffff'}}>
              <button className="btn-secondary" style={{flex: 1, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'}} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-submit" style={{flex: 2, marginTop: 0, background: '#0f172a'}} onClick={() => setShowAddModal(false)}>Initialize Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
