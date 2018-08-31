const mongoose = require('mongoose');
const Zebe = require('./models/zebe');
const Semester = require('./models/semester');
const { Midnight, MidnightType, MidnightAccount, MidnightPrefs } = require('./models/midnights');

function initialize() {
  if (process.env.HEROKU) {
    console.log('Connecting to prod db');
  } else {
    console.log('Connecting to dev db');
    mongoose.set("debug", true);
  }

  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .catch(console.error.bind(console, 'connection error:'))
    .then(() => {
      console.log("Connected to DB!")
  });
  mongoose.set("useFindAndModify", false);
  Zebe.init();
  Semester.init();
  Midnight.init();
  MidnightType.init();
  MidnightAccount.init();
  MidnightPrefs.init();
}

module.exports = {
  initialize: initialize
};
