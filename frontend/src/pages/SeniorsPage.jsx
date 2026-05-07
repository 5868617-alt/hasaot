import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import SeniorModal from '../components/SeniorModal';

function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:'380px', textAlign:'center', gap:'1.2rem'}}>
        <div style={{fontSize:'3rem'}}>🗑️</div>
        <h2 style={{color:'#c53030'}}>מחיקת קשיש</h2>
        <p style={{color:'#4a5568', fontSize:'1rem'}}>האם למחוק את <strong>{name}</strong>?<br/>פעולה זו אינה ניתנת לביטול.</p>
        <div style={{display:'flex', gap:'0.75rem', justifyContent:'center'}}>
          <button className="btn-danger" onClick={onConfirm}>כן, מחק</button>
          <button className="btn-secondary" onClick={onCancel}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function AbsenceModal({ senior, onClose }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [absences, setAbsences] = useState([]);

  const load = async () => {
    const { data } = await api.get('/absences', { params: { senior: senior._id } });
    setAbsences(data);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!startDate || !endDate) return alert('נא למלא תאריכים');
    await api.post('/absences', { senior: senior._id, startDate, endDate, note });
    setStartDate(''); setEndDate(''); setNote('');
    load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/absences/${id}`);
    load();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:'700px', width:'95%'}}>
        <h2>היעדרויות - {senior.name}</h2>
        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem'}}>
          <label>מתאריך: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
          <label>עד תאריך: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
          <label>הערה: <input value={note} onChange={e => setNote(e.target.value)} placeholder="אופציונלי" /></label>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button className="btn-primary" onClick={handleAdd}>💾 שמור</button>
            <button className="btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); setNote(''); }}>✕ ביטול</button>
          </div>
        </div>
        {absences.length > 0 && (
          <table className="data-table">
            <thead><tr><th>מתאריך</th><th>עד תאריך</th><th>הערה</th><th></th></tr></thead>
            <tbody>
              {absences.map(a => (
                <tr key={a._id}>
                  <td>{new Date(a.startDate).toLocaleDateString('he-IL', { day:'numeric', month:'numeric', year:'2-digit' })}</td>
                  <td>{new Date(a.endDate).toLocaleDateString('he-IL', { day:'numeric', month:'numeric', year:'2-digit' })}</td>
                  <td>{a.note}</td>
                  <td><button className="btn-delete" onClick={() => handleDelete(a._id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn-secondary" onClick={onClose} style={{marginTop:'1rem'}}>סגור</button>
      </div>
    </div>
  );
}

export default function SeniorsPage() {
  const [seniors, setSeniors] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [absenceModal, setAbsenceModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortBy, setSortBy] = useState('none');

  const load = async (q = '') => {
    const { data } = await api.get('/seniors', { params: { name: q } });
    setSeniors(data);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await api.delete(`/seniors/${id}`);
    setConfirmDelete(null);
    load(search);
  };

  const handleSave = async (formData, id) => {
    if (id) await api.put(`/seniors/${id}`, formData);
    else await api.post('/seniors', formData);
    setModal(null);
    load(search);
  };

  const sorted = useMemo(() => {
    if (sortBy === 'name') return [...seniors].sort((a, b) => a.name.localeCompare(b.name, 'he'));
    if (sortBy === 'transport') return [...seniors].sort((a, b) => (a.morningTransport?.name || '').localeCompare(b.morningTransport?.name || '', 'he'));
    return seniors;
  }, [seniors, sortBy]);

  return (
    <div>
      <div className="page-header">
        <h1>ניהול קשישים ({seniors.length})</h1>
        <div className="actions">
          <input placeholder="חיפוש לפי שם..." value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{padding:'0.5rem 0.75rem', borderRadius:'6px', border:'1px solid #cbd5e0', fontSize:'0.95rem'}}>
            <option value="none">מיון...</option>
            <option value="name">א-ב</option>
            <option value="transport">לפי שכונה</option>
          </select>
          <button className="btn-primary" onClick={() => setModal('add')}>+ הוסף קשיש</button>
          <button className="btn-secondary" onClick={() => {
            fetch(`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/api/seniors/export/addresses`)
              .then(r => r.blob()).then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'seniors-addresses.xlsx'; a.click(); });
          }}>📍 שם וכתובת</button>
          <button className="btn-secondary" onClick={() => {
            fetch(`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/api/seniors/export`)
              .then(r => r.blob()).then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'seniors.xlsx'; a.click(); });
          }}>📥 ייצוא מלא</button>        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
        <thead>
          <tr>
            <th>שם</th><th>כתובת</th><th>טלפון</th><th>ימים</th><th>הסעה בוקר</th><th>הסעה צהריים</th><th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.phones?.join(' / ')}</td>
              <td>{s.arrivalDays.join(', ')}</td>
              <td>{s.morningTransport?.name || '—'}</td>
              <td>{s.afternoonTransport?.name || '—'}</td>
              <td>
                <div className="row-actions">
                  <button className="btn-edit" title="עריכת פרטי קשיש" onClick={() => setModal(s)}>✏️ עריכה</button>
                  <button className="btn-secondary" title="ניהול היעדרויות" style={{padding:'0.35rem 0.6rem', fontSize:'0.82rem', fontWeight:'600'}} onClick={() => setAbsenceModal(s)}>📅</button>
                  <button className="btn-delete" title="מחיקת קשיש" onClick={() => setConfirmDelete(s)}>🗑️ מחיקה</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {confirmDelete && <ConfirmModal name={confirmDelete.name} onConfirm={() => handleDelete(confirmDelete._id)} onCancel={() => setConfirmDelete(null)} />}
      {absenceModal && <AbsenceModal senior={absenceModal} onClose={() => setAbsenceModal(null)} />}
      {modal && (
        <SeniorModal
          senior={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
