import React from 'react';
import { G } from '@utils/theme.js';

export default function Card({children, style={}, className=''}) {
  return (
    <div 
      className={className} 
      style={{
        background: G.card, borderRadius: 14, 
        border: `1px solid ${G.border}`, transition: 'all .28s', ...style
      }}
    >
      {children}
    </div>
  );
}