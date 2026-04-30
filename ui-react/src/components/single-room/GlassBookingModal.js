import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as srConfig from '../../config/singleRoom.config.js';
import GlassBookingSelection from './GlassBookingSelection';
import GlassBookingTimeline from './GlassBookingTimeline';
import GlassKeyboard from './GlassKeyboard';
import {
  SNAP_MIN,
  filterEventsForDay,
  collidesWith,
  clampSelection,
  appointmentMinutesOnDay,
} from './glassBookingHelpers';

const G = (srConfig && srConfig.glass) || {};
const POPUP = (G.bookingModal && G.bookingModal.popup) || G.popup || {};

const styles = {
  scrim: {
    position: 'fixed', inset: 0, zIndex: 30,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'stretch', justifyContent: 'stretch',
    padding: 24, boxSizing: 'border-box',
  },
  sheet: {
    flex: 1,
    display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0,
    background: 'rgba(14,16,20,0.85)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 28,
    overflow: 'hidden',
    color: '#fff',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
  },
};

const DAY_START_HOUR = parseInt(process.env.REACT_APP_BOOKING_DAY_START || '7', 10);
const DAY_END_HOUR = parseInt(process.env.REACT_APP_BOOKING_DAY_END || '21', 10);
const MAX_DAYS_AHEAD = parseInt(process.env.REACT_APP_BOOKING_MAX_DAYS_AHEAD || '10', 10);
const DEFAULT_SUBJECT = process.env.REACT_APP_BOOKING_DEFAULT_SUBJECT || 'Rezervace z displeje';

class GlassBookingModal extends Component {
  constructor(props) {
    super(props);
    const now = props.now || new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const nowMinRaw = (now.getHours() * 60 + now.getMinutes());
    const nowQuarter = Math.ceil(nowMinRaw / SNAP_MIN) * SNAP_MIN;
    let startMin = Math.max(DAY_START_HOUR * 60, nowQuarter);
    if (startMin >= DAY_END_HOUR * 60 - SNAP_MIN) {
      startMin = DAY_END_HOUR * 60 - 30;
    }
    const endMin = Math.min(DAY_END_HOUR * 60, startMin + 30);

    this.state = {
      today: today,
      now: now,
      dayOffset: 0,
      stripStart: 0,
      selection: { startMin: startMin, endMin: endMin },
      subject: '',
      keyboardOpen: false,
      submitting: false,
    };
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getSelectedDay() {
    const d = new Date(this.state.today);
    d.setDate(d.getDate() + this.state.dayOffset);
    return d;
  }

  getDayEvents() {
    const day = this.getSelectedDay();
    const appts = (this.props.room && this.props.room.Appointments) || [];
    return filterEventsForDay(appts, day);
  }

  handleDayChange = (offset) => {
    if (offset < 0 || offset >= MAX_DAYS_AHEAD) return;
    const newDay = new Date(this.state.today);
    newDay.setDate(newDay.getDate() + offset);
    const events = filterEventsForDay(
      (this.props.room && this.props.room.Appointments) || [],
      newDay
    );
    const dayStart = DAY_START_HOUR * 60;
    const dayEnd = DAY_END_HOUR * 60;
    let cand = this.state.selection;
    let minAllowed = dayStart;
    if (offset === 0) {
      const nm = appointmentMinutesOnDay(this.state.now, newDay);
      if (nm != null) minAllowed = Math.max(dayStart, Math.ceil(nm / SNAP_MIN) * SNAP_MIN);
    }
    if (cand.startMin < minAllowed) {
      cand = { startMin: minAllowed, endMin: minAllowed + (cand.endMin - cand.startMin) };
    }
    cand = clampSelection(cand.startMin, cand.endMin, events, dayStart, dayEnd);
    if (cand.endMin - cand.startMin < SNAP_MIN) {
      cand = { startMin: minAllowed, endMin: Math.min(dayEnd, minAllowed + 30) };
    }
    this.setState({ dayOffset: offset, selection: cand });
  };

  handleStripStartChange = (newStart) => this.setState({ stripStart: newStart });

  handleSelectionChange = (sel) => this.setState({ selection: sel });

  handleQuickDuration = (m) => {
    const sel = this.state.selection;
    const dayEnd = DAY_END_HOUR * 60;
    const events = this.getDayEvents();
    let endMin = Math.min(dayEnd, sel.startMin + m);
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (ev.startMin >= sel.startMin && ev.startMin < endMin) endMin = ev.startMin;
    }
    if (endMin - sel.startMin < SNAP_MIN) return;
    this.setState({ selection: { startMin: sel.startMin, endMin: endMin } });
  };

