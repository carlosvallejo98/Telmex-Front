// src/App.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/layout/Header/Header';
import Login from './pages/Login/Login';
import TicketsPage from './pages/Tickets/TicketsPage';
import UrgentesPage from './pages/Urgentes/UrgentesPage';
import HistoryPage from './pages/History/HistoryPage';
import ReportPage from './pages/Report/ReportPage';

import styles from './App.module.scss';
import { logout as apiLogout } from './utils/api';
import type { UITicket } from './pages/Tickets/TicketsView';

type MenuKey = 'tickets' | 'urgentes' | 'history' | 'profile' | 'report';

function getMenuFromHash(): MenuKey {
  const h = (window.location.hash || '').replace('#', '').trim().toLowerCase();
  // valores permitidos
  if (h === 'tickets' || h === 'urgentes' || h === 'history' || h === 'profile' || h === 'report') {
    return h as MenuKey;
  }
  return 'tickets';
}

function setHash(menu: MenuKey) {
  if ((window.location.hash || '').replace('#','') !== menu) {
    window.location.hash = menu;
  }
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [activeMenu, setActiveMenu] = useState<MenuKey>(getMenuFromHash());
  const [reportTicket, setReportTicket] = useState<UITicket | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sincroniza cambios del navegador (back/forward) con el estado
  useEffect(() => {
    const onHashChange = () => {
      const m = getMenuFromHash();
      setActiveMenu(m);
      if (m !== 'report') {
        // si el usuario volvió desde 'report', limpiamos el ticket seleccionado
        setReportTicket(null);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    // al cargar por primera vez, asegura estado correcto
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleLogin() {
    setIsAuthenticated(true);
    // al loguear, si no hay hash, ve a tickets
    if (!window.location.hash) setHash('tickets');
  }

  function handleLogout() {
    apiLogout();
    setIsAuthenticated(false);
    setActiveMenu('tickets');
    setHash('tickets');
  }

  function onMenuClick(menu: string) {
    // bloqueamos ir manual a 'report' sin ticket
    if (menu === 'report') return;
    const m = (menu as MenuKey);
    setActiveMenu(m);
    setHash(m); // 👈 sincroniza URL para que funcione back/forward
  }

  // Al presionar "Hacer reporte" cambiamos a la pantalla dedicada
  function onReport(ticket: UITicket) {
    setReportTicket(ticket);
    setActiveMenu('report');
    setHash('report'); // 👈 hash navegable
  }

  function onReportClosedOk() {
    setReportTicket(null);
    setActiveMenu('tickets'); // vuelve a tickets
    setHash('tickets');       // 👈 navegable
    setRefreshKey((x) => x + 1); // refresca lista
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className={styles.app}>
      <Header onMenuClick={onMenuClick} activeMenu={activeMenu} onLogout={handleLogout} />

      <div className={styles.mainContent}>
        <div className={styles.content}>
          {activeMenu === 'tickets'  && <TicketsPage  onReport={onReport} refreshKey={refreshKey} />}
          {activeMenu === 'urgentes' && <UrgentesPage onReport={onReport} refreshKey={refreshKey} />}
          {activeMenu === 'history'  && <HistoryPage />}
          {activeMenu === 'profile'  && null /* (lo tenías quitado del sidebar) */}

          {activeMenu === 'report' && reportTicket && (
            <ReportPage
              ticket={reportTicket}
              onBack={() => { setReportTicket(null); setActiveMenu('tickets'); setHash('tickets'); }}
              onOk={onReportClosedOk}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
