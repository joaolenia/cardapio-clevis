import React from 'react';
import { useCart } from '../context/CartContext';

interface FloatingCartProps {
  onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onClick }) => {
  const { cart } = useCart();

  if (cart.length === 0) return null;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-floating-btn visible" onClick={onClick}>
      <div className="float-btn-content">
        <div className="cart-icon-wrapper">
          <i className="fa-solid fa-basket-shopping"></i>
          <span className="cart-count">{totalQuantity}</span>
        </div>
        <span>Ver Sacola</span>
        <span className="float-total">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  );
};