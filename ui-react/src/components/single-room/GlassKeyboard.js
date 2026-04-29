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
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  panel: {
    width: '100%', maxWidth: 1100,
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
    minHeight: 44, padding: '10px 14px', marginBottom: 14,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 18, fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  row: { display: 'flex', gap: 6, marginBottom: 6, justifyContent: 'center' },
  key: {
    flex: '1 1 0', minWidth: 56, height: 56,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff',
    fontFamily: 'inherit', fontSize: 20, fontWeight: 500,
    cursor: 'pointer', userSelect: 'none',
  },
  keyWide: { flex: '2 1 0' },
  keyAccent: {
    background: 'rgba(255,255,255,0.92)', color: '#000',
    border: '1px solid rgba(255,255,255,1)', fontWeight: 600,
  },
  keyActive: {
    background: 'rgba(34,197,94,0.25)',
    border: '1px solid rgba(34,197,94,0.55)',
  },
};

const LAYOUTS = {
  cs: { row1: ['q','w','e','r','t','z','u','i','o','p'],
        row2: ['a','s','d','f','g','h','j','k','l'],
        row3: ['y','x','c','v','b','n','m'] },
  en: { row1: ['q','w','e','r','t','y','u','i','o','p'],
        row2: ['a','s','d','f','g','h','j','k','l'],
        row3: ['z','x','c','v','b','n','m'] },
};

const DIGITS_ROWS = {
  row1: ['1','2','3','4','5','6','7','8','9','0'],
  row2: ['.', ',', ':', ';', '-', '/', '@', '&'],
  row3: [],
};

const DIACRITICS = {
  a: ['á'], c: ['č'], d: ['ď'], e: ['é','ě'], i: ['í'],
  n: ['ň'], o: ['ó'], r: ['ř'], s: ['š'], t: ['ť'],
  u: ['ú','ů'], y: ['ý'], z: ['ž'],
};

const LONG_PRESS_MS = 400;

class GlassKeyboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shift: false,
      mode: 'letters', // 'letters' | 'digits'
      lang: props.initialLang || (process.env.REACT_APP_KEYBOARD_DEFAULT === 'en' ? 'en' : 'cs'),
      popover: null, // { letter, options } when long-press is active
    };
    this._longPressTimer = null;
    this._longPressFired = false;
  }

  componentWillUnmount() {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  appendChar(ch) {
    const out = this.state.shift ? ch.toUpperCase() : ch;
    this.props.onChange((this.props.value || '') + out);
    if (this.state.shift) this.setState({ shift: false });
  }

  handleBackspace = () => this.props.onChange((this.props.value || '').slice(0, -1));
  handleSpace = () => this.props.onChange((this.props.value || '') + ' ');
  toggleShift = () => this.setState({ shift: !this.state.shift });
  toggleMode = () => this.setState({ mode: this.state.mode === 'letters' ? 'digits' : 'letters' });
  toggleLang = () => this.setState({ lang: this.state.lang === 'cs' ? 'en' : 'cs' });

  startLongPress = (ch) => () => {
    this._longPressFired = false;
    if (!DIACRITICS[ch]) return;
    this._longPressTimer = setTimeout(() => {
      this._longPressFired = true;
      this.setState({ popover: { letter: ch, options: DIACRITICS[ch] } });
    }, LONG_PRESS_MS);
  };

  cancelLongPress = () => {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  };

  handleLetterClick = (ch) => () => {
    if (this._longPressFired) {
      this._longPressFired = false;
      return;
    }
    this.appendChar(ch);
  };

  pickDiacritic = (variant) => () => {
    this.props.onChange((this.props.value || '') + (this.state.shift ? variant.toUpperCase() : variant));
    this.setState({ popover: null, shift: false });
  };

  keyBtn(label, opts) {
    opts = opts || {};
    const style = Object.assign(
      {}, styles.key,
      opts.wide ? styles.keyWide : {},
      opts.accent ? styles.keyAccent : {},
      opts.active ? styles.keyActive : {}
    );
    const extra = opts.extraProps || {};
    return (
      <button
        key={label}
        type="button"
        data-key={label}
        style={style}
        onClick={opts.onClick}
        {...extra}
      >
        {opts.text != null ? opts.text : label}
      </button>
    );
  }

  render() {
    const { value, onSubmit, onClose } = this.props;
    const layout = this.state.mode === 'digits' ? DIGITS_ROWS : LAYOUTS[this.state.lang];

    const renderLetterKey = (ch) =>
      this.keyBtn(ch, {
        text: this.state.shift ? ch.toUpperCase() : ch,
        onClick: this.handleLetterClick(ch),
        extraProps: {
          onMouseDown: this.startLongPress(ch),
          onMouseUp: this.cancelLongPress,
          onMouseLeave: this.cancelLongPress,
          onTouchStart: this.startLongPress(ch),
          onTouchEnd: this.cancelLongPress,
        },
      });

    return (
      <div style={styles.scrim} onClick={onClose}>
        <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.preview}>{value}</div>
          {this.state.popover && (
            <div style={{
              display: 'flex', gap: 6, marginBottom: 10,
              padding: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
            }}>
              {this.state.popover.options.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  data-key={'diacritic-' + variant}
                  style={Object.assign({}, styles.key, { minWidth: 56, flex: '0 0 auto' })}
                  onClick={this.pickDiacritic(variant)}
                >
                  {this.state.shift ? variant.toUpperCase() : variant}
                </button>
              ))}
              <button
                type="button"
                data-key="diacritic-cancel"
                style={Object.assign({}, styles.key, { minWidth: 56, flex: '0 0 auto' })}
                onClick={() => this.setState({ popover: null })}
              >×</button>
            </div>
          )}

          <div style={styles.row}>
            {layout.row1.map(renderLetterKey)}
          </div>
          <div style={styles.row}>
            {layout.row2.map(renderLetterKey)}
            {this.keyBtn('Backspace', { wide: true, text: '←', onClick: this.handleBackspace })}
          </div>
          <div style={styles.row}>
            {this.state.mode === 'letters' && this.keyBtn('Shift', {
              text: KB.shift || 'Shift',
              active: this.state.shift,
              onClick: this.toggleShift,
            })}
            {layout.row3.map(renderLetterKey)}
            {this.keyBtn('ToDigits', {
              text: this.state.mode === 'digits' ? (KB.letters || 'ABC') : (KB.digits || '123'),
              onClick: this.toggleMode,
            })}
          </div>
          <div style={styles.row}>
            {this.keyBtn('Lang', {
              text: this.state.lang === 'cs'
                ? ((KB.langToggle && KB.langToggle.cs) || 'CZ')
                : ((KB.langToggle && KB.langToggle.en) || 'EN'),
              onClick: this.toggleLang,
            })}
            {this.keyBtn('Space', { wide: true, text: KB.space || '', onClick: this.handleSpace })}
            {this.keyBtn('Done', {
              wide: true, accent: true,
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
  initialLang: PropTypes.oneOf(['cs', 'en']),
};

export default GlassKeyboard;
