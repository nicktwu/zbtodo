import reducer from "./reducers/index";
import {
  createDeactivateZebes, createDeleteUsers, createGetCurrentZebes, createReactivateZebes, createValidateZebes,
  editUserInfo,
  editZebePermissions,
  getAdminInfo
} from "./actions";

const Actions = {
  getCurrentZebes: createGetCurrentZebes,
  saveUserInfo: editUserInfo,
  saveEditPermissions: editZebePermissions,
  getAdminInfo: getAdminInfo,
  validateZebes: createValidateZebes,
  deactivateZebes: createDeactivateZebes,
  reactivateZebes: createReactivateZebes,
  deleteUsers: createDeleteUsers
};

const State = {
  currentZebes: "currentZebes",
  potentialZebes: "potentialZebes",
  inactiveZebes: "inactiveZebes"
};

export {Actions, State, reducer};