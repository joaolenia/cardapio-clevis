import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState(''); // Novo estado para o nome do cliente
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  const overlayClass = isOpen ? `${styles.cartSidebarOverlay} ${styles.open}` : styles.cartSidebarOverlay;
  const sidebarClass = isOpen ? `${styles.cartSidebar} ${styles.open}` : styles.cartSidebar;

  // Função para gerenciar a diminuição ou remoção automática do item
  const handleDecreaseQuantity = (itemId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleCheckout = () => {
    // Validação obrigatória do Nome (independente se é Retirada ou Entrega)
    if (!customerName.trim()) {
      alert('Por favor, informe o seu Nome.');
      return;
    }

    // Validação do Endereço apenas se for Entrega
    if (deliveryType === 'delivery' && !address.trim()) {
      alert('Por favor, informe o endereço para entrega.');
      return;
    }

    const orderItemsText = cart.map(item => {
      let currentPrice = item.product.isPromo && item.product.promoPrice 
        ? item.product.promoPrice 
        : item.product.price;

      if (item.selectedVariant !== undefined && item.product.options) {
        currentPrice = item.product.options[item.selectedVariant].price;
      }

      const additionsText = item.selectedAdditions.length > 0 
        ? `\n   + Adicionais: ${item.selectedAdditions.map(a => `${a.name} (+R$ ${a.price.toFixed(2)})`).join(', ')}`
        : '';

      const notesText = item.notes ? `\n   + Obs: ${item.notes}` : '';

      return `*${item.quantity}x ${item.product.name}* (R$ ${currentPrice.toFixed(2).replace('.', ',')})${additionsText}${notesText}`;
    }).join('\n\n');

    const subtotal = getCartTotal();
    const deliveryFeeText = deliveryType === 'delivery' ? 'A combinar' : 'R$ 0,00';
    const totalText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    const message = encodeURIComponent(
      `*Novo Pedido - Clevi's*\n\n` +
      `*Cliente:* ${customerName.trim()}\n` + // Adicionado no texto do WhatsApp
      `--------------------------------\n` +
      `${orderItemsText}\n\n` +
      `--------------------------------\n` +
      `*Tipo:* ${deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}\n` +
      `*Forma de Pagamento:* ${paymentMethod}\n` +
      (deliveryType === 'delivery' ? `*Endereço:* ${address}\n` : '') +
      `*Taxa de Entrega:* ${deliveryFeeText}\n` +
      `*Total Geral:* ${totalText}`
    );

    const whatsappUrl = `https://wa.me/5542998748652?text=${message}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    setCustomerName(''); // Reseta o nome após o fechamento
    setAddress('');      // Reseta o endereço após o fechamento
    onClose();
  };

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={sidebarClass} onClick={e => e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h3>Sua Sacola</h3>
          <button className={styles.closeCart} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCartMsg}>
              <i className="fa-solid fa-basket-shopping"></i>
              <p>Sua sacola está vazia...</p>
            </div>
          ) : (
            cart.map((item) => {
              let itemBasePrice = item.product.isPromo && item.product.promoPrice 
                ? item.product.promoPrice 
                : item.product.price;

              if (item.selectedVariant !== undefined && item.product.options) {
                itemBasePrice = item.product.options[item.selectedVariant].price;
              }

              const additionsSum = item.selectedAdditions.reduce((acc, a) => acc + a.price, 0);
              const totalLinePrice = (itemBasePrice + additionsSum) * item.quantity;

              return (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemPrice}>
                      R$ {totalLinePrice.toFixed(2).replace('.', ',')}
                    </span>
                    {item.selectedAdditions.length > 0 && (
                      <span className={styles.itemSubDesc}>
                        + {item.selectedAdditions.map(a => a.name).join(', ')}
                      </span>
                    )}
                    {item.notes && <span className={styles.itemNotes}>{item.notes}</span>}
                  </div>

                  <div className={styles.qtySelector}>
                    <button onClick={() => handleDecreaseQuantity(item.id, item.quantity)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.deliveryOptionGroup}>
              <button 
                className={`${styles.optionBtn} ${deliveryType === 'delivery' ? styles.active : ''}`}
                onClick={() => setDeliveryType('delivery')}
              >
                Entrega
              </button>
              <button 
                className={`${styles.optionBtn} ${deliveryType === 'pickup' ? styles.active : ''}`}
                onClick={() => setDeliveryType('pickup')}
              >
                Retirada
              </button>
            </div>

            <div className={styles.deliveryForm}>
              <h4>Dados do Cliente</h4>
              {/* Campo do nome sempre visível e obrigatório para entrega ou retirada */}
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                placeholder="Seu Nome completo *" 
                required 
                style={{ marginBottom: '12px' }}
              />

              {deliveryType === 'delivery' && (
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Endereço (Rua, Número, Bairro) *" 
                  required 
                />
              )}

              <h4 style={{ marginTop: '16px' }}>Forma de Pagamento</h4>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>

            <hr className={styles.divider} />

            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Taxa de Entrega</span>
              <span>{deliveryType === 'delivery' ? 'A combinar' : 'Grátis'}</span>
            </div>
            <div className={`${styles.summaryLine} ${styles.total}`}>
              <span>Total</span>
              <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
            </div>

            <button className={styles.btnCheckout} onClick={handleCheckout}>
              Enviar Pedido via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};