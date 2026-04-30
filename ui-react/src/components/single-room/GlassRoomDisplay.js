import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import * as srConfig from '../../config/singleRoom.config.js';
import GlassBookingModal from './GlassBookingModal';
import {
  STATE_GLOW,
  fmtTime,
  fmtDayCz,
  fmtDateCz,
  fmtDateShortCz,
  getInitials,
  appointmentTime,
  appointmentMinutesUntil,
  appointmentDurationMinutes,
  classifyRoom,
  shouldShowHero,
  fmtDurationHm,
  GlassClockTicker,
} from '../global/glassShared';

const SHOW_ORGANIZER = (process.env.REACT_APP_SHOW_ORGANIZER || 'true').toLowerCase() !== 'false';

const G = (srConfig && srConfig.glass) || {};
const G_BUTTONS = G.buttons || {};
const G_TIME = G.time || {};
const G_HERO = G.hero || {};
const G_STATES = G.states || {};
const G_SHORT = G.shortStates || {};
const G_AGENDA = G.agenda || {};
const G_POPUP = G.popup || {};

const styles = {
  root: {
    width: '100%', height: '100vh',
    background: '#050608',
    color: '#fff',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bloom: {
    position: 'absolute', inset: '-20%',
    pointerEvents: 'none',
    transition: 'background 800ms ease',
    filter: 'blur(60px)',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), ' +
      'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
    maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
  },
  inner: {
    position: 'relative', zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr',
    width: '100%', height: '100%',
    padding: 24, gap: 24,
    boxSizing: 'border-box',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 32,
    display: 'flex', flexDirection: 'column',
    minWidth: 0,
    position: 'relative',
  },
  topRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.2em',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  pillDot: {
    width: 6, height: 6, borderRadius: '50%',
    boxShadow: '0 0 8px currentColor',
    animation: 'glassPulse 2s ease-in-out infinite',
  },
  roomLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.24em',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginTop: 14,
  },
  roomName: {
    fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em',
    margin: '2px 0 0', lineHeight: 1,
  },
  status: {
    fontSize: 60, fontWeight: 600, letterSpacing: '-0.035em',
    lineHeight: 1, margin: '14px 0 0',
    transition: 'color 600ms ease',
    whiteSpace: 'nowrap',
  },
  hero: {
    marginTop: 22,
    padding: '22px 22px 24px',
    borderRadius: 22,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  heroEmpty: {
    marginTop: 16,
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0,
  },
  heroLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.22em',
    textTransform: 'uppercase',
    marginBottom: 14,
    transition: 'color 400ms ease',
  },
  heroBody: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 18, alignItems: 'center',
  },
  heroFooter: {
    marginTop: 14,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 12,
  },
  bigAvatar: {
    width: 80, height: 80, borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    fontSize: 30, fontWeight: 600,
    letterSpacing: '-0.01em', color: '#fff',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  heroName: {
    fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
    color: 'rgba(255,255,255,0.95)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  heroTitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  timeBand: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center', gap: 16,
  },
  timePart: { display: 'flex', flexDirection: 'column' },
  timePartLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10, letterSpacing: '0.22em',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  timeBig: {
    fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    fontFeatureSettings: '"tnum"', lineHeight: 1,
  },
  timeArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 22, paddingTop: 18,
  },
  durationChip: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12, letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.85)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '5px 12px', borderRadius: 999,
    display: 'inline-flex',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  ctaRow: {
    display: 'flex', gap: 10, marginTop: 'auto',
    paddingTop: 18, flexWrap: 'wrap',
  },
  cta: {
    flex: 1, minWidth: 0,
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '14px 16px',
    borderRadius: 14,
    fontFamily: 'inherit',
    fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 200ms, transform 100ms',
  },
  ctaPrimary: {
    background: 'rgba(255,255,255,0.92)',
    color: '#000',
    border: '1px solid rgba(255,255,255,1)',
  },
  ctaDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  rightCol: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 24, minWidth: 0,
  },
  clockCard: { padding: '24px 28px' },
  clockText: {
    fontSize: 76, fontWeight: 500, letterSpacing: '-0.04em',
    lineHeight: 1, fontFeatureSettings: '"tnum"',
  },
  clockMeta: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: 8,
    fontFamily: 'Geist Mono, monospace',
    fontSize: 13, color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.04em',
  },
  agendaCard: { padding: '20px 24px', overflow: 'hidden' },
  agendaHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  agendaItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: 12, alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  initials: {
    width: 28, height: 28, borderRadius: 8,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  agendaText: { minWidth: 0 },
  agendaTitle: {
    fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.92)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  agendaSub: {
    fontSize: 11, color: 'rgba(255,255,255,0.45)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginTop: 1,
  },
  agendaTimeCell: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    whiteSpace: 'nowrap',
  },
  agendaDate: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10,
    letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'none',
    marginBottom: 2,
    fontFeatureSettings: '"tnum"',
  },
  agendaTime: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12, color: 'rgba(255,255,255,0.55)',
    fontFeatureSettings: '"tnum"',
    whiteSpace: 'nowrap', textAlign: 'right',
  },
  backLink: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 14,
    padding: '12px 16px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12, letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
};

