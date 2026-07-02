import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail, Phone, MapPin, Shield, ChevronRight, CheckCircle2, Camera, Loader2 } from 'lucide-react';
import { resetPassword } from '../services/authService';
import { uploadProfilePicture } from '../services/patientService';

const ClientProfileView = ({ patientData, onLogout, onProfileUpdate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const [notification, setNotification] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !patientData?.uid) return;
    
    setIsUploading(true);
    try {
      await uploadProfilePicture(file, patientData.uid);
      setNotification('Profile picture updated successfully!');
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error(error);
      setNotification('Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!patientData?.email) return;
    try {
      await resetPassword(patientData.email);
      setNotification('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error(error);
      setNotification('Failed to send password reset email.');
    }
  };

  return (
    <>
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            background: 'white',
            color: '#0066ff',
            padding: '16px 20px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 102, 255, 0.15)',
            border: '1px solid rgba(0, 102, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            zIndex: 1000,
            fontWeight: 700,
            fontSize: '0.9rem',
            textAlign: 'center'
          }}
        >
          <CheckCircle2 size={18} />
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
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
        <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '15px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f8fafc', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img src={patientData?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData?.uid || 'PatientOne'}&backgroundColor=b6e3f4`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#e2e8f0' }} />
          </div>
          <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#0066ff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,102,255,0.4)', border: '2px solid white' }}>
            {isUploading ? <Loader2 size={16} color="white" className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={16} color="white" />}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#181818' }}>{patientData ? `${patientData.firstName} ${patientData.lastName}` : 'Guest'}</h3>
        <span style={{ background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
          ID: #{patientData?.uid?.substring(0,6).toUpperCase() || '0000-XX'}
        </span>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#666' }}>Personal Information</h3>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <User size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Full Name</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>{patientData ? `${patientData.firstName} ${patientData.lastName}` : '-'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Mail size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>{patientData?.email || '-'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Phone size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Phone Number</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>{patientData?.contactNumber || '-'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px' }}>
            <MapPin size={18} color="#888" style={{ marginRight: '15px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Date of Birth</div>
              <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 600, marginTop: '2px' }}>{patientData?.dateOfBirth || '-'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#666' }}>Settings</h3>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <button 
            onClick={handlePasswordReset}
            style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#181818', fontWeight: 600, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Shield size={18} color="#0066ff" /> Change Password
            </div>
            <ChevronRight size={18} color="#ccc" />
          </button>
          <button 
            onClick={() => setShowLogoutModal(true)}
            style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '15px', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center' }}
            >
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#0f172a' }}>Confirm Logout</h3>
              <p style={{ margin: '0 0 25px 0', color: '#64748b', fontSize: '0.95rem' }}>Are you sure you want to securely log out of your account?</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { setShowLogoutModal(false); onLogout(); }} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Log Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
    </>
  );
};

export default ClientProfileView;
