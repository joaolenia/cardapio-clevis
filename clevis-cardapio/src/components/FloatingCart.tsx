import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './FloatingCart.module.css';

interface FloatingCartProps {
  onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onClick }) => {
  const { cart } = useCart();

  if (cart.length === 0) return null;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className={`${styles.cartFloatingBtn} ${styles.visible}`} onClick={onClick}>
      <div className={styles.floatBtnContent}>
        <div className={styles.cartIconWrapper}>
          <i className="fa-solid fa-basket-shopping"></i>
          <span className={styles.cartCount}>{totalQuantity}</span>
        </div>
        <span>Ver Sacola</span>
        <span className={styles.floatTotal}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  );
};