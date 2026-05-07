require('dotenv').config();
const mongoose = require('mongoose');
const Senior = require('./models/Senior');

const AREA_MAP = [
  { area: 'בית וגן / רחביה', streets: ['פרנק', 'משה זילברג', 'בית וגן', 'יוסף חכמי', 'ליאו ויסמן', 'בנימין מטודלה', 'אברבנאל', 'יוסף טרומפלדור', 'הנציב', 'מסילת ישרים', 'חכמי לובלין'] },
  { area: 'הר נוף', streets: ['משקלוב', 'האדמור מרוזי', 'שאולזון', 'קצנלבוגן', 'קהתי', 'בן ציון', 'כיכר המאירי', 'עזריאל', 'אבן דנן', 'האדמור מבויאן', 'רובין'] },
  { area: 'גאולה / בוכרים / שמואל הנביא', streets: ['אוהלי יוסף', 'אבינדב', 'ארץ חפץ', 'שמואל הנביא', 'משה זקס', 'סלנט', 'רבינו גרשום', 'נחמיה', 'בר גיורא', 'יוסף בן מתיתיהו', 'ישעיהו', 'מוסאיוף', 'שומרי אמונים', 'הזית', 'עלי הכהן', 'אלקנה'] },
  { area: 'רמות', streets: ['סולם יעקב', 'לואי ליפסקי', 'רמות פולין', 'ארי במסתרים', 'כיכר רקאנטי', 'רקאנטי', 'ראובן שרי', 'אהרון אשכולי', 'דרך החורש', 'שלום סיוון'] },
  { area: 'רכס / סנהדריה / רוממה', streets: ['דרוק', 'ברכת אברהם', 'כהנמן', 'אגרות משה', 'סנהדריה מורחבת', 'מנחת יצחק', 'אמרי בינה', 'סורוצקין', 'זכרון יעקב', 'חזון איש', 'סדיגורא', 'הרב בלוי', 'שמעון חכם', 'תורת חסד', 'פנים מאירות', 'הרב עוזי קלכהיים', 'יהודה המכבי', 'החומה השלישית'] },
  { area: 'גבעת מרדכי', streets: ['שחל', 'גבעת מרדכי'] },
];

function getArea(address) {
  if (!address) return '';
  for (const { area, streets } of AREA_MAP)
    if (streets.some(s => address.includes(s))) return area;
  return '';
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const seniors = await Senior.find();
  let updated = 0;
  for (const s of seniors) {
    const neighborhood = getArea(s.address);
    if (neighborhood && s.neighborhood !== neighborhood) {
      await Senior.findByIdAndUpdate(s._id, { neighborhood });
      console.log(`✅ ${s.name} → ${neighborhood}`);
      updated++;
    }
  }
  console.log(`\nעודכנו ${updated} קשישים`);
  await mongoose.disconnect();
}

run().catch(console.error);