// ── Booking helpers (kept compatible with existing API) ─────────────────────────
function bookingFetch(params, togglePopup, progressMsg) {
  const qs = Object.keys(params)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
  togglePopup(progressMsg);
  fetch('../api/roombooking?' + qs)
    .then((r) => r.json())
    .then((data) => {
      if (data && data.ok) {
        // Keep the in-progress popup visible until reload — switching to a
        // success label here would expose ~5 seconds of stale "free" state
        // underneath while waiting for the socket to push the new room
        // status. The reload itself is the success indicator.
        setTimeout(() => window.location.reload(), 5000);
      } else {
        const msg = data && data.reason === 'conflict'
          ? (G_POPUP.conflict || 'Slot byl mezitím obsazen — vyberte jiný čas')
          : (G_POPUP.error || 'Rezervaci se nepodařilo dokončit');
        togglePopup(msg);
      }
    })
    .catch(() => {
      togglePopup(G_POPUP.error || 'Rezervaci se nepodařilo dokončit');
    });
}
function bookNow(time, room, togglePopup) {
  const start = moment().toISOString();
  const end = moment().add(time, 'minutes').toISOString();
  bookingFetch(
    { roomEmail: room.Email, roomName: room.Name, startTime: start, endTime: end, bookingType: 'BookNow' },
    togglePopup,
    G_POPUP.booking || 'Probíhá rezervace... Prosím vyčkejte!'
  );
}
function bookAfter(time, room, currentEndDate, togglePopup) {
  const start = moment(currentEndDate).add(1, 'minutes').toISOString();
  const end = moment(start).add(time, 'minutes').toISOString();
  bookingFetch(
    { roomEmail: room.Email, roomName: room.Name, startTime: start, endTime: end, bookingType: 'BookAfter' },
    togglePopup,
    G_POPUP.booking || 'Probíhá rezervace... Prosím vyčkejte!'
  );
}
function extendBooking(time, room, currentStartDate, currentEndDate, togglePopup) {
  const newEnd = new Date(currentEndDate.getTime() + time * 60000);
  bookingFetch(
    {
      roomEmail: room.Email, roomName: room.Name,
      startTime: moment(currentStartDate).toISOString(),
      endTime: moment(newEnd).toISOString(),
      bookingType: 'Extend',
    },
    togglePopup,
    G_POPUP.extending || 'Prodlužuji rezervaci... Prosím vyčkejte!'
  );
}
function endNow(room, currentStartDate, togglePopup) {
  bookingFetch(
    {
      roomEmail: room.Email, roomName: room.Name,
      startTime: moment(currentStartDate).toISOString(),
      endTime: moment(new Date()).toISOString(),
      bookingType: 'EndNow',
    },
    togglePopup,
    G_POPUP.canceling || 'Ruším rezervaci... Prosím vyčkejte!'
  );
}

