import React, {Component} from 'react';
import MidnightIcon from "@material-ui/icons/Brightness3Rounded";
import PropTypes from 'prop-types';
import {GenericNav} from "../../components";

class MidnightNav extends Component {
  render() {
    return (
      <GenericNav text={"Midnights"} icon={<MidnightIcon />} active={this.props.active} />
    )
  }
}

MidnightNav.propTypes = {
  active: PropTypes.bool
};

const MidnightScene = {
  getComponent: ()=>(() => <p>Hi</p>),
  nav: MidnightNav
};

export default MidnightScene ;