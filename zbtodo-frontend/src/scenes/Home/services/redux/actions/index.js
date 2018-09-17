import {CURRENT_SEMESTER, CURRENT_USER, NOTIFICATIONS} from "../names";
import {ReduxActionCreators} from "../../../../../components";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/home";
let SEMESTER_BASE = "https://zbtodo-backend.herokuapp.com/api/semester";

if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/home";
  SEMESTER_BASE = "http://localhost:5000/api/semester";
}

const GET_HOME = BACKEND_BASE + "/all";
const CHECK_OK = SEMESTER_BASE + "/ready_to_advance";
const ADVANCE_SEMESTER = SEMESTER_BASE + "/advance";

const saveHandler = (PREFIX, dispatch) => ((contents) => {
  if (contents.zebe) {
    dispatch({type: PREFIX + CURRENT_USER, user: contents.zebe});
  }
  if (contents.semester) {
    dispatch({type: PREFIX + CURRENT_SEMESTER, semester: contents.semester});
  }
  if (contents.notifications) {
    dispatch({type: PREFIX + NOTIFICATIONS, notifications: contents.notifications});
  }
  return contents
});

export const createGetHome = ReduxActionCreators.getAndUpdateCreator(GET_HOME, saveHandler);

export const checkNewSemester = ReduxActionCreators.getAndUpdateCreator(CHECK_OK, saveHandler);

export const advanceSemester = ReduxActionCreators.fetchAndSaveActionCreator(ADVANCE_SEMESTER, (token, name) => ({
  method: "POST",
  mode: 'cors',
  headers: {
    'Authorization': "Bearer " + token,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name })
}), saveHandler);