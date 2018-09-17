import reducer from "./reducers/index";
import {createGetHome, checkNewSemester, advanceSemester} from "./actions";

const Actions = {
  getHome: createGetHome,
  checkReady: checkNewSemester,
  advanceSemester: advanceSemester,
};

const State = {
  user: 'user',
  semester: 'semester',
  notifications: 'notifications'
};

export {Actions, State, reducer};