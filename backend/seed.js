require('dotenv').config();
const mongoose = require('mongoose');
const Transport = require('./models/Transport');
const Senior = require('./models/Senior');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:fgWXfjlJCQUfaIdphfhEbVUKiEmJsyIV@switchback.proxy.rlwy.net:50421/hasaot?authSource=admin';

const DAYS_A = ['א'];
const DAYS_AB = ['א', 'ב'];
const DAYS_B = ['ב'];
const DAYS_ABC = ['א', 'ב', 'ג'];
const DAYS_AC = ['א', 'ג'];
const DAYS_BC = ['ב', 'ג'];
const DAYS_C = ['ג'];
const DAYS_ABCD = ['א', 'ב', 'ג', 'ד'];
const DAYS_ABD = ['א', 'ב', 'ד'];
const DAYS_ACD = ['א', 'ג', 'ד'];
const DAYS_BCD = ['ב', 'ג', 'ד'];
const DAYS_AD = ['א', 'ד'];
const DAYS_BD = ['ב', 'ד'];
const DAYS_CD = ['ג', 'ד'];
const DAYS_D = ['ד'];
const DAYS_E = ['ה'];
const DAYS_AE = ['א', 'ה'];
const DAYS_BE = ['ב', 'ה'];
const DAYS_CE = ['ג', 'ה'];
const DAYS_DE = ['ד', 'ה'];
const DAYS_ABE = ['א', 'ב', 'ה'];
const DAYS_ACE = ['א', 'ג', 'ה'];
const DAYS_ADE = ['א', 'ד', 'ה'];
const DAYS_BCE = ['ב', 'ג', 'ה'];
const DAYS_BDE = ['ב', 'ד', 'ה'];
const DAYS_CDE = ['ג', 'ד', 'ה'];
const DAYS_ABCE = ['א', 'ב', 'ג', 'ה'];
const DAYS_ABDE = ['א', 'ב', 'ד', 'ה'];
const DAYS_ACDE = ['א', 'ג', 'ד', 'ה'];
const DAYS_BCDE = ['ב', 'ג', 'ד', 'ה'];
const DAYS_ABCDE = ['א', 'ב', 'ג', 'ד', 'ה'];

const transports = [
  // ===== בוקר =====
  { name: 'בית וגן רחביה - בוקר', shift: 'בוקר', time: '8:15', escortPhone: '054-8423813', activeDays: DAYS_ABCDE },
  { name: 'הר נוף גב"ש - בוקר',   shift: 'בוקר', time: '8:30', escortName: 'חזקי', escortPhone: '053-2449472', activeDays: DAYS_ABCDE },
  { name: 'גוש 80 ש.הנביא בוכרים גאולה - בוקר', shift: 'בוקר', time: '8:35', escortName: 'ריקי', escortPhone: '052-3429086', activeDays: DAYS_ABCDE },
  { name: 'רמות - בוקר',           shift: 'בוקר', time: '8:35', escortName: 'נפתלי', escortPhone: '054-8998652', activeDays: DAYS_ABCDE },
  { name: 'רכס סנהדריה רוממה - בוקר', shift: 'בוקר', time: '8:30', escortName: 'אילה', escortPhone: '050-4104453', activeDays: DAYS_ABCDE },
  // ===== צהריים =====
  { name: 'מקור ברוך גאולה שמואל הנביא - צהריים', shift: 'צהריים', time: '14:00', escortPhone: '050-4104453', activeDays: DAYS_ABCDE },
  { name: 'בית וגן רחביה מרכז העיר - צהריים',     shift: 'צהריים', time: '14:00', escortPhone: '050-4104453', activeDays: DAYS_ACDE },
  { name: 'רוממה רכס - צהריים',    shift: 'צהריים', time: '14:00', escortPhone: '050-4104453', activeDays: DAYS_A },
  { name: 'גוש 80 סנהדריה בוכרים - צהריים', shift: 'צהריים', time: '14:00', activeDays: DAYS_ABCDE },
  { name: 'רמות - צהריים',         shift: 'צהריים', time: '14:00', escortPhone: '058-3238231', activeDays: DAYS_ABCDE },
  { name: 'גב"ש הר נוף - צהריים',  shift: 'צהריים', time: '14:00', escortPhone: '054-3013900', activeDays: DAYS_ABCDE },
  { name: 'שכונות צפון רכס - צהריים', shift: 'צהריים', time: '14:00', escortPhone: '050-4104453', activeDays: DAYS_BCDE },
];

