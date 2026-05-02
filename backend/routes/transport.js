const router = require('express').Router();
const Transport = require('../models/Transport');
const Senior = require('../models/Senior');
const Absence = require('../models/Absence');
const xlsx = require('xlsx');

const DAY_MAP = { 0: 'א', 1: 'ב', 2: 'ג', 3: 'ד', 4: 'ה' };
const NUM_TO_DAY = { '1': 'א', '2': 'ב', '3': 'ג', '4': 'ד', '5': 'ה' };

const resolveDay = (q) => NUM_TO_DAY[q] || q || DAY_MAP[new Date().getDay()] || 'א';

const sendExcel = (res, wb, filename) => {
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(buf);
};

router.get('/export/all', async (req, res) => {
  try {
    const today = resolveDay(req.query.day);
    const wb = xlsx.utils.book_new();
    let i = 1;
    for (const shift of ['בוקר', 'צהריים']) {
      const shiftName = shift === 'בוקר' ? 'morning' : 'afternoon';
      const transports = await Transport.find({ activeDays: today, shift });
      for (const t of transports) {
        const field = shift === 'בוקר' ? 'morningTransport' : 'afternoonTransport';
        const seniors = await Senior.find({ [field]: t._id, arrivalDays: today });
        const data = seniors.map(s => ({ name: s.name, address: s.address || '', phone: s.phones[0] || '' }));
        const ws = xlsx.utils.json_to_sheet(data.length ? data : [{ name: 'no passengers' }]);
        xlsx.utils.book_append_sheet(wb, ws, `${shiftName}-${i++}`.substring(0, 31));
      }
    }
    sendExcel(res, wb, `transports-day${today}.xlsx`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/daily/export', async (req, res) => {
  try {
    const today = resolveDay(req.query.day);
    const wb = xlsx.utils.book_new();
    let i = 1;
    for (const shift of ['בוקר', 'צהריים']) {
      const shiftName = shift === 'בוקר' ? 'morning' : 'afternoon';
      const transports = await Transport.find({ activeDays: today, shift });
      for (const t of transports) {
        const field = shift === 'בוקר' ? 'morningTransport' : 'afternoonTransport';
        const seniors = await Senior.find({ [field]: t._id, arrivalDays: today });
        const data = seniors.map(s => ({ name: s.name, address: s.address || '', phone: s.phones[0] || '' }));
        const ws = xlsx.utils.json_to_sheet(data.length ? data : [{ name: 'no passengers' }]);
        xlsx.utils.book_append_sheet(wb, ws, `${shiftName}-${i++}`.substring(0, 31));
      }
    }
    sendExcel(res, wb, `daily-day${today}.xlsx`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/daily', async (req, res) => {
  try {
    const today = resolveDay(req.query.day);
    const now = req.query.date ? new Date(req.query.date) : new Date();
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const absences = await Absence.find({ startDate: { $lt: dayEnd }, endDate: { $gte: dayStart } });
    const absentIds = new Set(absences.map(a => a.senior.toString()));

    const result = {};
    for (const shift of ['בוקר', 'צהריים']) {
      const transports = await Transport.find({ activeDays: today, shift });
      const field = shift === 'בוקר' ? 'morningTransport' : 'afternoonTransport';
      result[shift] = await Promise.all(transports.map(async (t) => {
        const seniors = await Senior.find({ [field]: t._id, arrivalDays: today });
        const filtered = seniors.filter(s => !absentIds.has(s._id.toString()));
        return { transport: t, seniors: filtered };
      }));
    }
    res.json({ day: today, ...result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/export', async (req, res) => {
  try {
    const today = resolveDay(req.query.day);
    const t = await Transport.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'not found' });
    const field = t.shift === 'בוקר' ? 'morningTransport' : 'afternoonTransport';
    const seniors = await Senior.find({ [field]: t._id, arrivalDays: today });
    const data = seniors.map((s, i) => ({
      '#': i + 1, name: s.name, address: s.address || '', phone: s.phones?.[0] || ''
    }));
    const ws = xlsx.utils.json_to_sheet(data.length ? data : [{ name: 'no passengers' }], { origin: 'A2' });
    xlsx.utils.sheet_add_aoa(ws, [['transport']], { origin: 'A1' });
    ws['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    sendExcel(res, wb, 'transport.xlsx');
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const transports = await Transport.find();
    res.json(transports);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json(transport);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(transport);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
