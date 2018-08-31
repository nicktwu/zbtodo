import React, { Component } from 'react';
import {AuthScene, MainScene, HomeScene, MidnightScene, ZebeScene} from "./scenes";
import getBaseServices from "./services";
import {combineReducers} from "redux";
import * as constants from "./constants";
import {Redirect, Route, Switch} from "react-router-dom";

const Authentication = AuthScene.getComponent(constants.actions.auth, constants.names.auth);
const withAuth = AuthScene.getWrapper(constants.actions.auth, constants.names.auth);

HomeScene.route = constants.paths.home;
HomeScene.component = withAuth(HomeScene.getComponent(constants.actions.home, constants.names.home));
MidnightScene.route = constants.paths.midnight;
MidnightScene.component = withAuth(MidnightScene.getComponent(constants.actions.midnight, constants.names.midnight));
ZebeScene.route = constants.paths.zebe;
ZebeScene.component = withAuth(ZebeScene.getComponent(constants.actions.zebe, constants.names.zebe));

const DisplaySceneList = [HomeScene, MidnightScene, ZebeScene];

// setup the main wrapper
const MainContent = MainScene.getComponent(DisplaySceneList);

// unify all the reducers into one, and set the names appropriately
const auth = AuthScene.getReducer(constants.actions.auth);
const home = HomeScene.getReducer(constants.actions.home);
const zebe = ZebeScene.getReducer(constants.actions.zebe);
const midnight = MidnightScene.getReducer(constants.actions.midnight);
const BaseServices = getBaseServices(combineReducers({
  [constants.names.auth] : auth,
  [constants.names.home] : home,
  [constants.names.zebe] : zebe,
  [constants.names.midnight] : midnight
}));

class App extends Component {
  render() {
    return (
      <BaseServices>
        <Authentication authPath={constants.paths.auth} homePath={constants.paths.base}
                        component={MainContent}>
          <Switch>
            {DisplaySceneList.map((scene, idx) => (
              <Route key={idx} path={constants.paths.base + scene.route} component={scene.component} />
            ))}
            <Route render={() => (
              <Redirect to={constants.paths.base + constants.paths.home} />
            )} />
          </Switch>
        </Authentication>
      </BaseServices>
    )
  }
}

export default App;
