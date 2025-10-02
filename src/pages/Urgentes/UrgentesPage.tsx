// src/pages/Urgentes/UrgentesPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import TicketsView, { UITicket } from '../Tickets/TicketsView';
import { listOpenTickets } from '../../utils/api';

interface Props { onReport: (ticket: UITicket) => void; refreshKey?: number; }

const UrgentesPage: React.FC<Props> = ({ onReport, refreshKey }) => {
  const [tickets, setTickets] = useState<UITicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const all = await listOpenTickets();
      setTickets(all.filter((t) => t.priority === 'urgent') as UITicket[]);
    } catch (e: any) {
      setErr(e.message || 'Error al cargar urgentes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets, refreshKey]);

  if (loading) return <p>Cargando urgentes…</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;
  return <TicketsView tickets={tickets} onReport={onReport} title="Urgentes" />;
};

export default UrgentesPage;
