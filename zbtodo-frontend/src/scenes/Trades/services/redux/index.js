import {createBasicFetch, offerMidnightAction, deleteMidnightTradeAction, editMidnightTradeAction} from "./actions/index";
import reducer from "./reducers/index";
import {executeMidnightTradeAction} from "./actions";

const Actions = {
  refreshData: createBasicFetch,
  giveMidnight: offerMidnightAction,
  deleteTrade: deleteMidnightTradeAction,
  updateTrade: editMidnightTradeAction,
  executeTrade: executeMidnightTradeAction
};

const State = {
  tradeAnnouncements: "tradeAnnouncements",
  midnightTrades: 'midnightTrades',
  tradeableMidnights: 'tradeableMidnights',
};

export {
  Actions,
  State,
  reducer
}