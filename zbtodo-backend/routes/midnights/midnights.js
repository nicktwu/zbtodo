const express = require('express');
const router = express.Router();
const Midnights = require('../../models/midnights');
const moment = require('moment');
const mongoose = require('mongoose');
const computation = require("../../computation/midnights_graph_computation");
const permissions = require('./permissions');

/**
 * POST week midnights with date in body
 */
router.post('/week', function(req, res, next) {
  if (req.body && req.body.date) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.getWeek(moment.parseZone(req.body.date)).then(midnights => {
      resObj.midnights=midnights;
      res.json(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

router.use(permissions);

router.post('/generate', function(req, res, next) {
  let data = {};
  let today = moment();
  let getDay = (idx) => moment([today.year(), today.month(), today.date() - today.day() + idx]);
  Midnights.MidnightType.getCurrent().then(types => {
    let tasks = [];
    let taskMap = {};
    for (let idx = 0; idx < types.length; idx++) {
      let type = types[idx];
      if (type.defaultDays) {
        for (let i = 0; i < type.defaultDays.length; i++) {
          let day = type.defaultDays[i];
          let ctr = 0;
          while (ctr < day) {
            let midnight = new Midnights.Midnight();
            midnight.task = type._id;
            midnight.potential = type.value;
            midnight._id = mongoose.Types.ObjectId();
            midnight.date = getDay(i);
            tasks.push(midnight);
            taskMap[midnight._id.toString()] = midnight;
            ctr += 1;
          }
        }
      }
    }
    data.types = types;
    data.taskList = tasks;
    data.taskMap = taskMap;
    return Midnights.MidnightAccount.getCurrent()
  }).then(accounts => {
    let broMap = accounts.reduce((acc, cur) => ({...acc, [cur._id.toString()]:cur }), {});
    return Promise.resolve(computation.assignMidnights(accounts, data.taskList, (broId, taskId) => {
      let midnight = data.taskMap[taskId];
      let bro = broMap[broId];
      let prefDays = new Set(bro.preferredDays ? bro.preferredDays : [0,1,2,3,4,5,6]);
      let prefTasks = new Set(bro.preferredTasks ? bro.preferredTasks.map(task=>task.toString()) : data.types.map(type=>type._id.toString()));
      return prefDays.has(midnight.date.getDay()) && prefTasks.has(midnight.task.toString());
    }))
  }).then(tasks => {
    return Midnights.Midnight.create(tasks)
  }).then(()=>{
    return Midnights.Midnight.getWeek(req.body ? req.body.date : null)
  }).then((midnights)=>{
    res.json({ midnights, token: req.refreshed_token})
  }).catch(next);
});

// /midnight/create POST
router.post('/create', function(req, res, next) {
  if (req.body
    && req.body.date // must have date field
    && moment.parseZone(req.body.date) // must have valid date
    && req.body.task // must have some task id
    && req.body.account
    && req.body.potential
    && req.body.potential > 0 // positive number of potential points
  ) {
    console.log(req.body.date);
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.create({
      date: req.body.date,
      task: req.body.task,
      account: req.body.account,
      potential: req.body.potential
    }).then(() => {
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      return Midnights.Midnight.getUnreviewed()
    }).then(unreviewed => {
      resObj.unreviewed = unreviewed;
      res.json(resObj);
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

// /midnight/update/<int:id> PUT
router.put('/update/:id', function(req, res, next) {
  if (req.body
    && req.body.date // must have date field
    && moment.parseZone(req.body.date) // must have valid date
    && req.body.task // must have some task id
    && req.body.account
    && req.body.potential
    && req.body.potential > 0 // positive number of potential points
  ) {
    Midnights.Midnight.findByIdAndUpdate(
      req.params.id,
      { $set: { date: req.body.date, task: req.body.task, account: req.body.account, potential: req.body.potential } },
      {runValidators: true, new: true, lean: false}
    ).exec().then(() => {
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate))
    }).then(midnights => {
      res.json({midnights: midnights, token: req.refreshed_token})
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /midnight/delete POST
router.post('/delete', function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate))
    }).then(docs => {
      resObj.midnights = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /midnight/award/<int:id> PUT
router.post('/award/:id', function(req, res, next) {
  if (req.body
    && req.body.hasOwnProperty("awarded") // must have date field
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.findByIdAndUpdate(req.params.id, {
      $set: { awarded : req.body.awarded, feedback: req.body.feedback || "", reviewed: true }
    }, {runValidators: true, lean: false}).exec().then((oldMidnight) => {
      // updated the midnight, update the respective points
      if (oldMidnight.reviewed) {
        return Midnights.MidnightAccount.findByIdAndUpdate(oldMidnight.account, {
          $inc: {balance: req.body.awarded - oldMidnight.awarded}
        }, {runValidators: true, new: true, lean: false})
      }
      return Midnights.MidnightAccount.findByIdAndUpdate(oldMidnight.account, {
        $inc: {balance: req.body.awarded}
      }, {runValidators: true, new: true, lean: false})
    }).then(() => {
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      return Midnights.Midnight.getUnreviewed();
    }).then(unreviewed => {
      resObj.unreviewed = unreviewed;
      return Midnights.MidnightAccount.getCurrent();
    }).then(accounts => {
      resObj.accounts = accounts;
      res.json(resObj)
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;