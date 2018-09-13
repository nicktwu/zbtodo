const express = require('express');
const router = express.Router();
const Zebe = require('./models/zebe');
const mongoose = require('mongoose');

const chance = new require('chance')();

router.get('/add_dummy_user', function(req, res, next) {
  Zebe.create({
    _id: mongoose.Types.ObjectId().toString(),
    name: chance.name(),
    email: chance.email(),
    kerberos: chance.word()
  }).then(user => res.json({ user })).catch(next)
});


module.exports = router;