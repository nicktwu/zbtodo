import React, { Component } from 'react';
import {AuthScene, MainScene, HomeScene, MidnightScene, ZebeScene, TradeScene} from "./scenes";
import getBaseServices from "./services";
import {combineReducers} from "redux";
import * as constants from "./constants";
import {Redirect, Route, Switch} from "react-router-dom";

const Authentication = constants.getRenderable("auth", AuthScene).component;
const withAuth = AuthScene.getWrapper(constants.names.auth.action, constants.names.auth.name);

const DisplaySceneList = [
  constants.getRenderable("home", HomeScene, withAuth),
  constants.getRenderable("midnight", MidnightScene, withAuth),
  constants.getRenderable("trade", TradeScene, withAuth),
  constants.getRenderable("zebe", ZebeScene, withAuth),
];

// setup the main wrapper
const MainContent = MainScene.getComponent(DisplaySceneList);

// unify all the reducers into one, and set the names appropriately
const BaseServices = getBaseServices(combineReducers(constants.joinReducers({
  auth: AuthScene,
  home: HomeScene,
  zebe: ZebeScene,
  midnight: MidnightScene,
  trade: TradeScene
})));

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
