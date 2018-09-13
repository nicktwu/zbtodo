/**
 * Created by nwu on 10/18/17.
 */
const Midnight = require('./models/midnights');
const emailer = require('./emailer');

const remindMidnights = function() {
  let today = new Date();
  let firstDay = new Date(today.getFullYear(), today.getMonth(),today.getDate());
  return Midnight.Midnight.find({date: firstDay})
    .populate({ path: 'account', populate: {path: 'zebe'}})
    .populate('task').exec().then(docs => {
    let notifications = {};
    for (let i = 0; i < docs.length; i++) {
      let doc = docs[i];
      if (doc.account.zebe) {
        if (notifications[doc.account.zebe.kerberos]) {
          notifications[doc.account.zebe.kerberos].push(doc.task.name);
        } else {
          notifications[doc.account.zebe.kerberos] = [doc.task.name];
        }
      }
    }
    Object.keys(notifications).forEach((key) => {
      console.log("Reminding " + key + " about " + notifications[key].length.toString() + " midnights.");
      let addr = key + "@mit.edu";
      const subj = "[ZBTodo] Midnights Reminder: " + today.toISOString().substring(0, 10);
      let midnightsList = notifications[key].join(", ");
      const body = "You have " + notifications[key].length.toString() + " midnight"
        + (notifications[key].length > 1 ? "s" : "")
        + " tonight: " + midnightsList;
      emailer.send(addr, subj, body);
    })
  })
};

module.exports = {
  remindMidnights: remindMidnights
};