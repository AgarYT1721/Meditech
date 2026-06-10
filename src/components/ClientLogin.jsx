import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import '../index.css';

const ClientLogin = ({ onLoginSuccess, onNavigateRegister, onNavigateForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      onLoginSuccess();
    }
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
      overflow: 'hidden'
    }}>
      {/* Soft Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(0, 102, 255, 0.1)', borderRadius: '50%', filter: 'blur(60px)', animation: 'floatSlow 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(0, 191, 255, 0.15)', borderRadius: '50%', filter: 'blur(60px)', animation: 'floatFast 6s ease-in-out infinite' }}></div>

      <motion.div 
        layoutId="auth-card"
        className="mobile-auth-container" 
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05), border 1px solid rgba(255,255,255,0.6)',
          position: 'relative',
          zIndex: 10,
          margin: '20px'
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
        
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.1)' }}>
            <Logo size={40} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#181818', fontWeight: 800 }}>MEDITECH</h1>
          <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.95rem' }}>Access your medical records securely.</p>
        </motion.div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}>
              <User size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 16px 16px 45px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#f8fafc',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}>
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </motion.div>

          <motion.div variants={itemVariants} style={{ textAlign: 'right', marginTop: '-10px' }}>
            <span onClick={onNavigateForgot} style={{ color: '#0066ff', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Forgot Password?</span>
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
              Sign In
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Don't have an account? <span onClick={onNavigateRegister} style={{ color: '#0066ff', fontWeight: 600, cursor: 'pointer' }}>Register Here</span>
        </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClientLogin;
