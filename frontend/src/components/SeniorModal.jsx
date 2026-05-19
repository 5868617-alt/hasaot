import { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה'];

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

export default function SeniorModal({ senior, onSave, onClose }) {
  const [transports, setTransports] = useState({ בוקר: [], צהריים: [] });
  const [form, setForm] = useState({
    name: '', address: '', neighborhood: '', phones: [''], arrivalDays: [],
    morningTransport: '', afternoonTransport: '',
    ...senior,
    arrivalDays: senior?.arrivalDays ? [...senior.arrivalDays] : [],
    phones: senior?.phones?.length ? [...senior.phones] : [''],
    morningTransport: senior?.morningTransport?._id || senior?.morningTransport || '',
    afternoonTransport: senior?.afternoonTransport?._id || senior?.afternoonTransport || '',
  });

  const handleAddressChange = (val) => {
    const neighborhood = getArea(val);
    setForm(f => ({ ...f, address: val, neighborhood }));
  };

  useEffect(() => {
    api.get('/transport').then(({ data }) => {
      setTransports({
        בוקר: data.filter(t => t.shift === 'בוקר'),
        צהריים: data.filter(t => t.shift === 'צהריים'),
      });
    });
  }, []);

  const handleTransportChange = (field, newId) => {
    const otherField = field === 'morningTransport' ? 'afternoonTransport' : 'morningTransport';
    const allList = [...transports.בוקר, ...transports.צהריים];
    const prevTransport = allList.find(t => t._id === form[field]);
    const newTransport = allList.find(t => t._id === newId);
    const otherTransport = allList.find(t => t._id === form[otherField]);

    let arrivalDays = [...form.arrivalDays];

    if (prevTransport) {
      const otherDays = otherTransport?.activeDays || [];
      arrivalDays = arrivalDays.filter(d => !prevTransport.activeDays.includes(d) || otherDays.includes(d));
    }
    if (newTransport) {
      for (const d of newTransport.activeDays)
        if (!arrivalDays.includes(d)) arrivalDays.push(d);
    }

    setForm(f => ({ ...f, [field]: newId, arrivalDays }));
  };

  const toggleDay = (day) => setForm(f => ({
    ...f,
    arrivalDays: f.arrivalDays.includes(day) ? f.arrivalDays.filter(d => d !== day) : [...f.arrivalDays, day],
  }));

  const updatePhone = (i, val) => {
    const phones = [...form.phones];
    phones[i] = val;
    setForm({ ...form, phones });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{senior ? 'עריכת קשיש' : 'הוספת קשיש'}</h2>

        <label>שם מלא</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <label>כתובת</label>
        <input value={form.address} onChange={e => handleAddressChange(e.target.value)} />

        <label>שכונה</label>
        <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} placeholder="מתמלא אוטומטית לפי כתובת" />

        <label>טלפונים</label>
        {form.phones.map((p, i) => (
          <input key={i} value={p} placeholder={`טלפון ${i + 1}`}
            onChange={e => updatePhone(i, e.target.value)} />
        ))}
        <button className="btn-secondary" style={{fontSize:'0.8rem'}}
          onClick={() => setForm({ ...form, phones: [...form.phones, ''] })}>+ טלפון נוסף</button>

        <label>ימי הגעה</label>
        <div className="days-grid">
          {DAYS.map(d => (
            <label key={d} className="day-check">
              <input type="checkbox" checked={form.arrivalDays.includes(d)} onChange={() => toggleDay(d)} />
              {d}
            </label>
          ))}
        </div>

        <label>הסעה בבוקר</label>
        <select value={form.morningTransport} onChange={e => handleTransportChange('morningTransport', e.target.value)}>
          <option value="">-- ללא --</option>
          {transports.בוקר.map(t => <option key={t._id} value={t._id}>{t.name} ({t.time})</option>)}
        </select>

        <label>הסעה בצהריים</label>
        <select value={form.afternoonTransport} onChange={e => handleTransportChange('afternoonTransport', e.target.value)}>
          <option value="">-- ללא --</option>
          {transports.צהריים.map(t => <option key={t._id} value={t._id}>{t.name} ({t.time})</option>)}
        </select>

        <div className="modal-actions">
          <button className="btn-primary" onClick={() => onSave(form, senior?._id)}>שמור</button>
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
