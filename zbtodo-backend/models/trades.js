const moment = require("moment");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Midnights = require('./midnights');

// We need to check whether the user has the midnight, then create the trade iff the use has the midnight
// There exists a race condition here with the midnight maker's ability to update the midnight
// This is tolerable; the worst case is Midnight ends up offered for trade, but was put up by previous owner

const midnightTrade = new Schema({
  midnight: { type: Schema.Types.ObjectId, ref: "Midnight"},
  pointsOffered: Number
});

midnightTrade.statics.getActive = function() {
  let today = moment().startOf("day");
  return Midnights.MidnightAccount.getCurrent().then(accounts => {
    return Midnights.Midnight.find({
      date: {$gte: today}, // future midnights
      account: { $in : accounts.map(acc => acc._id) }, // valid midnights
      $or: [ { reviewed: {$exists: false } },  { reviewed: false }, { reviewed: null} ] // unreviewed
    }).populate({ path: 'account', populate: {path: 'zebe'}}).populate('task').exec()
  }).then(midnights => {
    return this.find({
      midnight: {$in : midnights.map(midnight=>midnight._id)},
    }).populate({ path: 'midnight', populate: [{path: 'account', populate: {path: 'zebe'}}, {path: 'task'}]})
      .exec()
  })
};



let MidnightTrade = mongoose.model("MidnightTrade", midnightTrade);

module.exports = {
  MidnightTrade
};