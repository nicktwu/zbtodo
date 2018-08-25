const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let zebeSchema = new Schema({
  _id: {type: String},
  kerberos: String,
  email: String,
  name: String,
  phone: String,
  zebe: { type: Boolean, default: false },
  current: { type: Boolean, default: false },
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

const Zebe = mongoose.model('Zebe', zebeSchema);

module.exports = Zebe;