function fitOptions(gapMinutes) {
  return [15, 30, 60].filter((n) => n <= gapMinutes);
}

// ── Inline dropdown for a Glass CTA ─────────────────────────────────────────────
class GlassDropdownButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.handleDocClick = this.handleDocClick.bind(this);
    this._setRoot = (el) => { this._root = el; };
  }
  componentDidMount() { document.addEventListener('mousedown', this.handleDocClick); }
  componentWillUnmount() { document.removeEventListener('mousedown', this.handleDocClick); }
  handleDocClick(e) {
    if (this._root && !this._root.contains(e.target)) {
      this.setState({ open: false });
    }
  }
  render() {
    const { label, options, onPick, disabled, primary } = this.props;
    const baseStyle = { ...styles.cta, ...(primary ? styles.ctaPrimary : {}) };
    const buttonStyle = disabled ? { ...baseStyle, ...styles.ctaDisabled } : baseStyle;

    const hasOptions = options.length > 0;

    return (
      <div ref={this._setRoot} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <button
          type="button"
          disabled={disabled}
          style={{ ...buttonStyle, width: '100%' }}
          onClick={(e) => {
            e.preventDefault();
            if (disabled) return;
            this.setState({ open: !this.state.open });
          }}
        >
          {label}
        </button>
        {this.state.open && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'rgba(20,22,28,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 6,
            display: 'flex', flexDirection: 'column', gap: 4,
            zIndex: 100,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}>
            {hasOptions ? options.map((n) => (
              <button
                key={n}
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({ open: false });
                  onPick(n);
                }}
              >
                {n} {G_BUTTONS.minutesSuffix || 'minut'}
              </button>
            )) : (
              <div style={{
                padding: '12px 14px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontFamily: 'Geist Mono, monospace',
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}>
                {G_BUTTONS.noFreeSlot || 'Žádný volný čas'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

// ── Confirm-action button (Ukončit) ─────────────────────────────────────────────
class GlassConfirmButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this._setRoot = (el) => { this._root = el; };
  }
  componentDidMount() {
    this._h = (e) => {
      if (this._root && !this._root.contains(e.target)) this.setState({ open: false });
    };
    document.addEventListener('mousedown', this._h);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this._h); }
  render() {
    const { label, disabled, onConfirm } = this.props;
    return (
      <div ref={this._setRoot} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <button
          type="button"
          disabled={disabled}
          style={{ ...styles.cta, width: '100%', ...(disabled ? styles.ctaDisabled : {}) }}
          onClick={() => !disabled && this.setState({ open: !this.state.open })}
        >
          {label}
        </button>
        {this.state.open && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'rgba(20,22,28,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 10,
            zIndex: 10,
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {G_BUTTONS.confirmEnd || 'Opravdu ukončit?'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" style={{ ...styles.cta, flex: 1 }} onClick={() => this.setState({ open: false })}>{G_BUTTONS.no || 'Ne'}</button>
              <button type="button" style={{ ...styles.cta, ...styles.ctaPrimary, flex: 1 }} onClick={() => { this.setState({ open: false }); onConfirm(); }}>{G_BUTTONS.yes || 'Ano'}</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
class GlassRoomDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = { bookingModalOpen: false };
  }

  openBookingModal = () => this.setState({ bookingModalOpen: true });
  closeBookingModal = () => this.setState({ bookingModalOpen: false });

  render() {
    const { room, togglePopup, showPopup } = this.props;
    const bookingEnabled = process.env.REACT_APP_BOOKING_ENABLED === 'true';

    const durSfx = {
      minute: G_TIME.minSuffix || 'min',
      hour: G_TIME.hourSuffix || 'h',
      day: G_TIME.daySuffix || 'd',
    };

    return (
      <GlassClockTicker>
        {(now) => {
          const state = classifyRoom(room, now);
          const glow = STATE_GLOW[state];
          const appts = (room && room.Appointments) || [];

          let featured = appts[0] || null;
          const heroVisible = shouldShowHero(state, featured, now);
          const featuredStart = featured && featured.Start ? appointmentTime(featured.Start) : null;
          const featuredEnd = featured && featured.End ? appointmentTime(featured.End) : null;
          const durationMin = featured && featured.Start && featured.End
            ? appointmentDurationMinutes(featured.Start, featured.End)
            : 0;

          const remainingMin = state === 'occupied' && featured
            ? Math.max(0, appointmentMinutesUntil(now, featured.End))
            : null;
          const startsInMin = (state === 'free' || state === 'soon') && featured
            ? Math.max(0, appointmentMinutesUntil(now, featured.Start))
            : null;

          const heroLabel = state === 'occupied'
            ? (G_HERO.occupied || 'Právě obsazuje')
            : state === 'soon'
              ? (G_HERO.soon || 'Začíná za chvíli')
              : (G_HERO.free || 'Následuje');

          const showAvatar = state === 'occupied';
          const stateLabel = G_STATES[state] || (
            state === 'occupied' ? 'OBSAZENO' : state === 'soon' ? 'ZAČÍNÁ BRZY' : 'VOLNO'
          );
          const shortLabel = G_SHORT[state] || (
            state === 'occupied' ? 'Obsazeno' : state === 'soon' ? 'Začíná brzy' : 'Volno'
          );

          const upcoming = heroVisible ? appts.slice(1, 6) : appts.slice(0, 5);

          // Quick-book buttons hide themselves when no preset duration fits
          // the available gap — instead of showing an empty "Žádný volný čas"
          // dropdown the user is invited to use the custom-time modal below.
          let bookingButtons = null;
          if (bookingEnabled && room) {
            if (room.Busy && appts[0]) {
              const currentStart = new Date(parseInt(appts[0].Start, 10));
              const currentEnd = new Date(parseInt(appts[0].End, 10));
              let gap = Infinity;
              if (appts[1]) {
                gap = Math.round((parseInt(appts[1].Start, 10) - parseInt(appts[0].End, 10)) / 60000);
              }
              const opts = fitOptions(gap);
              const showExtend = opts.length > 0;
              const showBookAfter = opts.length > 0;
              bookingButtons = (
                <div style={styles.ctaRow}>
                  {showExtend && (
                    <GlassDropdownButton label={G_BUTTONS.extend || 'Prodloužit'} options={opts} disabled={showPopup}
                      onPick={(n) => extendBooking(n, room, currentStart, currentEnd, togglePopup)} />
                  )}
                  <GlassConfirmButton label={G_BUTTONS.end || 'Ukončit'} disabled={showPopup}
                    onConfirm={() => endNow(room, currentStart, togglePopup)} />
                  {showBookAfter && (
                    <GlassDropdownButton label={G_BUTTONS.bookAfter || 'Rezervovat po'} options={opts} disabled={showPopup} primary
                      onPick={(n) => bookAfter(n, room, currentEnd, togglePopup)} />
                  )}
                </div>
              );
            } else if (appts.length === 0) {
              bookingButtons = (
                <div style={styles.ctaRow}>
                  <GlassDropdownButton label={G_BUTTONS.bookNow || 'Rezervovat teď'} options={fitOptions(Infinity)} disabled={showPopup} primary
                    onPick={(n) => bookNow(n, room, togglePopup)} />
                </div>
              );
            } else {
              const minutesUntilNext = appointmentMinutesUntil(now, appts[0].Start);
              if (minutesUntilNext >= 5) {
                const opts = fitOptions(minutesUntilNext);
                if (opts.length > 0) {
                  bookingButtons = (
                    <div style={styles.ctaRow}>
                      <GlassDropdownButton label={G_BUTTONS.bookNow || 'Rezervovat teď'} options={opts} disabled={showPopup} primary
                        onPick={(n) => bookNow(n, room, togglePopup)} />
                    </div>
                  );
                }
              } else if (appts[0]) {
                const imminentEnd = new Date(parseInt(appts[0].End, 10));
                let gapAfterNext = Infinity;
                if (appts[1]) {
                  gapAfterNext = Math.round((parseInt(appts[1].Start, 10) - parseInt(appts[0].End, 10)) / 60000);
                }
                const opts = fitOptions(gapAfterNext);
                if (opts.length > 0) {
                  bookingButtons = (
                    <div style={styles.ctaRow}>
                      <GlassDropdownButton label={G_BUTTONS.bookAfterNext || 'Rezervovat po následující'} options={opts} disabled={showPopup} primary
                        onPick={(n) => bookAfter(n, room, imminentEnd, togglePopup)} />
                    </div>
                  );
                }
              }
            }
          }

          let customTimeButton = null;
          if (bookingEnabled && room) {
            customTimeButton = (
              <div style={Object.assign({}, styles.ctaRow, { marginTop: 8 })}>
                <button
                  type="button"
                  data-action="open-booking-modal"
                  style={Object.assign({}, styles.cta, { width: '100%' })}
                  onClick={this.openBookingModal}
                  disabled={showPopup}
                >
                  {G_BUTTONS.bookCustom || 'Rezervovat na čas…'}
                </button>
              </div>
            );
          }

          const featuredOrganizer = featured && featured.Organizer ? featured.Organizer : '';
          const featuredSubject = featured && featured.Subject ? featured.Subject : '';

          return (
            <div style={styles.root}>
              <div style={Object.assign({}, styles.bloom, { background: glow.bloom })} />
              <div style={styles.grid} />

              <div style={styles.inner}>
                {/* MAIN STATUS CARD */}
                <div style={styles.card}>
                  <div style={styles.topRow}>
                    <div style={styles.pill}>
                      <span style={Object.assign({}, styles.pillDot, { color: glow.hex, background: glow.hex })} />
                      <span>{shortLabel}</span>
                    </div>
                  </div>

                  <div style={styles.roomLabel}>{G.roomLabel || 'Zasedací místnost'}</div>
                  <div style={styles.roomName}>{room && room.Name}</div>

                  <h1 style={Object.assign({}, styles.status, { color: glow.hex })}>{stateLabel}</h1>

                  {heroVisible && featured && (
                    <div style={Object.assign({}, styles.hero, { borderColor: glow.soft })}>
                      <div style={Object.assign({}, styles.heroLabel, { color: glow.hex })}>{heroLabel}</div>

                      <div style={styles.heroBody}>
                        {SHOW_ORGANIZER && showAvatar && (
                          <div style={Object.assign({}, styles.bigAvatar, {
                            background: 'linear-gradient(135deg, ' + glow.soft + ', rgba(255,255,255,0.04))',
                            borderColor: glow.soft,
                          })}>
                            {getInitials(featuredOrganizer)}
                          </div>
                        )}
                        <div style={{ minWidth: 0, gridColumn: (SHOW_ORGANIZER && showAvatar) ? 'auto' : '1 / -1' }}>
                          {SHOW_ORGANIZER && (
                            <div style={styles.heroName}>{featuredOrganizer || '—'}</div>
                          )}
                          <div style={SHOW_ORGANIZER ? styles.heroTitle : styles.heroName}>{featuredSubject}</div>
                        </div>
                      </div>

                      {featuredStart && featuredEnd && (
                        <div style={styles.timeBand}>
                          <div style={styles.timePart}>
                            <div style={styles.timePartLabel}>{G_TIME.from || 'Od'}</div>
                            <div style={styles.timeBig}>{featuredStart}</div>
                          </div>
                          <div style={styles.timeArrow}>→</div>
                          <div style={styles.timePart}>
                            <div style={styles.timePartLabel}>{G_TIME.to || 'Do'}</div>
                            <div style={styles.timeBig}>{featuredEnd}</div>
                          </div>
                        </div>
                      )}

                      <div style={styles.heroFooter}>
                        {remainingMin !== null && (
                          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, letterSpacing: '0.18em', color: glow.hex, textTransform: 'uppercase' }}>
                            {G_TIME.remaining || 'Zbývá'} {fmtDurationHm(remainingMin, durSfx)}
                          </div>
                        )}
                        {startsInMin !== null && (
                          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, letterSpacing: '0.18em', color: glow.hex, textTransform: 'uppercase' }}>
                            {state === 'soon'
                              ? (G_TIME.startsIn || 'Začíná za') + ' ' + fmtDurationHm(startsInMin, durSfx)
                              : (G_TIME.freeFor || 'Volno ještě') + ' ' + fmtDurationHm(startsInMin, durSfx)}
                          </div>
                        )}
                        {durationMin > 0 && (
                          <div style={styles.durationChip}>{fmtDurationHm(durationMin, durSfx)}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {!heroVisible && (
                    <div style={styles.heroEmpty}>
                      {G_HERO.freeRest || 'Volno do konce dne'}
                    </div>
                  )}

                  {bookingButtons}
                  {customTimeButton}

                  <a href="/" style={styles.backLink}>{G.backLink || '← Ostatní místnosti'}</a>
                </div>

                {/* RIGHT COLUMN: clock + agenda */}
                <div style={styles.rightCol}>
                  <div style={Object.assign({}, styles.card, styles.clockCard)}>
                    <div style={styles.clockText}>{fmtTime(now)}</div>
                    <div style={styles.clockMeta}>
                      <span style={{ whiteSpace: 'nowrap' }}>{fmtDayCz(now).toUpperCase()} · {fmtDateCz(now)}</span>
                    </div>
                  </div>

                  <div style={Object.assign({}, styles.card, styles.agendaCard)}>
                    <div style={styles.agendaHeader}>
                      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        {G_AGENDA.title || 'Nadcházející'}
                      </span>
                      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {upcoming.length}
                      </span>
                    </div>
                    <div>
                      {upcoming.length === 0 && (
                        <div style={Object.assign({}, styles.agendaSub, { padding: '14px 0' })}>{G_AGENDA.empty || 'Žádná další událost dnes'}</div>
                      )}
                      {upcoming.map((ev, i) => (
                        <div
                          key={i}
                          style={SHOW_ORGANIZER
                            ? styles.agendaItem
                            : Object.assign({}, styles.agendaItem, { gridTemplateColumns: '1fr auto', padding: '18px 0' })}
                        >
                          {SHOW_ORGANIZER && (
                            <div style={styles.initials}>{getInitials(ev.Organizer)}</div>
                          )}
                          <div style={styles.agendaText}>
                            <div style={styles.agendaTitle}>{ev.Subject}</div>
                            {SHOW_ORGANIZER && (
                              <div style={styles.agendaSub}>{ev.Organizer}</div>
                            )}
                          </div>
                          <div style={styles.agendaTimeCell}>
                            {ev.Start && (
                              <div style={styles.agendaDate}>
                                {fmtDateShortCz(new Date(parseInt(ev.Start, 10)))}
                              </div>
                            )}
                            <div style={styles.agendaTime}>
                              {ev.Start && ev.End
                                ? appointmentTime(ev.Start) + '–' + appointmentTime(ev.End)
                                : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {this.state.bookingModalOpen && bookingEnabled && room && (
                <GlassBookingModal
                  room={room}
                  togglePopup={togglePopup}
                  showPopup={!!showPopup}
                  onClose={this.closeBookingModal}
                />
              )}
            </div>
          );
        }}
      </GlassClockTicker>
    );
  }
}

GlassRoomDisplay.propTypes = {
  room: PropTypes.object.isRequired,
  togglePopup: PropTypes.func,
  showPopup: PropTypes.bool,
};

export default GlassRoomDisplay;
