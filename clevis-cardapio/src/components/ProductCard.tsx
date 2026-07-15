import React, { useState, useEffect } from 'react';
import { getStoredAdditions, getStoredFlavors } from '../data/products';
import type { Product, CustomizationOption, FlavorOption } from '../data/products';
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
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorOption[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dynamicAdditions, setDynamicAdditions] = useState<CustomizationOption[]>([]);
  const [dynamicFlavors, setDynamicFlavors] = useState<FlavorOption[]>([]);

  useEffect(() => {
    const loadModalOptions = async () => {
      if (showModal) {
        // Carrega adicionais do banco
        const allAdditions = await getStoredAdditions();
        if (Array.isArray(allAdditions)) {
          const filteredAdds = allAdditions.filter(a => a.categoryLinked === product.category);
          setDynamicAdditions(filteredAdds);
        }

        // Carrega sabores do banco
        const allFlavors = await getStoredFlavors();
        if (Array.isArray(allFlavors)) {
          const filteredFlavs = allFlavors.filter(f => f.categoryLinked === product.category);
          setDynamicFlavors(filteredFlavs);
        }
      }
    };
    loadModalOptions();
  }, [showModal, product.category]);

  const handleAddSimple = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.allowCustomization || dynamicFlavors.length > 0) {
      setShowModal(true);
    } else if (product.isVariable) {
      addToCart(product, 1, selectedVariant);
    } else {
      addToCart(product, 1);
    }
  };

  const handleAddCustomized = () => {
    // Une os sabores escolhidos às anotações de observações para enviar ao carrinho
    let flavorNotes = notes;
    if (selectedFlavors.length > 0) {
      const flavorNames = selectedFlavors.map(f => f.name).join(', ');
      flavorNotes = flavorNotes 
        ? `Sabores: ${flavorNames} | OBS: ${flavorNotes}` 
        : `Sabores: ${flavorNames}`;
    }

    addToCart(product, quantity, product.isVariable ? selectedVariant : undefined, selectedAdditions, flavorNotes);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedAdditions([]);
    setSelectedFlavors([]);
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

  const toggleFlavor = (flavor: FlavorOption) => {
    setSelectedFlavors(prev => 
      prev.find(item => item.id === flavor.id)
        ? prev.filter(item => item.id !== flavor.id)
        : [...prev, flavor]
    );
  };

  const currentPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;

  return (
    <>
      <div className={styles.productCard} onClick={() => setShowModal(true)}>
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
              
              {/* SEÇÃO DE SABORES (MÚLTIPLA SELEÇÃO) */}
              {dynamicFlavors.length > 0 && (
                <div className={styles.customizationSection}>
                  <div className={styles.sectionHeaderFlex}>
                    <h3>Escolha os Sabores</h3>
                    <span className={styles.selectionTip}>Selecione ate meio a meio ou mais</span>
                  </div>
                  <div className={styles.additionsList}>
                    {dynamicFlavors.map((flav) => {
                      const isChecked = !!selectedFlavors.find(item => item.id === flav.id);
                      return (
                        <div key={flav.id} className={styles.additionItem} onClick={() => toggleFlavor(flav)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{flav.name}</span>
                          </div>
                          <span className={styles.flavorComplementBadge}>Disponivel</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEÇÃO DE ADICIONAIS */}
              {product.allowCustomization && dynamicAdditions.length > 0 && (
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
                  placeholder="Ex: Tirar cebola, maionese a parte..." 
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