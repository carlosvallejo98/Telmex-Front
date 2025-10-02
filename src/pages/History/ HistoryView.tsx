import React from 'react';
import styles from './HistoryView.module.scss';

interface ReportShape {
  id: number | string;
  ticketId: number | string;
  fecha?: string;
  hora?: string;
  dia?: string;
  tecnico?: string;
  empresa?: string;
  servicio?: string;         // opcional
  content?: string;          // backend nuevo
  contenido?: string;        // compat nombre anterior
}

interface HistoryViewProps {
  reports: ReportShape[];
  selectedReport: ReportShape | null;
  onSelectReport: (report: ReportShape) => void;
  onDownloadPdf?: (report: ReportShape) => void;
  onSendEmail?: (report: ReportShape) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onDownloadPdf,
  onSendEmail
}) => {
  const text = (selectedReport?.content ?? selectedReport?.contenido ?? '');

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyLayout}>
        {/* Columna izquierda: lista */}
        <div className={styles.historyList}>
          <div className={styles.historyGrid}>
            {reports.map((r) => (
              <div
                key={String(r.id)}
                className={`${styles.historyItem} ${selectedReport?.id === r.id ? styles.selected : ''}`}
                onClick={() => onSelectReport(r)}
              >
                <h3>{r.empresa || 'Empresa'}</h3>

                <div className={styles.itemMeta}>
                  <p>
                    <strong>Ticket:</strong> #{String(r.ticketId).padStart(4, '0')}
                  </p>
                </div>

                <div className={styles.itemMeta}>
                  <p>
                    <strong>Fecha:</strong> {r.fecha || '—'} &nbsp;|&nbsp;
                    <strong> Hora:</strong> {r.hora || '—'}
                  </p>
                </div>

                <div className={styles.itemMeta}>
                  <p>
                    <strong>Técnico:</strong> {r.tecnico || '—'}
                  </p>
                </div>

                {r.servicio && <p className={styles.serviceType}>{r.servicio}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: detalle */}
        <div className={styles.historyDetail}>
          {selectedReport ? (
            <>
              <div className={styles.reportHeader}>
                <h2>{selectedReport.empresa || 'Empresa'}</h2>
                {selectedReport.servicio && (
                  <p className={styles.serviceType}>{selectedReport.servicio}</p>
                )}
              </div>

              <div className={styles.reportMeta}>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Fecha</p>
                  <p className={styles.metaValue}>{selectedReport.fecha || '—'}</p>
                </div>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Hora</p>
                  <p className={styles.metaValue}>{selectedReport.hora || '—'}</p>
                </div>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Día</p>
                  <p className={styles.metaValue}>{selectedReport.dia || '—'}</p>
                </div>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Técnico</p>
                  <p className={styles.metaValue}>{selectedReport.tecnico || '—'}</p>
                </div>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Ticket ID</p>
                  <p className={styles.metaValue}>#{String(selectedReport.ticketId).padStart(4, '0')}</p>
                </div>
              </div>

              <div className={styles.reportContent}>
                <h3>Descripción del trabajo realizado:</h3>
                <div className={styles.contentText}>
                  {text.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              <div className={styles.reportActions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => onDownloadPdf?.(selectedReport)}
                >
                  <span className={styles.buttonIcon}>📄</span>
                  Descargar PDF
                </button>
                <button
                  className={styles.emailButton}
                  onClick={() => onSendEmail?.(selectedReport)}
                >
                  <span className={styles.buttonIcon}>📧</span>
                  Enviar a cvallejo069@gmail.com
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <div className={styles.noSelectionIcon}>📋</div>
              <h3>Selecciona un reporte</h3>
              <p>Elige un reporte del historial para ver los detalles completos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
