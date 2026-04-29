import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as srConfig from '../../config/singleRoom.config.js';
import { fmtMin, snap, SNAP_MIN, collidesWith, generateDayStrip } from './glassBookingHelpers';

const G = (srConfig && srConfig.glass) || {};
const M = G.bookingModal || {};

const HOUR_PX = 56;
const CZ_DOW_SHORT = ['NE', 'PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO'];

const styles = {
  pane: { display: 'grid', gridTemplateRows: 'auto 1fr', minWidth: 0, minHeight: 0 },
  dayStrip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '18px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  navBtnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  dayChips: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 },
  dayChip: {
    padding: '8px 6px', borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', textAlign: 'center', color: '#fff',
    fontFamily: 'inherit',
  },
  dayChipActive: {
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,1)', color: '#000',
  },
  dayChipDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  dayChipDow: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 9, letterSpacing: '0.18em',
    textTransform: 'uppercase', opacity: 0.7,
  },
  dayChipDay: {
    fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
    fontFeatureSettings: '"tnum"', marginTop: 2,
  },
  timelineWrap: { overflow: 'auto', position: 'relative', padding: '8px 24px 20px' },
  timeline: { position: 'relative', minHeight: '100%' },
  hourRow: {
    display: 'grid', gridTemplateColumns: '52px 1fr',
    alignItems: 'flex-start', minHeight: HOUR_PX,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },
  hourRowFirst: { borderTop: 'none' },
  hourLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.4)', paddingTop: 4,
    fontFeatureSettings: '"tnum"',
  },
  hourSlot: { position: 'relative', minHeight: HOUR_PX },
  halfHourLine: {
    position: 'absolute', left: 0, right: 0, top: '50%',
    borderTop: '1px dashed rgba(255,255,255,0.04)',
  },
  overlay: { position: 'absolute', left: 52, right: 0, top: 0 },
  eventBlock: {
    position: 'absolute', left: 8, right: 8,
    background: 'rgba(239,68,68,0.18)',
    border: '1px solid rgba(239,68,68,0.45)',
    borderLeft: '3px solid #ef4444',
    borderRadius: 10, padding: '8px 12px',
    color: 'rgba(255,255,255,0.95)',
    overflow: 'hidden', pointerEvents: 'none',
  },
  eventTitle: {
    fontSize: 13, fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  eventTime: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, color: 'rgba(255,255,255,0.7)',
    marginTop: 2, fontFeatureSettings: '"tnum"',
  },
  selectionBlock: {
    position: 'absolute', left: 6, right: 6,
    background: 'rgba(34,197,94,0.22)',
    border: '2px solid #22c55e',
    borderRadius: 12, padding: '8px 12px',
    color: '#fff',
    boxShadow: '0 8px 24px rgba(34,197,94,0.25)',
    overflow: 'visible',
  },
  selectionInner: {
    fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
    fontFeatureSettings: '"tnum"',
  },
  selectionInnerSub: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2,
  },
  handle: {
    position: 'absolute', left: '50%',
    transform: 'translateX(-50%)',
    width: 56, height: 14,
    background: '#22c55e',
    borderRadius: 999,
    cursor: 'ns-resize',
    boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#04130a',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    userSelect: 'none', touchAction: 'none',
  },
  nowLine: {
    position: 'absolute', left: 0, right: 0, height: 0,
    borderTop: '1.5px solid rgba(255,255,255,0.4)',
    pointerEvents: 'none', zIndex: 4,
  },
  nowDot: {
    position: 'absolute', left: -4, top: -5,
    width: 9, height: 9, borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 0 8px rgba(255,255,255,0.6)',
  },
  nowLabel: {
    position: 'absolute', left: -52, top: -8,
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    color: '#fff', background: 'rgba(0,0,0,0.6)',
    padding: '2px 6px', borderRadius: 4,
    fontFeatureSettings: '"tnum"',
  },
};

class GlassBookingTimeline extends Component {
  constructor(props) {
    super(props);
    this._timelineRef = null;
    this._setTimelineRef = (el) => { this._timelineRef = el; };
  }

