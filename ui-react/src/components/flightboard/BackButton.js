import { useHistory } from "react-router-dom";
import React, { Component } from 'react';

class BackButton extends Component {
  static contextTypes = {
    router: () => true, // replace with PropTypes.object if you use them
  }

  render() {
    return (
      <button
        id="btn-back"
        onClick={this.context.router.history.goBack}>
        <img src="img/backbutton.png" alt="BackBtn" />
      </button>
    )
  }
}
export default BackButton;
