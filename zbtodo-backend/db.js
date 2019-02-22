const mongoose = require('mongoose');
const Zebe = require('./models/zebe');
const Semester = require('./models/semester');
const { Midnight, MidnightType, MidnightAccount } = require('./models/midnights');
const Notifications = require('./models/notifications');

function initialize() {
  if (process.env.HEROKU) {
    console.log('Connecting to prod db');
  } else {
    console.log('Connecting to dev db');
    console.log(process.env.MONGODB_URI);
    mongoose.set("debug", true);
  }

  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .catch(console.error.bind(console, 'connection error:'))
    .then(() => {
      console.log("Connected to DB!")
  });
  // these flags were required to get mongoose to work for some goddamn reason
  // mongoose might fix this eventually, but for now we're doing this
  mongoose.set("useFindAndModify", false);
  mongoose.set('useCreateIndex', true);

  // init all my collections
  Zebe.init();
  Semester.init();
  Midnight.init();
  MidnightType.init();
  MidnightAccount.init();
  Notifications.Notification.init();
  Notifications.Announcement.init();
}

module.exports = {
  initialize: initialize
};