  openKeyboard = () => this.setState({ keyboardOpen: true });
  closeKeyboard = () => this.setState({ keyboardOpen: false });
  setSubject = (s) => this.setState({ subject: s });

  handleConfirm = () => {
    if (this.state.submitting) return;
    const { room, togglePopup, onClose } = this.props;
    const day = this.getSelectedDay();
    const sel = this.state.selection;
    const events = this.getDayEvents();
    if (collidesWith(sel.startMin, sel.endMin, events)) {
      togglePopup(POPUP.conflict || 'Slot byl mezitím obsazen');
      return;
    }
    const startDate = new Date(day);
    startDate.setHours(0, sel.startMin, 0, 0);
    const endDate = new Date(day);
    endDate.setHours(0, sel.endMin, 0, 0);

    const params = {
      roomEmail: room.Email,
      roomName: room.Name,
      startTime: moment(startDate).toISOString(),
      endTime: moment(endDate).toISOString(),
      bookingType: 'BookNow',
      subject: this.state.subject || DEFAULT_SUBJECT,
    };
    const qs = Object.keys(params)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    this.setState({ submitting: true });
    togglePopup(POPUP.booking || 'Rezervuji…');

    fetch('../api/roombooking?' + qs)
      .then((r) => r.json())
      .then((data) => {
        if (!this._mounted) return;
        if (data && data.ok) {
          // Close the modal so the user sees the room view (with the
          // in-progress popup overlayed) instead of the calendar grid
          // while waiting for the socket to push the updated room state.
          onClose();
          // Keep the in-progress popup visible until reload — switching to
          // a success label here would expose ~5 seconds of stale "free"
          // state underneath. The reload itself is the success indicator.
          setTimeout(() => window.location.reload(), 5000);
        } else {
          const msg = data && data.reason === 'conflict'
            ? (POPUP.conflict || 'Slot byl mezitím obsazen — vyberte jiný čas')
            : (POPUP.error || 'Rezervaci se nepodařilo dokončit');
          togglePopup(msg);
          this.setState({ submitting: false });
        }
      })
      .catch(() => {
        if (!this._mounted) return;
        togglePopup(POPUP.error || 'Rezervaci se nepodařilo dokončit');
        this.setState({ submitting: false });
      });
  };

  render() {
    const { room, onClose } = this.props;
    const day = this.getSelectedDay();
    const events = this.getDayEvents();
    const isToday = this.state.dayOffset === 0;
    const nowMin = isToday ? appointmentMinutesOnDay(this.state.now, day) : null;
    const minNow = nowMin != null ? Math.ceil(nowMin / SNAP_MIN) * SNAP_MIN : null;

    return (
      <div style={styles.scrim} onClick={onClose}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <GlassBookingSelection
            day={day}
            isToday={isToday}
            selection={this.state.selection}
            room={room}
            subject={this.state.subject}
            onClose={onClose}
            onQuickDuration={this.handleQuickDuration}
            onSubjectFocus={this.openKeyboard}
            onConfirm={this.handleConfirm}
            confirmDisabled={this.state.submitting}
          />
          <GlassBookingTimeline
            today={this.state.today}
            dayOffset={this.state.dayOffset}
            stripStart={this.state.stripStart}
            maxDaysAhead={MAX_DAYS_AHEAD}
            events={events}
            selection={this.state.selection}
            isToday={isToday}
            nowMin={nowMin}
            minNow={minNow}
            dayStartHour={DAY_START_HOUR}
            dayEndHour={DAY_END_HOUR}
            onDayOffsetChange={this.handleDayChange}
            onStripStartChange={this.handleStripStartChange}
            onSelectionChange={this.handleSelectionChange}
          />
        </div>
        {this.state.keyboardOpen && (
          <GlassKeyboard
            value={this.state.subject}
            onChange={this.setSubject}
            onSubmit={this.closeKeyboard}
            onClose={this.closeKeyboard}
          />
        )}
      </div>
    );
  }
}

GlassBookingModal.propTypes = {
  room: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  togglePopup: PropTypes.func.isRequired,
  showPopup: PropTypes.bool,
  now: PropTypes.instanceOf(Date),
};

export default GlassBookingModal;
