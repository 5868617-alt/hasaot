const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  senior: { type: mongoose.Schema.Types.ObjectId, ref: 'Senior', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Absence', absenceSchema);
