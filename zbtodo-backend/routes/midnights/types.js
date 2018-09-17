const express = require('express');
const router = express.Router();
const Semester = require('../../models/semester');
const Midnights = require('../../models/midnights');
const moment = require('moment');
const permissions = require('./permissions');

router.use(permissions);

/**
 * POST /create
 * create new midnight from body
 */
router.post('/create', function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (
    req.body // must have content
    && req.body.name // must have a name
    && req.body.value // must have a value
    && req.body.value > 0 // must have a positive value
    && req.body.description // must have a description
    && req.body.defaultDays // have to have default days this exists
    && req.body.defaultDays.length
  ) {
    Semester.getCurrent().then(currentSem => {
      let newType = {
        name: req.body.name,
        value: req.body.value,
        description: req.body.description,
        defaultDays: req.body.defaultDays
      };
      if (currentSem) {
        newType.semester = currentSem._id;
      }
      // might have the current semester changed out from underneath your feet, but this is tolerable
      return Midnights.MidnightType.create(newType)
    }).then(() => {
      return Midnights.MidnightType.getCurrent()
    }).then((docs) => {
      resObj.types = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

/**
 * PUT /update
 * update the midnight type with the body
 */
router.post('/update', function(req, res, next) {
  if (
    req.body // must have content
    && req.body._id
    && req.body.name // must have a name
    && req.body.value // must have a value
    && req.body.value > 0 // must have a positive value
    && req.body.description // must have a description
    && req.body.defaultDays // have to have default days this exists
    && req.body.defaultDays.length
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightType.findByIdAndUpdate(req.body._id, {
      $set: {
        name: req.body.name,
        value: req.body.value,
        description: req.body.description,
        defaultDays: req.body.defaultDays
      }
    }).exec().then((res) => {
      if (res) {
        return Midnights.MidnightType.getCurrent()
      } else {
        res.sendStatus(404);
        throw new Error("not found");
      }
    }).then(docs => {
      resObj.types = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});


/**
 * POST /delete
 * requires body with attribute deleted, containing a list of ids
 */
router.post('/delete', function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightType.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      // delete the respective midnights of that type as well
      return Midnights.Midnight.deleteMany({ task : {$in : req.body.deleted}}).exec()
    }).then(() => {
      return Midnights.MidnightType.getCurrent()
    }).then(docs => {
      resObj.types = docs;
      return Midnights.Midnight.getWeek(moment.parseZone(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;