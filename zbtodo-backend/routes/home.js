const express = require('express');
const Semester = require("../models/semester");
const router = express.Router();

/** GET /all
 * basic home information
 * */
router.get('/all', function(req, res, next) {
  let resObj = {zebe: req.user, token: req.refreshed_token};
  Semester.getCurrent().then(semester => {
    if (semester) {
      resObj.semester = semester;
    }
    res.json(resObj);
  }).catch(next);
});

module.exports = router;
