import React from 'react';
import HomeRounded from "@material-ui/icons/HomeRounded";
import {SceneCreator} from "../../components";
import content from "./content";
import {reducer} from "./services/redux";

export default SceneCreator("Home", <HomeRounded/>, content, reducer);