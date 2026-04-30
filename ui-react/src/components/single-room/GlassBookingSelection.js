import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as srConfig from '../../config/singleRoom.config.js';
import { fmtMin } from './glassBookingHelpers';

const G = (srConfig && srConfig.glass) || {};
const M = G.bookingModal || {};
const DAYS_CZ = ['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
const MONTHS_CZ = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];

const styles = {
  pane: {
    padding: '24px 24px 24px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', minWidth: 0,
  },
  topRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 18,
  },
  paneTitle: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.22em',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bigDate: { fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 },
  bigDateSub: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12, letterSpacing: '0.16em',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  selectionCard: {
    marginTop: 18, padding: 18, borderRadius: 18,
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.32)',
  },
  selectionLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.22em',
    color: '#22c55e', textTransform: 'uppercase', marginBottom: 10,
  },
  selectionTime: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center', gap: 10,
  },
  timeBox: { display: 'flex', flexDirection: 'column', gap: 4 },
  timeBoxLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 9, letterSpacing: '0.2em',
    color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
  },
  timeBoxVal: {
    fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em',
    fontFeatureSettings: '"tnum"', lineHeight: 1,
  },
  selectionDuration: {
    marginTop: 10,
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
  },
  quickRow: { marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' },
  quickBtn: {
    flex: '1 1 0', minWidth: 0,
    padding: '10px 0',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', borderRadius: 10,
    fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
    fontFeatureSettings: '"tnum"', cursor: 'pointer',
  },
  quickBtnActive: {
    background: 'rgba(34,197,94,0.18)',
    borderColor: 'rgba(34,197,94,0.5)',
    color: '#86efac',
  },
  fieldGroup: { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 },
  field: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '10px 14px',
    cursor: 'pointer',
  },
  fieldLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 9, letterSpacing: '0.2em',
    color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
  },
  fieldVal: {
    fontSize: 15, fontWeight: 500, marginTop: 3,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  fieldPlaceholder: { color: 'rgba(255,255,255,0.4)' },
  bottomRow: { marginTop: 'auto', paddingTop: 18, display: 'flex', gap: 10 },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.16)',
    color: 'rgba(255,255,255,0.85)',
    padding: '14px 18px', borderRadius: 14,
    fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    background: '#22c55e', border: '1px solid #22c55e',
    color: '#04130a',
    padding: '14px 18px', borderRadius: 14,
    fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
    letterSpacing: '-0.005em', cursor: 'pointer',
  },
  confirmBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
};

const QUICK_DURATIONS = [15, 30, 60, 120];

class GlassBookingSelection extends Component {
  render() {
    const {
      day, isToday, selection, room, subject,
      onClose, onQuickDuration, onSubjectFocus, onConfirm, confirmDisabled,
    } = this.props;

    const duration = selection.endMin - selection.startMin;
    const dayLabel = DAYS_CZ[day.getDay()] + (isToday ? ' · ' + (M.todayBadge || 'Dnes') : '');
    const dateLabel = day.getDate() + '. ' + MONTHS_CZ[day.getMonth()];

    return (
      <div style={styles.pane}>
        <div style={styles.topRow}>
          <div style={styles.paneTitle}>{M.title || 'Nová rezervace'}</div>
          <button style={styles.closeBtn} onClick={onClose} type="button" data-action="close">×</button>
        </div>

        <div style={styles.bigDate}>{dateLabel}</div>
        <div style={styles.bigDateSub}>{dayLabel}</div>

        <div style={styles.selectionCard}>
          <div style={styles.selectionLabel}>{M.selectedTime || 'Vybraný čas'}</div>
          <div style={styles.selectionTime}>
            <div style={styles.timeBox}>
              <div style={styles.timeBoxLabel}>{M.from || 'Od'}</div>
              <div style={styles.timeBoxVal}>{fmtMin(selection.startMin)}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, paddingTop: 14, fontFamily: 'Geist Mono, monospace' }}>→</div>
            <div style={styles.timeBox}>
              <div style={styles.timeBoxLabel}>{M.to || 'Do'}</div>
              <div style={styles.timeBoxVal}>{fmtMin(selection.endMin)}</div>
            </div>
          </div>
          <div style={styles.selectionDuration}>{duration} {M.durationSuffix || 'min'}</div>

          <div style={styles.quickRow}>
            {QUICK_DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                data-action={'quick-' + m}
                style={Object.assign({}, styles.quickBtn, duration === m ? styles.quickBtnActive : {})}
                onClick={() => onQuickDuration(m)}
              >{m} {M.quickButtonSuffix || 'min'}</button>
            ))}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>{M.room || 'Místnost'}</div>
            <div style={styles.fieldVal}>{room && room.Name}</div>
          </div>
          <div style={styles.field} onClick={onSubjectFocus} data-action="subject-field">
            <div style={styles.fieldLabel}>{M.subject || 'Předmět'}</div>
            <div style={Object.assign({}, styles.fieldVal, subject ? {} : styles.fieldPlaceholder)}>
              {subject || (M.subjectPlaceholder || 'Volitelné')}
            </div>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <button style={styles.cancelBtn} type="button" onClick={onClose} data-action="cancel">
            {M.cancel || 'Zrušit'}
          </button>
          <button
            style={Object.assign({}, styles.confirmBtn, confirmDisabled ? styles.confirmBtnDisabled : {})}
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            data-action="confirm"
          >
            {(M.confirm || 'Rezervovat') + ' · ' + duration + ' ' + (M.durationSuffix || 'min')}
          </button>
        </div>
      </div>
    );
  }
}

GlassBookingSelection.propTypes = {
  day: PropTypes.instanceOf(Date).isRequired,
  isToday: PropTypes.bool.isRequired,
  selection: PropTypes.shape({
    startMin: PropTypes.number.isRequired,
    endMin: PropTypes.number.isRequired,
  }).isRequired,
  room: PropTypes.object.isRequired,
  subject: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onQuickDuration: PropTypes.func.isRequired,
  onSubjectFocus: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmDisabled: PropTypes.bool,
};

export default GlassBookingSelection;
