import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff, Mail, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import '../index.css';
import { loginUser, logoutUser } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validation';

const ClientLogin = ({ onLoginSuccess, onRegisterSubmit, onNavigateForgot }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    password: ''
  });
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      const emailCheck = validateEmail(email);
      const passwordCheck = validatePassword(password);
      
      if (!emailCheck.isValid) {
        setLoginError(emailCheck.error);
        return;
      }
      if (!passwordCheck.isValid) {
        setLoginError(passwordCheck.error);
        return;
      }

      setIsLoading(true);
      setLoginError('');
      try {
        const user = await loginUser(email, password);
        if (user.role_id !== 1) {
          await logoutUser();
          setLoginError('Staff accounts cannot access the Patient Portal.');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(user.uid);
      } catch (err) {
        let errMsg = 'Invalid email or password.';
        if (err.message && !err.message.includes('auth/')) {
          errMsg = err.message;
        }
        setLoginError(errMsg);
        console.error("Login Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegisterChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError('');
    if (formData.firstName && formData.email && formData.password) {
      const emailCheck = validateEmail(formData.email);
      if (!emailCheck.isValid) {
        setRegisterError(emailCheck.error);
        return;
      }
      
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        setRegisterError(passwordCheck.error);
        return;
      }

      onRegisterSubmit(formData);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="mobile-auth-wrapper" style={{
      minHeight: '100vh', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f7ff, #ffffff)', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden', padding: '20px 0'
    }}>
      {/* Soft Background Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(0, 102, 255, 0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'floatSlow 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(0, 191, 255, 0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'floatFast 6s ease-in-out infinite' }}></div>

      <motion.div layoutId="auth-card" className="mobile-auth-container" style={{
        width: '100%', maxWidth: '420px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05), border 1px solid rgba(255,255,255,0.6)', position: 'relative', zIndex: 10, margin: '20px'
      }}>
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div key="login" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.1)' }}>
                  <Logo size={40} />
                </div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#181818', fontWeight: 800 }}>MEDITECH</h1>
                <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.95rem' }}>Access your medical records securely.</p>
              </motion.div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loginError && (
                  <motion.div variants={itemVariants} style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                    {loginError}
                  </motion.div>
                )}
                <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><User size={18} /></div>
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '16px 16px 16px 45px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><Lock size={18} /></div>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ width: '100%', padding: '16px 45px 16px 45px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '15px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'right', marginTop: '-10px' }}>
                  <span onClick={onNavigateForgot} style={{ color: '#0066ff', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Forgot Password?</span>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button type="submit" disabled={isLoading} style={{
                    width: '100%', padding: '16px', background: 'linear-gradient(90deg, #0066ff, #00bfff)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 15px rgba(0, 102, 255, 0.2)', marginTop: '10px', opacity: isLoading ? 0.7 : 1
                  }}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                Don't have an account? <span onClick={() => setIsLogin(false)} style={{ color: '#0066ff', fontWeight: 600, cursor: 'pointer' }}>Register Here</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="register" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.1)' }}>
                  <Logo size={32} />
                </div>
                <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#181818', fontWeight: 800 }}>Create Account</h1>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '0.9rem' }}>Join MediTech to access your records.</p>
              </motion.div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {registerError && (
                  <motion.div variants={itemVariants} style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                    {registerError}
                  </motion.div>
                )}
                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '15px' }}>
                  <div className="mobile-input-group" style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><User size={16} /></div>
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleRegisterChange} required
                      style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="mobile-input-group" style={{ position: 'relative', flex: 1 }}>
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleRegisterChange} required
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><Calendar size={16} /></div>
                  <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleRegisterChange} required
                    style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: formData.dob ? '#181818' : '#888' }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><Mail size={16} /></div>
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleRegisterChange} required
                    style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><Phone size={16} /></div>
                  <input type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleRegisterChange} required
                    style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mobile-input-group">
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: '#888' }}><Lock size={16} /></div>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Create Password" value={formData.password} onChange={handleRegisterChange} required
                      style={{ width: '100%', padding: '14px 45px 14px 40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '15px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px', paddingLeft: '5px' }}>
                    Must be 15-20 characters, include uppercase, lowercase, numbers, and symbols (!@?_-).
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button type="submit" style={{
                    width: '100%', padding: '16px', background: 'linear-gradient(90deg, #0066ff, #00bfff)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 15px rgba(0, 102, 255, 0.2)', marginTop: '10px'
                  }}>
                    Continue to Verification
                  </button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                Already have an account? <span onClick={() => setIsLogin(true)} style={{ color: '#0066ff', fontWeight: 600, cursor: 'pointer' }}>Sign In</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ClientLogin;
