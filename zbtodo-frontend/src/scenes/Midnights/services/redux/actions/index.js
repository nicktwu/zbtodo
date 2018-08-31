import {MIDNIGHT_ACCOUNTS, MIDNIGHT_ASSIGNMENTS, MIDNIGHT_TYPES, POTENTIAL_ACCOUNTS, UNREVIEWED} from "../names";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/midnights";

if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/midnights";
}
const ADD_TYPE = BACKEND_BASE + "/types/create";
const FETCH_ALL = BACKEND_BASE + "/all/user";
const FETCH_ADMIN = BACKEND_BASE + "/all/admin";
const EDIT_TYPE = BACKEND_BASE + "/types/update/";
const DELETE_TYPE = BACKEND_BASE + "/types/delete";
const ADD_ACCOUNT = BACKEND_BASE + "/accounts/create";
const EDIT_ACCOUNT = BACKEND_BASE + "/accounts/update/";
const DELETE_ACCOUNT = BACKEND_BASE + "/accounts/delete";
const ADD_MIDNIGHT = BACKEND_BASE + "/midnight/create";
const EDIT_MIDNIGHT = BACKEND_BASE + "/midnight/update/";
const DELETE_MIDNIGHT = BACKEND_BASE + "/midnight/delete";
const AWARD_MIDNIGHT = BACKEND_BASE + "/midnight/award/";
const GET_WEEK = BACKEND_BASE + "/midnight/week/";

export const createTypeAction = (PREFIX) => ((token, payload, options) => ((dispatch)=> {
  let editing = options && options.edit;
  let removing = options && options.remove;
  return fetch(editing ? EDIT_TYPE + payload._id : removing ? DELETE_TYPE : ADD_TYPE, {
    method: editing ? "PUT" : "POST",
    mode: "cors",
    headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    },
    body: JSON.stringify( removing ? payload :
      { name: payload.name, description: payload.description, value: payload.value }
      ),
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_TYPES, types: contents.types});
    if (contents.midnights) {
      dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    }
    return contents
  })
}));

export const createMidnightAction = (PREFIX) => ((token, payload, options) => ((dispatch) => {
  let editing = options && options.edit;
  let removing = options && options.remove;
  return fetch(editing ? EDIT_MIDNIGHT + payload._id : removing ? DELETE_MIDNIGHT : ADD_MIDNIGHT, {
    method: editing ? "PUT" : "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      console.log(res);
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    if (contents.unreviewed) {
      dispatch({type: PREFIX+UNREVIEWED, unreviewed: contents.unreviewed});
    }
    return contents
  })
}));

export const createFetchMidnightData = (PREFIX) => ((token, admin) => ((dispatch) => {
  return fetch(admin ? FETCH_ADMIN : FETCH_ALL, {
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json();
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_TYPES, types: contents.types});
    dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    dispatch({type: PREFIX+MIDNIGHT_ACCOUNTS, accounts: contents.accounts});
    if (admin) {
      dispatch({type: PREFIX+POTENTIAL_ACCOUNTS, potential: contents.potential});
      dispatch({type: PREFIX+UNREVIEWED, unreviewed: contents.unreviewed});
    }
    return contents
  })
}));

export const createAccountAction = (PREFIX) => ((token, payload, options) => ( (dispatch) => {
  let editing = options && options.edit;
  let removing = options && options.remove;
  return fetch(editing ? EDIT_ACCOUNT + payload._id : removing ? DELETE_ACCOUNT : ADD_ACCOUNT, {
    method: editing ? "PUT" : "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_ACCOUNTS, accounts: contents.accounts});
    if (contents.potential) {
      dispatch({type: PREFIX+POTENTIAL_ACCOUNTS, potential: contents.potential});
    }
    if (contents.midnights) {
      dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    }
    return contents
  })
}));

export const createMidnightAward = (PREFIX) => ((token, payload) => ((dispatch) => {
  return fetch(AWARD_MIDNIGHT + payload._id, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    dispatch({type: PREFIX+UNREVIEWED, unreviewed: contents.unreviewed});
    dispatch({type: PREFIX+MIDNIGHT_ACCOUNTS, accounts: contents.accounts});
    return contents
  })
}));

export const createChangeWeek = (PREFIX) => ((token, payload) => ((dispatch) => {
  return fetch(GET_WEEK, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
    return contents
  })
}));
