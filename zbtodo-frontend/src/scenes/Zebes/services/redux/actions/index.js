import {SAVE_CURRENT_LIST, SAVE_INACTIVE_LIST, SAVE_POTENTIAL_LIST} from "../names";

const BACKEND_BASE = "http://localhost:5000/api/zebes";
const CURRENT_ZEBES = BACKEND_BASE + "/current";
const UPDATE_CURRENT = BACKEND_BASE + "/update_current";
const ADMIN = BACKEND_BASE + "/admin";
const VALIDATE = BACKEND_BASE + "/validate";
const DEACTIVATE = BACKEND_BASE + "/deactivate";
const REACTIVATE = BACKEND_BASE + "/reactivate";
const DELETE = BACKEND_BASE + "/delete";
const PERMISSIONS = BACKEND_BASE + "/permissions";

export const createGetCurrentZebes = (PREFIX) => ((token) => ((dispatch) => {
  return fetch(CURRENT_ZEBES, {
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then((contents) => {
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.zebes });
    return contents
  });
}));

// this function isn't really a redux function, but for sake of organizational uniformity it's here
// at heart, it's doing my service works
export const editUserInfo = (token, updateObj) => {
  return fetch(UPDATE_CURRENT, {
    method: 'PUT',
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updateObj)
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  })
};

export const editZebePermissions = (PREFIX) => ((token, updateObj) => ((dispatch) => {
  return fetch(PERMISSIONS, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updateObj)
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data update failure")
    }
    return res.json()
  }).then(contents => {
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    return contents;
  })
}));


export const getAdminInfo = (PREFIX) => ((token) => ((dispatch) => {
  return fetch(ADMIN, {
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then((contents) => {
    dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    dispatch({ type: PREFIX+SAVE_INACTIVE_LIST, zebes: contents.inactive});
    return contents
  });
}));

export const createValidateZebes = (PREFIX) => ((token, updateIDs) => ((dispatch) => {
  return fetch(VALIDATE, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ validated: updateIDs })
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then(contents => {
    dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    return contents
  })
}));

export const createDeactivateZebes = (PREFIX) => ((token, updateIDs) => ((dispatch) => {
  return fetch(DEACTIVATE, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ deactivated: updateIDs })
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then(contents => {
    dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    dispatch({ type: PREFIX+SAVE_INACTIVE_LIST, zebes: contents.inactive});
    return contents
  })
}));

export const createReactivateZebes = (PREFIX) => ((token, updateIDs) => ((dispatch) => {
  return fetch(REACTIVATE, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reactivated: updateIDs })
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then(contents => {
    dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    dispatch({ type: PREFIX+SAVE_INACTIVE_LIST, zebes: contents.inactive});
    return contents
  })
}));

export const createDeleteUsers = (PREFIX) => ((token, updateIDs) => ((dispatch) => {
  return fetch(DELETE, {
    method: "POST",
    mode: "cors",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ deleted: updateIDs })
  }).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Data retrieval failed.")
    }
    return res.json()
  }).then(contents => {
    dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    dispatch({ type: PREFIX+SAVE_INACTIVE_LIST, zebes: contents.inactive});
    return contents
  })
}));