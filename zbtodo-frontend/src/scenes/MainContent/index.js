import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavBar} from './components';

/**
 * Get the main UI-side framework
 * @param SceneList a list of scenes, which must have route (string) and nav (component) attributes
 * @returns {MainContent} Component to render with props
 */
const getMainContent = (SceneList) => {
  class MainContent extends Component {
    render() {
      return (
        <NavBar logoutPath={this.props.logoutPath} sceneList={SceneList} basePath={this.props.basePath}>
          {this.props.children}
        </NavBar>
      )
    }
  }

  MainContent.propTypes = {
    logoutPath: PropTypes.string.isRequired,
    basePath: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    refreshToken: PropTypes.func.isRequired,
    timeoutToken: PropTypes.func.isRequired
  };

  return MainContent
};

export default { getComponent: getMainContent };