import { createStore } from "redux";
import reducers from "./reducers"
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"

const store = createStore(persistReducer({key: 'root', storage}, reducers));

export default store;