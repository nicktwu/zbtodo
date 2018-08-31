import {CURRENT_SEMESTER, CURRENT_USER} from "../names";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/home";
let SEMESTER_BASE = "https://zbtodo-backend.herokuapp.com/api/semester";

if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/home";
  SEMESTER_BASE = "http://localhost:5000/api/semester";

}
const GET_HOME = BACKEND_BASE + "/all";
const CHECK_OK = SEMESTER_BASE + "/ready_to_advance";
const ADVANCE_SEMESTER = SEMESTER_BASE + "/advance";

export const createGetHome = (PREFIX) => ((token) => ((dispatch) => {
  return fetch(GET_HOME, {
    mode: 'cors',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Failed to reach backend")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX + CURRENT_USER, user: contents.zebe});
    dispatch({type: PREFIX + CURRENT_SEMESTER, semester: contents.semester});
    return contents
  })
}));

export const checkNewSemester = () => ((token) => (() => {
  return fetch(CHECK_OK, {
    mode: 'cors',
    headers: {
      'Authorization': "Bearer " + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Failed to reach backend")
    }
    return res.json()
  })
}));

export const advanceSemester = (PREFIX) => ((token, name) => ((dispatch) => {
  return fetch(ADVANCE_SEMESTER, {
    method: "POST",
    mode: 'cors',
    headers: {
      'Authorization': "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Failed to reach backend")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX + CURRENT_SEMESTER, semester: contents.semester});
    return contents;
  })
}));