const express = require('express');
const router = express.Router();
const Zebe = require('./models/zebe');
const mongoose = require('mongoose');
const Midnights = require("./models/midnights");

const chance = new require('chance')();

router.get('/add_dummy_user', function(req, res, next) {
  Zebe.create({
    _id: mongoose.Types.ObjectId().toString(),
    name: chance.name(),
    email: chance.email(),
    kerberos: chance.word()
  }).then(user => res.json({ user })).catch(next)
});

router.get("/populate_dummy_midnights", function(req, res, next) {
  let info = {};
  Zebe.getCurrentZebes().then(zebes => {
    info.zebes = zebes;
    return Midnights.MidnightType.getCurrent()
  }).then(midnightTypes => {
    let today = new Date();
    let sunday = new Date(today.getFullYear(), today.getMonth(),today.getDate() - today.getDay()); //sets to midnight sunday, all sunday midnights included
    let monday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 1);
    let tuesday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 2);
    let wednesday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 3);
    let thursday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 4);
    let saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 6);
    let days = [sunday, monday, tuesday, wednesday, thursday, saturday];
    let midnightList = days.reduce((accumulated, currentDay) => (
      accumulated.concat(midnightTypes.map((type) => ({
        date: currentDay,
        zebe: info.zebes[Math.floor(Math.random() * info.zebes.length)]._id,
        semester: type.semester,
        task: type._id,
        note: "",
        potential: type.value
      })))
    ), []);
    return Midnights.Midnight.create(midnightList)
  }).then(midnights => {
    res.json({ midnights })
  }).catch(next)
});

module.exports = router;