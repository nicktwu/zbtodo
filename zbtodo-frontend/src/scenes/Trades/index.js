import React from 'react';
import {Cached} from "@material-ui/icons";
import {SceneCreator} from "../../components";
import content from "./content";
import {reducer} from "./services/redux";

export default SceneCreator("Trades", <Cached />, content, reducer);