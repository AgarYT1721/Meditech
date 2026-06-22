import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, Activity, FileText, ChevronRight, CheckCircle2, Home, User, Bell, Clock, Stethoscope, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import ClientAppointmentsView from './ClientAppointmentsView';
import ClientRecordsView from './ClientRecordsView';
import ClientProfileView from './ClientProfileView';
import { getPatientProfile } from '../services/patientService';
import { getPatientAppointments } from '../services/appointmentService';
import { getPatientRecords } from '../services/recordService';
import '../index.css';

const ClientDashboard = ({ clientUid, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [patient, setPatient] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, aptsData, recordsData] = await Promise.all([
        getPatientProfile(clientUid),
        getPatientAppointments(clientUid),
        getPatientRecords(clientUid),
      ]);
      setPatient(profileData);
      
      const upcoming = aptsData.filter(a => a.status === 'pending' || a.status === 'confirmed').slice(0, 2);
      setUpcomingAppointments(upcoming);
      
      setRecentRecords(recordsData.slice(0, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <img src={patient?.profilePicture || (patient ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.uid}&backgroundColor=b6e3f4` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4")} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            {loading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={32} color="#0066ff" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                <motion.div variants={itemVariants} style={{ marginBottom: '25px' }}>
                  <h2 style={{ margin: 0, color: '#666', fontSize: '1rem', fontWeight: 500 }}>Good morning,</h2>
                  <h1 style={{ margin: '5px 0 0 0', color: '#181818', fontSize: '1.8rem', fontWeight: 800 }}>{patient ? `${patient.firstName} ${patient.lastName}` : 'Guest'}</h1>
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
                {upcomingAppointments.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No upcoming appointments.</div>
                ) : upcomingAppointments.map((apt) => {
                  const [year, month, day] = apt.date.split('-');
                  const monthName = new Date(year, month - 1, day).toLocaleString('default', { month: 'short' });
                  return (
                    <div key={apt.id} style={{ background: '#fff', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff', borderRadius: '12px', padding: '10px', textAlign: 'center', minWidth: '60px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '3px' }}>{monthName}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#181818' }}>Dr. {apt.staffUid.substring(0,6)}</h4>
                        <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{apt.reasonDescription}</div>
                        <div style={{ color: '#0066ff', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12}/> {apt.time}
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('appointments')} style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818' }}>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Results */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>Recent Results</h3>
                <span onClick={() => setActiveTab('records')} style={{ color: '#0066ff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>See All</span>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                {recentRecords.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>No recent results.</div>
                ) : recentRecords.map((rec, index) => (
                  <div key={rec.id} style={{ borderLeft: `3px solid ${index % 2 === 0 ? '#10b981' : '#f59e0b'}`, paddingLeft: '15px', marginBottom: index === recentRecords.length - 1 ? 0 : '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#181818' }}>{rec.title}</div>
                      <span style={{ background: index % 2 === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: index % 2 === 0 ? '#10b981' : '#f59e0b', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>{rec.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>{rec.date}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            </>
            )}

          </motion.main>
        )}

        {activeTab === 'appointments' && (
          <motion.div key="appointments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientAppointmentsView clientUid={clientUid} patientData={patient} />
          </motion.div>
        )}

        {activeTab === 'records' && (
          <motion.div key="records" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientRecordsView clientUid={clientUid} />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            <ClientProfileView patientData={patient} onLogout={onLogout} onProfileUpdate={fetchDashboardData} />
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