  componentDidUpdate(prevProps) {
    // When selection.startMin changes by a lot (e.g. day flip), scroll into view.
    if (prevProps.selection.startMin !== this.props.selection.startMin && this._timelineRef) {
      const y = this.minToY(this.props.selection.startMin);
      const scrollTop = this._timelineRef.scrollTop;
      const clientH = this._timelineRef.clientHeight;
      if (y < scrollTop || y > scrollTop + clientH - 80) {
        try {
          this._timelineRef.scrollTo({ top: Math.max(0, y - 80), behavior: 'smooth' });
        } catch (e) {
          this._timelineRef.scrollTop = Math.max(0, y - 80);
        }
      }
    }
  }

  minToY = (min) => (min - this.props.dayStartHour * 60) * (HOUR_PX / 60);

  yToMin = (clientY) => {
    if (!this._timelineRef) return 0;
    const rect = this._timelineRef.getBoundingClientRect();
    const y = clientY - rect.top + this._timelineRef.scrollTop;
    return snap(this.props.dayStartHour * 60 + (y / HOUR_PX) * 60);
  };

  handleTimelineClick = (e) => {
    if (e.target !== this._timelineRef && !e.target.dataset.bgClick) return;
    const min = this.yToMin(e.clientY);
    const dayStart = this.props.dayStartHour * 60;
    const dayEnd = this.props.dayEndHour * 60;
    const proposedStart = Math.max(dayStart, min);
    const proposedEnd = Math.min(dayEnd, proposedStart + 30);
    if (proposedEnd - proposedStart < SNAP_MIN) return;
    if (collidesWith(proposedStart, proposedEnd, this.props.events)) return;
    if (this.props.minNow != null && proposedStart < this.props.minNow) return;
    this.props.onSelectionChange({ startMin: proposedStart, endMin: proposedEnd });
  };

