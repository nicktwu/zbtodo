const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NumberInt = require('mongoose-int32');

const semesterSchema = new Schema({
  name: String, // e.g Fall 2017
  current: { type: NumberInt, default: 0 }, // MUST BE KEPT ONLY BETWEEN 0 AND 1
  // ONLY USE THE STATIC METHODS TO TOUCH current
  previous: { type: Schema.Types.ObjectId, ref: "Semester" }
});

semesterSchema.statics.getCurrent = function() {
  return this.find({current: { $gt : 0 }}).exec().then((sems) => {
    if (sems.length > 1) throw new Error('more than 1 current semester');
    return Promise.resolve(sems.length ? sems[0] : null)
  });
};

semesterSchema.statics.changeCurrent = function (newSemId) {
  // mongodb does not support an atomic boolean toggle, so we've gotta use this hacky bit-xor method to atomically
  // ensure that we only have one current semester at any one time
  return this.update(
    {$or:[{ _id:newSemId},{current:{$gt:0}}]},
    {$bit:{current:{xor: 1}}},
    {multi: true, runValidators: true});
};

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;