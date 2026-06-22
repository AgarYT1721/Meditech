import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Users, User, Bell, Activity, LogOut, ShieldAlert, Clock } from 'lucide-react';
import Logo from './Logo';
import StaffAppointmentsView from './StaffAppointmentsView';
import StaffPatientsView from './StaffPatientsView';
import StaffProfileView from './StaffProfileView';
import { getStaffAppointments } from '../services/appointmentService';
import '../index.css';

const TEST_USER_UID = "ejCEXQ6aIRcVRcofJXqKxUZTWsZ2";

const StaffDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heroMousePos, setHeroMousePos] = useState({ x: 0, y: 0 });
  const [appointments, setAppointments] = useState([]);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroMousePos({ x, y });
  };
  
  const handleHeroMouseLeave = () => {
    setHeroMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      const apts = await getStaffAppointments(TEST_USER_UID);
      setAppointments(apts);
    } catch (error) {
      console.error(error);
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
    <div className="dash-container" style={{ 
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', 
      background: '#f8fafc', // Clean white-grey
      position: 'relative',
      color: '#334155', fontFamily: "'Inter', sans-serif" 
    }}>
      <style>{`
        @keyframes timeBlink {
          0%, 49.9% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
      {/* Ambient Abstract Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
      
      {/* Medical Sidebar */}
      <aside style={{ position: 'relative', width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(226, 232, 240, 0.8)', zIndex: 10, boxShadow: '10px 0 30px rgba(0, 0, 0, 0.02)', overflow: 'hidden' }}>
        
        {/* Subtle background abstract shapes for the sidebar */}
        <div style={{ position: 'absolute', top: '-5%', left: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '-30%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px)', backgroundSize: '15px 15px', zIndex: 0, pointerEvents: 'none', opacity: 0.5 }}></div>

        <div style={{ position: 'relative', zIndex: 1, padding: '32px 24px 20px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)' }}>
              <Logo size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Medi<span style={{ color: '#0284c7' }}>Tech</span></span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Main Menu</div>
        </div>

        <nav style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px', flex: 1 }}>
          <motion.button 
            whileHover={{ x: activeTab === 'home' ? 0 : 5, backgroundColor: activeTab === 'home' ? 'transparent' : 'rgba(240, 249, 255, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('home')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '15px',
              background: activeTab === 'home' ? 'linear-gradient(90deg, #e0f2fe 0%, #ffffff 100%)' : 'transparent',
              color: activeTab === 'home' ? '#0284c7' : '#64748b',
              border: 'none',
              borderLeft: activeTab === 'home' ? '4px solid #0ea5e9' : '4px solid transparent',
              borderRadius: '0 16px 16px 0',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === 'home' ? 800 : 600,
              fontSize: '0.95rem',
              boxShadow: activeTab === 'home' ? '4px 4px 15px rgba(14, 165, 233, 0.08)' : 'none'
            }}
          >
            <div style={{ background: activeTab === 'home' ? '#ffffff' : 'transparent', padding: '8px', borderRadius: '10px', boxShadow: activeTab === 'home' ? '0 4px 12px rgba(14, 165, 233, 0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: activeTab === 'home' ? '1px solid rgba(14, 165, 233, 0.1)' : '1px solid transparent' }}>
              <Home size={18} style={{ color: activeTab === 'home' ? '#0ea5e9' : '#94a3b8' }} />
            </div>
            <span>Dashboard</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ x: activeTab === 'schedule' ? 0 : 5, backgroundColor: activeTab === 'schedule' ? 'transparent' : 'rgba(240, 249, 255, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('schedule')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '15px',
              background: activeTab === 'schedule' ? 'linear-gradient(90deg, #e0f2fe 0%, #ffffff 100%)' : 'transparent',
              color: activeTab === 'schedule' ? '#0284c7' : '#64748b',
              border: 'none',
              borderLeft: activeTab === 'schedule' ? '4px solid #0ea5e9' : '4px solid transparent',
              borderRadius: '0 16px 16px 0',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === 'schedule' ? 800 : 600,
              fontSize: '0.95rem',
              boxShadow: activeTab === 'schedule' ? '4px 4px 15px rgba(14, 165, 233, 0.08)' : 'none'
            }}
          >
            <div style={{ background: activeTab === 'schedule' ? '#ffffff' : 'transparent', padding: '8px', borderRadius: '10px', boxShadow: activeTab === 'schedule' ? '0 4px 12px rgba(14, 165, 233, 0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: activeTab === 'schedule' ? '1px solid rgba(14, 165, 233, 0.1)' : '1px solid transparent' }}>
              <Calendar size={18} style={{ color: activeTab === 'schedule' ? '#0ea5e9' : '#94a3b8' }} />
            </div>
            <span>Schedule</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ x: activeTab === 'patients' ? 0 : 5, backgroundColor: activeTab === 'patients' ? 'transparent' : 'rgba(240, 249, 255, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('patients')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '15px',
              background: activeTab === 'patients' ? 'linear-gradient(90deg, #e0f2fe 0%, #ffffff 100%)' : 'transparent',
              color: activeTab === 'patients' ? '#0284c7' : '#64748b',
              border: 'none',
              borderLeft: activeTab === 'patients' ? '4px solid #0ea5e9' : '4px solid transparent',
              borderRadius: '0 16px 16px 0',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === 'patients' ? 800 : 600,
              fontSize: '0.95rem',
              boxShadow: activeTab === 'patients' ? '4px 4px 15px rgba(14, 165, 233, 0.08)' : 'none'
            }}
          >
            <div style={{ background: activeTab === 'patients' ? '#ffffff' : 'transparent', padding: '8px', borderRadius: '10px', boxShadow: activeTab === 'patients' ? '0 4px 12px rgba(14, 165, 233, 0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: activeTab === 'patients' ? '1px solid rgba(14, 165, 233, 0.1)' : '1px solid transparent' }}>
              <Users size={18} style={{ color: activeTab === 'patients' ? '#0ea5e9' : '#94a3b8' }} />
            </div>
            <span>Patients</span>
          </motion.button>
          
        </nav>

        <div style={{ padding: '24px 20px', position: 'relative' }}>
          {/* subtle glow behind profile */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)', filter: 'blur(15px)', zIndex: 0 }}></div>
          
          <motion.div 
            whileHover={{ y: -2, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.06)' }}
            onClick={() => setActiveTab('profile')}
            style={{ position: 'relative', zIndex: 1, background: activeTab === 'profile' ? 'linear-gradient(145deg, #f0f9ff, #ffffff)' : 'linear-gradient(145deg, #ffffff, #f8fafc)', borderRadius: '20px', border: activeTab === 'profile' ? '1px solid #0ea5e9' : '1px solid rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', padding: '14px', boxShadow: activeTab === 'profile' ? '0 10px 25px rgba(14, 165, 233, 0.15)' : '0 10px 25px rgba(0, 0, 0, 0.03)', cursor: 'pointer' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', marginRight: '12px', flexShrink: 0, overflow: 'hidden', padding: '2px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Klaus&backgroundColor=e0f2fe" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>Dr. Klaus Gilbert</div>
              <div style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 700 }}>Dental Specialist</div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }} 
              whileTap={{ scale: 0.9 }} 
              onClick={(e) => { e.stopPropagation(); onLogout(); }} 
              title="Log Out" 
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '6px' }}
            >
              <LogOut size={16} />
            </motion.button>
          </motion.div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent', zIndex: 5 }}>
        
        {/* Premium Medical Tech Header - Light Banner Theme */}
        <header className="dash-header" style={{ display: activeTab === 'home' ? 'none' : 'flex', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', borderBottom: '1px solid rgba(14, 165, 233, 0.15)', padding: '24px 40px', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          
          {/* Decorative background dotted grid - seamlessly scrolling */}
          <motion.div 
            animate={{ backgroundPosition: ['0px 0px', '20px 20px'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(rgba(14, 165, 233, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.8, zIndex: 0, pointerEvents: 'none' }}
          />
          
          {/* Subtle Diagonal Glass Glints - slowly floating */}
          <motion.div 
            animate={{ x: [0, -40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '-50%', bottom: '-50%', right: '15%', width: '10%', background: 'rgba(14, 165, 233, 0.03)', skewX: -20, pointerEvents: 'none', zIndex: 0, borderLeft: '1px solid rgba(14, 165, 233, 0.05)', borderRight: '1px solid rgba(14, 165, 233, 0.02)' }}
          />
          <motion.div 
            animate={{ x: [0, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '-50%', bottom: '-50%', right: '27%', width: '4%', background: 'rgba(14, 165, 233, 0.05)', skewX: -20, pointerEvents: 'none', zIndex: 0, borderLeft: '1px solid rgba(14, 165, 233, 0.08)' }}
          />

          {/* Rainbow Prism Highlight in Header */}
          <div 
            style={{ position: 'absolute', top: '10px', right: '22%', width: '120px', height: '50px', background: 'linear-gradient(115deg, rgba(255,0,0,1), rgba(255,165,0,1), rgba(255,255,0,1), rgba(0,255,0,1), rgba(0,255,255,1), rgba(0,0,255,1), rgba(238,130,238,1))', filter: 'blur(15px)', pointerEvents: 'none', zIndex: 0, transform: 'skewX(-30deg) rotate(-10deg)', opacity: 0.15 }}
          />

          {/* Huge faded Logo watermark - Left Aligned */}
          <div style={{ position: 'absolute', left: '-1%', top: '50%', transform: 'translateY(-50%)', opacity: 0.06, zIndex: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Activity size={160} strokeWidth={3} color="#0ea5e9" />
            <div style={{ fontSize: '9rem', fontWeight: 900, letterSpacing: '-5px', lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap', color: '#0ea5e9' }}>
              MEDITECH
            </div>
          </div>

          <div className="header-left" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="page-title" style={{ color: '#0f172a', fontSize: '1.5rem', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
              {activeTab === 'schedule' && 'Appointments Schedule'}
              {activeTab === 'patients' && 'Patient Directory'}
              {activeTab === 'profile' && 'Professional Profile'}
            </h2>
            <div className="breadcrumb" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>
              MediTech Clinic <span style={{ color: '#cbd5e1', margin: '0 8px' }}>/</span> <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.05)' }}>
              <Clock size={16} color="#0ea5e9" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center' }}>
                {(currentTime.getHours() % 12 || 12).toString().padStart(2, '0')}
                <span style={{ animation: 'timeBlink 1s infinite', margin: '0 2px' }}>:</span>
                {currentTime.getMinutes().toString().padStart(2, '0')}
                <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>{currentTime.getHours() >= 12 ? 'PM' : 'AM'}</span>
              </span>
            </div>
            <motion.button whileHover={{ y: -2, backgroundColor: '#ffffff' }} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.05)', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: 2, right: 2, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }}></span>
            </motion.button>
          </div>
        </header>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '40px', 
          boxSizing: 'border-box',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black 100%)'
        }}>
          <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
            
            <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                {/* Hero Greeting Section */}
                <motion.div 
                  variants={itemVariants} 
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={handleHeroMouseLeave}
                  style={{ 
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', 
                  borderRadius: '24px', 
                  padding: '40px', 
                  color: '#ffffff', 
                  position: 'relative', 
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)',
                  marginBottom: '40px',
                  perspective: '1000px'
                }}>
                  {/* Decorative background dotted grid - seamlessly scrolling */}
                  <motion.div 
                    animate={{ backgroundPosition: ['0px 0px', '20px 20px'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.8, zIndex: 0, pointerEvents: 'none' }}
                  />
                  
                  {/* Notification Bell in Banner */}
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '12px', borderRadius: '50%', cursor: 'pointer', color: '#ffffff', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Bell size={22} />
                    <span style={{ position: 'absolute', top: 2, right: 2, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #0369a1' }}></span>
                  </motion.button>
                  
                  {/* Small Static Prism Spot (Near the Clock) */}
                  <div 
                    style={{ position: 'absolute', top: '15%', right: '10%', width: '180px', height: '80px', background: 'linear-gradient(115deg, rgba(255,0,0,0.9), rgba(255,165,0,0.9), rgba(255,255,0,0.9), rgba(0,255,0,0.9), rgba(0,255,255,0.9), rgba(0,0,255,0.9), rgba(238,130,238,0.9))', filter: 'blur(25px)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 0, transform: 'skewX(-30deg) rotate(-10deg)', opacity: 0.8 }}
                  />

                  {/* Premium Diagonal Glass Glints (Simple Frosted Glass) */}
                  <motion.div 
                    animate={{ x: [0, -40, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '-20%', bottom: '-20%', right: '25%', width: '12%', background: 'linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.06))', skewX: -20, pointerEvents: 'none', zIndex: 0, borderLeft: '1px solid rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                  />
                  <motion.div 
                    animate={{ x: [0, 60, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '-20%', bottom: '-20%', right: '38%', width: '4%', background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.1))', skewX: -20, pointerEvents: 'none', zIndex: 0, borderLeft: '2px solid rgba(255,255,255,0.4)' }}
                  />
                  <motion.div 
                    animate={{ x: [0, -30, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    style={{ position: 'absolute', top: '-20%', bottom: '-20%', left: '25%', width: '8%', background: 'rgba(255, 255, 255, 0.02)', skewX: -20, pointerEvents: 'none', zIndex: 0, borderRight: '1px solid rgba(255,255,255,0.2)' }}
                  />

                  {/* Decorative background clock - Faint Fill */}
                  <div style={{ position: 'absolute', right: '4%', top: '50%', transform: `translateY(-50%) translate(${heroMousePos.x * 40}px, ${heroMousePos.y * 40}px)`, opacity: 0.12, zIndex: 1, pointerEvents: 'none', transition: 'transform 0.2s ease-out' }}>
                    <div style={{ fontSize: '12rem', fontWeight: 900, letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'flex-end' }}>
                      {(currentTime.getHours() % 12 || 12).toString().padStart(2, '0')}
                      <span style={{ animation: 'timeBlink 1s infinite', transform: 'translateY(-1rem)' }}>:</span>
                      {currentTime.getMinutes().toString().padStart(2, '0')}
                      <span style={{ fontSize: '3.5rem', fontWeight: 800, marginLeft: '1rem', letterSpacing: '-1px', marginBottom: '1.2rem' }}>{currentTime.getHours() >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                  </div>
                  {/* Decorative background clock - Top-Right Stroke Only */}
                  <div style={{ position: 'absolute', right: '4%', top: '50%', transform: `translateY(-50%) translate(${heroMousePos.x * 40}px, ${heroMousePos.y * 40}px)`, zIndex: 1, pointerEvents: 'none', transition: 'transform 0.2s ease-out' }}>
                    <div style={{ fontSize: '12rem', fontWeight: 900, letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'flex-end', color: 'transparent', textShadow: '1px -1px 0 rgba(255,255,255,0.3)' }}>
                      {(currentTime.getHours() % 12 || 12).toString().padStart(2, '0')}
                      <span style={{ animation: 'timeBlink 1s infinite', transform: 'translateY(-1rem)' }}>:</span>
                      {currentTime.getMinutes().toString().padStart(2, '0')}
                      <span style={{ fontSize: '3.5rem', fontWeight: 800, marginLeft: '1rem', letterSpacing: '-1px', marginBottom: '1.2rem' }}>{currentTime.getHours() >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, transform: `translate(${heroMousePos.x * 15}px, ${heroMousePos.y * 15}px)`, transition: 'transform 0.2s ease-out' }}>
                    <h1 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Good morning, Dr. Gilbert</h1>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 400, opacity: 0.9, maxWidth: '600px', lineHeight: 1.5 }}>Here is your schedule and clinic overview for today. You have {appointments.length} appointments and {appointments.filter(a => a.status === 'pending').length} pending reviews.</p>
                  </div>
                </motion.div>

                {/* Medical Stats Grid */}
                <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                  
                  <motion.div 
                    whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(14, 165, 233, 0.15)' }}
                    onClick={() => setActiveTab('schedule')}
                    style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)', borderRadius: '24px', padding: '30px', color: '#334155', cursor: 'pointer', border: '1px solid rgba(14, 165, 233, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', display: 'flex', alignItems: 'center', gap: '25px', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '20px', color: '#0ea5e9', boxShadow: '0 10px 20px rgba(14, 165, 233, 0.12)', position: 'relative', zIndex: 1 }}>
                      <Calendar size={32} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px', letterSpacing: '-1px' }}>{appointments.length}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Appointments Today</div>
                    </div>
                    <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '55%', height: '45%', opacity: 0.1 }} viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0,40 L10,30 L25,35 L45,15 L65,25 L85,5 L100,20 L100,40 Z" fill="#0ea5e9" />
                      <path d="M0,40 L10,30 L25,35 L45,15 L65,25 L85,5 L100,20" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                    </svg>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(139, 92, 246, 0.15)' }}
                    onClick={() => setActiveTab('patients')}
                    style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)', borderRadius: '24px', padding: '30px', color: '#334155', cursor: 'pointer', border: '1px solid rgba(139, 92, 246, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', display: 'flex', alignItems: 'center', gap: '25px', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '20px', color: '#8b5cf6', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.12)', position: 'relative', zIndex: 1 }}>
                      <Users size={32} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px', letterSpacing: '-1px' }}>03</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>New Patients</div>
                    </div>
                    <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '55%', height: '45%', opacity: 0.1 }} viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0,40 L15,25 L35,30 L55,10 L75,15 L90,5 L100,10 L100,40 Z" fill="#8b5cf6" />
                      <path d="M0,40 L15,25 L35,30 L55,10 L75,15 L90,5 L100,10" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                    </svg>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(245, 158, 11, 0.15)' }}
                    style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)', borderRadius: '24px', padding: '30px', color: '#334155', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', display: 'flex', alignItems: 'center', gap: '25px', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '20px', color: '#f59e0b', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.12)', position: 'relative', zIndex: 1 }}>
                      <Activity size={32} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px', letterSpacing: '-1px' }}>{appointments.filter(a => a.status === 'pending').length}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Pending Reviews</div>
                    </div>
                    <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '55%', height: '45%', opacity: 0.1 }} viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0,40 L10,15 L25,25 L40,5 L60,20 L80,10 L100,15 L100,40 Z" fill="#f59e0b" />
                      <path d="M0,40 L10,15 L25,25 L40,5 L60,20 L80,10 L100,15" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                  </motion.div>

                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                  {/* Next Appointment Card */}
                  <motion.div variants={itemVariants}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Next Appointment</h3>
                      <button style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View All</button>
                    </div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(14, 165, 233, 0.08)' }}
                      style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(14, 165, 233, 0.1)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                    >
                      {/* Decorative gradient blur in card */}
                      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }}></div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid rgba(14, 165, 233, 0.05)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', flexShrink: 0, overflow: 'hidden', border: '3px solid #ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Patient1&backgroundColor=f8fafc" alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Alex Mercer</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Routine Checkup</span>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>ID: P-1001</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today</div>
                          <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.2)', color: '#0f172a', padding: '8px 16px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            10:30 AM
                          </div>
                        </div>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '20px' }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1, background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.2)', color: '#0f172a', padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>View Patient Records</motion.button>
                        <motion.button whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)' }} whileTap={{ scale: 0.98 }} style={{ flex: 1, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', color: '#ffffff', padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.2)' }}>Start Consultation</motion.button>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div variants={itemVariants}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Recent Activity</h3>

                    <motion.div 
                      whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(16, 185, 129, 0.08)' }}
                      style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(16, 185, 129, 0.1)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', position: 'relative', overflow: 'hidden' }}
                    >
                      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }}></div>

                      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                        <div style={{ position: 'absolute', top: '48px', left: '23px', bottom: '-30px', width: '2px', background: 'linear-gradient(to bottom, #bae6fd, #bbf7d0)' }}></div>
                        <div style={{ background: '#e0f2fe', color: '#0ea5e9', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                          <Activity size={20} />
                        </div>
                        <div style={{ paddingTop: '4px' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Lab Results Uploaded</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Blood work for Sarah Connor is ready for review.</div>
                          <div style={{ fontSize: '0.8rem', color: '#0ea5e9', marginTop: '6px', fontWeight: 700 }}>2 hours ago</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ background: '#dcfce7', color: '#10b981', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                          <Calendar size={20} />
                        </div>
                        <div style={{ paddingTop: '4px' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Appointment Confirmed</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>John Doe confirmed his visit for tomorrow.</div>
                          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px', fontWeight: 700 }}>4 hours ago</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: '100%' }}>
                <StaffAppointmentsView />
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div key="patients" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: '100%' }}>
                <StaffPatientsView />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: '100%' }}>
                <StaffProfileView onLogout={onLogout} />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
