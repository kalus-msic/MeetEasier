import React, { Component } from 'react';

const wrap = {
  position: 'fixed',
  inset: 0,
  top: 0, left: 0, right: 0, bottom: 0,
  background: '#050608',
  color: '#fff',
  fontFamily: 'Inter Tight, system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 22,
  zIndex: 1,
  overflow: 'hidden',
};

const bloom = {
  position: 'absolute',
  inset: '-15%',
  pointerEvents: 'none',
  filter: 'blur(80px)',
  background:
    'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(34,197,94,0.16), transparent 60%), ' +
    'radial-gradient(ellipse 45% 45% at 70% 65%, rgba(245,158,11,0.10), transparent 60%)',
};

const ringWrap = {
  position: 'relative',
  width: 56, height: 56,
  zIndex: 2,
};

const ring = {
  position: 'absolute', inset: 0,
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.12)',
  borderTopColor: 'rgba(255,255,255,0.85)',
  animation: 'glassSpin 0.9s linear infinite',
};

const ringInner = {
  position: 'absolute', inset: 10,
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.06)',
  borderTopColor: 'rgba(255,255,255,0.4)',
  animation: 'glassSpin 1.4s linear infinite reverse',
};

const label = {
  zIndex: 2,
  fontFamily: 'Geist Mono, monospace',
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
};

class Spinner extends Component {
  componentDidMount() {
    if (typeof document !== 'undefined' && !document.getElementById('glass-popup-keyframes')) {
      const style = document.createElement('style');
      style.id = 'glass-popup-keyframes';
      style.textContent = '@keyframes glassSpin { to { transform: rotate(360deg) } }';
      document.head.appendChild(style);
    }
  }
  render() {
    return (
      <div style={wrap}>
        <div style={bloom} />
        <div style={ringWrap}>
          <div style={ring} />
          <div style={ringInner} />
        </div>
        <div style={label}>Načítání</div>
      </div>
    );
  }
}

export default Spinner;
