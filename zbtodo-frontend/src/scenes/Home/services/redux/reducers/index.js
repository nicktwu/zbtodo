import {CURRENT_USER} from "../names";

const getHome = (PREFIX) => ((state = {}, action) => {
  switch (action.type) {
    case PREFIX+CURRENT_USER:
      return {...state, user: action.user};
    default:
      return state
  }
});

export { getHome }