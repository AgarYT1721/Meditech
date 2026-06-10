import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const ClientResetPassword = ({ onSubmitReset, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password === formData.confirmPassword) {
      setIsSuccess(true);
      setTimeout(() => {
        onSubmitReset(formData.password);
      }, 2500);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.15, staggerChildren: 0.1 }
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="mobile-auth-wrapper" style={{
      minHeight: '100vh',
      width: '100%',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f7ff, #ffffff)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px 0'
    }}>
      {/* Soft Background Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(0, 102, 255, 0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'floatSlow 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(0, 191, 255, 0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'floatFast 6s ease-in-out infinite' }}></div>

      <motion.div 
        layoutId="auth-card"
        className="mobile-auth-container" 
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.6)',
          position: 'relative',
          zIndex: 10,
          margin: '20px'
        }}
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
            
            <motion.div variants={itemVariants}>
              <button 
              onClick={onBackToLogin} 
              style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '30px', fontSize: '0.9rem', padding: 0 }}
            >
              <ArrowLeft size={16} /> Cancel
              </button>
            </motion.div>

            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.1)' }}>
                <Logo size={40} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#181818', fontWeight: 800 }}>Create New Password</h1>
              <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Your new password must be different from previous used passwords.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <motion.div variants={itemVariants} className="mobile-input-group">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="New Password" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 45px 16px 45px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: '#f8fafc',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div 
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '15px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px', paddingLeft: '5px' }}>
                  Must be 15-20 characters, include uppercase, lowercase, numbers, and symbols (!@?_-).
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mobile-input-group">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    placeholder="Confirm New Password" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 45px 16px 45px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: '#f8fafc',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div 
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '15px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button type="submit" style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(90deg, #0066ff, #00bfff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 8px 15px rgba(0, 102, 255, 0.2)',
                  marginTop: '10px'
                }}>
                  Reset Password
                </button>
              </motion.div>
            </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ textAlign: 'center', padding: '40px 0' }}
            >
              <motion.div variants={itemVariants} style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle color="white" size={40} />
              </motion.div>
              <motion.h1 variants={itemVariants} style={{ margin: 0, fontSize: '1.8rem', color: '#181818', fontWeight: 800 }}>Password Reset!</motion.h1>
              <motion.p variants={itemVariants} style={{ margin: '15px 0 0 0', color: '#666', fontSize: '1rem', lineHeight: 1.5 }}>
                Your password has been successfully updated. Redirecting to sign in...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ClientResetPassword;
