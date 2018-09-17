const express = require('express');
const Semester = require("../models/semester");
const Notifications = require('../models/notifications');
const router = express.Router();

/** GET /all
 * basic home information
 */
router.get('/all', function(req, res, next) {
  let resObj = {zebe: req.user, token: req.refreshed_token};
  Semester.getCurrent().then(semester => {
    if (semester) {
      resObj.semester = semester;
    }
    return Notifications.Notification.find({ zebe: req.user._id, semester: semester._id }).exec();
  }).then(notifications => {
    resObj.notifications = notifications;
    res.json(resObj);
  }).catch(next);
});

module.exports = router;
