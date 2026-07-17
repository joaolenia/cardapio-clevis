import React, { useRef, useEffect } from 'react';
import type { Category } from '../data/products';
import styles from './CategoryNav.module.css';

interface CategoryNavProps {
  categories: Category[]; 
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onSelectCategory }) => {
  const scrollRef = useRef<HTMLElement>(null);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directionRef = useRef<1 | -1>(1); // 1 = Direita, -1 = Esquerda

  // Animação Mágica de Auto-Scroll
  useEffect(() => {
    let animationFrameId: number;

    const autoScroll = () => {
      if (!isPausedRef.current && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Se bateu no limite direito, inverte para a esquerda
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          directionRef.current = -1;
        } 
        // Se bateu no limite esquerdo, inverte para a direita
        else if (scrollLeft <= 0) {
          directionRef.current = 1;
        }

        // Velocidade suave (0.5 pixels por frame)
        scrollRef.current.scrollLeft += 0.5 * directionRef.current;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Pausa a animação quando o usuário interagir
  const pauseAutoScroll = () => {
    isPausedRef.current = true;
    
    // Limpa o tempo anterior se ele continuar mexendo
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Volta a rolar sozinho após 3 segundos de inatividade
    timeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 3000);
  };

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    onSelectCategory(id);
    pauseAutoScroll();
    
    // Centraliza o botão clicado
    e.currentTarget.scrollIntoView({ 
      behavior: 'smooth', 
      inline: 'center', 
      block: 'nearest' 
    });
  };

  return (
    <section 
      ref={scrollRef}
      className={styles.categoriesNav}
      onMouseEnter={pauseAutoScroll}
      onTouchStart={pauseAutoScroll}
      onWheel={pauseAutoScroll}
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.catBtn} ${activeCategory === cat.id ? styles.active : ''}`}
          onClick={(e) => handleSelect(e, cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </section>
  );
};