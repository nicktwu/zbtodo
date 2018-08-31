const express = require('express');
const Semester = require("../models/semester");
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
      // do something else to the res obj
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
  if (req.body && req.body.name) {
    // TODO: more advanced advance logic (dealing with midnights, etc)
    Semester.getCurrent().then(semester => {
      let newSem = new Semester();
      newSem.name = req.body.name;
      if (semester) {
        newSem.previous = semester._id;
        // migrate information to new semester
      }
      return newSem.save()
    }).then(newSemester => {
      return Semester.changeCurrent(newSemester._id)
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