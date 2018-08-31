import {CURRENT_USER, CURRENT_SEMESTER} from "../names";

const getHome = (PREFIX) => ((state = { user: {}, semester: {} }, action) => {
  switch (action.type) {
    case PREFIX+CURRENT_USER:
      return {...state, user: action.user};
    case PREFIX+CURRENT_SEMESTER:
      return {...state, semester: action.semester};
    default:
      return state
  }
});

export { getHome }