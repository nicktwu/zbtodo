import {AUTH_ERROR, LOGIN, SAVE_TOKEN, CLEAR_AUTH_MESSAGE, LOGOUT, LOGOUT_ERROR} from "../names";

let BACKEND_AUTH = "https://zbtodo-backend.herokuapp.com/auth";

const BACKEND_INITIATE = BACKEND_AUTH + "/initiate";
const BACKEND_LOGIN = BACKEND_AUTH + "/login";
const AUTH_ENDPOINT = "https://oidc.mit.edu/authorize";
const LOGOUT_ENDPOINT = "https://oidc.mit.edu/logout";
const CLIENT_ID = "986eded7-87a0-4e09-986b-98553ffc0eef";
let LOGIN_REDIRECT = "https://zbt.mit.edu/todo/auth/landing";
if (process.env.NODE_ENV === "development") {
  BACKEND_AUTH = "http://localhost:5000/auth";
  LOGIN_REDIRECT = "http://localhost:3000/todo/auth/landing"; // for debug
}

const getLogin = (PREFIX) => (() => {
  return (dispatch) => {
    // update the state
    return fetch(BACKEND_INITIATE).then(res => {
      if (res.status >= 400 && res.state <= 600) {
        throw new Error("Authentication failed.")
      }
      return res.json()
    }).then(contents => {
      dispatch({
        type: PREFIX + LOGIN,
        state_val: contents.state,
        nonce: contents.nonce,
        mac: contents.mac
      });
      return contents
    }).then(contents =>{
      // then redirect to the openid authorization page
      window.location = AUTH_ENDPOINT + "?" +
        "client_id=" + CLIENT_ID + "&" +
        "response_type=code&" +
        "scope=openid profile email phone&" +
        "state=" + contents.state+ "&" +
        "nonce=" + contents.nonce + "&" +
        "redirect_uri=" + LOGIN_REDIRECT
    }).catch(err => {
      dispatch({type: PREFIX + AUTH_ERROR, error: err.message})
    });
  }
});

const getTokenSave = (PREFIX) => ((code, state_val, nonce, mac) => {
  return (dispatch) => {
    return fetch(BACKEND_LOGIN, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ code: code, state: state_val, nonce: nonce, mac: mac, redirect_uri: LOGIN_REDIRECT}),
      headers:{
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(res => {
      if (res.status >= 400 && res.state <= 600) {
        throw new Error("Authentication failed.")
      }
      return res.json()
    }).then(contents => {
      dispatch({ type: PREFIX+SAVE_TOKEN, token: contents.token, user: contents.zebe });
      return contents
    }).catch(err => {
      dispatch({type: PREFIX+AUTH_ERROR, error: err.message});
    });
  }
});


const getLogout = (PREFIX) => (() => {
  return (dispatch) => {
    return fetch(LOGOUT_ENDPOINT, {credentials: "include", mode: 'no-cors'}).then(res => {
      dispatch({
        type: PREFIX+LOGOUT
      });
      return res
    }).catch(() => {
      dispatch({type: PREFIX+LOGOUT_ERROR, message: "An error occurred. You may not have been logged out of ZBTodo, but possibly not MIT's ID server."})
    });
  }
});

const getTokenTimeout = (PREFIX) => ({type: PREFIX+LOGOUT_ERROR, message: "Your session timed out. Please log in again."});

const getTokenRefresh = (PREFIX) => ((new_token, new_user) => {
  let action = {type: PREFIX+SAVE_TOKEN, token: new_token};
  if (new_user) {
    action.user = new_user;
  }
  return action
});

const getClearMessage = (PREFIX) => ({ type: PREFIX + CLEAR_AUTH_MESSAGE });

export {
  getLogin,
  getTokenSave,
  getLogout,
  getClearMessage,
  getTokenRefresh,
  getTokenTimeout
}