import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GlassRoomDisplay from './GlassRoomDisplay';
import Socket from '../global/Socket';
import Spinner from '../global/Spinner';
import Popup from './Popup';


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
    const { response, room, showPopup, popupText } = this.state;

    return (
      <ErrorHandler>
        <div>
          <Socket response={this.handleSocket} />
          {response && room ? (
            <div>
              {showPopup ? <Popup text={popupText} /> : null}
              <GlassRoomDisplay
                room={room}
                togglePopup={this.togglePopup}
                showPopup={showPopup}
              />
            </div>
          ) : (
            <Spinner />
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
