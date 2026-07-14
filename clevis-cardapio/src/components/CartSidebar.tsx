import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, changeQuantity, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<'Entrega' | 'Retirada'>('Entrega');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Pix');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSendOrder = () => {
    if (!name.trim()) {
      alert('Por favor, insira o seu nome!');
      return;
    }
    if (deliveryType === 'Entrega' && !address.trim()) {
      alert('Por favor, insira o endereço de entrega completo!');
      return;
    }

    let orderText = `*🍔 NOVO PEDIDO - CLEVI'S 🍔*\n\n`;
    orderText += `*Cliente:* ${name}\n`;
    orderText += `*Tipo de Pedido:* ${deliveryType === 'Entrega' ? '🛵 Entrega' : '🏪 Retirada no Local'}\n`;
    
    if (deliveryType === 'Entrega') {
      orderText += `*Endereço:* ${address}\n`;
    }
    
    orderText += `*Pagamento:* ${payment}\n\n`;
    orderText += `*--- ITENS DO PEDIDO ---*\n`;

    cart.forEach(item => {
      const itemSub = item.price * item.quantity;
      let additionsText = '';
      if (item.selectedAdditions.length > 0) {
        additionsText = `   ↳ _Adicionais: ${item.selectedAdditions.map(a => a.name).join(', ')}_\n`;
      }
      let notesText = item.notes ? `   ↳ _Obs: ${item.notes}_\n` : '';

      orderText += `• ${item.quantity}x _${item.name}_ ${item.selectedVariantName ? `(${item.selectedVariantName})` : ''} - (R$ ${itemSub.toFixed(2).replace('.', ',')})\n${additionsText}${notesText}`;
    });

    orderText += `\n*Total do Pedido:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (deliveryType === 'Entrega') {
      orderText += `_Taxa de entrega a combinar no chat_ 🛵`;
    } else {
      orderText += `_Pedido pronto em 30-40 minutos para retirada_ 🏪`;
    }

    const phone = "5542998748652";
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  return (
    <>
      <div className={`${styles.cartSidebarOverlay} ${isOpen ? styles.open : ''}`} onClick={onClose}></div>
      <aside className={`${styles.cartSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.cartHeader}>
          <h3>Sua Sacola</h3>
          <button className={styles.closeCart} onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCartMsg}>
              <i className="fa-solid fa-bag-shopping"></i>
              <p>Sua sacola está vazia</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className={styles.cartItem}>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>
                    {item.name} {item.selectedVariantName ? `(${item.selectedVariantName})` : ''}
                  </span>
                  {item.selectedAdditions.map(add => (
                    <span key={add.id} className={styles.itemSubDesc}>+ {add.name}</span>
                  ))}
                  {item.notes && <span className={styles.itemNotes}>Obs: "{item.notes}"</span>}
                  <span className={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className={styles.qtySelector}>
                  <button onClick={() => changeQuantity(item.cartItemId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.cartItemId, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.deliveryForm}>
              <h4>Como deseja seu pedido?</h4>
              <div className={styles.deliveryOptionGroup}>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${deliveryType === 'Entrega' ? styles.active : ''}`}
                  onClick={() => setDeliveryType('Entrega')}
                >
                  <i className="fa-solid fa-motorcycle"></i> Entrega
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${deliveryType === 'Retirada' ? styles.active : ''}`}
                  onClick={() => setDeliveryType('Retirada')}
                >
                  <i className="fa-solid fa-store"></i> Retirada
                </button>
              </div>

              <h4>Dados do Cliente</h4>
              <input type="text" placeholder="Seu Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              {deliveryType === 'Entrega' && (
                <input type="text" placeholder="Endereço (Rua, Número, Bairro)" value={address} onChange={(e) => setAddress(e.target.value)} required />
              )}

              <h4>Forma de Pagamento</h4>
              <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <hr className={styles.divider} />

            <div className={styles.cartSummary}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {deliveryType === 'Entrega' && (
                <div className={`${styles.summaryLine} ${styles.delivery}`}>
                  <span>Taxa de Entrega</span>
                  <span>A combinar</span>
                </div>
              )}
              <div className={`${styles.summaryLine} ${styles.total}`}>
                <span>Total</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button className={styles.btnCheckout} onClick={handleSendOrder}>
              <i className="fa-brands fa-whatsapp"></i> Enviar Pedido via WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
};