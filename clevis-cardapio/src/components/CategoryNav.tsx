import React from 'react';
import type { Category } from '../data/products';
import styles from './CategoryNav.module.css';

interface CategoryNavProps {
  categories: Category[]; // Modificado para receber do banco dinamicamente
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}
export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onSelectCategory }) => {

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