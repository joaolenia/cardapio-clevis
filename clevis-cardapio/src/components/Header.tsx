import React from 'react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  return (
    <header className={styles.hero}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1 className={styles.brandTitle}>CLEVI'S</h1>
        <p className={styles.brandSubtitle}>
          <span>LANCHES</span> • <span>SUSHI</span> • <span>SORVETES</span> • <span>CHOPP</span>
        </p>
        <div className={styles.shopInfo}>
          <span className={styles.statusBadge}>
            <i className="fa-solid fa-circle"></i> Aberto Agora
          </span>
          <span className={styles.deliveryTime}>
            <i className="fa-solid fa-clock"></i> 40-50 min
          </span>
        </div>
      </div>
    </header>
  );
};