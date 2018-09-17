const express = require('express');
const router = express.Router();
const Zebe = require('../models/zebe');
const emailValidator = require('email-validator');
const Semester = require('../models/semester');
const Midnights = require('../models/midnights');
const Notifications = require("../models/notifications");

const editPermissions = function(req, res, next) {
  if (req.user.tech_chair || req.user.president || req.user.rush_chair) {
    next()
  } else {
    res.sendStatus(403);
  }
};

/* GET current zebe listing. */
router.get('/current', function(req, res, next) {
  Zebe.getCurrentZebes("name kerberos email phone").then(docs => {
    res.json({ zebes: docs, token: req.refreshed_token })
  }).catch(next);
});

router.post('/update_current', function(req, res, next) {
  if (req.body // must have valid body
    && (!req.body.phone || /^\d+$/.test(req.body.phone)) // must have a numeric phone number
    && (!req.body.email || emailValidator.validate(req.body.email)) // must have a valid email
  ) {
    let setObj = {};
    setObj.phone = req.body.phone ? req.body.phone : "";
    setObj.email = req.body.email ? req.body.email : "";
    // Singular operation updating, this is clearly atomic
    Zebe.findByIdAndUpdate(req.user._id, {$set: setObj}, {runValidators: true, new: true, lean: false}).exec().then((doc) => {
      res.json({ token: req.refreshed_token, user: doc });
    }).catch(next);
  } else {
    // on or more of our checks failed, the request was bad
    res.sendStatus(400);
  }
});

router.get('/admin', editPermissions, function(req, res, next) {
  Zebe.getAdminInfo().then(info => {
    res.json({...info, token: req.refreshed_token});
  }).catch(next)
});

// validate zebes
router.post("/validate", editPermissions, function(req, res, next) {
  if (req.body && req.body.validated && req.body.validated.length > 0) {
    Semester.getCurrent().then((currentSemester) => {
      // race condition on the semester: worst case, we update the semester to an old semester- not malicious
      return Zebe.update(
        {_id: {$in: req.body.validated}},
        {$set: {zebe: true}, $addToSet: { semesters: currentSemester._id}},
        {multi: true, runValidators: true}
      ).exec()
    }).then(() => {
      return Zebe.getAdminInfo()
    }).then(info => {
      res.json({ ...info, token: req.refreshed_token });
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

// deactivate zebes
router.post("/deactivate", editPermissions, function(req, res, next) {
  if (req.body && req.body.deactivated && req.body.deactivated.length > 0) {
    Semester.getCurrent().then(currentSemester => {
      // race condition on the semester: worst case, we update the semester to an old semester- not malicious
      return Zebe.update(
        {_id: {$in: req.body.deactivated}},
        {$pullAll: { semesters: [ currentSemester._id ]}},
        {multi: true, runValidators: true}
      ).exec()
    }).then(() => {
      return Zebe.getAdminInfo()
    }).then(info => {
      res.json({...info, token: req.refreshed_token});
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

// reactivate
router.post("/reactivate", editPermissions, function(req, res, next) {
  if (req.body && req.body.reactivated && req.body.reactivated.length > 0) {
    Semester.getCurrent().then(currentSemester => {
      // race condition on the semester: worst case, we update the semester to an old semester- not malicious
      return Zebe.update(
        {_id: {$in: req.body.reactivated}},
        {$addToSet: { semesters: currentSemester._id}},
        {multi: true, runValidators: true},
      ).exec()
    }).then(() => {
      return Zebe.getAdminInfo()
    }).then(info => {
      res.json({...info, token: req.refreshed_token});
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

// delete zebes
router.post("/delete_many", editPermissions, function(req, res, next) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    // no race: midnightaccount and notification's zebe attr should be immutable
    Zebe.deleteMany(
      {_id: {$in: req.body.deleted}},
    ).exec().then(()=> {
      return Midnights.MidnightAccount.find({zebe: {$in: req.body.deleted}}).exec();
    }).then((accts) => {
      return Midnights.Midnight.deleteMany({"account" : {$in : accts.map(acct=>acct._id)}}).exec()
    }).then(() => {
      return Midnights.MidnightAccount.deleteMany({zebe: {$in: req.body.deleted}}).exec()
    }).then(() => {
      return Notifications.Notification.deleteMany({zebe: {$in: req.body.deleted}}).exec();
    }).then(() => {
      return Zebe.find({zebe: false}).exec()
    }).then((zebes) => {
      responseObj.potential = zebes;
      return Zebe.getInactiveZebes()
    }).then((inactiveZebes) => {
      responseObj.inactive = inactiveZebes;
      res.json(responseObj);
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

router.post("/permissions", editPermissions, function(req, res, next) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.id && req.body.permissions) {
    // atomic, no race
    Zebe.findByIdAndUpdate(
      req.body.id,
      {$set: req.body.permissions},
      {runValidators: true, new: true, lean: false}
    ).exec().then(() => {
      return Zebe.getCurrentZebes()
    }).then((zebes) => {
      responseObj.current = zebes;
      return Zebe.findById(req.user._id).exec()
    }).then((zebe) => {
      responseObj.user = zebe;
      res.json(responseObj);
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
