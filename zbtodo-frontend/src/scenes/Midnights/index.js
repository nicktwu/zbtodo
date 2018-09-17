import React from 'react';
import MidnightIcon from "@material-ui/icons/Brightness3Rounded";
import {SceneCreator} from "../../components";
import content from './content';
import { reducer } from './services/redux';

export default SceneCreator("Midnights", <MidnightIcon />, content, reducer) ;