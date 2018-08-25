import { createStore, applyMiddleware } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";

const getStore = (reducers) => (createStore(
  persistReducer({key: 'root', storage}, reducers),
  applyMiddleware(thunk)
));

export default getStore;