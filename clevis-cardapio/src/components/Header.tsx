import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import { getStoreConfiguration } from '../data/products';
import type { StoreConfig } from '../data/products';

export const Header: React.FC = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const storeData = await getStoreConfiguration();
      if (storeData) {
        setConfig(storeData);
      }
    };
    loadConfig();
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        {/* Título com animação de destaque */}
        
        <div className={styles.shopInfo}>
          {config ? (
            <>
              {/* Badge de Status Elegante */}
              <div className={`${styles.statusBadge} ${!config.aberto ? styles.closed : ''}`}>
                <span className={styles.dot}></span> 
                {config.aberto ? 'Aberto Agora' : 'Fechado no momento'}
              </div>
              
              {config.aberto && ( 
                <div className=""></div>
                // Voltar o tempo de entrega, só descomentar o código abaixo e remover a div vazia acima
                // <div className={styles.deliveryInfo}>
                //   <i className="fa-solid fa-clock"></i> {config.entrega} min
                // </div>
              )}
            </>
          ) : (
            <span className={styles.loading}>Carregando...</span>
          )}
        </div>
      </div>
    </header>
  );
};