import React, { Component } from 'react';
import * as fbConfig from '../../config/flightboard.config.js';

// Inject Inter Tight + Geist Mono and the glassPulse keyframe once per page load.
// Done dynamically so the Glass UI is self-contained and doesn't require touching
// the shared index.html.
function ensureGlassAssets() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('glass-fonts-link')) {
    const link = document.createElement('link');
    link.id = 'glass-fonts-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }
  if (!document.getElementById('glass-keyframes')) {
    const style = document.createElement('style');
    style.id = 'glass-keyframes';
    style.textContent = '@keyframes glassPulse { 0%,100%{opacity:1} 50%{opacity:.5} } html.glass-page, html.glass-page body, html.glass-page #app { background:#050608; }';
    document.head.appendChild(style);
  }
}

if (typeof window !== 'undefined') ensureGlassAssets();

export const STATE_GLOW = {
  free: {
    hex: '#22c55e',
    soft: 'rgba(34,197,94,0.18)',
    bloom:
      'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(34,197,94,0.32), transparent 60%), ' +
      'radial-gradient(ellipse 40% 40% at 80% 20%, rgba(34,197,94,0.16), transparent 60%)',
  },
  occupied: {
    hex: '#ef4444',
    soft: 'rgba(239,68,68,0.18)',
    bloom:
      'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(239,68,68,0.32), transparent 60%), ' +
      'radial-gradient(ellipse 40% 40% at 80% 20%, rgba(239,68,68,0.16), transparent 60%)',
  },
  soon: {
    hex: '#f59e0b',
    soft: 'rgba(245,158,11,0.18)',
    bloom:
      'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(245,158,11,0.30), transparent 60%), ' +
      'radial-gradient(ellipse 40% 40% at 80% 20%, rgba(245,158,11,0.16), transparent 60%)',
  },
};

export const STATE_HEX = { free: '#22c55e', occupied: '#ef4444', soon: '#f59e0b' };

export const SOON_THRESHOLD_MIN = 15;

const DAYS = fbConfig.days || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = fbConfig.months || [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad = (n) => (n < 10 ? '0' + n : '' + n);

export function fmtTime(d) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
export function fmtSeconds(d) {
  return pad(d.getSeconds());
}
export function fmtDayCz(d) {
  return DAYS[d.getDay()];
}
export function fmtDateCz(d) {
  return d.getDate() + '. ' + MONTHS[d.getMonth()];
}

export function fmtDateShortCz(d) {
  return d.getDate() + '. ' + (d.getMonth() + 1) + '.';
}

export function isSameLocalDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function shouldShowHero(state, featuredEvent, now) {
  if (state === 'occupied') return true;
  if (state === 'soon') return !!featuredEvent;
  if (state === 'free') {
    if (!featuredEvent || !featuredEvent.Start) return false;
    const start = new Date(parseInt(featuredEvent.Start, 10));
    return isSameLocalDay(start, now);
  }
  return false;
}

// Format a minute count as a compact human-readable duration. Below 90 min
// stays as minutes (familiar for room-availability glances); 90 min – 24 h
// switches to hours + remainder; >= 24 h reads as days + hours.
export function fmtDurationHm(totalMin, suffixes) {
  const sfx = suffixes || {};
  const minute = sfx.minute || 'min';
  const hour = sfx.hour || 'h';
  const day = sfx.day || 'd';
  const m = Math.max(0, Math.round(totalMin));
  if (m < 90) return m + ' ' + minute;
  if (m < 60 * 24) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? h + ' ' + hour : h + ' ' + hour + ' ' + rem + ' ' + minute;
  }
  const d = Math.floor(m / (60 * 24));
  const h = Math.floor((m % (60 * 24)) / 60);
  return h === 0 ? d + ' ' + day : d + ' ' + day + ' ' + h + ' ' + hour;
}

export function getInitials(name) {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function diffMin(now, hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
}

export function appointmentTime(ms) {
  const d = new Date(parseInt(ms, 10));
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function appointmentMinutesUntil(now, ms) {
  const start = new Date(parseInt(ms, 10));
  return Math.round((start.getTime() - now.getTime()) / 60000);
}

export function appointmentDurationMinutes(startMs, endMs) {
  const s = parseInt(startMs, 10);
  const e = parseInt(endMs, 10);
  return Math.max(0, Math.round((e - s) / 60000));
}

// Maps a room (with .Busy + .Appointments[]) and current time to a Glass state.
export function classifyRoom(room, now) {
  if (!room) return 'free';
  if (room.Busy) return 'occupied';
  const next = room.Appointments && room.Appointments[0];
  if (next && next.Start) {
    const minsUntil = appointmentMinutesUntil(now, next.Start);
    if (minsUntil >= 0 && minsUntil < SOON_THRESHOLD_MIN) return 'soon';
  }
  return 'free';
}

export const BrandMark = ({ size = 24, color = 'rgba(255,255,255,0.6)' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" rx="8" stroke={color} strokeWidth="1.6" />
    <path d="M9 22V10l7 7 7-7v12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Live-ticking clock state, exposed as a class so consumers can compose.
export class GlassClockTicker extends Component {
  constructor(props) {
    super(props);
    this.state = { now: new Date() };
  }
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: new Date() }), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    return this.props.children(this.state.now);
  }
}
