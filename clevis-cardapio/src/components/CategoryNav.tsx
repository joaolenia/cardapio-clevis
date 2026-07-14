import React from 'react';
import styles from './CategoryNav.module.css';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onSelectCategory }) => {
  const categories = [
    { id: 'lanches', label: 'Lanches' },
    { id: 'combos', label: 'Combos' },
    { id: 'tabuas', label: 'Tábuas' },
    { id: 'pasteis', label: 'Pastéis' },
    { id: 'porcoes', label: 'Porções' },
    { id: 'chuleta', label: 'Chuleta' },
    { id: 'bebidas', label: 'Bebidas' }
  ];

  return (
    <section className={styles.categoriesNav}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.catBtn} ${activeCategory === cat.id ? styles.active : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </section>
  );
};