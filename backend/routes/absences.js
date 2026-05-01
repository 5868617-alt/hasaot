const router = require('express').Router();
const Absence = require('../models/Absence');

// קבלת כל ההיעדרויות (אופציונלי: לפי קשיש)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.senior ? { senior: req.query.senior } : {};
    const absences = await Absence.find(filter).populate('senior', 'name');
    res.json(absences);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// הוספת היעדרות
router.post('/', async (req, res) => {
  try {
    const absence = await Absence.create(req.body);
    res.status(201).json(absence);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// מחיקת היעדרות
router.delete('/:id', async (req, res) => {
  try {
    await Absence.findByIdAndDelete(req.params.id);
    res.json({ message: 'נמחק' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
