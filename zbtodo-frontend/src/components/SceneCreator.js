import React from 'react';
import {GenericNav} from ".";


let createTab = (title, icon) => (({ active }) => <GenericNav text={title} icon={icon} active={active}/>);

const createScene = (title, icon, content, reducer) => ({
  getComponent: content,
  nav: createTab(title, icon),
  getReducer: reducer
});

export default createScene;