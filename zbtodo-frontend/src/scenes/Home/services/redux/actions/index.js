import {CURRENT_USER} from "../names";

const BACKEND_BASE = "http://localhost:5000/api/home";
const GET_CURRENT_USER = BACKEND_BASE + "/user";

const createGetCurrentUser = (PREFIX) => ((token) => ((dispatch) => {
  return fetch(GET_CURRENT_USER, {
    mode: 'cors',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      console.log(res);
      throw new Error("Failed to reach backend")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX + CURRENT_USER, user: contents.user});
    return contents
  })
}));

export {
  createGetCurrentUser
}