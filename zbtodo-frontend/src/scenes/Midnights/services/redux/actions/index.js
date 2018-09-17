import {MIDNIGHT_ACCOUNTS, MIDNIGHT_ASSIGNMENTS, MIDNIGHT_TYPES, POTENTIAL_ACCOUNTS, UNREVIEWED} from "../names";
import {ReduxActionCreators} from "../../../../../components";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/midnights";

if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/midnights";
}
const ADD_TYPE = BACKEND_BASE + "/types/create";
const FETCH_ALL = BACKEND_BASE + "/all/user";
const FETCH_ADMIN = BACKEND_BASE + "/all/admin";
const EDIT_TYPE = BACKEND_BASE + "/types/update";
const DELETE_TYPE = BACKEND_BASE + "/types/delete";
const ADD_ACCOUNT = BACKEND_BASE + "/accounts/create";
const EDIT_ACCOUNT = BACKEND_BASE + "/accounts/update";
const DELETE_ACCOUNT = BACKEND_BASE + "/accounts/delete";
const UPDATE_PREFS = BACKEND_BASE + "/accounts/update_prefs";
const SET_REQ = BACKEND_BASE + "/accounts/set_req";
const ADD_MIDNIGHT = BACKEND_BASE + "/midnight/create";
const EDIT_MIDNIGHT = BACKEND_BASE + "/midnight/update";
const DELETE_MIDNIGHT = BACKEND_BASE + "/midnight/delete";
const AWARD_MIDNIGHT = BACKEND_BASE + "/midnight/award";
const GENERATE_MIDNIGHTS = BACKEND_BASE + "/midnight/generate";
const GET_WEEK = BACKEND_BASE + "/midnight/week";

const saveHandler = (PREFIX, dispatch) => ((contents) => {
  if (contents.types) {
    dispatch({type: PREFIX+MIDNIGHT_TYPES, types: contents.types});
  }
  if (contents.midnights) {
    dispatch({type: PREFIX+MIDNIGHT_ASSIGNMENTS, midnights: contents.midnights});
  }
  if (contents.accounts) {
    dispatch({type: PREFIX+MIDNIGHT_ACCOUNTS, accounts: contents.accounts});
  }
  if (contents.potential) {
    dispatch({type: PREFIX+POTENTIAL_ACCOUNTS, potential: contents.potential});
  }
  if (contents.unreviewed) {
    dispatch({type: PREFIX+UNREVIEWED, unreviewed: contents.unreviewed.sort((midnightA, midnightB) => {
      if (midnightA.date.substr(0,10) < midnightB.date) {
        return -1
      } else if (midnightB.date.substr(0,10) < midnightA.date.substr(0,10)) {
        return 1
      } else {
        return 0
      }
    }) });
  }
  return contents;
});

export const fetchMidnightData = ReduxActionCreators.getAndUpdateCreator(FETCH_ALL, saveHandler);
export const fetchAdminMidnightData = ReduxActionCreators.getAndUpdateCreator(FETCH_ADMIN, saveHandler);

export const createType = ReduxActionCreators.postAndUpdateCreator(ADD_TYPE, saveHandler);
export const editType = ReduxActionCreators.postAndUpdateCreator(EDIT_TYPE, saveHandler);
export const deleteType = ReduxActionCreators.postAndUpdateCreator(DELETE_TYPE, saveHandler);

export const addMidnight = ReduxActionCreators.postAndUpdateCreator(ADD_MIDNIGHT, saveHandler);
export const editMidnight = ReduxActionCreators.postAndUpdateCreator(EDIT_MIDNIGHT, saveHandler);
export const deleteMidnight = ReduxActionCreators.postAndUpdateCreator(DELETE_MIDNIGHT, saveHandler);

export const createRequirement = ReduxActionCreators.postAndUpdateCreator(SET_REQ, saveHandler);
export const setPreferences = ReduxActionCreators.postAndUpdateCreator(UPDATE_PREFS, saveHandler);

export const createAccount = ReduxActionCreators.postAndUpdateCreator(ADD_ACCOUNT, saveHandler);
export const editAccount = ReduxActionCreators.postAndUpdateCreator(EDIT_ACCOUNT, saveHandler);
export const deleteAccount = ReduxActionCreators.postAndUpdateCreator(DELETE_ACCOUNT, saveHandler);

export const generateMidnights = ReduxActionCreators.postAndUpdateCreator(GENERATE_MIDNIGHTS, saveHandler);
export const awardMidnights = ReduxActionCreators.postAndUpdateCreator(AWARD_MIDNIGHT, saveHandler);
export const changeWeek = ReduxActionCreators.postAndUpdateCreator(GET_WEEK, saveHandler);

