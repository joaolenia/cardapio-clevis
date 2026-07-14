import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

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
      <div className={`cart-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Sua Sacola</h3>
          <button className="close-cart" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart-msg">
              <i className="fa-solid fa-bag-shopping"></i>
              <p>Sua sacola está vazia</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="cart-item">
                <div className="item-details">
                  <span className="item-name">
                    {item.name} {item.selectedVariantName ? `(${item.selectedVariantName})` : ''}
                  </span>
                  
                  {item.selectedAdditions.map(add => (
                    <span key={add.id} className="item-sub-desc">+ {add.name}</span>
                  ))}
                  
                  {item.notes && <span className="item-notes">Obs: "{item.notes}"</span>}
                  
                  <span className="item-price">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="qty-selector">
                  <button onClick={() => changeQuantity(item.cartItemId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.cartItemId, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="delivery-form">
              <h4>Como deseja seu pedido?</h4>
              <div className="delivery-option-group">
                <button
                  type="button"
                  className={`option-btn ${deliveryType === 'Entrega' ? 'active' : ''}`}
                  onClick={() => setDeliveryType('Entrega')}
                >
                  <i className="fa-solid fa-motorcycle"></i> Entrega
                </button>
                <button
                  type="button"
                  className={`option-btn ${deliveryType === 'Retirada' ? 'active' : ''}`}
                  onClick={() => setDeliveryType('Retirada')}
                >
                  <i className="fa-solid fa-store"></i> Retirada
                </button>
              </div>

              <h4>Dados do Cliente</h4>
              <input
                type="text"
                placeholder="Seu Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {deliveryType === 'Entrega' && (
                <input
                  type="text"
                  placeholder="Endereço (Rua, Número, Bairro)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              )}

              <h4>Forma de Pagamento</h4>
              <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <hr className="divider" />

            <div className="cart-summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {deliveryType === 'Entrega' && (
                <div className="summary-line delivery">
                  <span>Taxa de Entrega</span>
                  <span>A combinar</span>
                </div>
              )}
              <div className="summary-line total">
                <span>Total</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button className="btn-checkout" onClick={handleSendOrder}>
              <i className="fa-brands fa-whatsapp"></i> Enviar Pedido via WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
};