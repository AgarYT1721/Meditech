import React, { useState, useEffect } from 'react';
import { UserPlus, Key, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import StaffDashboard from './components/StaffDashboard';
import ClientLogin from './components/ClientLogin';
import ClientOtpVerification from './components/ClientOtpVerification';
import ClientForgotPassword from './components/ClientForgotPassword';
import './index.css';
import { loginUser, fetchUserDetails, registerPatient, logoutUser, resetPassword } from "./services/authService";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { validateEmail, validatePassword } from "./utils/validation";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // App States
  const [appState, setAppState] = useState(window.innerWidth <= 768 ? 'client-auth' : 'auth'); // 'auth', 'admin'

  // Auth States
  const [authStage, setAuthStage] = useState('login'); // 'login', 'otp', 'change-password'
  const [registrationData, setRegistrationData] = useState(null);
  const [clientUid, setClientUid] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState(''); // addition
  
  // Empty Field States for Custom Validation
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpRequests, setOtpRequests] = useState(1);

  // Loading States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const triggerOtp = async (userEmail, userName) => {
    try {
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName || 'Staff' })
      });
    } catch (err) {
      console.error('Failed to trigger OTP email', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await fetchUserDetails(user);
          if (data.role_id === 1) {
            setClientUid(data.uid);
            setAppState('client-dashboard');
          } else if (data.role_id === 4) {
            if (sessionStorage.getItem('otpVerified') === 'true') {
              setAppState('admin');
            } else {
              setStaffUser(data);
              setAppState('auth');
              setAuthStage('otp');
              setOtpCountdown(90);
              setOtpAttempts(0);
              setOtpRequests(1);
              setOtp('');
              triggerOtp(data.email, data.firstName);
            }
          } else {
            if (sessionStorage.getItem('otpVerified') === 'true') {
              setStaffUser(data);
              setAppState('staff-dashboard');
            } else {
              setStaffUser(data);
              setAppState('auth');
              setAuthStage('otp');
              setOtpCountdown(90);
              setOtpAttempts(0);
              setOtpRequests(1);
              setOtp('');
              triggerOtp(data.email, data.firstName);
            }
          }
        } catch (error) {
          console.error("Session restore failed:", error);
          setAppState(window.innerWidth <= 768 ? 'client-auth' : 'auth');
        }
      } else {
        setAppState(window.innerWidth <= 768 ? 'client-auth' : 'auth');
      }
      setTimeout(() => setIsLoaded(true), 1500);
      setTimeout(() => setShowSplash(false), 2000);
    });

    return () => unsubscribe();
  }, []);
  
  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (authStage === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authStage, otpCountdown]);

  const handleLogout = async (targetState) => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    sessionStorage.removeItem('otpVerified');
    setAppState(targetState);
    setAuthStage('login');
    setStaffUser(null);
    setClientUid(null);
    setEmail('');
    setPassword('');
    setOtp('');
    setOtpAttempts(0);
    setOtpRequests(1);
    setAuthError('');
  };

  if (appState === 'admin') {
    return <AdminDashboard onLogout={() => handleLogout('auth')} />;
  }

  if (appState.startsWith('client-') && appState !== 'client-dashboard') {
    return (
      <AnimatePresence mode="wait">
        {appState === 'client-auth' && (
          <ClientLogin 
            key="auth" 
            onLoginSuccess={(uid) => { setClientUid(uid); setAppState('client-dashboard'); }} 
            onRegisterSubmit={async (data) => { 
              setRegistrationData(data); 
              setAppState('client-register-otp'); 
              try {
                await fetch('/api/send-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: data.email, name: data.firstName })
                });
              } catch (err) {
                console.error('Failed to trigger OTP email', err);
              }
            }} 
            onNavigateForgot={() => setAppState('client-forgot-password')} 
          />
        )}
        {appState === 'client-register-otp' && (
          <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
            <ClientOtpVerification 
              email={registrationData?.email}
              onOtpSuccess={async () => {
                try {
                  const user = await registerPatient(registrationData.email, registrationData.password, registrationData);
                  setClientUid(user.uid);
                  setAppState('client-dashboard');
                } catch (err) {
                  console.error("Registration error:", err);
                  alert("Failed to register. Please try again.");
                }
              }} 
              onBackToRegister={() => setAppState('client-auth')} 
            />
          </motion.div>
        )}
        {appState === 'client-forgot-password' && (
          <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
            <ClientForgotPassword onBackToLogin={() => setAppState('client-auth')} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (appState === 'client-dashboard') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <ClientDashboard clientUid={clientUid} onLogout={() => handleLogout('client-auth')} />
      </motion.div>
    );
  }

  if (appState === 'staff-dashboard') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <StaffDashboard staffUser={staffUser} setStaffUser={setStaffUser} onLogout={() => handleLogout('auth')} />
      </motion.div>
    );
  }

  const handleKeyEvent = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  let valid = true;

  // --- your existing empty field checks ---
  if (!email) {
    setEmailEmpty(false);
    setTimeout(() => setEmailEmpty(true), 10);
    valid = false;
  }
  if (!password) {
    setPasswordEmpty(false);
    setTimeout(() => setPasswordEmpty(true), 10);
    valid = false;
  }
  if (!valid) return;

  // --- Strict BRD Validation ---
  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) {
    setEmailError(emailCheck.error);
    valid = false;
  } else {
    setEmailError('');
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    setPasswordError(passwordCheck.error);
    valid = false;
  } else {
    setPasswordError('');
  }

  if (!valid) return;

  // --- NEW: call Firebase after all validation passes ---
  setIsLoggingIn(true);
  try {
    setAuthError('');
    const user = await loginUser(email, password);

    if (user.role_id === 1) {
      await logoutUser();
      setAuthError('Patient accounts cannot access the Staff Portal.');
      return;
    }
    
    // onAuthStateChanged will handle the rest (routing to OTP)

  } catch (err) {
    console.error("❌ Login error:", err.code, err.message);
    setAuthError('Invalid email or password.');
  } finally {
    setIsLoggingIn(false);
  }
};

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpAttempts >= 3) return;
    if (otpCountdown === 0) {
      setAuthError('OTP expired. Please resend a new code.');
      return;
    }
    
    setAuthError('');
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffUser?.email || email, code: otp })
      });
      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem('otpVerified', 'true');
        if (staffUser?.role_id === 4) {
          setAppState('admin');
        } else {
          setAppState('staff-dashboard');
        }
      } else {
        setOtpAttempts(prev => prev + 1);
        setAuthError(data.message || 'Invalid OTP code');
      }
    } catch (err) {
      setAuthError('Failed to verify OTP: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {showSplash && <Loader onComplete={() => setShowSplash(false)} />}
      <div className="app-container" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 1s ease-out' }}>
        
        {/* Left Side: Technical Visual Section */}
        <div className="visual-section">
          <div className="ruler-top"></div>
          <div className="ruler-left"></div>
          
          {/* Corner brackets */}
          <div className="bracket tl"></div>
          <div className="bracket tr"></div>
          <div className="bracket bl"></div>
          <div className="bracket br"></div>

          {/* Coordinate Text */}
          <div className="coord-text coord-1">X: 14.502 // Y: 99.21</div>
          <div className="coord-text coord-2">SYS.OP.NORMAL</div>
          <div className="coord-text coord-3">AXIS // 0.0.0.0</div>
          
          {/* Vertical System Text */}
          <div className="vertical-text">SYS.AUTH_PROTOCOL // ACTIVE</div>
          
          {/* Floating Glass Squares */}
          <div className="floating-square sq-1"></div>
          <div className="floating-square sq-2"></div>
          <div className="floating-square sq-3"></div>

          {/* Giant Cross Logo Watermark (Replacing "AUTH") */}
          <svg className="giant-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="snakeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 V10 Z" fill="url(#crossGrad)" />
            
            {/* Rod of Asclepius - Winding Snake */}
            <path d="M 40 90 C 60 95, 75 80, 50 65 C 20 50, 30 30, 55 25 C 70 20, 70 5, 45 10" fill="none" stroke="url(#snakeGrad)" strokeWidth="4.5" strokeLinecap="round" />
            <g opacity="0.8">
              <path d="M 45 7 C 35 3, 25 9, 30 15 C 35 17, 42 15, 45 13 Z" fill="var(--secondary)" />
              <circle cx="35" cy="10" r="1.5" fill="#ffffff" />
              <path d="M 30 15 L 24 17 L 21 15 M 24 17 L 22 20" fill="none" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Right Side: Auth Panel */}
        <div className="auth-section">
          {/* Decorative Elements - Arknights Inspired */}
          <div className="ark-line-h" style={{ top: '15%' }}></div>
          <div className="ark-line-h" style={{ top: '82%', borderTopStyle: 'dashed' }}></div>
          <div className="ark-line-v" style={{ left: '12%' }}></div>
          <div className="ark-line-v" style={{ right: '22%', borderLeftStyle: 'dashed' }}></div>

          <div className="ark-dot-matrix"></div>
          
          <div className="ark-emblem">
            <svg viewBox="0 0 40 40">
              <path d="M 0 10 L 0 0 L 10 0 M 30 0 L 40 0 L 40 10 M 40 30 L 40 40 L 30 40 M 10 40 L 0 40 L 0 30" fill="none" stroke="var(--text-muted)" strokeWidth="2" />
              <path d="M 10 15 h 20 M 10 25 h 20 M 15 10 v 20 M 25 10 v 20" fill="none" stroke="var(--text-muted)" strokeWidth="2" />
              <rect x="18" y="18" width="4" height="4" fill="var(--text-main)" />
            </svg>
          </div>

          <div className="ark-square solid" style={{ top: '8%', right: '25%', width: '35px', height: '35px' }}></div>
          <div className="ark-square outline" style={{ top: '22%', right: '8%', width: '50px', height: '50px' }}></div>
          <div className="ark-square solid" style={{ bottom: '15%', right: '35%', width: '45px', height: '45px' }}></div>
          <div className="ark-square solid tiny" style={{ bottom: '28%', right: '15%' }}></div>

          <div className="ark-stripes">
            <div></div><div></div><div></div><div></div><div></div>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">MEDITECH</h1>
            <div className="auth-subtitle">Secure Staff Portal</div>
            <p className="auth-desc">
              {authStage === 'login' && 'Please log in with your credentials to access patient records and clinical schedules.'}
              {authStage === 'otp' && 'A 6-digit verification code has been sent to your registered device. Please enter it below.'}
              {authStage === 'change-password' && 'Welcome to MediTech. Please set a secure password to initialize your account.'}
            </p>
          </div>

          {authStage === 'login' && (
            <form className="auth-form" noValidate onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>ID_CREDENTIAL</label>
                <div className="input-wrapper">
                  <div className={`caps-warning-tab ${capsLockActive && focusedField === 'email' ? 'active' : ''}`}>
                    <AlertTriangle size={12}/> CAPS LOCK ACTIVE
                  </div>
                  <input 
                    type="text" 
                    className={`form-input ${emailError ? 'error-border' : ''} ${emailEmpty ? 'shake-empty' : ''}`} 
                    placeholder="Enter identification (@gmail.com)" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value) setEmailEmpty(false);
                    }}
                    onKeyDown={handleKeyEvent}
                    onKeyUp={handleKeyEvent}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required 
                  />
                </div>
                {emailError && !emailEmpty && <div className="error-text">{emailError}</div>}
              </div>
              
              <div className="form-group">
                <label>PASSCODE</label>
                <div className="input-wrapper">
                  <div className={`caps-warning-tab ${capsLockActive && focusedField === 'password' ? 'active' : ''}`}>
                    <AlertTriangle size={12}/> CAPS LOCK ACTIVE
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className={`form-input ${passwordError ? 'error-border' : ''} ${passwordEmpty ? 'shake-empty' : ''}`} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) setPasswordEmpty(false);
                    }}
                    onKeyDown={handleKeyEvent}
                    onKeyUp={handleKeyEvent}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required 
                  />
                  <button type="button" className="btn-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && !passwordEmpty && <div className="error-text">{passwordError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => { setAuthStage('forgot-password'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'monospace', opacity: 0.8 }}>
                    [FORGOT_PASSCODE?]
                  </button>
                </div>
              </div>

              {authError && <div className="error-text">{authError}</div>}

              <button type="submit" className="btn-submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          )}

          {authStage === 'otp' && (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label>ONE_TIME_PASSCODE (OTP)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: 'bold' }}
                  placeholder="000000" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required 
                />
                {otpAttempts > 0 && <div className="error-text">Failed attempts: {otpAttempts}/3</div>}
              </div>

              {authError && <div className="error-text">{authError}</div>}

              <button type="submit" className="btn-submit" disabled={otpAttempts >= 3 || isVerifying || otpCountdown === 0}>
                {isVerifying ? 'Verifying...' : 'Verify Identity'}
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                disabled={otpCountdown > 0 || otpRequests >= 5}
                onClick={() => { setOtpCountdown(90); setOtpAttempts(0); setOtp(''); setOtpRequests(prev => prev + 1); triggerOtp(staffUser?.email || email, staffUser?.firstName); }}
              >
                {otpRequests >= 5 ? 'Maximum requests reached' : (otpCountdown > 0 ? `Resend available in ${otpCountdown}s` : `Resend OTP (${5 - otpRequests} left)`)}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleLogout('auth')}
                style={{ marginTop: '15px', color: '#ef4444', borderStyle: 'dashed' }}
              >
                CANCEL / RETURN TO LOGIN
              </button>
            </form>
          )}

          {authStage === 'forgot-password' && (
            <form className="auth-form" onSubmit={async (e) => {
              e.preventDefault();
              if (email) {
                setIsLoggingIn(true);
                try {
                  await resetPassword(email);
                  alert('Password reset email sent! Check your inbox.');
                  setAuthStage('login');
                  setAuthError('');
                } catch (err) {
                  setAuthError('Failed to send reset email: ' + err.message);
                } finally {
                  setIsLoggingIn(false);
                }
              }
            }}>
              <div className="form-group">
                <label>ID_CREDENTIAL (EMAIL)</label>
                <div className="input-wrapper">
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="Enter your registered email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              {authError && <div className="error-text">{authError}</div>}

              <button type="submit" className="btn-submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'TRANSMITTING...' : 'SEND RESET LINK'}
              </button>
              
              <button type="button" className="btn-secondary" onClick={() => { setAuthStage('login'); setAuthError(''); }} style={{ marginTop: '15px' }}>
                ABORT / RETURN
              </button>
            </form>
          )}

          {authStage === 'change-password' && (
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); alert('Password Changed Successfully! Redirecting to Dashboard...'); setAuthStage('login'); setPassword(''); setEmail(''); }}>
              <div className="form-group">
                <label>NEW_PASSCODE</label>
                <div className="input-wrapper">
                  <div className={`caps-warning-tab ${capsLockActive && focusedField === 'new-password' ? 'active' : ''}`}>
                    <AlertTriangle size={12}/> CAPS LOCK ACTIVE
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder="••••••••" 
                    onKeyDown={handleKeyEvent}
                    onKeyUp={handleKeyEvent}
                    onFocus={() => setFocusedField('new-password')}
                    onBlur={() => setFocusedField(null)}
                    required 
                  />
                  <button type="button" className="btn-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Commit Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
