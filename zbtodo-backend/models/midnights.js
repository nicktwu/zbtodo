const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Aggregate = mongoose.Aggregate;
const Semester = require("./semester");
const Zebe = require('./zebe');
const moment = require('moment');

const midnightTypeSchema = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  name: String,
  value: Number,
  defaultDays: [Number],
  description: String
});

midnightTypeSchema.statics.getCurrent = function() {
  return Semester.getCurrent().then(currentSem => {
    if (currentSem) {
      return this.find({semester: currentSem._id}).exec()
    } else {
      return Promise.resolve([])
    }
  })
};

midnightTypeSchema.statics.advanceSemester = function(newSemester) {
  return this.updateMany({}, {$set: {semester: newSemester._id}})
};

const MidnightType = mongoose.model('MidnightType', midnightTypeSchema);

const midnightAccountSchema = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  zebe: {type: String, ref: "Zebe"},
  balance: Number,
  requirement: Number,
  preferredDays: [Number],
  preferredTasks: [{type: Schema.Types.ObjectId, ref: "MidnightType"}]
});

midnightAccountSchema.statics.getCurrent = function() {
  return Semester.getCurrent().then(semester => {
    if (semester) {
      return this.find({semester: semester._id}).populate('zebe').exec()
    } else {
      return Promise.resolve([])
    }
  })
};

midnightAccountSchema.statics.getAssignable = function() {
  return Semester.getCurrent().then(semester => {
    if (semester) {
      return Zebe.find({
        semesters: { $all: [ semester._id ] },
        van_driver: { $ne : true },
        midnight_maker: { $ne: true }
      }).exec().then((zebes) => {
        return this.find({
          semester: semester._id,
          zebe: { $in : zebes.map(zebe => zebe._id)}
        }).populate('zebe').exec()
      })
    } else {
      return Promise.resolve([])
    }
  }).then()
};

midnightAccountSchema.statics.getPotential = function () {
  let sem_id = null;
  return Semester.getCurrent().then(semester => {
    if (semester) {
      sem_id = semester._id;
      return this.find({semester: sem_id}).populate('zebe').exec()
    } else {
      return Promise.resolve([]) // return promises so we chan chain asynchronous then calls
    }
  }).then((accounts) => {
    if (sem_id) {
      return Zebe.find({
        _id: { $not : { $in : accounts.map(acc => acc.zebe) }},
        zebe: true,
        semesters: { $all : [sem_id] }
      }).exec()
    } else {
      return Promise.resolve([])
    }
  })
};

midnightAccountSchema.statics.advanceSemester = function(newSemester) {
  return this.updateMany({}, {semester: newSemester._id}).then(()=>{
    return this.aggregate([
      {
        $project: {semester: 1, zebe: 1, balance: {$subtract: ["balance", "requirement"]}, preferredDays: 1, preferredTasks: 1}
      },
      { $out: "midnightaccounts"}
    ])
  }).then(()=>{
    return this.updateMany({balance : {$lt : 0}}, {$set : {balance: 0}})
  })
};

const MidnightAccount = mongoose.model('MidnightAccount', midnightAccountSchema);

const midnightSchema = new Schema({
  date: Date,
  task: {type: Schema.Types.ObjectId, ref: "MidnightType"},
  potential: Number,
  account: {type: Schema.Types.ObjectId, ref: "MidnightAccount"},
  note: String,
  feedback: String,
  awarded: Number,
  offered: Boolean,
  reviewed: Boolean
});

midnightSchema.statics.getWeek = function(focusDate) {
  let today = moment();
  if (focusDate) {
    today = focusDate;
  }
  let getDay = (idx) => moment([today.year(), today.month(), today.date()]).add( idx - today.day(), "days");
  return MidnightAccount.getCurrent().then(accounts => {
    return this.find({
      date: {$gte: getDay(0), $lte: getDay(7)},
      account: { $in : accounts.map(acc => acc._id) }
    }).populate({ path: 'account', populate: {path: 'zebe'}}).populate('task').exec()
  }).then(midnights => {
    return Promise.resolve([0, 1, 2, 3, 4, 5, 6].map((idx) => ({
      date: getDay(idx),
      midnights: midnights.filter((midnight) => (
        midnight.date.getFullYear() === getDay(idx).year()
        && midnight.date.getMonth() === getDay(idx).month()
        && midnight.date.getDate() === getDay(idx).date()
      ))
    })));
  })
};

midnightSchema.statics.getUnreviewed = function() {
  let today = moment();
  return MidnightAccount.getCurrent().then(accounts => {
    return this.find( {
      date: { $lte: today },
      reviewed: { $ne : true },
      account: { $in : accounts.map(acc=>acc._id)}
    }).populate("task").populate({ path: 'account', populate: {path: 'zebe'}}).exec()
  })
};

midnightSchema.statics.findFutureUserMidnights = function(zebe, exclude) {
  let today = moment().startOf("day");
  return Semester.getCurrent().then((semester) => {
    return MidnightAccount.findOne({ zebe, semester: semester._id}).exec()
  }).then(account => {
    if (account) {
      return this.find({
        account: account._id,
        date: {$gte: today},
        _id: {$nin: exclude}
      }).populate("task").exec()
    } else {
      return Promise.resolve([]);
    }
  })
};

midnightSchema.statics.advanceSemester = function() {
  return this.deleteMany({});
};

const Midnight = mongoose.model('Midnight', midnightSchema);


module.exports = {
  Midnight,
  MidnightAccount,
  MidnightType
};
