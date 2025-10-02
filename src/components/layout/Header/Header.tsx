import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Header.module.scss';

interface HeaderProps {
  onMenuClick: (menu: string) => void;
  activeMenu: string;
  onLogout?: () => void;
}

type MenuKey = 'tickets' | 'urgentes' | 'history';

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeMenu, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Carga Feather una vez
  useEffect(() => {
    try {
      const feather = require('feather-icons');
      feather.replace();
    } catch {}
  }, []);

  // Reemplaza íconos cuando cambian aperturas (por si re-render)
  useEffect(() => {
    try {
      const feather = require('feather-icons');
      feather.replace();
    } catch {}
  }, [isSidebarOpen, profileOpen]);

  // Lee datos del usuario del localStorage (sin tocar otras pantallas)
  const { token, userName, userId, avatarUrl } = useMemo(() => {
    const rawUser = localStorage.getItem('user');
    let parsed: any = null;
    try { parsed = rawUser ? JSON.parse(rawUser) : null; } catch {}
    const token = localStorage.getItem('token') || '';
    const name = parsed?.name || parsed?.user?.name || localStorage.getItem('userName') || 'Usuario';
    const id   = parsed?.id || parsed?._id || parsed?.user?.id || localStorage.getItem('userId') || '—';
    const avatar = parsed?.avatarUrl || localStorage.getItem('avatarUrl') || '';
    return { token, userName: name, userId: id, avatarUrl: avatar };
  }, []);

  const initials = useMemo(() => {
    if (!userName) return 'U';
    const parts = String(userName).trim().split(/\s+/);
    return (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
  }, [userName]);

  const sidebarItems: { key: MenuKey; label: string; icon: string }[] = [
    { key: 'tickets',  label: 'Tickets',  icon: 'inbox' },
    { key: 'urgentes', label: 'Urgentes', icon: 'alert-triangle' },
    { key: 'history',  label: 'Historial', icon: 'clock' },
  ];

  // Cerrar popover si clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    if (!token) return; // sin token, no intentamos subir

    const file = e.target.files[0];
    const form = new FormData();
    form.append('avatar', file);

    try {
      setUploading(true);
      const res = await fetch('https://telmex.onrender.com/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || 'Error al subir la foto');
      }
      const data = await res.json();

      // Persistimos avatar en localStorage sin tocar otras pantallas
      const rawUser = localStorage.getItem('user');
      let parsed: any = null;
      try { parsed = rawUser ? JSON.parse(rawUser) : null; } catch {}
      const newAvatar = data?.user?.avatarUrl || '';
      if (parsed) {
        parsed.avatarUrl = newAvatar;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      localStorage.setItem('avatarUrl', newAvatar);
      // Actualizamos recargando íconos y cerramos
      setProfileOpen(true);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Error al subir la foto');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <header className={styles.header}>
      {/* IZQUIERDA: botón menú (ícono Feather más grande) */}
      <div className={`${styles.headerLeft} ${styles.left || ''}`}>
        <button
          className={styles.menuButton}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <i data-feather="menu" />
        </button>
      </div>

      {/* CENTRO: logo */}
      <div className={styles.headerCenter}>
        <img src="/logo-helpdesk.png" alt="Helpdesk" className={styles.headerImage} />
      </div>

      {/* DERECHA: nombre que abre tarjeta (NO botón suelto) */}
      <div className={`${styles.headerRight} ${styles.right || ''}`}>
        <div className={styles.profileContainer} ref={profileRef}>
          <button
            className={styles.profileButton}
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Abrir perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className={styles.avatarThumb} />
            ) : (
              <div className={styles.avatarFallback}>{initials}</div>
            )}
            <span className={styles.userName}>{userName}</span>
            <i data-feather="chevron-down" />
          </button>

          <div className={`${styles.profileMenu} ${profileOpen ? styles.menuOpen : ''}`}>
            <div className={styles.profileInfo}>
              <div className={styles.profileHeader}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className={styles.profilePhoto} />
                ) : (
                  <div className={styles.profilePhotoFallback}>{initials}</div>
                )}
                <div>
                  <div className={styles.profileName}>{userName}</div>
                  <div className={styles.profileRole}>Ingeniero en sistemas</div>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>ID</span>
                  <span className={styles.detailValue}>{userId}</span>
                </div>
              </div>
            </div>

            <div className={styles.menuActions}>
              <label className={styles.menuItem}>
                <i data-feather="image" />
                <span>{uploading ? 'Subiendo…' : 'Subir foto'}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFile}
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>

              <button
                className={styles.menuItem}
                onClick={() => {
                  setProfileOpen(false);
                  onLogout?.();
                }}
              >
                <i data-feather="log-out" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY y SIDEBAR (oscuro). Estructura intacta */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <h2 className={styles.sidebarTitle}>Menú</h2>
        <ul className={styles.sidebarMenu}>
          {sidebarItems.map((item) => (
            <li
              key={item.key}
              className={`${styles.sidebarMenuItem} ${activeMenu === item.key ? styles.active : ''}`}
            >
              <button
                onClick={() => {
                  onMenuClick(item.key);
                  setIsSidebarOpen(false);
                }}
              >
                <i data-feather={item.icon} />
                <span>{item.label.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
};

export default Header;
