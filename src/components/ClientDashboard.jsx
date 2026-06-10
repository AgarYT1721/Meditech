import React, { useState } from 'react';
import { LogOut, Calendar, Activity, FileText, ChevronRight, CheckCircle2, Home, User, Bell, Clock, Stethoscope, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import ClientAppointmentsView from './ClientAppointmentsView';
import ClientRecordsView from './ClientRecordsView';
import ClientProfileView from './ClientProfileView';
import '../index.css';

const ClientDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="mobile-dash-wrapper" style={{
      minHeight: '100vh',
      width: '100%',
      flex: 1,
      overflowX: 'hidden',
      background: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      paddingBottom: '80px' // Space for bottom nav
    }}>
      
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #0066ff, #00bfff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0, 102, 255, 0.2)' }}>
            <Logo size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px', color: '#181818' }}>MEDITECH</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button style={{ background: 'none', border: 'none', position: 'relative', padding: 0 }}>
            <Bell size={22} color="#666" />
            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
          </button>
          <div 
            onClick={onLogout}
            style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PatientOne" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#e2e8f0' }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.main 
            key="home"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            style={{ padding: '20px' }}
          >
            {/* Greeting Section */}
            <motion.div variants={itemVariants} style={{ marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: '#666', fontSize: '1rem', fontWeight: 500 }}>Good morning,</h2>
              <h1 style={{ margin: '5px 0 0 0', color: '#181818', fontSize: '1.8rem', fontWeight: 800 }}>Alex Mercer</h1>
            </motion.div>

            {/* Quick Actions (Horizontal Scroll) */}
            <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', margin: '0 -20px', padding: '0 20px', scrollbarWidth: 'none' }}>
                
                <div 
                  onClick={() => setActiveTab('appointments')}
                  style={{ minWidth: '160px', background: 'linear-gradient(135deg, #0066ff, #00bfff)', borderRadius: '20px', padding: '20px', color: 'white', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.2)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Calendar size={80} /></div>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Calendar size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Book<br/>Appointment</h3>
                </div>

                <div 
                  onClick={() => setActiveTab('records')}
                  style={{ minWidth: '160px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '20px', padding: '20px', color: 'white', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Activity size={80} /></div>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Activity size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Request<br/>Prescription</h3>
                </div>

              </div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>Upcoming Appointments</h3>
                <span onClick={() => setActiveTab('appointments')} style={{ color: '#0066ff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>See All</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Card 1 */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff', borderRadius: '12px', padding: '10px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>14</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '3px' }}>OCT</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#181818' }}>Dr. Sarah Jenkins</h4>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>Cardiology</div>
                    <div style={{ color: '#0066ff', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12}/> 10:30 AM
                    </div>
                  </div>
                  <button style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Card 2 */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.8 }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.05)', color: '#666', borderRadius: '12px', padding: '10px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>28</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '3px' }}>NOV</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#181818' }}>General Checkup</h4>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>Primary Care</div>
                    <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 500, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12}/> 02:00 PM
                    </div>
                  </div>
                  <button style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Recent Results */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>Recent Results</h3>
                <span onClick={() => setActiveTab('records')} style={{ color: '#0066ff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>See All</span>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '15px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#181818' }}>Blood Panel (Comprehensive)</div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>Normal</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>Oct 01, 2026</div>
                </div>

                <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#181818' }}>Lipid Profile</div>
                    <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>Reviewed</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>Sep 15, 2026</div>
                </div>
              </div>
            </motion.div>

          </motion.main>
        )}

        {activeTab === 'appointments' && (
          <motion.div key="appointments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientAppointmentsView />
          </motion.div>
        )}

        {activeTab === 'records' && (
          <motion.div key="records" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientRecordsView />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientProfileView onLogout={onLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '15px 10px',
        paddingBottom: 'calc(15px + env(safe-area-inset-bottom))',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
      }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'home' ? '#0066ff' : '#94a3b8' }}>
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span style={{ fontSize: '0.65rem', fontWeight: activeTab === 'home' ? 700 : 500 }}>Home</span>
        </button>
        <button onClick={() => setActiveTab('appointments')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'appointments' ? '#0066ff' : '#94a3b8' }}>
          <Stethoscope size={24} strokeWidth={activeTab === 'appointments' ? 2.5 : 2} />
          <span style={{ fontSize: '0.65rem', fontWeight: activeTab === 'appointments' ? 700 : 500 }}>Schedule</span>
        </button>
        <button onClick={() => setActiveTab('records')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'records' ? '#0066ff' : '#94a3b8' }}>
          <MessageCircle size={24} strokeWidth={activeTab === 'records' ? 2.5 : 2} />
          <span style={{ fontSize: '0.65rem', fontWeight: activeTab === 'records' ? 700 : 500 }}>Chats</span>
        </button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'profile' ? '#0066ff' : '#94a3b8' }}>
          <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span style={{ fontSize: '0.65rem', fontWeight: activeTab === 'profile' ? 700 : 500 }}>Profile</span>
        </button>
      </nav>

    </div>
  );
};

export default ClientDashboard;
