import React, {Component} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {Actions} from './services/redux';
import {Route, Switch, Redirect, withRouter} from 'react-router-dom';
import {FinishAuthorization, Login} from "./components";
import queryString from "query-string";
import {loginPath, logoutPath, landingPath} from "./paths";
import {getAuth} from "./services/redux";


const mapStateToProps = (NAME) => ((state) => {
  return {
    auth: state[NAME],
    token: state[NAME].token,
    errMessage: state[NAME].message
  }
});

const mapDispatchToProps = (PREFIX) => ((dispatch) => ({
  login: () => dispatch(Actions.getLogin(PREFIX)()),
  getToken: (code, state, nonce, mac) => (dispatch(Actions.getTokenSave(PREFIX)(code, state, nonce, mac))),
  logout: () => dispatch(Actions.getLogout(PREFIX)()),
  clearMessage: () => dispatch(Actions.getClearMessage(PREFIX)),
  refreshToken: (new_token) => dispatch(Actions.getTokenRefresh(PREFIX)(new_token)),
  timeoutToken: () => dispatch(Actions.getTokenTimeout(PREFIX))
}));

/**
 * Passive component, props controlled entirely by redux,
 * shows authentication flow
 */
class Authentication extends Component {

  render() {
    return (
      <Switch>
        <Route path={this.props.authPath + loginPath} render={() => {
          return <Login click={this.props.login}
                        token={this.props.token}
                        clearMessage={this.props.clearMessage}
                        errMessage={this.props.errMessage}
                        finishPath={this.props.homePath}/>
        }}/>
        <Route path={this.props.authPath + landingPath} render={({location}) => (
            <FinishAuthorization token={this.props.token} errMessage={this.props.errMessage}
                                 finishPath={this.props.homePath}
                                 finishLogin={(code, state) => (this.props.getToken(
                                   code, state, this.props.auth.nonce, this.props.auth.mac
                                 ))} loginPath={this.props.authPath + loginPath}
                                 queryParams={queryString.parse(location.search)} />
          )
        }/>
        <Route path={this.props.authPath + logoutPath} render={() => {
          this.props.logout();
          return <Redirect to={this.props.authPath + loginPath} />
        }}/>
        <Route render={()=>{
          if (this.props.token) {
            let Component = this.props.component;
            return (
              <Component logoutPath={this.props.authPath + logoutPath}
                         basePath={this.props.homePath}
                         timeoutToken={this.props.timeoutToken}
                         token={this.props.token}
                         refreshToken={this.props.refreshToken}>
                {this.props.children}
              </Component>
            )
          } else {
            return <Redirect to={this.props.authPath + loginPath}/>
          }
        }}/>
      </Switch>
    )
  }
}

Authentication.propTypes = {
  auth: PropTypes.object,
  token: PropTypes.string,
  errMessage: PropTypes.string,
  children: PropTypes.element.isRequired,
  clearMessage: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  getToken: PropTypes.func.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired,
  component: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  homePath: PropTypes.string.isRequired,
  authPath: PropTypes.string.isRequired,
};


/**
 * Wrap an element to give it some props
 * @param PREFIX the Auth prefix
 * @param NAME the Auth name
 * @returns {function(*=): *} a function that returns a component
 *                            provided with the token, refreshtoken,
 *                            and timeouttoken props
 */
const getWrapper = (PREFIX, NAME) => ((Component) => connect(
  (state) => ({ token: state[NAME].token, user: state[NAME].user }),
  (dispatch) => ({
    refreshToken: (new_token, new_user) => dispatch(Actions.getTokenRefresh(PREFIX)(new_token, new_user)),
    timeoutToken: () => dispatch(Actions.getTokenTimeout(PREFIX))
  })
)(Component));


export default {
  getComponent: (PREFIX, NAME) => withRouter(connect(mapStateToProps(NAME), mapDispatchToProps(PREFIX))(Authentication)),
  getWrapper: getWrapper,
  getReducer: getAuth
}