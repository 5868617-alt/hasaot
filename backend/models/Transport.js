const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shift: { type: String, enum: ['בוקר', 'צהריים'], required: true },
  time: String,
  escortName: String,
  escortPhone: String,
  activeDays: [{ type: String, enum: ['א', 'ב', 'ג', 'ד', 'ה'] }],
});

module.exports = mongoose.model('Transport', transportSchema);
