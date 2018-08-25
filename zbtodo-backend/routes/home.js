const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/user', function(req, res) {
  res.json({user: req.user, token: req.refreshed_token});
});

module.exports = router;
