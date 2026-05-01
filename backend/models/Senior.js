const mongoose = require('mongoose');

const seniorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phones: [String],
  arrivalDays: [{ type: String, enum: ['א', 'ב', 'ג', 'ד', 'ה'] }],
  morningTransport:   { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', default: null },
  afternoonTransport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Senior', seniorSchema);
