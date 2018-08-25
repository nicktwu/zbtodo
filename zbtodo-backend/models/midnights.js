const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const midnightSchema = new Schema({
  _id: Schema.Types.ObjectId,
  date: Date,
  zebe: {type: String, ref: "Zebe" },
  task: {type: Schema.Types.ObjectId, ref: "MidnightType"},
  note: String,
  feedback: String,
  potential: Number,
  awarded: Number,
  offered: Boolean,
  reviewed: Boolean
});

const midnightAccountSchema = new Schema({
  _id: Schema.Types.ObjectId,
  semester: {type: Schema.Types.ObjectId, ref: "Semester"},
  zebe: {type: String, ref: "Zebe"},
  balance: Number,
  requirement: Number
});

const midnightTypeSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  value: Number,
  description: String
});

const midnightPrefsSchema = new Schema({
  zebe: { type: String, ref: "Zebe"},
  daysPreferred: [String], // Days that this zebe prefers to work, ex: ['Monday', 'Thursday']
  tasksPreferred: [{type: Schema.Types.ObjectId, ref: "MidnightType"}] // Tasks that this zebe prefers to do, ex: ['Dinings', 'Waitings', 'Commons']
});

const Midnight = mongoose.model('Midnight', midnightSchema);
const MidnightAccount = mongoose.model('MidnightAccount', midnightAccountSchema);
const MidnightType = mongoose.model('MidnightType', midnightTypeSchema);
const MidnightPrefs = mongoose.model('MidnightPrefs', midnightPrefsSchema);

module.exports = {
  Midnight,
  MidnightAccount,
  MidnightType,
  MidnightPrefs
};
