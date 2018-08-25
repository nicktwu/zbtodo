import {SAVE_CURRENT_LIST, SAVE_INACTIVE_LIST, SAVE_POTENTIAL_LIST} from "../names";

const getZebes = (PREFIX) => ((state = {currentZebes: [], potentialZebes: [], inactiveZebes: []}, action) => {
  switch (action.type) {
    case PREFIX+SAVE_CURRENT_LIST:
      return { ...state, currentZebes: action.zebes};
    case PREFIX+SAVE_POTENTIAL_LIST:
      return { ...state, potentialZebes: action.users};
    case PREFIX+SAVE_INACTIVE_LIST:
      return {...state, inactiveZebes: action.zebes};
    default:
      return state
  }
});

export { getZebes }