export const G = {
  bg: '#07070f', bg2: '#0a0a16', card: '#0f0f1e', card2: '#161626',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(232,65,24,0.35)',
  accent: '#E84118', accent2: '#FF6B3D', muted: 'rgba(200,200,230,0.45)',
  text: '#e8e8f8', teal: '#00C88C', gold: '#FFBE00', red: '#EF4444', purple: '#7C3AED',
};

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{overflow-x:hidden}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e1e30;border-radius:2px}
  input{font-family:'Plus Jakarta Sans',sans-serif;background:#0f0f1e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 16px 11px 42px;color:#e8e8f8;outline:none;font-size:13px;width:100%;transition:border-color .2s}
  input:focus{border-color:rgba(232,65,24,0.4)}
  input::placeholder{color:rgba(200,200,230,0.28)}
  @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  .view{animation:fadeup .32s ease}
  .expo-card:hover{transform:translateY(-6px)!important;box-shadow:0 20px 60px rgba(232,65,24,0.1)!important}
  .ex-card:hover{transform:translateY(-5px)!important;box-shadow:0 14px 44px rgba(232,65,24,0.08)!important}
  .fp-cell:hover{transform:scale(1.06)!important}
`;