  startDrag = (which) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    const move = (ev) => {
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const min = this.yToMin(clientY);
      const dayStart = this.props.dayStartHour * 60;
      const dayEnd = this.props.dayEndHour * 60;
      const sel = this.props.selection;
      const events = this.props.events;
      let next;
      if (which === 'top') {
        let ns = Math.max(dayStart, Math.min(sel.endMin - SNAP_MIN, min));
        if (this.props.minNow != null) ns = Math.max(this.props.minNow, ns);
        // Block crossing into previous event from below.
        for (let i = 0; i < events.length; i++) {
          const ev2 = events[i];
          if (ev2.endMin <= sel.endMin && ev2.endMin > ns) ns = ev2.endMin;
        }
        next = { startMin: ns, endMin: sel.endMin };
      } else {
        let ne = Math.min(dayEnd, Math.max(sel.startMin + SNAP_MIN, min));
        for (let i = 0; i < events.length; i++) {
          const ev2 = events[i];
          if (ev2.startMin >= sel.startMin && ev2.startMin < ne) ne = ev2.startMin;
        }
        next = { startMin: sel.startMin, endMin: ne };
      }
      this.props.onSelectionChange(next);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  renderDayStrip() {
    const { stripStart, dayOffset, maxDaysAhead, today, onStripStartChange, onDayOffsetChange } = this.props;
    const days = generateDayStrip(today, stripStart, maxDaysAhead);
    const prevDisabled = stripStart <= 0;
    const nextDisabled = stripStart + 7 >= maxDaysAhead;
    return (
      <div style={styles.dayStrip}>
        <button
          type="button"
          data-action="strip-prev"
          style={Object.assign({}, styles.navBtn, prevDisabled ? styles.navBtnDisabled : {})}
          onClick={() => !prevDisabled && onStripStartChange(Math.max(0, stripStart - 7))}
          disabled={prevDisabled}
        >‹</button>
        <div style={styles.dayChips}>
          {days.map((d) => {
            const active = d.offset === dayOffset;
            const disabled = !d.isAllowed;
            return (
              <button
                key={d.offset}
                type="button"
                data-day-offset={d.offset}
                style={Object.assign({}, styles.dayChip,
                  active ? styles.dayChipActive : {},
                  disabled ? styles.dayChipDisabled : {})}
                onClick={() => !disabled && onDayOffsetChange(d.offset)}
                disabled={disabled}
              >
                <div style={styles.dayChipDow}>{CZ_DOW_SHORT[d.date.getDay()]}</div>
                <div style={styles.dayChipDay}>{d.date.getDate()}</div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          data-action="strip-next"
          style={Object.assign({}, styles.navBtn, nextDisabled ? styles.navBtnDisabled : {})}
          onClick={() => !nextDisabled && onStripStartChange(stripStart + 7)}
          disabled={nextDisabled}
        >›</button>
      </div>
    );
  }

  render() {
    const { events, selection, isToday, nowMin, dayStartHour, dayEndHour } = this.props;
    const hours = [];
    for (let h = dayStartHour; h < dayEndHour; h++) hours.push(h);
    const totalHeight = hours.length * HOUR_PX;
    const duration = selection.endMin - selection.startMin;

    return (
      <div style={styles.pane}>
        {this.renderDayStrip()}

        <div
          ref={this._setTimelineRef}
          style={styles.timelineWrap}
          onClick={this.handleTimelineClick}
          data-bg-click="true"
        >
          <div style={Object.assign({}, styles.timeline, { height: totalHeight })}>
            {hours.map((h, i) => (
              <div
                key={h}
                style={Object.assign({}, styles.hourRow, i === 0 ? styles.hourRowFirst : {})}
                data-bg-click="true"
              >
                <div style={styles.hourLabel}>{String(h).padStart(2, '0') + ':00'}</div>
                <div style={styles.hourSlot} data-bg-click="true">
                  <div style={styles.halfHourLine} />
                </div>
              </div>
            ))}

            <div style={Object.assign({}, styles.overlay, { height: totalHeight })} data-bg-click="true">
              {events.map((ev, i) => (
                <div
                  key={i}
                  style={Object.assign({}, styles.eventBlock, {
                    top: this.minToY(ev.startMin),
                    height: Math.max(20, this.minToY(ev.endMin) - this.minToY(ev.startMin) - 2),
                  })}
                >
                  <div style={styles.eventTitle}>{ev.subject || '(bez názvu)'}</div>
                  <div style={styles.eventTime}>
                    {fmtMin(ev.startMin) + '–' + fmtMin(ev.endMin)}
                  </div>
                </div>
              ))}

              {isToday && nowMin != null && nowMin >= dayStartHour * 60 && nowMin < dayEndHour * 60 && (
                <div style={Object.assign({}, styles.nowLine, { top: this.minToY(nowMin) })}>
                  <div style={styles.nowLabel}>{fmtMin(nowMin)}</div>
                  <div style={styles.nowDot} />
                </div>
              )}

              <div
                style={Object.assign({}, styles.selectionBlock, {
                  top: this.minToY(selection.startMin),
                  height: Math.max(36, this.minToY(selection.endMin) - this.minToY(selection.startMin) - 4),
                })}
                onClick={(e) => e.stopPropagation()}
                data-action="selection"
              >
                <div
                  style={Object.assign({}, styles.handle, { top: -7 })}
                  data-action="handle-top"
                  onMouseDown={this.startDrag('top')}
                  onTouchStart={this.startDrag('top')}
                >↕</div>
                <div style={styles.selectionInner}>{M.selectionLabel || 'Vaše rezervace'}</div>
                <div style={styles.selectionInnerSub}>
                  {fmtMin(selection.startMin) + ' – ' + fmtMin(selection.endMin) + ' · ' + duration + ' ' + (M.durationSuffix || 'min')}
                </div>
                <div
                  style={Object.assign({}, styles.handle, { bottom: -7 })}
                  data-action="handle-bottom"
                  onMouseDown={this.startDrag('bottom')}
                  onTouchStart={this.startDrag('bottom')}
                >↕</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

GlassBookingTimeline.propTypes = {
  today: PropTypes.instanceOf(Date).isRequired,
  dayOffset: PropTypes.number.isRequired,
  stripStart: PropTypes.number.isRequired,
  maxDaysAhead: PropTypes.number.isRequired,
  events: PropTypes.array.isRequired,
  selection: PropTypes.shape({
    startMin: PropTypes.number.isRequired,
    endMin: PropTypes.number.isRequired,
  }).isRequired,
  isToday: PropTypes.bool.isRequired,
  nowMin: PropTypes.number,
  minNow: PropTypes.number,
  dayStartHour: PropTypes.number.isRequired,
  dayEndHour: PropTypes.number.isRequired,
  onDayOffsetChange: PropTypes.func.isRequired,
  onStripStartChange: PropTypes.func.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
};

export default GlassBookingTimeline;
