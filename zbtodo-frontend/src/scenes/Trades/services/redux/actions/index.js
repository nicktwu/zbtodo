import {COMPLETE_MIDNIGHT_TRADES, INCOMPLETE_MIDNIGHT_TRADES, TRADEABLE_MIDNIGHT} from "../names";
import {ReduxActionCreators} from "../../../../../components";

let BACKEND_BASE = "https://zbtodo-backend.herokuapp.com/api/trades";
if (process.env.NODE_ENV === "development") {
  BACKEND_BASE = "http://localhost:5000/api/trades";
}

let BASIC_INFO = BACKEND_BASE + "/all";
let OFFER = BACKEND_BASE + "/give_midnight";
let EDIT = BACKEND_BASE + "/update_midnight_trade";
let DELETE = BACKEND_BASE + "/delete_midnight_trade";
let EXECUTE = BACKEND_BASE + "/execute_midnight_trade";

const getSaveHandler = function(PREFIX, dispatch) {
  return (contents) => {
    if (contents.midnightTrades) {
      dispatch({type: PREFIX + INCOMPLETE_MIDNIGHT_TRADES, trades: contents.midnightTrades});
    }
    if (contents.midnightsToTrade) {
      dispatch({type: PREFIX + TRADEABLE_MIDNIGHT, midnights: contents.midnightsToTrade});
    }
    if (contents.completedTrades) {
      dispatch({type: PREFIX + COMPLETE_MIDNIGHT_TRADES, announcements: contents.completedTrades});
    }
    return contents
  }
};

export const createBasicFetch = ReduxActionCreators.fetchAndSaveActionCreator(BASIC_INFO, (token) => ({
  mode: 'cors',
  headers: {
    'Authorization': 'Bearer ' + token
  }
}), getSaveHandler);

export const offerMidnightAction = ReduxActionCreators.postAndUpdateCreator(OFFER, getSaveHandler);
export const editMidnightTradeAction = ReduxActionCreators.postAndUpdateCreator(EDIT, getSaveHandler);
export const deleteMidnightTradeAction = ReduxActionCreators.postAndUpdateCreator(DELETE, getSaveHandler);
export const executeMidnightTradeAction = ReduxActionCreators.postAndUpdateCreator(EXECUTE, getSaveHandler);