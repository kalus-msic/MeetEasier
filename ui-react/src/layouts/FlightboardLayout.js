import React, { Component } from 'react';

import GlassDashboard from '../components/flightboard/GlassDashboard';
import Flightboard from '../components/flightboard/Flightboard';
import Navbar from '../components/flightboard/Navbar';

const isClassic = (process.env.REACT_APP_UI_VARIANT || 'glass').toLowerCase() === 'classic';

class FlightboardLayout extends Component {
  constructor(props) {
    super(props);
    this.state = { filter: '' };
    this.handleFilter = this.handleFilter.bind(this);
  }

  handleFilter(filterValue) {
    this.setState({ filter: filterValue });
  }

  render() {
    if (isClassic) {
      const { filter } = this.state;
      return (
        <div id="page-wrap">
          <Navbar filter={this.handleFilter} />
          <Flightboard filter={filter} />
        </div>
      );
    }

    return (
      <div id="page-wrap">
        <GlassDashboard />
      </div>
    );
  }
}

export default FlightboardLayout;
