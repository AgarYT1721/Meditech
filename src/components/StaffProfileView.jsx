import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, Settings, Shield, Bell, HelpCircle, Mail, Phone, MapPin, Edit2, Check, X, Camera } from 'lucide-react';
import { updateStaffProfile, updateStaffProfilePicture, resetPassword } from '../services/authService';

const StaffProfileView = ({ staffUser, setStaffUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: staffUser?.phone || '+1 (555) 123-4567',
    office: staffUser?.office || 'Room 402, Building B'
  });
  const [profilePic, setProfilePic] = useState(staffUser?.profilePicture || null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const handlePasswordReset = async () => {
    if (!staffUser?.email) return;
    try {
      await resetPassword(staffUser.email);
      setPasswordMessage({ text: 'Password reset email sent! Please check your inbox.', type: 'success' });
    } catch (error) {
      console.error(error);
      setPasswordMessage({ text: 'Failed to send password reset email.', type: 'error' });
    }
  };

  const handleSaveContactInfo = async () => {
    setIsSaving(true);
    try {
      await updateStaffProfile(staffUser.uid, contactInfo.phone, contactInfo.office);
      if (setStaffUser) {
        setStaffUser(prev => ({ ...prev, phone: contactInfo.phone, office: contactInfo.office }));
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPic(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL("image/jpeg", 0.7);

          setProfilePic(base64String);
          await updateStaffProfilePicture(staffUser.uid, base64String);
          if (setStaffUser) {
            setStaffUser(prev => ({ ...prev, profilePicture: base64String }));
          }
          setIsUploadingPic(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image.");
      setIsUploadingPic(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Menu items replaced with direct password change

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
        
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#fff', padding: '4px', marginBottom: '15px', zIndex: 1, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
        >
          <img src={profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffUser?.firstName || 'Klaus'}&backgroundColor=e2e8f0`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
            {isUploadingPic ? <span style={{ color: 'white', fontSize: '12px' }}>...</span> : <Camera size={24} color="white" />}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, zIndex: 1 }}>Dr. {staffUser?.firstName} {staffUser?.lastName}</h3>
        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px', zIndex: 1, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>{staffUser?.specialization}</div>
      </motion.div>

      {/* Contact Info Card */}
      <motion.div variants={itemVariants} style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>Contact Information</h4>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Edit2 size={14} /> Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSaveContactInfo} disabled={isSaving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>{staffUser?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <Phone size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Phone</div>
              {!isEditing ? (
                <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>{contactInfo.phone}</div>
              ) : (
                <input type="text" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <MapPin size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Office</div>
              {!isEditing ? (
                <div style={{ fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>{contactInfo.office}</div>
              ) : (
                <input type="text" value={contactInfo.office} onChange={(e) => setContactInfo({...contactInfo, office: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Settings (Password Change) */}
      <motion.div variants={itemVariants} style={{ background: '#fff', borderRadius: '20px', padding: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        
        {passwordMessage.text && (
          <div style={{ margin: '15px 15px 0 15px', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, background: passwordMessage.type === 'error' ? '#fef2f2' : '#ecfdf5', color: passwordMessage.type === 'error' ? '#ef4444' : '#10b981', border: `1px solid ${passwordMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
            {passwordMessage.text}
          </div>
        )}

        <button 
          onClick={handlePasswordReset}
          style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#181818', fontWeight: 600, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#181818' }}>Change Password (Email Link)</span>
          </div>
          <ChevronRight size={20} color="#adb5bd" />
        </button>
      </motion.div>

      {/* Redundant logout button removed per user request */}
      
    </motion.div>
  );
};

export default StaffProfileView;
