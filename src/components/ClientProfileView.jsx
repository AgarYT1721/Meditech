import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Phone, MapPin, Shield, ChevronRight } from 'lucide-react';

const ClientProfileView = ({ onLogout }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '20px', width: '100%', boxSizing: 'border-box', display: 'block' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#181818' }}>Profile</h2>
      </div>

      <motion.div variants={itemVariants} style={{ background: '#fff', borderRadius: '20px', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f8fafc', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px' }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PatientOne" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#e2e8f0' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#181818' }}>Alex Mercer</h3>
        <span style={{ background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
          ID: #8492-AX
        </span>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#666' }}>Personal Information</h3>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <User size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Full Name</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>Alex Mercer</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Mail size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>alex.mercer@example.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Phone size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Phone Number</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>+1 (555) 123-4567</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px' }}>
            <MapPin size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Date of Birth</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>12 April 1990</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#666' }}>Settings</h3>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <button style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#181818', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Shield size={18} color="#0066ff" /> Change Password
            </div>
            <ChevronRight size={18} color="#ccc" />
          </button>
          <button 
            onClick={onLogout}
            style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '15px', color: '#ef4444', fontWeight: 600 }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default ClientProfileView;
