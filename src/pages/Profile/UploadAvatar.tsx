// src/pages/Profile/UploadAvatar.tsx
import React, { useState } from 'react';
import { uploadAvatar } from '../../utils/api';

const UploadAvatar: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setErr('Selecciona una imagen'); return; }
    try {
      setErr(null); setMsg(null);
      await uploadAvatar(file);
      setMsg('Foto actualizada. Se usará en los reportes.');
    } catch (e: any) {
      setErr(e.message || 'No se pudo subir el avatar');
    }
  }

  return (
    <div>
      <h2>Mi Perfil</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit">Subir</button>
      </form>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  );
};

export default UploadAvatar;
