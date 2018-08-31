import React, {Component} from 'react';
import {GroupRounded} from "@material-ui/icons";
import PropTypes from 'prop-types';
import {GenericNav} from "../../components";
import getContent from "./content";
import {getZebes} from "./services/redux";
import {connect} from "react-redux";

class SceneNav extends Component {
  render() {
    return (
      <GenericNav text={"Zebes"} icon={<GroupRounded />} active={this.props.active} />
    )
  }
}

const getWrapper = (PREFIX, NAME) => ((Component) => connect(
  (state) => ({ currentZebes: state[NAME].currentZebes }),
  () => ({})
)(Component));

SceneNav.propTypes = {
  active: PropTypes.bool
};

const Scene = {
  getComponent: getContent,
  nav: SceneNav,
  getReducer: getZebes,
  getWrapper: getWrapper
};

export default Scene;