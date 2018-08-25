const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const semesterSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String, // e.g Fall 2017
  start: Date,
  end: Date,
  current: Boolean,
  previous: { type: Schema.Types.ObjectId, ref: "Semester" }
});

semesterSchema.statics.getCurrent = function(callback) {
  this.find({current: true}, function(err, sems) {
    if (sems.length === 0) return callback(null, null);
    if (sems.length > 1) return callback(new Error('more than 1 current semester'), null);
    return callback(null, sems[0]);
  });
};

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;