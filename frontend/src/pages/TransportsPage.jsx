import { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה'];
const DAY_NAMES = { 'א': 'ראשון', 'ב': 'שני', 'ג': 'שלישי', 'ד': 'רביעי', 'ה': 'חמישי' };
const EMPTY = { name: '', shift: 'בוקר', time: '', escortName: '', escortPhone: '', activeDays: [] };

function TransportModal({ transport, onSave, onClose }) {
  const [form, setForm] = useState(transport || EMPTY);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (d) =>
    set('activeDays', form.activeDays.includes(d)
      ? form.activeDays.filter(x => x !== d)
      : [...form.activeDays, d]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (transport?._id) {
      const { data } = await api.put(`/transport/${transport._id}`, form);
      onSave(data);
    } else {
      const { data } = await api.post('/transport', form);
      onSave(data);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{transport?._id ? 'עריכת הסעה' : 'הוספת הסעה'}</h2>
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
            {DAYS.map(d => (
              <label key={d} className="day-check">
                <input type="checkbox" checked={form.activeDays.includes(d)} onChange={() => toggleDay(d)} />
                {DAY_NAMES[d]}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">💾 שמור</button>
            <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TransportsPage() {
  const [transports, setTransports] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | transport object

  useEffect(() => {
    api.get('/transport').then(({ data }) => setTransports(data));
  }, []);

  const handleSave = (saved) => {
    setTransports(prev =>
      prev.find(t => t._id === saved._id)
        ? prev.map(t => t._id === saved._id ? saved : t)
        : [...prev, saved]
    );
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('למחוק הסעה זו?')) return;
    await api.delete(`/transport/${id}`);
    setTransports(prev => prev.filter(t => t._id !== id));
  };

  const morning = transports.filter(t => t.shift === 'בוקר');
  const afternoon = transports.filter(t => t.shift === 'צהריים');

  return (
    <div>
      <div className="page-header">
        <h1>🚌 ניהול הסעות</h1>
        <button className="btn-primary" onClick={() => setModal('add')}>+ הוסף הסעה</button>
      </div>

      {['בוקר', 'צהריים'].map(shift => {
        const list = shift === 'בוקר' ? morning : afternoon;
        return (
          <div key={shift} className="shift-section">
            <h2 className="shift-title">{shift === 'בוקר' ? '🌅' : '🌇'} {shift}</h2>
            {list.length === 0
              ? <p className="empty">אין הסעות</p>
              : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>שם</th>
                        <th>שעה</th>
                        <th>מלווה</th>
                        <th>טלפון מלווה</th>
                        <th>ימים פעילים</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(t => (
                        <tr key={t._id}>
                          <td>{t.name}</td>
                          <td>{t.time || '—'}</td>
                          <td>{t.escortName || '—'}</td>
                          <td>{t.escortPhone || '—'}</td>
                          <td>{t.activeDays.map(d => DAY_NAMES[d]).join(', ') || '—'}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-edit" onClick={() => setModal(t)}>✏️ עריכה</button>
                              <button className="btn-delete" onClick={() => handleDelete(t._id)}>🗑️ מחיקה</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        );
      })}

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
