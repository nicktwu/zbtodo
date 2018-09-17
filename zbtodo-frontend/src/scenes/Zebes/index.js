import React from 'react';
import GroupRounded from "@material-ui/icons/GroupRounded";
import {SceneCreator} from "../../components";
import content from "./content";
import {reducer} from "./services/redux";
import {connect} from "react-redux";

const Scene = SceneCreator("Zebes", <GroupRounded/>, content, reducer);

Scene.getWrapper = (PREFIX, NAME) => ((Component) => connect(
  (state) => ({ currentZebes: state[NAME].currentZebes }),
  () => ({})
)(Component));

export default Scene;