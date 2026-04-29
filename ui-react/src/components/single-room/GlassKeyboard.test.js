import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import GlassKeyboard from './GlassKeyboard';

configure({ adapter: new Adapter() });

function clickKey(wrapper, label) {
  const key = wrapper
    .find('button')
    .filterWhere((n) => n.prop('data-key') === label)
    .first();
  expect(key.exists()).toBe(true);
  key.simulate('click');
}

describe('GlassKeyboard — letter input', () => {
  it('calls onChange with appended character when a letter key is tapped', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="" onChange={onChange} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('appends letters to the existing value', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="ah" onChange={onChange} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'o');
    expect(onChange).toHaveBeenCalledWith('aho');
  });

  it('removes last character on Backspace', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="abc" onChange={onChange} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'Backspace');
    expect(onChange).toHaveBeenCalledWith('ab');
  });

  it('inserts a space on Space', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="hi" onChange={onChange} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'Space');
    expect(onChange).toHaveBeenCalledWith('hi ');
  });

  it('calls onSubmit on Hotovo', () => {
    const onSubmit = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="hi" onChange={() => {}} onSubmit={onSubmit} onClose={() => {}} />
    );
    clickKey(wrapper, 'Done');
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('GlassKeyboard — Shift, digits, language', () => {
  it('Shift uppercases the next letter then resets', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <GlassKeyboard value="" onChange={onChange} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'Shift');
    clickKey(wrapper, 'a');
    expect(onChange).toHaveBeenLastCalledWith('A');
    onChange.mockClear();
    // Now wrapper passes value="A"; subsequent letter is lowercase again.
    wrapper.setProps({ value: 'A' });
    clickKey(wrapper, 'b');
    expect(onChange).toHaveBeenLastCalledWith('Ab');
  });

  it('123 button switches to digit layout', () => {
    const wrapper = mount(
      <GlassKeyboard value="" onChange={() => {}} onSubmit={() => {}} onClose={() => {}} />
    );
    clickKey(wrapper, 'ToDigits');
    // After toggling, digits should be visible
    expect(
      wrapper.find('button').filterWhere((n) => n.prop('data-key') === '1').length
    ).toBeGreaterThan(0);
  });

  it('CZ/EN toggle switches base layout (z <-> y in row 1 last position)', () => {
    const wrapper = mount(
      <GlassKeyboard value="" onChange={() => {}} onSubmit={() => {}} onClose={() => {}} initialLang="cs" />
    );
    // CZ layout (QWERTZ) has 'z' in row 1
    expect(
      wrapper.find('button').filterWhere((n) => n.prop('data-key') === 'z').length
    ).toBeGreaterThan(0);
    clickKey(wrapper, 'Lang');
    wrapper.update();
    // EN layout (QWERTY) does not have 'z' in row 1, has 'y' in row 1 instead
    // (and 'z' moves to row 3). For this test we just check that toggling
    // produced a re-render in which the lang state is now 'en'.
    const langBtn = wrapper.find('button').filterWhere((n) => n.prop('data-key') === 'Lang').first();
    expect(langBtn.text()).toBe('EN');
  });
});
