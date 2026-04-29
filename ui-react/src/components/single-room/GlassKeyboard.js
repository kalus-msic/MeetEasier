import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as srConfig from '../../config/singleRoom.config.js';

const G = (srConfig && srConfig.glass) || {};
const KB = G.keyboard || {};

const styles = {
  scrim: {
    position: 'fixed', left: 0, right: 0, bottom: 0, top: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 1100,
    background: 'rgba(20,22,28,0.95)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: '20px 16px 24px',
    color: '#fff',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
  },
  preview: {
    minHeight: 44,
    padding: '10px 14px',
    marginBottom: 14,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 18, fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  row: {
    display: 'flex',
    gap: 6,
    marginBottom: 6,
    justifyContent: 'center',
  },
  key: {
    flex: '1 1 0',
    minWidth: 56, height: 56,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: 20, fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
  },
  keyWide: {
    flex: '2 1 0',
  },
  keyAccent: {
    background: 'rgba(255,255,255,0.92)',
    color: '#000',
    border: '1px solid rgba(255,255,255,1)',
    fontWeight: 600,
  },
};

const ROW1 = ['q','w','e','r','t','z','u','i','o','p'];
const ROW2 = ['a','s','d','f','g','h','j','k','l'];
const ROW3 = ['y','x','c','v','b','n','m'];

class GlassKeyboard extends Component {
  render() {
    const { value, onChange, onSubmit, onClose } = this.props;

    const handleLetter = (ch) => onChange((value || '') + ch);
    const handleBackspace = () => onChange((value || '').slice(0, -1));
    const handleSpace = () => onChange((value || '') + ' ');

    const keyBtn = (label, opts) => {
      opts = opts || {};
      const style = Object.assign(
        {}, styles.key, opts.wide ? styles.keyWide : {}, opts.accent ? styles.keyAccent : {}
      );
      return (
        <button
          key={label}
          type="button"
          data-key={label}
          style={style}
          onClick={opts.onClick}
        >
          {opts.text != null ? opts.text : label}
        </button>
      );
    };

    return (
      <div style={styles.scrim} onClick={onClose}>
        <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.preview}>{value}</div>

          <div style={styles.row}>
            {ROW1.map((ch) => keyBtn(ch, { onClick: () => handleLetter(ch) }))}
          </div>
          <div style={styles.row}>
            {ROW2.map((ch) => keyBtn(ch, { onClick: () => handleLetter(ch) }))}
            {keyBtn('Backspace', { wide: true, text: '←', onClick: handleBackspace })}
          </div>
          <div style={styles.row}>
            {ROW3.map((ch) => keyBtn(ch, { onClick: () => handleLetter(ch) }))}
          </div>
          <div style={styles.row}>
            {keyBtn('Space', {
              wide: true,
              text: KB.space || '',
              onClick: handleSpace,
            })}
            {keyBtn('Done', {
              wide: true,
              accent: true,
              text: KB.done || 'Hotovo',
              onClick: onSubmit,
            })}
          </div>
        </div>
      </div>
    );
  }
}

GlassKeyboard.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GlassKeyboard;
