const mongoose = require('mongoose');
const models = require('./models');

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
  models.Zebe.init();
  models.Semester.init();
  models.Midnight.init();
  models.MidnightType.init();
  models.MidnightAccount.init();
  models.MidnightPrefs.init();
}

module.exports = {
  initialize: initialize
};
