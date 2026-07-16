import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './FloatingCart.module.css';

interface FloatingCartProps {
  onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onClick }) => {
  // Importamos getCartTotal que já calcula preços normais, promocionais e adicionais corretamente
  const { cart, getCartTotal } = useCart();

  if (cart.length === 0) return null;

  // Calcula o total de itens somando a quantidade de cada um
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getCartTotal();

  return (
    <div className={`${styles.cartFloatingBtn} ${styles.visible}`} onClick={onClick}>
      <div className={styles.floatBtnContent}>
        <div className={styles.cartIconWrapper}>
          <i className="fa-solid fa-basket-shopping"></i>
          <span className={styles.cartCount}>{totalQuantity}</span>
        </div>
        <span>Ver Pedido</span>
        <span className={styles.floatTotal}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  );
};

export default FloatingCart;