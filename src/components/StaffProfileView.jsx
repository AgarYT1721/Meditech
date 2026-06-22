import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, Settings, Shield, Bell, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';

const StaffProfileView = ({ onLogout }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const menuItems = [
    { icon: <Settings size={20} />, label: 'Account Settings', color: '#6366f1' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', color: '#10b981' },
    { icon: <Bell size={20} />, label: 'Notifications', color: '#f59e0b' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', color: '#0ea5e9' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}
    >
      {/* Main Profile Card */}
      <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', borderRadius: '24px', padding: '25px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.25)', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#fff', padding: '4px', marginBottom: '15px', zIndex: 1 }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Klaus&backgroundColor=e2e8f0" alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, zIndex: 1 }}>Dr. Klaus Gilbert</h3>
        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px', zIndex: 1, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>Dentist • ID: D-8821</div>
      </motion.div>

      {/* Contact Info Card */}
      <motion.div variants={itemVariants} style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>Contact Information</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>klaus.g@meditech.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Phone</div>
              <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>+1 (555) 123-4567</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Office</div>
              <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>Room 402, Building B</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu Options */}
      <motion.div variants={itemVariants} style={{ background: '#fff', borderRadius: '20px', padding: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        {menuItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: idx !== menuItems.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: `${item.color}15`, color: item.color, padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#181818' }}>{item.label}</span>
            </div>
            <ChevronRight size={20} color="#adb5bd" />
          </div>
        ))}
      </motion.div>

      {/* Redundant logout button removed per user request */}
      
    </motion.div>
  );
};

export default StaffProfileView;
