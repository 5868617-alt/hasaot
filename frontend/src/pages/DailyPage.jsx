import { useState, useEffect } from 'react';
import api from '../api';

const DAY_MAP = { 0: '1', 1: '2', 2: '3', 3: '4', 4: '5' };
const DAY_NAMES = { '1': 'ראשון', '2': 'שני', '3': 'שלישי', '4': 'רביעי', '5': 'חמישי' };
const DAYS = ['1', '2', '3', '4', '5'];
const SHIFTS = ['הכל', 'בוקר', 'צהריים'];

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const downloadFile = async (url, filename) => {
  const res = await fetch(url);
  if (!res.ok) { alert('שגיאה בהורדה'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

function LineCard({ transport, seniors, selectedDay }) {
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

  useEffect(() => {
    setLoading(true);
    api.get('/transport/daily', { params: { day: selectedDay, date: selectedDate } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [selectedDay, selectedDate]);

  const exportExcel = () =>
    downloadFile(`${BASE_URL}/api/transport/daily/export?day=${selectedDay}`, 'daily.xlsx');

  const exportAll = () =>
    downloadFile(`${BASE_URL}/api/transport/export/all?day=${selectedDay}`, 'all-transports.xlsx');

  const showMorning = selectedShift === 'הכל' || selectedShift === 'בוקר';
  const showAfternoon = selectedShift === 'הכל' || selectedShift === 'צהריים';

  return (
    <div>
      <div className="page-header">
        <h1>הסעות יום {DAY_NAMES[selectedDay]}</h1>
        <button className="btn-secondary" onClick={exportExcel}>📥 הורד הסעות יום זה</button>
        <button className="btn-secondary" onClick={exportAll}>📥 הורד כל ההסעות</button>
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
                      <LineCard key={transport._id} transport={transport} seniors={seniors} selectedDay={selectedDay} />
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
                      <LineCard key={transport._id} transport={transport} seniors={seniors} selectedDay={selectedDay} />
                    ))}
                  </div>
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}
