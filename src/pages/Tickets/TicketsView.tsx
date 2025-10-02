import React from 'react';
import styles from './TicketsView.module.scss';

export interface UITicket {
  _id: string;
  title: string;
  description: string;
  priority: 'normal' | 'urgent';
  status: 'open' | 'closed';
}

interface TicketsViewProps {
  tickets: UITicket[];
  onReport: (ticket: UITicket) => void;
  title?: string;
}

const TicketsView: React.FC<TicketsViewProps> = ({ tickets, onReport, title = 'Todos los Tickets' }) => {
  return (
    <div className={styles.ticketsView}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.list}>
        {tickets.map((ticket) => (
          <div key={ticket._id} className={styles.card}>
            <div className={styles.header}>
              <div className={styles.left}>
                <span
                  className={`${styles.priority} ${
                    ticket.priority === 'urgent' ? styles.urgent : styles.normal
                  }`}
                >
                  {ticket.priority === 'urgent' ? 'URGENTE' : 'NORMAL'}
                </span>
                <h3 className={styles.ticketTitle}>{ticket.title}</h3>
              </div>

              <span className={styles.status}>
                {ticket.status === 'open' ? 'Abierto' : 'Cerrado'}
              </span>
            </div>

            <p className={styles.description}>{ticket.description}</p>

            <div className={styles.actions}>
              <button
                className={styles.reportButton}
                onClick={() => onReport(ticket)}
              >
                Hacer reporte
              </button>

              {/*
              ⛔️ BOTÓN ELIMINADO:
              <button
                className={styles.completeButton}
                onClick={() => onTicketAction(ticket, 'complete')}
              >
                Hecho
              </button>
              */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsView;
