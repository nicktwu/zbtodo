const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Semester = require("./semester");
const Zebe = require('./zebe');
const moment = require('moment');

// For the purpose of storing short-term notifications that expire pretty quickly,
// PURGE THESE USING THE SCHEDULED CLEAN_REMINDERS
// scheduled reminder script that runs at 3/4pm (depending on daylight savings)

const notificationSchema = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  zebe: {type: String, ref: "Zebe"},
  message: String,
  category: String,
  expiry: Date,
});

let categories = {
  midnight: "midnight",
  trading: "trading"
};

notificationSchema.statics.createMidnightNotification = function(info) {
  return { ...info, category: categories.midnight}
};

notificationSchema.statics.getCurrent = function() {
  return Semester.getCurrent().then(currentSem => {
    if (currentSem) {
      return this.find({semester: currentSem._id}).exec()
    } else {
      return Promise.resolve([])
    }
  })
};

notificationSchema.statics.purgeExpired = function() {
  return this.deleteMany({ expiry : { $lte : moment().startOf("day") } }).exec()
};

const Notification = mongoose.model('Notification', notificationSchema);

const announcement = new Schema({
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  message: String,
  category: String,
  expiry: Date,
});

announcement.statics.createTradeAnnouncement = function(message) {
  return Semester.getCurrent().then(sem => {
    return this.create({
      message,
      semester: sem._id,
      category: categories.trading,
      expiry: moment().startOf("day").add(1,"day")
    });
  })
};

announcement.statics.getTradeAnnouncements = function() {
  return Semester.getCurrent().then(currentSem => {
    if (currentSem) {
      return this.find({semester: currentSem._id, category: categories.trading}).exec()
    } else {
      return Promise.resolve([])
    }
  })
};

announcement.statics.purgeExpired = function() {
  return this.deleteMany({ expiry : { $lte : moment().startOf("day") } }).exec()
};

const Announcement = mongoose.model('Announcement', announcement);

module.exports = {
  Notification,
  Announcement
};
