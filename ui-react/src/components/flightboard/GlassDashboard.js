import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Socket from '../global/Socket';
import Spinner from '../global/Spinner';
import * as config from '../../config/flightboard.config.js';
import {
  STATE_HEX,
  fmtTime,
  fmtSeconds,
  fmtDayCz,
  fmtDateCz,
  fmtDateShortCz,
  appointmentTime,
  appointmentMinutesUntil,
  isSameLocalDay,
  classifyRoom,
  GlassClockTicker,
} from '../global/glassShared';

const SHOW_ORGANIZER = (process.env.REACT_APP_SHOW_ORGANIZER || 'true').toLowerCase() !== 'false';

const styles = {
  root: {
    width: '100%', minHeight: '100vh',
    background: '#050608',
    color: '#fff',
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bloom: {
    position: 'absolute', inset: '-15%',
    pointerEvents: 'none',
    filter: 'blur(80px)',
    background:
      'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(34,197,94,0.18), transparent 60%), ' +
      'radial-gradient(ellipse 50% 50% at 80% 70%, rgba(239,68,68,0.16), transparent 60%), ' +
      'radial-gradient(ellipse 35% 35% at 60% 20%, rgba(245,158,11,0.12), transparent 60%)',
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
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh',
    padding: 24, gap: 16,
    boxSizing: 'border-box',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 22px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 22,
    position: 'relative',
    zIndex: 30,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  title: {
    fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em',
    margin: 0, lineHeight: 1,
  },
  rightCluster: { display: 'flex', alignItems: 'center', gap: 18 },
  clock: {
    fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em',
    fontFeatureSettings: '"tnum"',
  },
  clockSeconds: { color: 'rgba(255,255,255,0.4)', fontSize: 18, marginLeft: 4 },
  date: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 14,
  },
  summary: {
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', gap: 14,
  },
  summaryDot: {
    width: 12, height: 12, borderRadius: 4,
    boxShadow: '0 0 14px currentColor',
  },
  summaryLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.2em',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em',
    fontFeatureSettings: '"tnum"',
    marginTop: 2,
  },
  list: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 22,
    padding: '8px 4px',
    overflow: 'hidden',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '14px 110px 1fr 1.4fr 110px',
    alignItems: 'center',
    padding: '14px 22px',
    gap: 18,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'inherit',
    textDecoration: 'none',
  },
  rowLast: { borderBottom: 'none' },
  statusBar: { width: 4, height: 36, borderRadius: 2, boxShadow: '0 0 10px currentColor' },
  statusBlock: { display: 'flex', flexDirection: 'column', gap: 4 },
  statusWord: {
    fontFamily: 'Inter Tight, system-ui, sans-serif',
    fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em',
    lineHeight: 1,
    transition: 'color 400ms ease',
  },
  statusSub: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10, letterSpacing: '0.16em',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  roomName: {
    fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  roomMeta: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  eventBlock: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  eventHead: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10, letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16, fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    color: 'rgba(255,255,255,0.95)',
  },
  eventLine: {
    display: 'flex', gap: 10, alignItems: 'baseline',
    fontSize: 13, color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    minWidth: 0,
  },
  eventTime: {
    fontFamily: 'Geist Mono, monospace',
    fontFeatureSettings: '"tnum"',
    color: 'rgba(255,255,255,0.85)',
    whiteSpace: 'nowrap',
  },
  eventOrganizer: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rightCell: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  remaining: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  remainingValue: {
    fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
    fontFeatureSettings: '"tnum"',
  },
  empty: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
  },
  branchPillWrap: { position: 'relative' },
  errorBox: {
    margin: 24, padding: 24,
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 18,
    background: 'rgba(239,68,68,0.08)',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 13, letterSpacing: '0.08em',
  },
};

// ── Glass-native branch dropdown ───────────────────────────────────────────────
const filterStyles = {
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 11, letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    cursor: 'pointer',
    userSelect: 'none',
  },
  caret: { fontSize: 10, opacity: 0.6 },
  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    minWidth: 220,
    background: 'rgba(20,22,28,0.96)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 6,
    display: 'flex', flexDirection: 'column', gap: 2,
    zIndex: 20,
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  },
  option: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12, letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'left',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  optionActive: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
};

