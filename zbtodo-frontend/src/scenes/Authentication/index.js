import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {Actions} from '../../services/redux';
import queryString from 'query-string';
import axios from "axios";

const ZBTODO_AUTH_ENDPOINT = "https://oidc.mit.edu/authorize";
const ZBTODO_CLIENT_ID = "986eded7-87a0-4e09-986b-98553ffc0eef";
const ZBTODO_LOGOUT = "https://oidc.mit.edu/logout";

const THIS_URL = "http://localhost:3000/todo/landing"; // for debug

const mapStateToProps = (state) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch) => ({
  invalidate: () => dispatch(Actions.invalidate()),
  generateValues: () => dispatch(Actions.generateValues()),
  getToken: (code, state_val) => dispatch(Actions.getToken(code, state_val))
});

const getLogoutFunc = (invalidationFunc) => {
  //return () => axios({method: "post", maxRedirects:0, url: ZBTODO_LOGOUT}).then(invalidationFunc)
  return invalidationFunc
};


class AuthWrapper extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const queryParams = queryString.parse(this.props.location.search);
    if (queryParams.state === this.props.auth.state_val) {
      this.props.getToken(queryParams.code, queryParams.state)
    }
  }

  componentDidUpdate() {
    if (!this.props.auth.valid) {
      if (this.props.auth.redirect) {
        window.location = encodeURI(
          ZBTODO_AUTH_ENDPOINT + "?" +
          "client_id=" + ZBTODO_CLIENT_ID + "&" +
          "response_type=code&" +
          "scope=openid profile email&" +
          "state=" + this.props.auth.state_val + "&" +
          "nonce=" + this.props.auth.nonce + "&" +
          "redirect_uri=" + THIS_URL
        );
      }
    }
  }


  render() {
    return React.cloneElement(this.props.children, {
      loggedIn: this.props.auth.valid,
      logout: getLogoutFunc(this.props.invalidate),
      login: this.props.generateValues
    })
  }
}

AuthWrapper.propTypes = {
  auth : PropTypes.object.isRequired,
  generateValues: PropTypes.func.isRequired,
  getToken: PropTypes.func.isRequired,
  invalidate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AuthWrapper))