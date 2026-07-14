import React from 'react';
import type { Product } from '../data/products';
import styles from './PromoBanner.module.css';

interface PromoBannerProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ products, onOpenProduct }) => {
  const promoItems = products.filter(p => p.isPromo && p.disponivel !== false);

  if (promoItems.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}><i className="fa-solid fa-fire"></i> PROMOÇÕES DO DIA</h3>
      <div className={styles.scrollGrid}>
        {promoItems.map(p => (
          <div key={p.id} className={styles.promoCard} onClick={() => onOpenProduct(p)}>
            <div className={styles.badge}>OFERTA</div>
            <img src={p.image} alt={p.name} className={styles.img} />
            <div className={styles.info}>
              <h4>{p.name}</h4>
              <div className={styles.priceRow}>
                <span className={styles.oldPrice}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
                <span className={styles.newPrice}>R$ {p.promoPrice?.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};