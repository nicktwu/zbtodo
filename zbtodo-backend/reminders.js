/**
 * Created by nwu on 10/18/17.
 */
const Midnight = require('./models/midnights');
const Notification = require('./models/notifications');
const emailer = require('./emailer');
const moment = require('moment');

const remindMidnights = function() {
  let today = moment().startOf("day");
  return Midnight.Midnight.find({date: today})
    .populate({ path: 'account', populate: {path: 'zebe'}})
    .populate('task').exec().then(docs => {
    let notifications = {};
    let idEmailMap = {};
    for (let i = 0; i < docs.length; i++) {
      let doc = docs[i];
      if (doc.account && doc.account.zebe) {
        if (notifications[doc.account.zebe._id]) {
          notifications[doc.account.zebe._id].push(doc.task.name);
        } else {
          notifications[doc.account.zebe._id] = [doc.task.name];
        }
        idEmailMap[doc.account.zebe._id] = {
          email: doc.account.zebe.email || doc.account.zebe.kerberos + "@mit.edu",
          semester: doc.account.semester
        };
      }
    }

    let notificationList = [];

    Object.keys(notifications).forEach((key) => {
      console.log("Reminding " + key + " about " + notifications[key].length.toString() + " midnights.");
      let addr = idEmailMap[key].email;
      const subj = "[ZBTodo] Midnights Reminder: " + today.toISOString().substring(0, 10);
      let midnightsList = notifications[key].join(", ");
      const body = "You have " + notifications[key].length.toString() + " midnight"
        + (notifications[key].length > 1 ? "s" : "")
        + " tonight: " + midnightsList;
      emailer.send(addr, subj, body);
      notificationList.push(Notification.Notification.createMidnightNotification({
        semester: idEmailMap[key].semester,
        zebe: key,
        message: body,
        expiry: moment().startOf("day").add(1, "days")
      }));
    });

    return Notification.Notification.create(notificationList)
  })
};

const cleanup = function() {
  return Notification.Notification.purgeExpired().then(Notification.Announcement.purgeExpired)
};

module.exports = {
  remindMidnights,
  cleanup
};