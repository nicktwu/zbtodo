import {AUTH_ERROR, CLEAR_AUTH_MESSAGE, LOGIN, LOGOUT, LOGOUT_ERROR, SAVE_TOKEN} from "../names";

const getAuth = (PREFIX) => ((state = {}, action) => {
  switch (action.type) {
    case PREFIX+LOGIN:
      return {state_val: action.state_val, nonce: action.nonce, mac: action.mac};
    case PREFIX+SAVE_TOKEN:
      return {token: action.token, user: action.user ? action.user : state.user};
    case PREFIX+LOGOUT:
      return {};
    case PREFIX+AUTH_ERROR:
      return {message: "An error occurred. You have not been logged in."};
    case PREFIX+LOGOUT_ERROR:
      return {message: action.message};
    case PREFIX+CLEAR_AUTH_MESSAGE:
      return {token: state.token, state_val: state.state_val, nonce: state.nonce, mac: state.mac, user: state.user};
    default:
      return state
  }
});

export { getAuth }