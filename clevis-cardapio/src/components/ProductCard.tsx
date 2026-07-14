import React, { useState } from 'react';
import { ADICIONAIS_LANCHES } from '../data/products';
import type { Product, CustomizationOption } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

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
      <div className={styles.productCard} onClick={() => product.allowCustomization && setShowModal(true)}>
        <div className={styles.productImageContainer}>
          <img src={product.image} alt={product.name} className={styles.productImg} />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productDesc}>{product.desc}</p>
          <div className={styles.productMeta}>
            {product.isVariable && product.options ? (
              <select
                className={styles.productVariantSelect}
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
              <span className={styles.productPrice}>R$ {product.price.toFixed(2).replace('.', ',')}</span>
            )}
            <button className={styles.addToCartBtn} onClick={handleAddSimple}>
              <i className="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.customModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeaderImg} style={{ backgroundImage: `url(${product.image})` }}>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className={styles.modalBodyScroll}>
              <h2 className={styles.modalProdTitle}>{product.name}</h2>
              <p className={styles.modalProdDesc}>{product.desc}</p>
              
              <div className={styles.customizationSection}>
                <h3>Adicionais deliciosos</h3>
                <p className={styles.sectionSubtitle}>Adicione um toque extra no seu pedido</p>
                
                <div className={styles.additionsList}>
                  {ADICIONAIS_LANCHES.map((add) => {
                    const isChecked = !!selectedAdditions.find(item => item.id === add.id);
                    return (
                      <div key={add.id} className={styles.additionItem} onClick={() => toggleAddition(add)}>
                        <div className={styles.addLabel}>
                          <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                            {isChecked && <i className="fa-solid fa-check"></i>}
                          </span>
                          <span>{add.name}</span>
                        </div>
                        <span className={styles.addPrice}>+ R$ {add.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.customizationSection}>
                <h3>Observações</h3>
                <textarea 
                  className={styles.customNotesInput} 
                  placeholder="Ex: Tirar cebola, maionese à parte, bem passado..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={140}
                />
              </div>
            </div>

            <div className={styles.modalFooterSticky}>
              <div className={styles.qtyPicker}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button className={styles.btnAddModal} onClick={handleAddCustomized}>
                Confirmar • R$ {((product.price + selectedAdditions.reduce((acc, a) => acc + a.price, 0)) * quantity).toFixed(2).replace('.', ',')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};