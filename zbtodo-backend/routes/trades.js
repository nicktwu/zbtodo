const express = require('express');
const Notifications = require("../models/notifications");
const Trades = require('../models/trades');
const Midnights = require('../models/midnights');
const Semester = require('../models/semester');
const emailer = require('../emailer');
const router = express.Router();
const moment = require('moment');

let WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

/** GET /all
 * basic trade information
 */
router.get('/all', function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  Trades.MidnightTrade.getActive().then(midnightTrades => {
    resObj.midnightTrades = midnightTrades;
    return Midnights.Midnight.findFutureUserMidnights(req.user._id, midnightTrades.map(trade => trade.midnight))
  }).then((midnights) => {
    resObj.midnightsToTrade = midnights;
    return Notifications.Announcement.getTradeAnnouncements()
  }).then((announcements) => {
    resObj.completedTrades = announcements;
    res.json(resObj);
  }).catch(next);
});

router.post("/give_midnight", function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (req.body && req.body.hasOwnProperty("pointsOffered") && req.body.midnight) {
    let trade = new Trades.MidnightTrade();
    let midnight = null;
    trade.midnight = req.body.midnight;
    trade.pointsOffered = req.body.pointsOffered;
    Midnights.Midnight.findById({
      _id: trade.midnight,
      date: {$gte : moment().startOf("day")}
    }).populate({ path: 'account', populate: {path: 'zebe'}}).populate('task').exec().then((m) => {
      if (m && m.account && m.account.zebe._id === req.user._id) {
        midnight = m;
        return trade.save();
      } else {
        return Promise.resolve(null)
      }
    }).then((res) => {
      if (res) {
        resObj.success = true
      }
      return Trades.MidnightTrade.getActive()
    }).then(midnightTrades => {
      resObj.midnightTrades = midnightTrades;
      return Midnights.Midnight.findFutureUserMidnights(req.user._id, midnightTrades.map(trade => trade.midnight))
    }).then((midnights) => {
      resObj.midnightsToTrade = midnights;
      res.json(resObj);
      if (req.body.email && midnight) {
        emailer.send("zbt-residents@mit.edu",
          "[ZBTodo] Take " + WEEKDAYS[moment.parseZone(midnight.date).day()]
          + " " + midnight.task.name + (req.body.pointsOffered ? (" for " + req.body.pointsOffered.toString() + " extra points") : ""),
          "Go to <a href='https://zbt.mit.edu/todo'>ZBTodo</a> to claim."
        )
      }
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

router.post("/update_midnight_trade", function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (req.body && req.body.hasOwnProperty("pointsOffered") && req.body._id) {
    Trades.MidnightTrade.findById(req.body._id)
      .populate({path: "midnight", populate: {path: "account"}})
      .exec().then((trade) => {
      if (trade.midnight.account.zebe === req.user._id) {
        Trades.MidnightTrade.findOneAndUpdate({_id: req.body._id, midnight: trade.midnight._id},
          {$set: {pointsOffered: req.body.pointsOffered}}).exec().then(() => {
          return Trades.MidnightTrade.getActive()
        }).then(midnightTrades => {
          resObj.midnightTrades = midnightTrades;
          res.json(resObj);
        }).catch(next);
      } else {
        res.sendStatus(401)
      }
    });
  } else {
    res.sendStatus(400);
  }
});

router.post("/delete_midnight_trade", function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (req.body && req.body._id) {
    Trades.MidnightTrade.findById(req.body._id)
      .populate({path: "midnight", populate: {path: "account"}})
      .exec().then((trade) => {
      if (trade.midnight.account.zebe === req.user._id) {
        Trades.MidnightTrade.deleteOne({_id: req.body._id, midnight: trade.midnight._id}).exec().then(() => {
          return Trades.MidnightTrade.getActive()
        }).then(midnightTrades => {
          resObj.midnightTrades = midnightTrades;
          return Midnights.Midnight.findFutureUserMidnights(req.user._id, midnightTrades.map(trade => trade.midnight))
        }).then((midnights) => {
          resObj.midnightsToTrade = midnights;
          res.json(resObj);
        }).catch(next);
      } else {
        res.sendStatus(401)
      }
    });
  } else {
    res.sendStatus(400);
  }
});

router.post("/execute_midnight_trade", function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (req.body && req.body._id) {
    // Atomic find-and-delete, prevents racing
    Trades.MidnightTrade.findByIdAndDelete(req.body._id)
      .populate({path: "midnight", populate: { path: "account", populate: {path: "zebe"}}})
      .exec().then((trade) => {
        if (trade) {
          // we won any possible race for this trade, finish the transaction
          let pointsTransacted = trade.pointsOffered;
          return Midnights.MidnightAccount.findByIdAndUpdate(trade.midnight.account._id, { $inc: { balance: -1*pointsTransacted }})
            .exec().then(() => {
              return Midnights.MidnightAccount.findOneAndUpdate({zebe: req.user._id}, {$inc:{balance:pointsTransacted}}).exec()
            }).then((acct)=>{
              if (acct) {
                return Promise.resolve(acct);
              } else {
                // synthesize a new account for this zebe
                let acct = {zebe: req.user._id, balance: pointsTransacted};
                return Semester.getCurrent().then((semester) => {
                  if (semester) {
                    acct.semester = semester._id;
                  }
                  return Midnights.MidnightType.getCurrent().then()
                }).then(types=>{
                  acct.preferredTasks = types.map(type=>type._id);
                  acct.preferredDays = [0,1,2,3,4,5,6];
                  return Midnights.MidnightAccount.create(acct);
                })
              }
            }).then((acct) => {
              return Midnights.Midnight.findByIdAndUpdate(trade.midnight, {$set: {account: acct}})
            }).then(() => {
              let message = req.user.name + " took a midnight from "
                + trade.midnight.account.zebe.name + " for " + pointsTransacted.toString() + " additional point" +
                (pointsTransacted === 1 ? "" : "s");
              return Notifications.Announcement.createTradeAnnouncement(message);
            })
        } else {
          // didn't get to the trade in time, but that's ok
          return Promise.resolve()
        }
    }).then(() => {
      return Trades.MidnightTrade.getActive()
    }).then(midnightTrades => {
      resObj.midnightTrades = midnightTrades;
      return Midnights.Midnight.findFutureUserMidnights(req.user._id, midnightTrades.map(trade => trade.midnight))
    }).then((midnights) => {
      resObj.midnightsToTrade = midnights;
      res.json(resObj);
    }).catch(next);;
  } else {
    res.sendStatus(400);
  }
});


module.exports = router;
