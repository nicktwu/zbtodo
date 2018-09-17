const paths = {
  auth: "/auth",
  base: "/zbt",
  home: "/home",
  zebe: "/zebe",
  midnight: "/midnight",
  trade: "/trade",
};

const names = {
  auth: { name: "auth", action: "AUTH_" },
  home: { name: "home", action: "HOME_" },
  midnight: { name: "midnight", action: "MIDNIGHT_" },
  zebe: { name: "zebe", action: "ZEBE_" },
  trade: { name: 'trade', action: "TRADE_" }
};

const getRenderable = (name, scene, wrapper=(x=>x)) => {
  let renderable = { ...scene };
  renderable.route = paths[name];
  let designated = names[name];
  renderable.component = wrapper(scene.getComponent(designated.action, designated.name));
  return renderable
};

const joinReducers = (nameToSceneMap) => {
  return Object.keys(names).reduce((previousValue, currentValue) => ({
    ...previousValue,
    [names[currentValue].name]: nameToSceneMap[currentValue].getReducer(names[currentValue].action, names[currentValue].name)
  }), {})
};

export { paths, names, getRenderable, joinReducers }