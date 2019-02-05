const express = require('express');
const Semester = require("../models/semester");
const Notifications = require('../models/notifications');
const Midnights = require("../models/midnights");
const router = express.Router();

router.get('/current', function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  Semester.getCurrent().then((sem) => {
    resObj.sem = sem;
    res.json(resObj);
  }).catch(next);
});

const adminPermissions = function(req, res, next) {
  if (req.user.tech_chair || req.user.president) {
    next()
  } else {
    res.sendStatus(403);
  }
};

/**
 * GET /ready_to_advance
 * body.ready is whether we are ready to advance to the next semester
 */
router.get('/ready_to_advance', adminPermissions, function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  resObj.ready = true;
  Semester.getCurrent().then(sem => {
    if (sem) {
      // one day we will need a sanity check to stop new semesters from just happening, but for now this is okay i guess
    }
    res.json(resObj);
  });
});

/**
 * POST /advance
 *  create a new semester and advance into it, get name from body
 */
router.post('/advance', adminPermissions, function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  let newSem = null
  if (req.body && req.body.name) {
    // TODO: more advanced advance logic (dealing with midnights, etc)
    Semester.getCurrent().then(semester => {
      let newSem = new Semester();
      newSem.name = req.body.name;
      if (semester) {
        newSem.previous = semester._id;
        // migrate information to new semester
      }
      // create a new semester, and then attempt to switch into it
      return newSem.save()
    }).then(newSemester => {
      newSem = newSemester;
      // this operation is atomic, so we're safe
      return Semester.changeCurrent(newSemester._id)
    }).then(()=>{
      console.log("trying to copy types")
      return Midnights.MidnightType.advanceSemester(newSem);
    }).then(() => {
      console.log('trying to copy accounts')
      return Midnights.MidnightAccount.advanceSemester(newSem);
    }).then(()=>{
      console.log("clearing old midnights")
      return Midnights.Midnight.advanceSemester();
    }).then(()=>{
      return Notifications.Announcement.advanceSemester();
    }).then(()=>{
      return Notifications.Notification.advanceSemester();
    }).then(() => {
      return Semester.getCurrent()
    }).then((semester) => {
      resObj.semester = semester;
      res.json(resObj);
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;