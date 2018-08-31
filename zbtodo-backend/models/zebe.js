const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Semester = require('./semester');

let zebeSchema = new Schema({
  _id: {type: String},
  kerberos: String,
  email: String,
  name: String,
  phone: String,
  semesters: [{type: Schema.Types.ObjectId, ref: "Semester"}],
  zebe: { type: Boolean, default: false },
  president: { type: Boolean, default: false },
  midnight_maker: { type: Boolean, default: false },
  house_chair: { type: Boolean, default: false },
  workweek_chair: { type: Boolean, default: false },
  dev: { type: Boolean, default: false },
  rush_chair: { type: Boolean, default: false },
  social_chair: { type: Boolean, default: false },
  tech_chair: { type: Boolean, default: false },
  risk_manager: { type: Boolean, default: false },
});

zebeSchema.statics.getCurrentZebes = function(selector) {
  return Semester.getCurrent().then(currentSemester => {
    let queryObj = {zebe: true};
    if (currentSemester) {
      queryObj.semesters = { $all: [ currentSemester._id ] }
    };
    return selector ? this.find(queryObj).select(selector).exec() : this.find(queryObj).exec();
  })
};

zebeSchema.statics.getInactiveZebes = function(selector) {
  return Semester.getCurrent().then(currentSemester => {
    let queryObj = {zebe: true};
    if (currentSemester) {
      queryObj.semesters = { $not : { $all: [ currentSemester._id ] }}
    }
    return selector ? this.find(queryObj).select(selector).exec() : this.find(queryObj).exec();
  })
};

zebeSchema.statics.getAdminInfo = function() {
  let info = {};
  return this.find({zebe: false}).exec().then((zebes) => {
    info.potential = zebes;
    return this.getCurrentZebes()
  }).then((currentZebes) => {
    info.current = currentZebes;
    return Zebe.getInactiveZebes()
  }).then((inactiveZebes) => {
    info.inactive = inactiveZebes;
    return Promise.resolve(info);
  })
};

const Zebe = mongoose.model('Zebe', zebeSchema);

module.exports = Zebe;