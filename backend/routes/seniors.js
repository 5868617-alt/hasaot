const router = require('express').Router();
const Senior = require('../models/Senior');
const xlsx = require('xlsx');

const AREA_MAP = [
  { area: 'בית וגן / רחביה', streets: ['פרנק', 'משה זילברג', 'בית וגן', 'יוסף חכמי', 'ליאו ויסמן', 'בנימין מטודלה', 'אברבנאל', 'יוסף טרומפלדור', 'הנציב', 'מסילת ישרים', 'חכמי לובלין'] },
  { area: 'הר נוף', streets: ['משקלוב', 'האדמור מרוזי', 'שאולזון', 'קצנלבוגן', 'קהתי', 'בן ציון', 'כיכר המאירי', 'עזריאל', 'אבן דנן', 'האדמור מבויאן', 'רובין פינת שיף'] },
  { area: 'גאולה / בוכרים / שמואל הנביא', streets: ['אוהלי יוסף', 'אבינדב', 'ארץ חפץ', 'שמואל הנביא', 'משה זקס', 'סלנט', 'רבינו גרשום', 'נחמיה', 'בר גיורא', 'יוסף בן מתיתיהו', 'ישעיהו', 'מוסאיוף', 'עלי הכהן', 'אלקנה', 'הזית', 'שומרי אמונים'] },
  { area: 'רמות', streets: ['סולם יעקב', 'לואי ליפסקי', 'רמות פולין', 'ארי במסתרים', 'כיכר רקאנטי', 'רקאנטי', 'ראובן שרי', 'אהרון אשכולי', 'דרך החורש', 'שלום סיוון'] },
  { area: 'רכס / סנהדריה / רוממה', streets: ['דרוק', 'ברכת אברהם', 'כהנמן', 'אגרות משה', 'סנהדריה מורחבת', 'מנחת יצחק', 'אמרי בינה', 'סורוצקין', 'זכרון יעקב', 'חזון איש', 'סדיגורא', 'הרב בלוי', 'שמעון חכם', 'תורת חסד', 'פנים מאירות', 'הרב עוזי קלכהיים', 'יהודה המכבי', 'מא"ש', 'החומה השלישית'] },
];

function getArea(address) {
  if (!address) return '';
  for (const { area, streets } of AREA_MAP) {
    if (streets.some(s => address.includes(s))) return area;
  }
  return 'לא זוהה';
}

router.get('/export/addresses', async (req, res) => {
  try {
    const seniors = await Senior.find().sort({ name: 1 });
    const data = seniors.map(s => ({
      'שם': s.name,
      'כתובת': s.address || '',
      'אזור': getArea(s.address),
    }));
    const ws = xlsx.utils.json_to_sheet(data, { origin: 'A2' });
    xlsx.utils.sheet_add_aoa(ws, [['רשימת קשישים - שם, כתובת ואזור']], { origin: 'A1' });
    ws['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 20 }];
    ws['!sheetView'] = [{ rightToLeft: true }];
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'שם וכתובת');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=seniors-addresses.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export', async (req, res) => {
  try {
    const seniors = await Senior.find()
      .populate('morningTransport')
      .populate('afternoonTransport')
      .sort({ name: 1 });
    const data = seniors.map((s, i) => ({
      '#': i + 1,
      'שם': s.name,
      'כתובת': s.address || '',
      'טלפון': s.phones?.[0] || '',
      'ימי הגעה': s.arrivalDays.join(', '),
      'הסעת בוקר': s.morningTransport?.name || '',
      'הסעת צהריים': s.afternoonTransport?.name || '',
    }));
    const ws = xlsx.utils.json_to_sheet(data, { origin: 'A2' });
    xlsx.utils.sheet_add_aoa(ws, [['רשימת קשישים']], { origin: 'A1' });
    ws['!cols'] = [{ wch: 4 }, { wch: 22 }, { wch: 28 }, { wch: 15 }, { wch: 16 }, { wch: 18 }, { wch: 18 }];
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=seniors.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    const filter = name ? { name: new RegExp(name, 'i') } : {};
    const seniors = await Senior.find(filter)
      .populate('morningTransport')
      .populate('afternoonTransport');
    res.json(seniors);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.morningTransport) delete body.morningTransport;
    if (!body.afternoonTransport) delete body.afternoonTransport;
    const senior = await Senior.create(body);
    res.status(201).json(senior);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.morningTransport) body.morningTransport = null;
    if (!body.afternoonTransport) body.afternoonTransport = null;
    const senior = await Senior.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json(senior);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Senior.findByIdAndDelete(req.params.id);
    res.json({ message: 'נמחק בהצלחה' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
