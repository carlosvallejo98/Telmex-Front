// src/pages/History/HistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { listMyReports, ReportDTO } from '../../utils/api';

const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listMyReports();
        setItems(data);
      } catch (e: any) {
        setErr(e.message || 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando historial…</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;
  if (!items.length) return <p>Sin reportes todavía.</p>;

  return (
    <div>
      <h2>Historial</h2>
      <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
        {items.map((r) => (
          <li key={r._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <strong>{r.ticketId?.title}</strong> — {r.ticketId?.priority?.toUpperCase()}
            <div>Reporte: {r.content || '(sin contenido)'}</div>
            <div>Fecha: {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</div>
            {r.excelPath && <div>Excel: {r.excelPath.split('/').pop()}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
 