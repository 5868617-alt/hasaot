import { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה'];

export default function SeniorModal({ senior, onSave, onClose }) {
  const [transports, setTransports] = useState({ בוקר: [], צהריים: [] });
  const [form, setForm] = useState({
    name: '', address: '', phones: [''], arrivalDays: [],
    morningTransport: '', afternoonTransport: '',
    ...senior,
    phones: senior?.phones?.length ? senior.phones : [''],
    morningTransport: senior?.morningTransport?._id || senior?.morningTransport || '',
    afternoonTransport: senior?.afternoonTransport?._id || senior?.afternoonTransport || '',
  });

  useEffect(() => {
    api.get('/transport').then(({ data }) => {
      setTransports({
        בוקר: data.filter(t => t.shift === 'בוקר'),
        צהריים: data.filter(t => t.shift === 'צהריים'),
      });
    });
  }, []);

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
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

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
        <select value={form.morningTransport} onChange={e => setForm({ ...form, morningTransport: e.target.value })}>
          <option value="">-- ללא --</option>
          {transports.בוקר.map(t => <option key={t._id} value={t._id}>{t.name} ({t.time})</option>)}
        </select>

        <label>הסעה בצהריים</label>
        <select value={form.afternoonTransport} onChange={e => setForm({ ...form, afternoonTransport: e.target.value })}>
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
