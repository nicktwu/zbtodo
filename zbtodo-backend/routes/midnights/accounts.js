const express = require('express');
const router = express.Router();
const Semester = require('../../models/semester');
const Midnights = require('../../models/midnights');
const moment = require('moment');
const permissions = require('./permissions');


router.post('/update_prefs', function(req, res, next) {
  if ( req.body &&
    ((req.body.preferredDays) || (req.body.preferredTasks))
  ) {
    let updateObj = {};
    let findObj = {};
    Midnights.MidnightType.getCurrent().then(types => {
      let typeSet = new Set(types.map(type => type._id.toString()));
      if (req.body.preferredDays) {
        updateObj.preferredDays = req.body.preferredDays.map(day => day%7);
      }
      if (req.body.preferredTasks) {
        updateObj.preferredTasks = req.body.preferredTasks.filter(id => typeSet.has(id))
      }
      return Semester.getCurrent()
    }).then(semester => {
      findObj.semester = semester._id;
      findObj.zebe = req.user._id;
      return Midnights.MidnightAccount.findOneAndUpdate(findObj, {$set : updateObj}, {
        runValidators: true, new: true, lean: false
      }).exec()
    }).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then(accs => {
      res.json({accounts: accs, token: req.refreshed_token})
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

router.use(permissions);

router.post("/set_req", function(req, res, next) {
  if (req.body && req.body.requirement) {
    Midnights.MidnightAccount.setReq(req.body.requirement).then(() => {
      return Midnights.MidnightAccount.getCurrent();
    }).then(accs => {
      res.json({accounts: accs, token: req.refreshed_token})
    })
  } else {
    res.sendStatus(400);
  }
});


// /create POST
router.post('/create', function(req, res, next){
  let resObj = {token: req.refreshed_token};
  if (
    req.body // must have content
    && req.body.zebes // must have zebes
    && req.body.zebes.length // must have > 1 to create
  ) {
    let accs = req.body.zebes.map(zebe => ({ zebe }));
    Semester.getCurrent().then(semester => {
      accs = accs.map(acct => ({...acct, semester: semester._id}));
      return Midnights.MidnightType.getCurrent();
    }).then((types) => {
      accs = accs.map(acct => ({...acct, preferredDays: [0,1,2,3,4,5,6], preferredTasks: types.map(type=>type._id)}));
      return Midnights.MidnightAccount.create(accs)
    }).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then((docs) => {
      resObj.accounts = docs;
      return Midnights.MidnightAccount.getPotential()
    }).then(potentials => {
      resObj.potential = potentials;
      res.json(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /update PUT
router.post('/update', function(req, res, next) {
  if (
    req.body // must have content
    && req.body._id
    && req.body.zebe // must have zebe
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightAccount.findByIdAndUpdate(req.body._id, {
      balance: req.body.balance || 0,
      requirement: req.body.requirement || 0
    }, {runValidators: true, new: true, lean: false}).then((res) => {
      if (res) {
        return Midnights.MidnightAccount.getCurrent()
      } else {
        res.sendStatus(404);
        throw new Error("not found");
      }
    }).then((docs) => {
      resObj.accounts = docs;
      res.json(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /delete POST
router.post('/delete', function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightAccount.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      return Midnights.Midnight.deleteMany({account: {$in: req.body.deleted}}).exec();
    }).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then(docs => {
      resObj.accounts = docs;
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate));
    }).then(midnights => {
      resObj.midnights = midnights;
      return Midnights.MidnightAccount.getPotential()
    }).then(potentials => {
      resObj.potential = potentials;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;