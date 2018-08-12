import React, {Component} from 'react';
import Router from "./router";
import Redux from "./redux";

class BaseServices extends Component {
  render() {
    return (
      <Redux>
        <Router>
          {this.props.children}
        </Router>
      </Redux>
    )
  }
}

export default BaseServices;
