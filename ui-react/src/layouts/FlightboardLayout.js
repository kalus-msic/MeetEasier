import React, { Component } from 'react';

import GlassDashboard from '../components/flightboard/GlassDashboard';

class FlightboardLayout extends Component {
  render () {
    return (
      <div id="page-wrap">
        <GlassDashboard />
      </div>
    )
  }
}

export default FlightboardLayout;
