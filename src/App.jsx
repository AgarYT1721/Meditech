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
import { loginUser, registerPatient, logoutUser } from "./services/authService"; // addition
import { seedDatabase } from "./seed";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // App States
  const [appState, setAppState] = useState(window.innerWidth <= 768 ? 'client-auth' : 'auth'); // 'auth', 'admin'

  // Auth States
  const [authStage, setAuthStage] = useState('login'); // 'login', 'otp', 'change-password'
  const [registrationData, setRegistrationData] = useState(null);
  const [clientUid, setClientUid] = useState(null);
  
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
  const [otpCountdown, setOtpCountdown] = useState(90);
  const [otpAttempts, setOtpAttempts] = useState(0);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 2000);
    seedDatabase();
  }, []);
  
  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (authStage === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authStage, otpCountdown]);

  if (appState === 'admin') {
    return <AdminDashboard onLogout={() => setAppState('auth')} />;
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
    return <ClientDashboard clientUid={clientUid} onLogout={() => { setClientUid(null); setAppState('client-auth'); }} />;
  }

  if (appState === 'staff-dashboard') {
    return <StaffDashboard onLogout={() => setAppState('client-auth')} />;
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

  // --- your existing email validation ---
  const parts = email.split('@');
  if (parts.length === 2 && parts[1] === 'gmail.com') {
    const prefix = parts[0];
    if (prefix.length >= 6 && prefix.length <= 32 &&
        /[a-z]/.test(prefix) && /[A-Z]/.test(prefix) &&
        /\d/.test(prefix) && /[_.]/.test(prefix) &&
        /^[a-zA-Z0-9_.]+$/.test(prefix)) {
      setEmailError('');
    } else {
      setEmailError('Prefix must be 6-32 chars, mix of upper/lower/numbers/symbols(_.)');
      valid = false;
    }
  } else {
    setEmailError('Must be a valid @gmail.com address');
    valid = false;
  }

  // --- your existing password validation ---
  if (password.length >= 15 && password.length <= 20 &&
      /[a-z]/.test(password) && /[A-Z]/.test(password) &&
      /\d/.test(password) && /[!@?_\-]/.test(password) &&
      /^[a-zA-Z0-9!@?_\-]+$/.test(password)) {
    setPasswordError('');
  } else {
    setPasswordError('Must be 15-20 chars, mix of upper/lower/num/symbols(!@?_-), no emojis');
    valid = false;
  }

  if (!valid) return;

  // --- NEW: call Firebase after all validation passes ---
  try {
    setAuthError('');
    const user = await loginUser(email, password);

    if (user.role_id === 1) {
      await logoutUser();
      setAuthError('Patient accounts cannot access the Staff Portal.');
      return;
    }

    // Move to OTP stage on success
    // (plug in real navigation later when dashboards are ready)
    setAuthStage('otp');
    setOtpCountdown(90);

  } catch (err) {
  console.error("❌ Login error:", err.code, err.message); 
  setAuthError('Invalid email or password.');
}
};

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otpAttempts >= 3) return;
    
    // Mock OTP verification (any 6 digit for this demo is fine, let's use 123456)
    if (otp === '123456') { 
      setAuthStage('change-password');
    } else {
      setOtpAttempts(prev => prev + 1);
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
              </div>

              {authError && <div className="error-text">{authError}</div>}

              <button type="submit" className="btn-submit">
                Login
              </button>
              
              <button type="button" className="btn-secondary" style={{marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444'}} onClick={() => setAuthStage('change-password')}>
                <AlertTriangle size={14} /> [DEV] Simulate First Login
              </button>
              
              <button type="button" className="btn-secondary" style={{marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981'}} onClick={() => setAppState('admin')}>
                <ShieldCheck size={14} /> [DEV] Jump to Admin Dashboard
              </button>
              
              <button type="button" className="btn-secondary" style={{marginTop: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6'}} onClick={() => setAppState('staff-dashboard')}>
                <ShieldCheck size={14} /> [DEV] Jump to Staff Dashboard
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

              <button type="submit" className="btn-submit" disabled={otpAttempts >= 3}>
                Verify Identity
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                disabled={otpCountdown > 0}
                onClick={() => { setOtpCountdown(90); setOtpAttempts(0); setOtp(''); }}
              >
                {otpCountdown > 0 ? `Resend available in ${otpCountdown}s` : 'Resend OTP'}
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
