import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as config from '../../config/singleRoom.config.js';

import GlassRoomDisplay from './GlassRoomDisplay';
import RoomStatusBlock from './RoomStatusBlock';
import Sidebar from './Sidebar';
import Socket from '../global/Socket';
import Spinner from '../global/Spinner';
import Popup from './Popup';

const isClassic = (process.env.REACT_APP_UI_VARIANT || 'glass').toLowerCase() === 'classic';


class ErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorOccurred: false, currentError: null };
  }

  componentDidCatch(error, info) {
    this.setState({ errorOccurred: true, currentError: error });
  }

  render() {
    if (this.state.errorOccurred) {
      const msg = this.state.currentError ? this.state.currentError.toString() : '';
      if (msg.includes("Cannot read property 'length' of undefined")
          || msg.includes("Cannot read property 'Subject' of undefined")) {
        window.location.reload();
      }
      return <div></div>;
    }
    return this.props.children;
  }
}


class Display extends Component {
  constructor(props) {
    super(props);
    this.togglePopup = this.togglePopup.bind(this);
    this.state = {
      showPopup: false,
      popupText: 'Probíhá rezervace... prosím počkejte',
      response: false,
      roomAlias: this.props.alias,
      rooms: [],
      room: null,
      roomDetails: {
        appointmentExists: false,
        timesPresent: false,
        upcomingAppointments: false,
        nextUp: '',
      },
    };
  }

  togglePopup = (text) => {
    this.setState({ popupText: text });
    this.setState({ showPopup: !this.state.showPopup });
  }

  getRoomsData = () => {
    return fetch('/api/rooms')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ rooms: data }, () => this.processRoomDetails());
      });
  }

  processRoomDetails = () => {
    const { rooms, roomAlias } = this.state;
    const room = (rooms || []).filter((r) => r.RoomAlias === roomAlias)[0] || null;

    // Classic UI needs the legacy roomDetails flags. Glass UI ignores them.
    if (isClassic && room && Array.isArray(room.Appointments) && room.Appointments.length > 0) {
      const first = room.Appointments[0];
      const hasTimes = !!(first.Start && first.End);
      this.setState({
        response: true,
        room,
        roomDetails: {
          appointmentExists: true,
          upcomingAppointments: room.Appointments.length > 1,
          timesPresent: hasTimes,
          nextUp: hasTimes && !room.Busy ? config.nextUp + ': ' : '',
        },
      });
      return;
    }

    this.setState({ response: true, room });
  }

  handleSocket = (socketResponse) => {
    this.setState({
      response: socketResponse.response,
      rooms: socketResponse.rooms,
    }, () => this.processRoomDetails());
  }

  componentDidMount = () => { this.getRoomsData(); }

  render() {
    const { response, room, roomDetails, showPopup, popupText } = this.state;

    if (!response || !room) {
      return (
        <ErrorHandler>
          <div>
            <Socket response={this.handleSocket} />
            <Spinner />
          </div>
        </ErrorHandler>
      );
    }

    return (
      <ErrorHandler>
        <div>
          <Socket response={this.handleSocket} />
          {showPopup ? <Popup text={popupText} /> : null}
          {isClassic ? (
            <div className="row expanded full-height">
              <RoomStatusBlock
                room={room}
                details={roomDetails}
                config={config}
                togglePopup={this.togglePopup}
                showPopup={showPopup}
              />
              <Sidebar room={room} details={roomDetails} config={config} />
            </div>
          ) : (
            <GlassRoomDisplay
              room={room}
              togglePopup={this.togglePopup}
              showPopup={showPopup}
            />
          )}
        </div>
      </ErrorHandler>
    );
  }
}

Display.propTypes = {
  alias: PropTypes.string,
};

export default Display;
