import {COMPLETE_MIDNIGHT_TRADES, INCOMPLETE_MIDNIGHT_TRADES, TRADEABLE_MIDNIGHT} from "../names";


const initialState = {
  tradeAnnouncements: [],
  midnightTrades: [],
  tradeableMidnights: []
};

const getTrades = (PREFIX) => ((state = initialState, action) => {
  switch (action.type) {
    case PREFIX+COMPLETE_MIDNIGHT_TRADES:
      return {...state, tradeAnnouncements: action.announcements };
    case PREFIX+INCOMPLETE_MIDNIGHT_TRADES:
      return {...state, midnightTrades: action.trades };
    case PREFIX+TRADEABLE_MIDNIGHT:
      return {...state, tradeableMidnights: action.midnights };
    default:
      return state;
  }
});

export default getTrades;