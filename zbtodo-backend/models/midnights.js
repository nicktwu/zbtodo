const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Aggregate = mongoose.Aggregate;
const Semester = require("./semester");
const Zebe = require('./zebe');
const moment = require('moment');

// represents a midnight type i.e. Kitchens, 2 points, sunday-thurs (0,1,2,3,4), etc.
const midnightTypeSchema = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  name: String,
  value: Number,
  defaultDays: [Number],
  description: String
});


midnightTypeSchema.statics.getCurrent = function() {
  // get all current midnight types
  return Semester.getCurrent().then(currentSem => {
    if (currentSem) {
      return this.find({semester: currentSem._id}).exec()
    } else {
      return Promise.resolve([])
    }
  })
};

midnightTypeSchema.statics.advanceSemester = function(newSemester) {
  // move the midnight types to the next semester
  return this.updateMany({}, {$set: {semester: newSemester._id}})
};

const MidnightType = mongoose.model('MidnightType', midnightTypeSchema);

// the midnight accounts
const midnightAccountSchema = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  zebe: {type: String, ref: "Zebe"},
  balance: Number,
  requirement: Number,
  preferredDays: [Number], // the days this dude prefers to work
  preferredTasks: [{type: Schema.Types.ObjectId, ref: "MidnightType"}] // the tasks this person prefers to do
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
        semesters: semester._id,
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
  })
};

midnightAccountSchema.statics.setReq = function(requirement) {
  return Semester.getCurrent().then(semester => {
    if (semester) {
      return Zebe.find({
        semesters: semester._id,
        van_driver: { $ne : true },
        midnight_maker: { $ne: true }
      }).exec().then((zebes) => {
        return this.updateMany({
          semester: semester._id,
          zebe: { $in : zebes.map(zebe => zebe._id)}
        }, {
          requirement: requirement
        }).populate('zebe').exec()
      })
    } else {
      return Promise.resolve([])
    }
  })
};

midnightAccountSchema.statics.getPotential = function () {
  let sem_id = null;
  // gets a list of zebes who do not have a midnight account and could possibly get one
  return Semester.getCurrent().then(semester => {
    if (semester) {
      sem_id = semester._id;
      return this.find({semester: sem_id}).populate('zebe').exec()
    } else {
      return Promise.resolve([]) // return promises so we can chain asynchronous then calls
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
  // transfer all the accounts to the new semester
  // subtract the requirement from the balance
  return this.updateMany({}, {semester: newSemester._id}).then(()=>{
    return this.aggregate([
      {
        $project: {semester: 1, zebe: 1, balance: {$subtract: ["$balance", "$requirement"]}, preferredDays: 1, preferredTasks: 1}
      },
      { $out: "midnightaccounts"}
    ])
  }).then(()=> {
    // cap the bottom at 0, assume negative balances were settled
    return this.updateMany({balance : {$lt : 0}}, {$set : {balance: 0}})
  })
};

const MidnightAccount = mongoose.model('MidnightAccount', midnightAccountSchema);

// a specific midnight; references the type in task, and who does it in account
const midnightSchema = new Schema({
  date: Date,
  task: {type: Schema.Types.ObjectId, ref: "MidnightType"},
  potential: Number,
  account: {type: Schema.Types.ObjectId, ref: "MidnightAccount"},
  note: String, // special notes from the midnight maker?
  feedback: String, //midnightmaker feedback
  awarded: Number, // points given
  offered: Boolean, // offered for trade?
  reviewed: Boolean // did midnight maker assign points yet
});

midnightSchema.statics.getWeek = function(focusDate) {
  // get the midnights in the given week
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
  // get all the midnights that haven't been reviewed
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
  // get the mdinights that a given zebe will have to do in the future
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
  // new semester should wipe all the old midnights
  return this.deleteMany({});
};

const Midnight = mongoose.model('Midnight', midnightSchema);


module.exports = {
  Midnight,
  MidnightAccount,
  MidnightType
};
