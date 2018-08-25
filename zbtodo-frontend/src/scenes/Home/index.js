import React, {Component} from 'react';
import {HomeRounded} from "@material-ui/icons";
import PropTypes from 'prop-types';
import {GenericNav} from "../../components";
import getContent from "./content";
import {getHome} from "./services/redux";

class HomeNav extends Component {
  render() {
    return (
      <GenericNav text={"Home"} icon={<HomeRounded />} active={this.props.active} />
    )
  }
}

HomeNav.propTypes = {
  active: PropTypes.bool
};

const HomeScene = {
  getComponent: getContent,
  nav: HomeNav,
  getReducer: getHome
};

export default HomeScene;