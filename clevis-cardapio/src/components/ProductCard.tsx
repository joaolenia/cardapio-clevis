import React, { useState, useEffect } from 'react';
import { getStoredAdditions } from '../data/products';
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
  const [dynamicAdditions, setDynamicAdditions] = useState<CustomizationOption[]>([]);

  // CORREÇÃO: Carrega os adicionais de forma assíncrona para evitar travar a tela
  useEffect(() => {
    const loadAdditions = async () => {
      if (showModal) {
        const allAdditions = await getStoredAdditions();
        if (Array.isArray(allAdditions)) {
          const filtered = allAdditions.filter(a => a.categoryLinked === product.category);
          setDynamicAdditions(filtered);
        }
      }
    };
    loadAdditions();
  }, [showModal, product.category]);

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

  const currentPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;

  return (
    <>
      <div className={styles.productCard} onClick={() => product.allowCustomization && setShowModal(true)}>
        <div className={styles.productImageContainer}>
          <img src={product.image} alt={product.name} className={styles.productImg} />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          {product.desc && <p className={styles.productDesc}>{product.desc}</p>}
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
              <div className={styles.priceContainer}>
                {product.isPromo && <span className={styles.oldCardPrice}>R$ {product.price.toFixed(2).replace('.', ',')}</span>}
                <span className={styles.productPrice}>R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <button className={styles.addToCartBtn} onClick={handleAddSimple}>
              Add
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.customModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalProdTitle}>{product.name}</h2>
                <p className={styles.modalProdPrice}>R$ {currentPrice.toFixed(2).replace('.', ',')}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className={styles.modalBodyScroll}>
              {dynamicAdditions.length > 0 && (
                <div className={styles.customizationSection}>
                  <h3>Adicionais</h3>
                  <div className={styles.additionsList}>
                    {dynamicAdditions.map((add) => {
                      const isChecked = !!selectedAdditions.find(item => item.id === add.id);
                      return (
                        <div key={add.id} className={styles.additionItem} onClick={() => toggleAddition(add)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{add.name}</span>
                          </div>
                          <span className={styles.addPrice}>+ R$ {add.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={styles.customizationSection}>
                <h3>Observacoes</h3>
                <textarea 
                  className={styles.customNotesInput} 
                  placeholder="Ex: Sem cebola, bem passado..." 
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
                Confirmar • R$ {((currentPrice + selectedAdditions.reduce((acc, a) => acc + a.price, 0)) * quantity).toFixed(2).replace('.', ',')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};