class GlassRoomFilter extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, roomlists: [], loaded: false };
    this._setRoot = (el) => { this._root = el; };
    this._handleDocClick = (e) => {
      if (this._root && !this._root.contains(e.target)) this.setState({ open: false });
    };
  }
  componentDidMount() {
    document.addEventListener('mousedown', this._handleDocClick);
    fetch('/api/roomlists')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) this.setState({ roomlists: data, loaded: true });
        else this.setState({ loaded: true });
      })
      .catch(() => this.setState({ loaded: true }));
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this._handleDocClick);
  }

  pick(value) {
    this.setState({ open: false });
    this.props.onFilter(value);
  }

  render() {
    const { current } = this.props;
    const { open, roomlists } = this.state;

    const G = (config.glass) || {};
    const allId = 'roomlist-all';
    const isAll = !current || current === '' || current === allId;
    let label = G.branchLabel || (config.roomFilter && config.roomFilter.filterTitle) || 'Pobočky';
    if (!isAll) {
      const match = roomlists.find(
        (n) => 'roomlist-' + n.toLowerCase().replace(/\s+/g, '-') === current
      );
      if (match) label = match;
    }

    return (
      <div ref={this._setRoot} style={{ position: 'relative' }}>
        <div
          style={filterStyles.pill}
          onClick={() => this.setState({ open: !open })}
        >
          <span>{label}</span>
          <span style={filterStyles.caret}>▾</span>
        </div>
        {open && (
          <div style={filterStyles.panel}>
            <button
              type="button"
              style={{
                ...filterStyles.option,
                ...(isAll ? filterStyles.optionActive : {}),
              }}
              onClick={() => this.pick(allId)}
            >
              {G.branchAll || (config.roomFilter && config.roomFilter.filterAllTitle) || 'Všechny místnosti'}
            </button>
            {roomlists.map((name) => {
              const id = 'roomlist-' + name.toLowerCase().replace(/\s+/g, '-');
              const active = current === id;
              return (
                <button
                  key={id}
                  type="button"
                  style={{
                    ...filterStyles.option,
                    ...(active ? filterStyles.optionActive : {}),
                  }}
                  onClick={() => this.pick(id)}
                >
                  {name}
                </button>
              );
            })}
            {roomlists.length === 0 && (
              <div style={{ ...filterStyles.option, opacity: 0.5, cursor: 'default' }}>
                {G.loading || 'Načítání'}…
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

class GlassDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: false,
      error: false,
      rooms: [],
      filter: '',
    };
    this.handleSocket = this.handleSocket.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }
  componentDidMount() { this.getRoomData(); }

  getRoomData() {
    return fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => {
        this.setState({
          response: true,
          error: !!data.error,
          rooms: data,
        });
      });
  }

  handleSocket(socketResponse) {
    this.setState({
      response: socketResponse.response,
      rooms: socketResponse.rooms,
    });
  }

  handleFilter(filterValue) {
    this.setState({ filter: filterValue });
  }

  filteredRooms() {
    const { rooms, filter } = this.state;
    if (!filter || filter === 'roomlist-all' || filter === '') return rooms;
    return rooms.filter((r) => {
      if (!r.Roomlist) return false;
      const slug = 'roomlist-' + r.Roomlist.toLowerCase().replace(/\s+/g, '-');
      return slug === filter;
    });
  }

  render() {
    const { response, error, rooms, filter } = this.state;

    if (!response) {
      return (
        <div style={styles.root}>
          <div style={styles.bloom} />
          <Socket response={this.handleSocket} />
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.root}>
          <div style={styles.bloom} />
          <Socket response={this.handleSocket} />
          <div style={styles.errorBox}>{rooms.error || (config.glass && config.glass.loadError) || 'Chyba načítání místností'}</div>
        </div>
      );
    }

    const visibleRooms = this.filteredRooms();
    const showRoomlistFilter = process.env.REACT_APP_ROOMLIST === 'true';

    return (
      <GlassClockTicker>
        {(now) => {
          const enriched = visibleRooms.map((r) => ({ room: r, state: classifyRoom(r, now) }));
          const counts = enriched.reduce((acc, x) => {
            acc[x.state] = (acc[x.state] || 0) + 1;
            return acc;
          }, {});
          const total = enriched.length;
          const G = config.glass || {};
          const STATES = G.states || { free: 'Volno', soon: 'Brzy', occupied: 'Obsazeno' };
          const SUMMARY = G.summary || { free: 'Volných', soon: 'Začíná brzy' };
          const ROW_HEADS = G.rowHeads || { inProgress: 'Probíhá', upcomingSoon: 'Začíná za chvíli', next: 'Následuje' };
          const ROW_RIGHT = G.rowRight || { remaining: 'Zbývá', startsIn: 'Začíná za', freeFor: 'Volno ještě', free: 'Volno', minSuffix: 'min' };
          const titleText = G.title || (config.navbar && config.navbar.title) || '';

          return (
            <div style={styles.root}>
              <div style={styles.bloom} />
              <div style={styles.grid} />
              <Socket response={this.handleSocket} />

              <div style={styles.inner}>
                {/* TOP BAR */}
                <div style={styles.topBar}>
                  <div style={styles.titleRow}>
                    <h1 style={styles.title}>{titleText}</h1>
                    {showRoomlistFilter && (
                      <div style={styles.branchPillWrap}>
                        <GlassRoomFilter onFilter={this.handleFilter} current={filter} />
                      </div>
                    )}
                  </div>
                  <div style={styles.rightCluster}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={styles.clock}>
                        {fmtTime(now)}
                        <span style={styles.clockSeconds}>:{fmtSeconds(now)}</span>
                      </div>
                      <div style={styles.date}>{fmtDayCz(now)} · {fmtDateCz(now)}</div>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}
                <div style={styles.summaryRow}>
                  {[
                    { state: 'free', label: SUMMARY.free },
                    { state: 'soon', label: SUMMARY.soon },
                  ].map((s) => (
                    <div key={s.state} style={styles.summary}>
                      <div style={{ ...styles.summaryDot, color: STATE_HEX[s.state], background: STATE_HEX[s.state] }} />
                      <div>
                        <div style={styles.summaryLabel}>{s.label}</div>
                        <div style={styles.summaryVal}>
                          {counts[s.state] || 0}{' '}
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'Geist Mono, monospace' }}>
                            / {total}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ROOMS LIST */}
                <div style={styles.list}>
                  {enriched.map(({ room, state }, i) => {
                    const color = STATE_HEX[state];
                    const stateWord = STATES[state];
                    const appts = room.Appointments || [];
                    const showCurrent = state === 'occupied' && appts[0];
                    const featured = showCurrent ? appts[0] : appts[0];
                    const headLabel = showCurrent
                      ? ROW_HEADS.inProgress
                      : state === 'soon' ? ROW_HEADS.upcomingSoon : ROW_HEADS.next;

                    let remainingLabel = ROW_RIGHT.free;
                    let remainingVal = '—';
                    if (showCurrent) {
                      remainingLabel = ROW_RIGHT.remaining;
                      remainingVal = Math.max(0, appointmentMinutesUntil(now, featured.End)) + ' ' + ROW_RIGHT.minSuffix;
                    } else if (featured) {
                      const diff = appointmentMinutesUntil(now, featured.Start);
                      remainingLabel = state === 'soon' ? ROW_RIGHT.startsIn : ROW_RIGHT.freeFor;
                      remainingVal = Math.max(0, diff) + ' ' + ROW_RIGHT.minSuffix;
                    }

                    const rowStyle = {
                      ...styles.row,
                      ...(i === enriched.length - 1 ? styles.rowLast : {}),
                    };

                    const eventLineParts = [];
                    if (featured && featured.Start && featured.End) {
                      const startDate = new Date(parseInt(featured.Start, 10));
                      const datePrefix = isSameLocalDay(startDate, now)
                        ? ''
                        : fmtDateShortCz(startDate) + ' ';
                      eventLineParts.push(
                        <span key="t" style={styles.eventTime}>
                          {datePrefix}{appointmentTime(featured.Start)}–{appointmentTime(featured.End)}
                        </span>
                      );
                    }
                    if (SHOW_ORGANIZER && featured && featured.Organizer) {
                      eventLineParts.push(
                        <span key="dot" style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                      );
                      eventLineParts.push(
                        <span key="org" style={styles.eventOrganizer}>{featured.Organizer}</span>
                      );
                    }

                    const rowChildren = [
                      <div key="bar" style={{ ...styles.statusBar, background: color, color }} />,
                      <div key="status" style={styles.statusBlock}>
                        <div style={{ ...styles.statusWord, color }}>{stateWord}</div>
                        {room.Roomlist && <div style={styles.statusSub}>{room.Roomlist}</div>}
                      </div>,
                      <div key="name" style={{ minWidth: 0 }}>
                        <div style={styles.roomName}>{room.Name}</div>
                        {room.RoomAlias && <div style={styles.roomMeta}>{room.RoomAlias}</div>}
                      </div>,
                      <div key="event" style={styles.eventBlock}>
                        {featured ? (
                          <div>
                            <div style={{ ...styles.eventHead, color: showCurrent ? color : 'rgba(255,255,255,0.45)' }}>
                              {headLabel}
                            </div>
                            <div style={styles.eventTitle}>{featured.Subject}</div>
                            <div style={styles.eventLine}>{eventLineParts}</div>
                          </div>
                        ) : (
                          <div style={styles.empty}>{G.emptyDayLabel || 'Žádná další událost dnes'}</div>
                        )}
                      </div>,
                      <div key="right" style={styles.rightCell}>
                        <div style={{ ...styles.remaining, color: showCurrent || state === 'soon' ? color : 'rgba(255,255,255,0.45)' }}>
                          {remainingLabel}
                        </div>
                        <div style={{ ...styles.remainingValue, color: showCurrent || state === 'soon' ? color : '#fff' }}>
                          {remainingVal}
                        </div>
                      </div>,
                    ];

                    if (room.ErrorMessage) {
                      return (
                        <div key={room.RoomAlias || i} style={rowStyle} title={room.ErrorMessage}>
                          {rowChildren}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={room.RoomAlias || i}
                        to={'/single-room/' + room.RoomAlias}
                        target="_self"
                        style={rowStyle}
                      >
                        {rowChildren}
                      </Link>
                    );
                  })}
                  {enriched.length === 0 && (
                    <div style={{ padding: '40px 22px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      {G.emptyList || 'Žádné místnosti k zobrazení'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </GlassClockTicker>
    );
  }
}

GlassDashboard.propTypes = {};

export default GlassDashboard;
