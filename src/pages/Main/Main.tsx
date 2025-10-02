import React from 'react';
import styles from './Main.module.scss';
import presentacionImg from './presentacion-img.jpg'; 

const Main: React.FC = () => {
  return (
    <div 
      className={styles.mainContainer}
      style={{ backgroundImage: `url(${presentacionImg})` }}
    >
      <div className={styles.mainContent}>
        <div className={styles.welcomeText}>
          <h1>Bienvenido al Nuevo Sistema de Telmex Connection</h1>
          <p>Gestión eficiente de tickets y reportes para servicios técnicos</p>
        </div>
      </div>
    </div>
  );
};

export default Main;