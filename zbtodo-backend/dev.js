const express = require('express');
const router = express.Router();
const Zebe = require('./models/zebe');
const Semester = require('./models/semester');
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

let SEMESTER_CREATED = true;

router.get('/create_semester', function(req, res, next) {
  Semester.create({
    name: "test_sem",
    current: SEMESTER_CREATED ? 1 : 0
  }).then(sem => res.json({sem})).catch(next)
});

module.exports = router;