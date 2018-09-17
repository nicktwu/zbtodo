import {SAVE_CURRENT_LIST, SAVE_INACTIVE_LIST, SAVE_POTENTIAL_LIST} from "../names";
import {ReduxActionCreators} from "../../../../../components";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/zebes";

if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/zebes";
}
const CURRENT_ZEBES = BACKEND_BASE + "/current";
const UPDATE_CURRENT = BACKEND_BASE + "/update_current";
const ADMIN = BACKEND_BASE + "/admin";
const VALIDATE = BACKEND_BASE + "/validate";
const DEACTIVATE = BACKEND_BASE + "/deactivate";
const REACTIVATE = BACKEND_BASE + "/reactivate";
const DELETE = BACKEND_BASE + "/delete_many";
const PERMISSIONS = BACKEND_BASE + "/permissions";

const getSaveHandler = function(PREFIX, dispatch) {
  return (contents) => {
    if (contents.zebes) {
      dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.zebes });
    }
    if (contents.current) {
      dispatch({ type: PREFIX+SAVE_CURRENT_LIST, zebes: contents.current});
    }
    if (contents.potential) {
      dispatch({ type: PREFIX+SAVE_POTENTIAL_LIST, users: contents.potential });
    }
    if (contents.inactive) {
      dispatch({ type: PREFIX+SAVE_INACTIVE_LIST, zebes: contents.inactive});
    }
    return contents
  }
};

const getFetchOptions = (token) => ({
  mode: "cors",
  headers: {
    "Authorization": "Bearer " + token
  }
});

const getFetchPostOptions = (type) => ((token, ids) => ({
  method: "POST",
  mode: "cors",
  headers: {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ [type]: ids })
}));


export const createGetCurrentZebes = ReduxActionCreators.fetchAndSaveActionCreator(
  CURRENT_ZEBES,
  getFetchOptions,
  getSaveHandler
);

export const editUserInfo = ReduxActionCreators.postAndUpdateCreator(UPDATE_CURRENT, () => (x => x));

export const editZebePermissions = ReduxActionCreators.postAndUpdateCreator(PERMISSIONS, getSaveHandler);

export const getAdminInfo = ReduxActionCreators.fetchAndSaveActionCreator(ADMIN, getFetchOptions, getSaveHandler);

export const createValidateZebes = ReduxActionCreators.fetchAndSaveActionCreator(
  VALIDATE,
  getFetchPostOptions("validated"),
  getSaveHandler
);

export const createDeactivateZebes = ReduxActionCreators.fetchAndSaveActionCreator(
  DEACTIVATE,
  getFetchPostOptions("deactivated"),
  getSaveHandler
);

export const createReactivateZebes = ReduxActionCreators.fetchAndSaveActionCreator(
  REACTIVATE,
  getFetchPostOptions("reactivated"),
  getSaveHandler
);

export const createDeleteUsers = ReduxActionCreators.fetchAndSaveActionCreator(
  DELETE,
  getFetchPostOptions("deleted"),
  getSaveHandler
);