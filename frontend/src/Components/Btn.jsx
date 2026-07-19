import React from 'react';
import { G } from '@utils/theme.js';

export default function Btn({children, onClick, variant='primary', size='sm', style={}}) {
  const vs = {
    primary: {background: G.accent, color: '#fff'},
    secondary: {background: 'rgba(255,255,255,.06)', color: G.muted, border: `1px solid ${G.border}`},
    danger: {background: 'rgba(239,68,68,.1)', color: '#EF4444'},
    ghost: {background: 'transparent', color: G.muted}
  };
  const sz = {
    sm: {padding: '7px 14px', fontSize: 12},
    md: {padding: '11px 24px', fontSize: 13},
    lg: {padding: '13px 30px', fontSize: 14}
  };
  return (
    <button 
      onClick={onClick} 
      style={{
        cursor:'pointer', border:'none', borderRadius:10, fontWeight:700, 
        fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all .2s', 
        display:'inline-flex', alignItems:'center', gap:6, 
        ...sz[size], ...vs[variant], ...style
      }} 
      onMouseEnter={e => {e.currentTarget.style.opacity='.85'; e.currentTarget.style.transform='translateY(-2px)'}} 
      onMouseLeave={e => {e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'}}
    >
      {children}
    </button>
  );
}