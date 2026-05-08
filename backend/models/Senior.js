const mongoose = require('mongoose');

const seniorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  neighborhood: String,
  phones: [String],
  arrivalDays: [{ type: String, enum: ['א', 'ב', 'ג', 'ד', 'ה'] }],
  morningTransport:   { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', default: null },
  afternoonTransport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', default: null },
  frozen: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Senior', seniorSchema);
