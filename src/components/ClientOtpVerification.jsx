import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const ClientOtpVerification = ({ email, onOtpSuccess, onBackToRegister }) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(90);
  const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success', 'cascading-out'
  const inputRef = useRef(null);

  useEffect(() => {
    if (status === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otp })
        });
        const result = await response.json();
        
        if (result.success) {
          setStatus('success');
          setTimeout(() => {
            onOtpSuccess();
          }, 1500);
        } else {
          setStatus('error');
          setTimeout(() => {
            setStatus('cascading-out'); 
            setTimeout(() => {
              setOtp('');
              setStatus('idle');
            }, 600); 
          }, 800);
        }
      } catch (err) {
        console.error("OTP Verification Error:", err);
        setStatus('error');
        setTimeout(() => {
          setStatus('cascading-out');
          setTimeout(() => { setOtp(''); setStatus('idle'); }, 600);
        }, 800);
      }
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
        
        <motion.div variants={itemVariants}>
          <button 
          onClick={onBackToRegister} 
          style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '30px', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
          </button>
        </motion.div>

        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(0, 102, 255, 0.1)' }}>
            <Logo size={40} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#181818', fontWeight: 800 }}>Verify Account</h1>
          <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
            We've sent a 6-digit code to your email. Enter it below to activate your account.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <motion.div variants={itemVariants} className="mobile-input-group" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <input 
                ref={inputRef}
                type="text" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={status !== 'idle'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  zIndex: 10,
                  cursor: status === 'idle' ? 'text' : 'default'
                }}
              />
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] || '';
                const isFocused = otp.length === index;
                
                return (
                  <div
                    key={index}
                    style={{
                      width: '45px',
                      height: '55px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: (status === 'error' || status === 'cascading-out') ? '#ef4444' : status === 'success' ? '#10b981' : '#181818',
                      background: '#f8fafc',
                      border: `2px solid ${(status === 'error' || status === 'cascading-out') ? '#ef4444' : status === 'success' ? '#10b981' : char || isFocused ? '#0066ff' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '12px',
                      boxShadow: status === 'success' ? '0 4px 10px rgba(16, 185, 129, 0.15)' : isFocused ? '0 4px 10px rgba(0, 102, 255, 0.15)' : 'none',
                      transition: 'border 0.2s, box-shadow 0.2s, color 0.2s'
                    }}
                  >
                    <motion.span
                      initial={false}
                      animate={
                        status === 'cascading-out'
                          ? { y: [0, 20], opacity: [1, 0] }
                          : { y: 0, opacity: 1 }
                      }
                      transition={{
                        delay: status === 'cascading-out' ? index * 0.05 : 0,
                        duration: 0.3
                      }}
                    >
                      {char}
                    </motion.span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button 
              type="submit" 
              disabled={otp.length !== 6 || status !== 'idle'}
              animate={
                status === 'error' ? { x: [-10, 10, -10, 10, 0] } : {}
              }
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                padding: '16px',
                background: (status === 'error' || status === 'cascading-out')
                  ? '#ef4444' 
                  : status === 'success' 
                    ? '#10b981' 
                    : otp.length !== 6
                      ? '#cbd5e1'
                      : 'linear-gradient(90deg, #0066ff, #00bfff)',
                color: otp.length !== 6 ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: otp.length === 6 && status === 'idle' ? 'pointer' : 'not-allowed',
                boxShadow: (status === 'error' || status === 'cascading-out')
                  ? '0 8px 15px rgba(239, 68, 68, 0.3)' 
                  : status === 'success'
                    ? '0 8px 15px rgba(16, 185, 129, 0.3)'
                    : otp.length !== 6
                      ? 'none'
                      : '0 8px 15px rgba(0, 102, 255, 0.2)',
                marginTop: '10px',
                transition: 'background 0.3s, color 0.3s, box-shadow 0.3s'
              }}
            >
              {(status === 'error' || status === 'cascading-out') ? 'Wrong OTP' : status === 'success' ? 'Verification Successful' : 'Verify & Activate'}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          {countdown > 0 ? (
            <span>Resend code in <span style={{ fontWeight: 'bold' }}>{countdown}s</span></span>
          ) : (
            <span onClick={() => setCountdown(90)} style={{ color: '#0066ff', fontWeight: 600, cursor: 'pointer' }}>Resend Verification Code</span>
          )}
        </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClientOtpVerification;
