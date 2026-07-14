import React, { useState } from 'react';
// CORRIGIDO: Separamos o valor real (ADICIONAIS_LANCHES) dos tipos de dados
import { ADICIONAIS_LANCHES } from '../data/products';
import type { Product, CustomizationOption } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdditions, setSelectedAdditions] = useState<CustomizationOption[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddSimple = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.allowCustomization) {
      setShowModal(true);
    } else if (product.isVariable) {
      addToCart(product, 1, selectedVariant);
    } else {
      addToCart(product, 1);
    }
  };

  const handleAddCustomized = () => {
    addToCart(product, quantity, product.isVariable ? selectedVariant : undefined, selectedAdditions, notes);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedAdditions([]);
    setNotes('');
    setQuantity(1);
  };

  const toggleAddition = (addition: CustomizationOption) => {
    setSelectedAdditions(prev => 
      prev.find(item => item.id === addition.id)
        ? prev.filter(item => item.id !== addition.id)
        : [...prev, addition]
    );
  };

  return (
    <>
      <div className="product-card" onClick={() => product.allowCustomization && setShowModal(true)}>
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-img" />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">{product.desc}</p>
          <div className="product-meta">
            {product.isVariable && product.options ? (
              <select
                className="product-variant-select"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              >
                {product.options.map((opt, idx) => (
                  <option key={idx} value={idx}>
                    {opt.name} - R$ {opt.price.toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            ) : (
              <span className="product-price">R$ {product.price.toFixed(2).replace('.', ',')}</span>
            )}
            <button className="add-to-cart-btn" onClick={handleAddSimple}>
              <i className="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>

      {/* Modal Customizador de Lanches e Adicionais */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-img" style={{ backgroundImage: `url(${product.image})` }}>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="modal-body-scroll">
              <h2 className="modal-prod-title">{product.name}</h2>
              <p className="modal-prod-desc">{product.desc}</p>
              
              <div className="customization-section">
                <h3>Adicionais deliciosos</h3>
                <p className="section-subtitle">Adicione um toque extra no seu pedido</p>
                
                <div className="additions-list">
                  {ADICIONAIS_LANCHES.map((add) => {
                    const isChecked = !!selectedAdditions.find(item => item.id === add.id);
                    return (
                      <div key={add.id} className="addition-item" onClick={() => toggleAddition(add)}>
                        <div className="add-label">
                          <span className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && <i className="fa-solid fa-check"></i>}
                          </span>
                          <span>{add.name}</span>
                        </div>
                        <span className="add-price">+ R$ {add.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="customization-section">
                <h3>Observações</h3>
                <textarea 
                  className="custom-notes-input" 
                  placeholder="Ex: Tirar cebola, maionese à parte, bem passado..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={140}
                />
              </div>
            </div>

            <div className="modal-footer-sticky">
              <div className="qty-picker">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button className="btn-add-modal" onClick={handleAddCustomized}>
                Confirmar • R$ {((product.price + selectedAdditions.reduce((acc, a) => acc + a.price, 0)) * quantity).toFixed(2).replace('.', ',')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};