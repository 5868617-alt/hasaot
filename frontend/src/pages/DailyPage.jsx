import { useState, useEffect } from 'react';
import api from '../api';

const DAY_MAP = { 0: '1', 1: '2', 2: '3', 3: '4', 4: '5' };
const DAY_NAMES = { '1': 'ראשון', '2': 'שני', '3': 'שלישי', '4': 'רביעי', '5': 'חמישי' };
const DAYS = ['1', '2', '3', '4', '5'];
const SHIFTS = ['הכל', 'בוקר', 'צהריים'];

const HEB_DAYS = ['א', 'ב', 'ג', 'ד', 'ה'];
const HEB_DAY_NAMES = { 'א': 'ראשון', 'ב': 'שני', 'ג': 'שלישי', 'ד': 'רביעי', 'ה': 'חמישי' };
const EMPTY = { name: '', shift: 'בוקר', time: '', escortName: '', escortPhone: '', activeDays: [] };

function TransportModal({ transport, onSave, onClose }) {
  const isEdit = !!transport?._id;
  const [form, setForm] = useState(transport || EMPTY);
  const [allSeniors, setAllSeniors] = useState([]);
  const [search, setSearch] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDay = (d) =>
    set('activeDays', form.activeDays.includes(d)
      ? form.activeDays.filter(x => x !== d)
      : [...form.activeDays, d]);

  useEffect(() => {
    if (isEdit) api.get('/seniors').then(({ data }) => setAllSeniors(data));
  }, [isEdit]);

  const field = form.shift === 'בוקר' ? 'morningTransport' : 'afternoonTransport';
  const assignedIds = new Set(allSeniors.filter(s => s[field]?._id === transport._id || s[field] === transport._id).map(s => s._id));

  const toggleSenior = async (senior) => {
    const isAssigned = assignedIds.has(senior._id);
    const update = { [field]: isAssigned ? null : transport._id };
    const { data: updated } = await api.put(`/seniors/${senior._id}`, { ...senior, ...update });
    setAllSeniors(prev => prev.map(s => s._id === updated._id ? updated : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = isEdit
      ? await api.put(`/transport/${transport._id}`, form)
      : await api.post('/transport', form);
    onSave(data);
  };

  const filtered = allSeniors.filter(s => s.name.includes(search));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: isEdit ? '560px' : '440px' }} onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? 'עריכת הסעה' : 'הוספת הסעה'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <label>שם הסעה</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} />
          <label>משמרת</label>
          <select value={form.shift} onChange={e => set('shift', e.target.value)}>
            <option value="בוקר">בוקר</option>
            <option value="צהריים">צהריים</option>
          </select>
          <label>שעה</label>
          <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="למשל 08:00" />
          <label>שם מלווה</label>
          <input value={form.escortName} onChange={e => set('escortName', e.target.value)} />
          <label>טלפון מלווה</label>
          <input value={form.escortPhone} onChange={e => set('escortPhone', e.target.value)} />
          <label>ימים פעילים</label>
          <div className="days-grid">
            {HEB_DAYS.map(d => (
              <label key={d} className="day-check">
                <input type="checkbox" checked={form.activeDays.includes(d)} onChange={() => toggleDay(d)} />
                {HEB_DAY_NAMES[d]}
              </label>
            ))}
          </div>

          {isEdit && (
            <>
              <label style={{ marginTop: '0.5rem' }}>נוסעים בהסעה</label>
              <input
                placeholder="חיפוש קשיש..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem' }}>
                {filtered.length === 0 && <p style={{ color: '#a0aec0', textAlign: 'center', padding: '0.5rem' }}>אין תוצאות</p>}
                {filtered.map(s => (
                  <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', background: assignedIds.has(s._id) ? '#ebf8ff' : 'transparent' }}>
                    <input type="checkbox" checked={assignedIds.has(s._id)} onChange={() => toggleSenior(s)} />
                    <span>{s.name}</span>
                    {s.address && <span style={{ color: '#718096', fontSize: '0.82rem' }}>{s.address}</span>}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn-primary">💾 שמור</button>
            <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const downloadFile = async (url, filename) => {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) { alert('שגיאה בהורדה'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

function LineCard({ transport, seniors, selectedDay, onEdit, onDelete }) {
  const exportLine = () =>
    downloadFile(`${BASE_URL}/api/transport/${transport._id}/export?day=${selectedDay}`, 'transport.xlsx');

  return (
    <div className="line-card">
      <div className="line-header">
        <div>
          <strong>{transport.name}</strong>
          <span className="line-time"> 🕐 {transport.time}</span>
        </div>
        <div>
          {transport.escortName && <span className="escort">מלווה: {transport.escortName}</span>}
          {transport.escortPhone && <span className="escort">📞 {transport.escortPhone}</span>}
          <button className="btn-export-line" onClick={exportLine} title="הורד הסעה זו">📥</button>
          <button className="btn-export-line" onClick={onEdit} title="עריכה">✏️</button>
          <button className="btn-export-line" onClick={onDelete} title="מחיקה" style={{color:'#fc8181'}}>🗑️</button>
        </div>
      </div>
      {seniors.length === 0
        ? <p className="empty">אין נוסעים</p>
        : <ol>
            {seniors.map(s => (
              <li key={s._id}>
                <strong>{s.name}</strong>
                {s.address && <span className="address"> | {s.address}</span>}
                {s.phones?.[0] && <span> | 📞 {s.phones[0]}</span>}
              </li>
            ))}
          </ol>
      }
      <div className="line-footer">{seniors.length} נוסעים</div>
    </div>
  );
}

export default function DailyPage() {
  const todayKey = DAY_MAP[new Date().getDay()] ?? '1';
  const [selectedDay, setSelectedDay] = useState(() => DAY_MAP[new Date().getDay()] ?? '1');
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  });
  const [selectedShift, setSelectedShift] = useState('הכל');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const fetchData = (day = selectedDay, date = selectedDate) => {
    setLoading(true);
    api.get('/transport/daily', { params: { day, date } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(selectedDay, selectedDate); }, [selectedDay, selectedDate]);

  const handleSave = () => { setModal(null); fetchData(selectedDay, selectedDate); };

  const handleDelete = async (id) => {
    if (!confirm('למחוק הסעה זו?')) return;
    await api.delete(`/transport/${id}`);
    fetchData(selectedDay, selectedDate);
  };

  const exportExcel = () =>
    downloadFile(`${BASE_URL}/api/transport/daily/export?day=${selectedDay}&t=${Date.now()}`, 'daily.xlsx');

  const exportAll = () =>
    downloadFile(`${BASE_URL}/api/transport/export/all?day=${selectedDay}&t=${Date.now()}`, 'all-transports.xlsx');

  const showMorning = selectedShift === 'הכל' || selectedShift === 'בוקר';
  const showAfternoon = selectedShift === 'הכל' || selectedShift === 'צהריים';

  return (
    <div>
      <div className="page-header">
        <h1>הסעות יום {DAY_NAMES[selectedDay]}</h1>
        <div className="actions">
          <button className="btn-primary" onClick={() => setModal('add')}>+ הוסף הסעה</button>
          <button className="btn-primary" onClick={exportExcel}>📥 הורד הסעות יום זה</button>
          <button className="btn-secondary" onClick={exportAll}>📂 הורד כל ההסעות</button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <span>תאריך:</span>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{padding:'0.4rem', borderRadius:'6px', border:'1px solid #cbd5e0'}} />
        </div>
        <div className="filter-group">
          <span>יום:</span>
          {DAYS.map(d => (
            <button key={d}
              className={selectedDay === d ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedDay(d)}>
              {DAY_NAMES[d]}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span>הסעה:</span>
          {SHIFTS.map(s => (
            <button key={s}
              className={selectedShift === s ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedShift(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>טוען...</p>}

      {!loading && data && (
        <>
          {showMorning && (
            <div className="shift-section">
              <h2 className="shift-title">🌅 בוקר</h2>
              {data.בוקר?.length === 0
                ? <p className="empty">אין הסעות בוקר ביום זה</p>
                : <div className="lines-grid">
                    {data.בוקר?.map(({ transport, seniors }) => (
                      <LineCard key={transport._id} transport={transport} seniors={seniors} selectedDay={selectedDay}
                        onEdit={() => setModal(transport)}
                        onDelete={() => handleDelete(transport._id)} />
                    ))}
                  </div>
              }
            </div>
          )}
          {showAfternoon && (
            <div className="shift-section">
              <h2 className="shift-title">🌇 צהריים</h2>
              {data.צהריים?.length === 0
                ? <p className="empty">אין הסעות צהריים ביום זה</p>
                : <div className="lines-grid">
                    {data.צהריים?.map(({ transport, seniors }) => (
                      <LineCard key={transport._id} transport={transport} seniors={seniors} selectedDay={selectedDay}
                        onEdit={() => setModal(transport)}
                        onDelete={() => handleDelete(transport._id)} />
                    ))}
                  </div>
              }
            </div>
          )}
        </>
      )}

      {modal && (
        <TransportModal
          transport={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
