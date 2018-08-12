import {AUTH_REDIRECT, FORCE_INVALIDATE, GET_TOKEN} from "../names";

const auth = (state = {}, action) => {
  switch (action.type) {
    case AUTH_REDIRECT:
      return {state_val: action.state_val, redirect: true, nonce: action.nonce};
    case GET_TOKEN:
      if (state.state_val === action.state_val) {
        // get a token here
        return {valid: true}
      } else {
        return {}
      }
    case FORCE_INVALIDATE:
      return {};
    default:
      return state
  }
};


export default auth;