import {
  createType, editType, deleteType,
  fetchAdminMidnightData, fetchMidnightData,
  addMidnight, editMidnight, deleteMidnight,
  createAccount, editAccount, deleteAccount,
  setPreferences, createRequirement, awardMidnights,
  changeWeek, generateMidnights
} from "./actions";
import reducer from './reducers';

const Actions = {
  fetchAll: fetchMidnightData,
  fetchAdmin: fetchAdminMidnightData,
  addType: createType,
  editType: editType,
  deleteTypes: deleteType,
  addMidnight: addMidnight,
  editMidnight: editMidnight,
  deleteMidnight: deleteMidnight,
  addAccounts: createAccount,
  editAccount: editAccount,
  deleteAccounts: deleteAccount,
  updatePreferences: setPreferences,
  setRequirement: createRequirement,
  awardMidnight: awardMidnights,
  generateMidnights: generateMidnights,
  changeDay: changeWeek
};

const State = {
  typeList: "types",
  midnights: "midnights",
  accounts: "accounts",
  potentialAccounts: "potentialAccounts",
  unreviewed: "unreviewed"
};

export { Actions, State, reducer }