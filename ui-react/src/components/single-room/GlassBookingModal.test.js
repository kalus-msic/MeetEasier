import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import GlassBookingModal from './GlassBookingModal';

configure({ adapter: new Adapter() });

function makeRoom(appointments) {
  return {
    Email: 'room1@example.com',
    Name: 'Kabinet',
    Busy: false,
    Appointments: appointments || [],
  };
}

function makeAppointment(startISO, endISO, subject) {
  return {
    Start: String(new Date(startISO).getTime()),
    End: String(new Date(endISO).getTime()),
    Subject: subject || 'Existing meeting',
    Organizer: 'X',
  };
}

describe('GlassBookingModal', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-04-29T10:00:00').getTime());
  });
  afterEach(() => {
    Date.now.mockRestore && Date.now.mockRestore();
    if (jest.restoreAllMocks) jest.restoreAllMocks();
  });

  it('renders and shows a default 30-min selection starting at the next quarter', () => {
    const wrapper = mount(
      <GlassBookingModal
        room={makeRoom([])}
        onClose={() => {}}
        togglePopup={() => {}}
        showPopup={false}
        now={new Date('2026-04-29T10:07:00')}
      />
    );
    const confirm = wrapper.find('button[data-action="confirm"]').first();
    expect(confirm.exists()).toBe(true);
    expect(confirm.text()).toMatch(/30 min/);
  });

  it('quick-duration chip changes selection length', () => {
    const wrapper = mount(
      <GlassBookingModal
        room={makeRoom([])}
        onClose={() => {}}
        togglePopup={() => {}}
        showPopup={false}
        now={new Date('2026-04-29T10:00:00')}
      />
    );
    wrapper.find('button[data-action="quick-60"]').first().simulate('click');
    wrapper.update();
    expect(wrapper.find('button[data-action="confirm"]').first().text()).toMatch(/60 min/);
  });

  it('confirm calls fetch with expected URL and reloads on ok', (done) => {
    const reload = jest.fn();
    const togglePopup = jest.fn();
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ ok: true }) }));
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    });

    const wrapper = mount(
      <GlassBookingModal
        room={makeRoom([])}
        onClose={() => {}}
        togglePopup={togglePopup}
        showPopup={false}
        now={new Date('2026-04-29T10:00:00')}
      />
    );

    wrapper.find('button[data-action="confirm"]').first().simulate('click');

    setImmediate(() => {
      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('/api/roombooking');
      expect(url).toContain('roomEmail=room1%40example.com');
      expect(url).toContain('bookingType=BookNow');
      const messages = togglePopup.mock.calls.map((c) => c[0]).filter(Boolean);
      expect(messages.some((m) => /Hotovo/.test(m))).toBe(true);
      setTimeout(() => {
        expect(reload).toHaveBeenCalled();
        done();
      }, 5100);
    });
  }, 7000);

  it('conflict response shows the conflict popup and keeps modal open', (done) => {
    const togglePopup = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ ok: false, reason: 'conflict' }) })
    );

    const wrapper = mount(
      <GlassBookingModal
        room={makeRoom([])}
        onClose={() => {}}
        togglePopup={togglePopup}
        showPopup={false}
        now={new Date('2026-04-29T10:00:00')}
      />
    );

    wrapper.find('button[data-action="confirm"]').first().simulate('click');

    setImmediate(() => {
      const messages = togglePopup.mock.calls.map((c) => c[0]).filter(Boolean);
      expect(messages.some((m) => /obsazen/i.test(m))).toBe(true);
      expect(wrapper.find('button[data-action="confirm"]').exists()).toBe(true);
      done();
    });
  });

  it('day chip click switches the displayed events', () => {
    const wrapper = mount(
      <GlassBookingModal
        room={makeRoom([
          makeAppointment('2026-04-30T09:00:00', '2026-04-30T10:00:00', 'Tomorrow event'),
        ])}
        onClose={() => {}}
        togglePopup={() => {}}
        showPopup={false}
        now={new Date('2026-04-29T10:00:00')}
      />
    );
    expect(wrapper.text()).not.toContain('Tomorrow event');
    wrapper.find('button[data-day-offset=1]').first().simulate('click');
    wrapper.update();
    expect(wrapper.text()).toContain('Tomorrow event');
  });
});
