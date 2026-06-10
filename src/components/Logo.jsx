import React from 'react';

const Logo = ({ size = 32, className = '', color }) => (
  <svg 
    className={`logo-icon ${className}`} 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#00bfff" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="snakeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#0066ff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#00bfff" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 V10 Z" fill={color || "url(#crossGrad)"} />
    
    <path d="M 40 90 C 60 95, 75 80, 50 65 C 20 50, 30 30, 55 25 C 70 20, 70 5, 45 10" fill="none" stroke={color || "url(#snakeGrad)"} strokeWidth="4.5" strokeLinecap="round" />
    <g opacity={color === 'white' ? "1" : "0.8"}>
      <path d="M 45 7 C 35 3, 25 9, 30 15 C 35 17, 42 15, 45 13 Z" fill={color || "#00bfff"} />
      <circle cx="35" cy="10" r="1.5" fill="#ffffff" />
      <path d="M 30 15 L 24 17 L 21 15 M 24 17 L 22 20" fill="none" stroke={color === 'white' ? '#ffffff' : '#ef4444'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export default Logo;
