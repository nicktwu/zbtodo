import {MIDNIGHT_ACCOUNTS, MIDNIGHT_ASSIGNMENTS, MIDNIGHT_TYPES, POTENTIAL_ACCOUNTS, UNREVIEWED} from "../names";


const initialState = {
  types: [],
  midnights: [],
  potentialAccounts: [],
  accounts: [],
  unreviewed: []
};

const getMidnights = (PREFIX) => ((state=initialState, action) => {
  switch(action.type) {
    case PREFIX+MIDNIGHT_TYPES:
      return { ...state, types: action.types};
    case PREFIX+MIDNIGHT_ASSIGNMENTS:
      return { ...state, midnights: action.midnights};
    case PREFIX + POTENTIAL_ACCOUNTS:
      return { ...state, potentialAccounts: action.potential};
    case PREFIX+MIDNIGHT_ACCOUNTS:
      return { ...state, accounts: action.accounts};
    case PREFIX+UNREVIEWED:
      return {...state, unreviewed: action.unreviewed};
    default:
      return state
  }
});

export {getMidnights}