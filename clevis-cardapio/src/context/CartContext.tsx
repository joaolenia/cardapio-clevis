import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CustomizationOption } from '../data/products';

export interface CartItem {
  id: string; 
  product: Product;
  quantity: number;
  selectedVariant?: number;
  selectedAdditions: CustomizationOption[];
  notes: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product, 
    quantity: number, 
    selectedVariant?: number, 
    selectedAdditions?: CustomizationOption[], 
    notes?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('clevis_cart');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('clevis_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product, 
    quantity: number, 
    selectedVariant?: number, 
    selectedAdditions: CustomizationOption[] = [], 
    notes: string = ''
  ) => {
    const itemUniqueId = `${product.id}-${selectedVariant ?? 'base'}-${selectedAdditions.map(a => a.id).sort().join('-')}-${notes}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === itemUniqueId);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prevCart, {
        id: itemUniqueId,
        product,
        quantity,
        selectedVariant,
        selectedAdditions,
        notes
      }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // CORREÇÃO: Pega o preço correto considerando a promoção ou a variante
      let basePrice = item.product.isPromo && item.product.promoPrice 
        ? item.product.promoPrice 
        : item.product.price;

      if (item.selectedVariant !== undefined && item.product.options) {
        basePrice = item.product.options[item.selectedVariant].price;
      }

      const additionsPrice = item.selectedAdditions.reduce((sum, a) => sum + a.price, 0);
      return total + (basePrice + additionsPrice) * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado sob um CartProvider');
  return context;
};