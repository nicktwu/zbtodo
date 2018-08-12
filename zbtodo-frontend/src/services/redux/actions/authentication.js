import {AUTH_REDIRECT, GET_TOKEN, FORCE_INVALIDATE} from "../names";

export const generateValues = () => {
  let state_val = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
  let nonce = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
  return {
    type: AUTH_REDIRECT,
    state_val: state_val,
    nonce: nonce
  }
};

export const getToken = (code, state_val) => {
  // use the code to get a token
  return {
    type: GET_TOKEN,
    code: code,
    state_val: state_val
  }
};

export const invalidate = () => ({
  type: FORCE_INVALIDATE
});