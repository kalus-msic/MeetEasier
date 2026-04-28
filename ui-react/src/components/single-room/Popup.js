import React from 'react';

const isClassic = (process.env.REACT_APP_UI_VARIANT || 'glass').toLowerCase() === 'classic';

const overlay = {
  position: 'fixed',
  inset: 0,
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5,6,8,0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  fontFamily: 'Inter Tight, system-ui, sans-serif',
  color: '#fff',
  padding: 24,
};

const card = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 24,
  padding: '32px 40px',
  textAlign: 'center',
  maxWidth: 520,
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};

const spinnerWrap = {
  width: 36, height: 36,
  margin: '0 auto 20px',
  borderRadius: '50%',
  border: '3px solid rgba(255,255,255,0.15)',
  borderTopColor: 'rgba(255,255,255,0.85)',
  animation: 'glassSpin 0.9s linear infinite',
};

const text = {
  fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
  margin: 0,
};

class Popup extends React.Component {
  componentDidMount() {
    if (typeof document !== 'undefined' && !document.getElementById('glass-popup-keyframes')) {
      const style = document.createElement('style');
      style.id = 'glass-popup-keyframes';
      style.textContent = '@keyframes glassSpin { to { transform: rotate(360deg) } }';
      document.head.appendChild(style);
    }
  }
  render() {
    if (isClassic) {
      return (
        <div className="popupNotification">
          <div className="popupNotification inner">
            <h1>{this.props.text}</h1>
          </div>
        </div>
      );
    }
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={spinnerWrap} />
          <h1 style={text}>{this.props.text}</h1>
        </div>
      </div>
    );
  }
}

export default Popup;
