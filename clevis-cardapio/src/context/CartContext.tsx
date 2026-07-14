import React, { createContext, useContext, useState } from 'react';
import type { Product, CustomizationOption } from '../data/products';

export interface CartItem {
  cartItemId: string; // ID único que combina ID + opcionais
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedVariantName?: string;
  selectedAdditions: CustomizationOption[];
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product, 
    quantity: number, 
    variantIndex?: number, 
    additions?: CustomizationOption[], 
    notes?: string
  ) => void;
  changeQuantity: (cartItemId: string, amount: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    product: Product,
    quantity: number,
    variantIndex?: number,
    additions: CustomizationOption[] = [],
    notes: string = ''
  ) => {
    setCart((prev) => {
      let basePrice = product.price;
      let variantName = '';

      if (product.isVariable && product.options && variantIndex !== undefined) {
        const variant = product.options[variantIndex];
        basePrice = variant.price;
        variantName = variant.name;
      }

      // Calcula custo extra de opcionais
      const additionsPrice = additions.reduce((acc, opt) => acc + opt.price, 0);
      const finalItemPrice = basePrice + additionsPrice;

      // Cria chave hash para identificar itens perfeitamente iguais e mesclá-los se idênticos
      const additionsHash = additions.map((a) => a.id).sort().join('-');
      const cartItemId = `${product.id}-${variantIndex ?? 'default'}-${additionsHash}-${notes.replace(/\s/g, '')}`;

      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId,
          id: product.id,
          name: product.name,
          price: finalItemPrice,
          quantity,
          selectedVariantName: variantName || undefined,
          selectedAdditions: additions,
          notes: notes.trim() || undefined,
        },
      ];
    });
  };

  const changeQuantity = (cartItemId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
};