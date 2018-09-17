import {CURRENT_USER, CURRENT_SEMESTER, NOTIFICATIONS} from "../names";

const getHome = (PREFIX) => ((state = { user: {}, semester: {}, notifications: [] }, action) => {
  switch (action.type) {
    case PREFIX+CURRENT_USER:
      return {...state, user: action.user};
    case PREFIX+CURRENT_SEMESTER:
      return {...state, semester: action.semester};
    case PREFIX + NOTIFICATIONS:
      return {...state, notifications: action.notifications};
    default:
      return state
  }
});

export default getHome