// פונקציה שמחפשת הסעה לפי שם
const t = (name) => name;

const seniorsData = [
  // ===== בית וגן רחביה - בוקר =====
  { name: 'שכטר שושנה',    address: 'פרנק 13',                    phones: ['054-8752500'],                       morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'יצחק סדוביץ',   address: 'משה זילברג 34',              phones: ['058-4684924'],                       morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'אסתר סדוביץ',   address: 'משה זילברג 34',              phones: ['058-4684924'],                       morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'אברהמי יוסף',   address: 'בית וגן 81',                 phones: ['052-7181945'],                       morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'רצאבי',         address: 'יוסף חכמי 43',               phones: ['054-4268080', '058-6262698'],        morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'זוהר מנשה',     address: 'ליאו ויסמן 5',               phones: ['053-3111004', '050-4116664'],        morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACD },
  { name: 'לובל נתן',      address: 'בנימין מטודלה 25',           phones: ['054-9937366', '058-5267426'],        morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ABCDE },
  { name: 'שלזינגר דבורה', address: 'אברבנאל 30',                 phones: ['050-3195841', '054-8468616', '052-7641546'], morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ABCDE },
  { name: 'חנה גוטמן',     address: 'יוסף טרומפלדור 12',          phones: ['055-9890320', '050-3195841'],        morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ACDE },
  { name: 'לדרמן מלכה',    address: 'הנציב פינת הלבנון',          phones: ['055-2548021'],                       morningTransport: t('בית וגן רחביה - בוקר'),         afternoonTransport: t('בית וגן רחביה מרכז העיר - צהריים'), days: DAYS_ABCDE },

  // ===== הר נוף גב"ש - בוקר =====
  { name: 'יצחק מרים',       address: 'משקלוב 4',                 phones: ['055-6797098'],                       morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'שושנה רבינוביץ',  address: 'האדמור מרוזי\'ן 11',       phones: ['052-4408063'],                       morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABD },
  { name: 'יעל מטלון',       address: 'שאולזון 14',               phones: ['054-8494014', '054-8494015'],        morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'ברוך מלכאן',      address: 'קצנלבוגן 9',               phones: ['055-7761817', '052-2408140'],        morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ACDE },
  { name: 'חדד אפרים',       address: 'קצנלבוגן 46',              phones: ['055-9565136', '052-7671030'],        morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'ויכלדר רבקה',     address: 'קהתי 1',                   phones: ['053-3162726', '02-6520661'],         morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'ביינס יעקב',      address: 'קהתי 5',                   phones: ['058-7436688'],                       morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'ציפורה שפירא',    address: 'בן ציון 2',                phones: ['050-4475332'],                       morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },
  { name: 'בן שלוש רפאל',    address: 'כיכר המאירי',              phones: ['058-3238871'],                       morningTransport: t('הר נוף גב"ש - בוקר'),           afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_ABCDE },

  // ===== גוש 80 ש.הנביא בוכרים גאולה - בוקר =====
  { name: 'חיים מתתיהו',     address: 'אוהלי יוסף 6',             phones: ['052-7176033'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCDE },
  { name: 'בביאן דליה',      address: 'אבינדב 20',                phones: ['050-4144666', '054-4793785'],        morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCE },
  { name: 'אוהל אליהו',      address: 'אבינדב 18',                phones: ['052-6690323', '02-5820344'],         morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCE },
  { name: 'גז לאה',          address: 'ארץ חפץ 113',              phones: ['054-8480062', '02-5323197'],         morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ACE },
  { name: 'רן רינת',         address: 'שמואל הנביא 72 פינת תדהר', phones: ['052-7152108'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'אברמוב בתיה',     address: 'משה זקס 11',               phones: ['051-2051275'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'רבקה קלירס',      address: 'סלנט פינת הרקח',           phones: ['054-8471280'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ACE },
  { name: 'גרוס',            address: 'רבינו גרשום פינת מוסאיוף', phones: ['050-4148538'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCDE },
  { name: 'ברוק',            address: 'נחמיה 18',                 phones: ['052-7625861', '050-4153175'],        morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCDE },
  { name: 'טרכטינגוט אריה',  address: 'בר גיורא 10',              phones: ['052-7624075'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'שמואל הבלין',     address: 'יוסף בן מתיתיהו פינת אלפנדרי', phones: ['052-3911367', '058-6703369', '058-4413971'],  morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'ציפורה בורנשטיין', address: 'יוסף בן מתיתיהו פינת פרי חדש', phones: ['054-8470354', '053-3114986'], morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'אברהם שולמית',    address: 'יוסף בן מתיתיהו 20',       phones: ['054-8441964'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },
  { name: 'אסרף גינה',       address: 'ישעיהו 14',                phones: ['050-4143289'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },

  // ===== רמות - בוקר =====
  { name: 'יוסף מורה',      address: 'סולם יעקב 34',              phones: ['052-7687535'],                       morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'עזיז קירמה',     address: 'לואי ליפסקי 43',            phones: ['02-5863695', '054-5377790'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCD },
  { name: 'רחל קראוס',      address: 'רמות פולין 64',             phones: ['02-5864473', '052-7179239'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'יפה שרם',        address: 'ארי במסתרים',               phones: ['02-5711847', '050-4101812'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'משה קליין',      address: 'כיכר רקאנטי',               phones: ['058-6334040', '058-6688724'],        morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'אליהו איוב',     address: 'ראובן שרי 25',              phones: ['053-7269729'],                       morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'יעקבי יעקב',     address: 'רקאנטי 32',                 phones: ['054-5943660'],                       morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABC },
  { name: 'בקמן בנציון',    address: 'אהרון אשכולי פינת צונדק',   phones: ['058-4412004'],                       morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCDE },
  { name: 'בן דוד נגה',     address: 'דרך החורש 76',              phones: ['053-3848708', '02-5865565'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABCD },

  // ===== רכס סנהדריה רוממה - בוקר =====
  { name: 'כץ',             address: 'דרוק 97',                   phones: ['052-7605605'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'אסתר לוי',       address: 'ברכת אברהם 2',              phones: ['050-8197492', '02-5869762'],         morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'שולה שריקי',     address: 'כהנמן 4',                   phones: ['02-5712643', '053-3132476'],         morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'ויצהנדלר שרה',   address: 'אגרות משה 7',               phones: ['054-8488911'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'גנץ רחל',        address: 'סנהדריה מורחבת 115',        phones: ['02-5816814', '052-7692411'],         morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCDE },
  { name: 'קליין גבריאל',   address: 'סנהדריה מורחבת 135',        phones: ['053-3104254'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABCDE },
  { name: 'עטרה גולדברג',   address: 'אלקנה 7',                   phones: ['058-3251404'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_ABC },
  { name: 'שוורץ יהודית',   address: 'מנחת יצחק 20',              phones: ['02-5000583'],                        morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'יגן אסתר',       address: 'אמרי בינה 30',              phones: ['02-5383084'],                        morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'רחל יעקובזון',   address: 'אמרי בינה 18',              phones: ['02-5388157'],                        morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABC },
  { name: 'זייבלד יוכבד',   address: 'סורוצקין 53',               phones: ['053-3182347'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCD },
  { name: 'אליהו תורגמן',   address: 'סורוצקין 16',               phones: ['053-3145272', '02-5373538'],         morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },
  { name: 'שרה ריבלין',     address: 'זכרון יעקב 21',             phones: ['058-3259939'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('רוממה רכס - צהריים'), days: DAYS_ABCDE },

  // ===== רק בצהריים - מקור ברוך =====
  { name: 'אברהם יונה',     address: 'יהודה המכבי 9',             phones: ['052-7111617', '052-7692552'],        morningTransport: null, afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },

  // ===== חדש: יום שני בלבד =====
  { name: 'גבאי לונה',      address: 'אבן דנן 11',                phones: ['055-6895551'],                       morningTransport: t('הר נוף גב"ש - בוקר'), afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_B },
  { name: 'ליכטיג הדסה',    address: 'שאולזון 64',               phones: ['052-7615506', '053-3148360'],        morningTransport: t('הר נוף גב"ש - בוקר'), afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_BE },
  { name: 'לוי מלכה',      address: 'מוסאיוף 1',                phones: ['052-7635253', '055-6780956'],        morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_BD },
  { name: 'ברכה ימיני',     address: 'מסילת ישרים 3',             phones: ['054-5390348'],                       morningTransport: t('בית וגן רחביה - בוקר'), afternoonTransport: null, days: DAYS_BE },
  { name: 'אסתר דיין',      address: 'חזון איש 18',               phones: ['02-9702983'],                        morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_BE },
  { name: 'זיידל גילה',     address: 'סדיגורא 3',                 phones: ['052-7161223'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_BCE },
  { name: 'שמחה כהן',       address: 'הרב בלוי 8',                phones: ['052-7645489', '052-6101336'],        morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_BE },
  { name: 'ויספיש שמואל',   address: 'שמעון חכם 5',               phones: ['052-7681613'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_BCE },
  { name: 'זיוולד חנה',     address: 'תורת חסד 3',                phones: ['054-8457473'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_BE },
  { name: 'רומפלר רבקי',    address: 'פנים מאירות 13',            phones: ['053-4162236'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_BCE },
  { name: 'קרימלובסקי',     address: 'עלי הכהן פינת בר אילן',     phones: ['053-3134711', '054-8527970'],        morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_BD },
  { name: 'דוד סדובסקי',    address: 'אלקנה 21',                  phones: ['054-8495461'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_BCE },
  { name: 'אברמוב בועז',    address: 'אבינדב 18',                 phones: ['052-6690323'],                       morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_B },
  { name: 'פטרובסקי רוזה',  address: 'סולם יעקב 7',               phones: ['02-5861353', '052-7707328'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_BE },
  { name: 'שאר ישוב בועז',  address: 'שלום סיוון 24',             phones: ['054-8407424', '02-5879616'],         morningTransport: t('רמות - בוקר'), afternoonTransport: t('רמות - צהריים'), days: DAYS_ABD },
  { name: 'שמחה יחזקאל ב',  address: 'אבינדב 9',                  phones: ['058-3260383'],                       morningTransport: null, afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },

  // ===== חדש: יום שלישי =====
  // הר נוף - חדש ביום שלישי
  { name: 'שרה קולה',       address: 'עזריאל 8',                  phones: ['052-7132613', '053-7485483', '02-6510113'], morningTransport: t('הר נוף גב"ש - בוקר'), afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_CDE },
  // רכס - חדש ביום שלישי
  { name: 'גבירץ ברכה',     address: 'אלקנה 15',                  phones: ['053-3139740'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('גוש 80 סנהדריה בוכרים - צהריים'), days: DAYS_BCE },
  // איינהורן - ביום שלישי כתובת שונה
  { name: 'איינהורן משה',   address: 'שומרי אמונים 4',            phones: ['050-4117547'],                       morningTransport: null, afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_ABCDE },

  // ===== חדש: יום רביעי =====
  { name: 'מרים אזולאי',    address: 'הרב עוזי קלכהיים 11',      phones: ['052-5504125'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_DE },
  { name: 'לייטנר אסתר',    address: 'אמרי בינה 16',              phones: ['054-7091692'],                       morningTransport: t('רכס סנהדריה רוממה - בוקר'), afternoonTransport: t('שכונות צפון רכס - צהריים'), days: DAYS_DE },
  { name: 'סימון חיים',      address: 'קהתי 17',                  phones: ['054-5331090'],                       morningTransport: t('הר נוף גב"ש - בוקר'), afternoonTransport: t('גב"ש הר נוף - צהריים'), days: DAYS_DE },
  { name: 'אהרן הס',       address: 'הזית 8',                   phones: ['02-5382491', '054-4572718'],         morningTransport: t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים'), days: DAYS_DE },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('מחובר ל-MongoDB');

  // עדכון הסעות קיימות או יצירת חדשות
  const savedTransports = [];
  for (const tr of transports) {
    const saved = await Transport.findOneAndUpdate(
      { name: tr.name },
      tr,
      { upsert: true, new: true }
    );
    savedTransports.push(saved);
  }
  console.log(`עודכנו/נשמרו ${savedTransports.length} הסעות`);

  const transportMap = {};
  savedTransports.forEach(tr => { transportMap[tr.name] = tr._id; });

  let updated = 0, inserted = 0;
  for (const s of seniorsData) {
    const arrivalDays = s.days || DAYS_AB;
    const data = {
      address: s.address,
      phones: s.phones,
      morningTransport: s.morningTransport ? transportMap[s.morningTransport] : null,
      afternoonTransport: s.afternoonTransport ? transportMap[s.afternoonTransport] : null,
    };
    const existing = await Senior.findOne({ name: s.name });
    if (existing) {
      await Senior.findByIdAndUpdate(existing._id, { ...data, arrivalDays });
      updated++;
    } else {
      await Senior.create({ name: s.name, ...data, arrivalDays });
      inserted++;
    }
  }
  console.log(`עודכנו ${updated} קשישים, נוספו ${inserted} חדשים`);

  await mongoose.disconnect();
  console.log('סיום!');
}

seed().catch(e => { console.error(e); process.exit(1); });
