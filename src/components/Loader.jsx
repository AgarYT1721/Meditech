import React, { useEffect, useState } from 'react';
import './Loader.css';

export default function Loader({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // The CSS animation hides it at 2.5s, so we unmount it at 2.6s to be safe
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="sys-loader">
      <div className="loader-glow-1"></div>
      <div className="loader-glow-2"></div>
      <div className="loader-bg-squares"></div>
      <div className="loader-bg-logo">
        <svg viewBox="0 0 100 130">
          <rect className="cross-v" x="35" y="0" width="30" height="100"/>
          <rect className="cross-h" x="0" y="35" width="100" height="30"/>
          <path className="snake" d="M 40 90 C 60 95, 75 80, 50 65 C 20 50, 30 30, 55 25 C 70 20, 70 5, 45 10" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <g className="snake-head">
            <path d="M 45 7 C 35 3, 25 9, 30 15 C 35 17, 42 15, 45 13 Z" fill="#0f172a" />
            <circle cx="35" cy="10" r="1.5" fill="#ffffff" />
            <path d="M 30 15 L 24 17 L 21 15 M 24 17 L 22 20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text className="loader-text" x="50" y="125" textAnchor="middle">MEDITECH</text>
        </svg>
        <div className="logo-shine">
          <svg viewBox="0 0 100 130">
            <rect className="cross-v" x="35" y="0" width="30" height="100"/>
            <rect className="cross-h" x="0" y="35" width="100" height="30"/>
            <path className="snake" d="M 40 90 C 60 95, 75 80, 50 65 C 20 50, 30 30, 55 25 C 70 20, 70 5, 45 10" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            <g className="snake-head">
              <path d="M 45 7 C 35 3, 25 9, 30 15 C 35 17, 42 15, 45 13 Z" fill="#ffffff" />
              <circle cx="35" cy="10" r="1.5" fill="#0f172a" />
              <path d="M 30 15 L 24 17 L 21 15 M 24 17 L 22 20" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text className="loader-text" x="50" y="125" textAnchor="middle">MEDITECH</text>
          </svg>
        </div>
      </div>
      
      <div className="loader-geom-bg">
        <div className="geom-circle"></div>
        <div className="geom-circle-2"></div>
        <div className="geom-line-h"></div>
        <div className="geom-line-h2"></div>
        <div className="geom-line-v"></div>
        <div className="geom-line-v2"></div>
        
        <div className="geom-plus" style={{top: '20%', left: '15%'}}></div>
        <div className="geom-plus" style={{top: '70%', left: '80%'}}></div>
        <div className="geom-plus" style={{top: '40%', left: '85%'}}></div>
        <div className="geom-plus" style={{top: '85%', left: '30%'}}></div>
        <div className="geom-plus" style={{top: '10%', left: '60%'}}></div>
        <div className="geom-plus" style={{top: '50%', left: '40%'}}></div>
        <div className="geom-plus" style={{top: '30%', left: '70%'}}></div>
        
        <div className="geom-dashed-h"></div>
        <div className="geom-dashed-v"></div>
        
        <div className="geom-6x6-grid">
          <div></div><div></div><div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>

        <div className="geom-main-frame">
          <div className="geom-dot-cluster"></div>
          <div className="geom-dot-cluster-2"></div>
          <div className="geom-glass-sq g-sq-1"></div>
          <div className="geom-glass-sq g-sq-2"></div>
          <div className="geom-glass-sq g-sq-3"></div>
          <div className="geom-glass-sq g-sq-4"></div>
          <div className="geom-glass-sq g-sq-5"></div>
        </div>
      </div>
    </div>
  );
}
