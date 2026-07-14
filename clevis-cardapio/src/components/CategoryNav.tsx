import React from 'react';

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
    <section className="categories-nav">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </section>
  );
};