import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Bairros fictícios com suas respectivas taxas
const NEIGHBORHOODS = [
  { id: '', name: 'Selecione seu Bairro...', fee: 0 },
  { id: 'centro', name: 'Centro', fee: 4.00 },
  { id: 'bairro1', name: 'Jardim Botânico', fee: 6.50 },
  { id: 'bairro2', name: 'Vila Nova', fee: 7.00 },
  { id: 'bairro3', name: 'Bela Vista', fee: 8.00 },
  { id: 'bairro4', name: 'Alto da Boa Vista', fee: 10.00 },
  { id: 'bairro5', name: 'São Domingos', fee: 5.50 },
  { id: 'bairro6', name: 'Parque das Águas', fee: 9.00 },
  { id: 'bairro7', name: 'Morumbi', fee: 12.00 },
  { id: 'bairro8', name: 'Jardim das Rosas', fee: 6.00 },
  { id: 'bairro9', name: 'São José', fee: 8.50 },
];

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  
  // Estados Gerais
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [streetAndNumber, setStreetAndNumber] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  // Estados dos Modais
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [needsChange, setNeedsChange] = useState<boolean | null>(null);
  const [changeAmount, setChangeAmount] = useState('');

  const overlayClass = isOpen ? `${styles.cartSidebarOverlay} ${styles.open}` : styles.cartSidebarOverlay;
  const sidebarClass = isOpen ? `${styles.cartSidebar} ${styles.open}` : styles.cartSidebar;

  // Cálculo de Subtotal e Taxas
  const currentFee = deliveryType === 'delivery' 
    ? NEIGHBORHOODS.find(n => n.name === selectedNeighborhood)?.fee || 0 
    : 0;

  const subtotal = getCartTotal();
  const finalTotal = subtotal + currentFee;

  // Lógica de Diminuir/Excluir
  const handleDecreaseQuantity = (itemId: string, currentQty: number) => {
    if (currentQty <= 1) {
      setItemToDelete(itemId); // Abre o modal de confirmação
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  // Lógica de Pagamento
  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === 'Dinheiro') {
      setShowChangeModal(true);
      setNeedsChange(null);
      setChangeAmount('');
    } else {
      setNeedsChange(null);
      setChangeAmount('');
    }
  };

  const handleConfirmChange = () => {
    if (needsChange) {
      if (!changeAmount) {
        alert("Por favor, informe para quanto precisa de troco.");
        return;
      }
      const amount = parseFloat(changeAmount.replace(',', '.'));
      if (isNaN(amount) || amount < finalTotal) {
        alert(`O valor para troco deve ser maior ou igual ao total do pedido (R$ ${finalTotal.toFixed(2).replace('.', ',')}).`);
        return;
      }
    }
    setShowChangeModal(false);
  };

  // Finalização do Pedido
  const handleCheckout = () => {
    if (!customerName.trim()) return alert('Por favor, informe o seu Nome.');
    
    if (deliveryType === 'delivery') {
      if (!selectedNeighborhood) return alert('Por favor, selecione um Bairro.');
      if (!streetAndNumber.trim()) return alert('Por favor, informe Rua e Número.');
    }

    if (paymentMethod === 'Dinheiro') {
      if (needsChange === null) {
        setShowChangeModal(true);
        return;
      }
      if (needsChange) {
        const amount = parseFloat(changeAmount.replace(',', '.'));
        if (isNaN(amount) || amount < finalTotal) {
          alert(`O valor do troco (R$ ${amount.toFixed(2)}) é menor que o total (R$ ${finalTotal.toFixed(2)}). Ajuste o valor.`);
          setShowChangeModal(true);
          return;
        }
      }
    }

    const orderItemsText = cart.map(item => {
      let basePrice = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.price;
      if (item.selectedVariant !== undefined && item.product.options) {
        basePrice = item.product.options[item.selectedVariant].price;
      }
      const additionsSum = item.selectedAdditions.reduce((acc, a) => acc + a.price, 0);
      const totalLinePrice = (basePrice + additionsSum) * item.quantity;

      const variantText = item.selectedVariant !== undefined && item.product.options 
        ? ` (${item.product.options[item.selectedVariant].name})` 
        : '';

      const additionsText = item.selectedAdditions.length > 0 
        ? `\n   ↳ Adicionais: ${item.selectedAdditions.map(a => a.name).join(', ')}`
        : '';

      const notesText = item.notes ? `\n   ↳ *Obs:* ${item.notes}` : '';

      return `🔸 *${item.quantity}x ${item.product.name}*${variantText} - R$ ${totalLinePrice.toFixed(2).replace('.', ',')}${additionsText}${notesText}`;
    }).join('\n\n');

    let addressText = '';
    if (deliveryType === 'delivery') {
      addressText = `*Endereço:* ${streetAndNumber}\n*Bairro:* ${selectedNeighborhood}\n`;
    }

    // Bloco inteligente de Pagamento e Cálculo do Troco
    let paymentText = '';
    if (paymentMethod === 'Dinheiro') {
      if (needsChange) {
        const amount = parseFloat(changeAmount.replace(',', '.'));
        const calcChange = amount - finalTotal;
        paymentText = `*PAGAMENTO:* Dinheiro\n*Troco para:* R$ ${amount.toFixed(2).replace('.', ',')}\n*Levar de troco:* R$ ${calcChange.toFixed(2).replace('.', ',')}`;
      } else {
        paymentText = `*PAGAMENTO:* Dinheiro (Não precisa de troco)`;
      }
    } else {
      paymentText = `*PAGAMENTO:* ${paymentMethod}`;
    }

    const message = encodeURIComponent(
      `🛒 *NOVO PEDIDO - CLEVI'S* 🛒\n\n` +
      `*Cliente:* ${customerName.trim()}\n` +
      `*Tipo:* ${deliveryType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏪'}\n` +
      `${addressText}` +
      `--------------------------------\n` +
      `*RESUMO DO PEDIDO:*\n\n` +
      `${orderItemsText}\n\n` +
      `--------------------------------\n` +
      `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n` +
      `*Taxa de Entrega:* ${deliveryType === 'delivery' ? `R$ ${currentFee.toFixed(2).replace('.', ',')}` : 'Grátis'}\n` +
      `*TOTAL A PAGAR:* *R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n` +
      `--------------------------------\n` +
      `${paymentText}`
    );

    window.open(`https://wa.me/5542998748652?text=${message}`, '_blank');
    
    clearCart();
    setCustomerName('');
    setStreetAndNumber('');
    setSelectedNeighborhood('');
    setPaymentMethod('Pix');
    setNeedsChange(null);
    setChangeAmount('');
    onClose();
  };

  return (
    <>
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
                let itemBasePrice = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.price;
                if (item.selectedVariant !== undefined && item.product.options) {
                  itemBasePrice = item.product.options[item.selectedVariant].price;
                }
                const additionsSum = item.selectedAdditions.reduce((acc, a) => acc + a.price, 0);
                const totalLinePrice = (itemBasePrice + additionsSum) * item.quantity;

                return (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>
                        {item.product.name} {item.selectedVariant !== undefined && item.product.options ? `(${item.product.options[item.selectedVariant].name})` : ''}
                      </span>
                      <span className={styles.itemPrice}>R$ {totalLinePrice.toFixed(2).replace('.', ',')}</span>
                      {item.selectedAdditions.length > 0 && (
                        <span className={styles.itemSubDesc}>+ {item.selectedAdditions.map(a => a.name).join(', ')}</span>
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
                <button className={`${styles.optionBtn} ${deliveryType === 'delivery' ? styles.active : ''}`} onClick={() => setDeliveryType('delivery')}>
                  Entrega
                </button>
                <button className={`${styles.optionBtn} ${deliveryType === 'pickup' ? styles.active : ''}`} onClick={() => setDeliveryType('pickup')}>
                  Retirada
                </button>
              </div>

              <div className={styles.deliveryForm}>
                <h4>Dados do Cliente</h4>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Seu Nome completo *" required style={{ marginBottom: '12px' }} />

                {deliveryType === 'delivery' && (
                  <>
                    <select value={selectedNeighborhood} onChange={e => setSelectedNeighborhood(e.target.value)} style={{ marginBottom: '8px' }}>
                      {NEIGHBORHOODS.map(n => (
                        <option key={n.id} value={n.name} disabled={n.id === ''}>{n.name} {n.fee > 0 ? `(+R$ ${n.fee.toFixed(2).replace('.', ',')})` : ''}</option>
                      ))}
                    </select>
                    <input type="text" value={streetAndNumber} onChange={e => setStreetAndNumber(e.target.value)} placeholder="Rua e Número *" required />
                  </>
                )}

                <h4 style={{ marginTop: '16px' }}>Forma de Pagamento</h4>
                <select value={paymentMethod} onChange={handlePaymentChange}>
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                </select>
                
                {/* Mostra resumo do troco se for dinheiro */}
                {paymentMethod === 'Dinheiro' && needsChange !== null && (
                  <div className={styles.changeSummary} onClick={() => setShowChangeModal(true)}>
                    <span>{needsChange ? `Troco para: R$ ${changeAmount}` : 'Não precisa de troco'}</span>
                    <i className="fa-solid fa-pen"></i>
                  </div>
                )}
              </div>

              <hr className={styles.divider} />

              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Taxa de Entrega</span>
                <span>{deliveryType === 'pickup' ? 'Grátis' : (selectedNeighborhood ? `R$ ${currentFee.toFixed(2).replace('.', ',')}` : 'A combinar')}</span>
              </div>
              <div className={`${styles.summaryLine} ${styles.total}`}>
                <span>Total</span>
                <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
              </div>

              <button className={styles.btnCheckout} onClick={handleCheckout}>
                Enviar Pedido via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemToDelete && (
        <div className={styles.popupOverlay} onClick={() => setItemToDelete(null)}>
          <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
            <h3>Remover item?</h3>
            <p>Deseja remover este item da sua sacola?</p>
            <div className={styles.popupButtons}>
              <button className={styles.btnCancel} onClick={() => setItemToDelete(null)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={confirmDelete}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TROCO (DINHEIRO) */}
      {showChangeModal && (
        <div className={styles.popupOverlay} onClick={() => { if (needsChange !== null) setShowChangeModal(false); }}>
          <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
            <h3>Pagamento em Dinheiro</h3>
            {!needsChange ? (
              <>
                <p>Você vai precisar de troco para o entregador?</p>
                <div className={styles.popupButtons}>
                  <button className={styles.btnCancel} onClick={() => { setNeedsChange(false); setShowChangeModal(false); }}>Não</button>
                  <button className={styles.btnConfirm} onClick={() => setNeedsChange(true)}>Sim</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '10px' }}>Total do pedido: <strong>R$ {finalTotal.toFixed(2).replace('.', ',')}</strong></p>
                <p>Troco para quanto?</p>
                <input 
                  type="number" 
                  className={styles.changeInput}
                  placeholder="Ex: 50, 100..." 
                  value={changeAmount} 
                  onChange={e => setChangeAmount(e.target.value)} 
                  autoFocus
                />
                <div className={styles.popupButtons}>
                  <button className={styles.btnCancel} onClick={() => setNeedsChange(null)}>Voltar</button>
                  <button className={styles.btnConfirm} onClick={handleConfirmChange}>Confirmar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};