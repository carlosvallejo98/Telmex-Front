import React, { useEffect, useMemo, useState } from 'react';
import styles from './ReportView.module.scss';
import { sendReport } from '../../utils/api';

export interface ReportViewTicket {
  _id: string;
  title?: string;
  empresa?: string;
}

export interface ReportViewProps {
  ticket: ReportViewTicket;
  onCancel: () => void;
  onCloseSuccess: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ ticket, onCancel, onCloseSuccess }) => {
  const [reportContent, setReportContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('profile') || '';
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
  };

  // SOLO UI del botón "Cambiar foto" (el upload real ya lo haremos luego)
  const onAvatarSelect = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // noop (solo visual por ahora)
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setErr(null);
      await sendReport(ticket._id, reportContent, files);
      onCloseSuccess();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el reporte');
    } finally {
      setLoading(false);
    }
  }

  const fecha = now.toLocaleDateString('es-MX');
  const hora  = now.toLocaleTimeString('es-MX', { hour12: false });
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dia = dias[now.getDay()];

  const attachmentsLabel =
    files.length === 0
      ? 'Sin archivos seleccionados'
      : files.map(f => f.name).join(', ');

  return (
    <div className={styles.reportContainer}>
      <form className={styles.reportForm} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div className={styles.userInfo}>
            <img
              className={styles.userPhoto}
              src={user?.avatarUrl || '/default-avatar.png'}
              alt="Foto de usuario"
            />

            <div>
              <div className={styles.metaRow}><strong>Nombre:</strong> {user?.name || '—'}</div>
              <div className={styles.metaRow}><strong>Puesto:</strong> Ingeniero en Sistemas</div>
              <div className={styles.metaRow}><strong>ID:</strong> {user?.id || user?._id || '—'}</div>

              {/* Botón estilizado para cambiar foto */}
              <div className={styles.inlineFile}>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFile}
                  onChange={onAvatarSelect}
                  disabled={loading}
                />
                <label htmlFor="avatarInput" className={styles.fileButton}>
                  Cambiar foto
                </label>
              </div>
            </div>
          </div>

          <div className={styles.ticketInfo}>
            <h3>{ticket.empresa || ticket.title || 'Ticket'}</h3>
            <p>Fecha: {fecha} &nbsp;|&nbsp; Hora: {hora} &nbsp;|&nbsp; Día: {dia}</p>
          </div>
        </div>

        {err && <p className={styles.errorText}>{err}</p>}

        <div className={styles.formGroup}>
          <label>Contenido del reporte</label>
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            required
            disabled={loading}
            placeholder="Describe el trabajo realizado, hallazgos, evidencias, etc."
          />
        </div>

        {/* Adjuntos (sin la palabra 'opcional') + botón bonito */}
        <div className={styles.formGroup}>
          <label>Adjuntos</label>
          <div className={styles.inlineFile}>
            <input
              id="attachmentsInput"
              type="file"
              multiple
              className={styles.hiddenFile}
              onChange={onFileChange}
              disabled={loading}
            />
            <label htmlFor="attachmentsInput" className={styles.fileButton}>
              Elegir archivos
            </label>
            <span className={styles.fileNote}>{attachmentsLabel}</span>
          </div>
        </div>

        <div className={styles.reportActions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportView;
