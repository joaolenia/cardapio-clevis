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
  const [dynamicAdditions, setDynamicAdditions] = useState<CustomizationOption[]>([]);
  const [dynamicFlavors, setDynamicFlavors] = useState<FlavorOption[]>([]);

  // Carrega opções e bloqueia o scroll do body quando o modal abre
  useEffect(() => {
    const loadModalOptions = async () => {
      if (showModal) {
        document.body.style.overflow = 'hidden';

        const allAdditions = await getStoredAdditions();
        const filteredAdds = Array.isArray(allAdditions) ? allAdditions.filter(a => a.categoryLinked === product.category) : [];
        setDynamicAdditions(filteredAdds);

        const allFlavors = await getStoredFlavors();
        const filteredFlavs = Array.isArray(allFlavors) ? allFlavors.filter(f => f.categoryLinked === product.category) : [];
        setDynamicFlavors(filteredFlavs);
      } else {
        document.body.style.overflow = 'auto';
      }
    };
    loadModalOptions();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, product.category]);

  // Lógica do preço base (considera variação ou promoção)
  const basePrice = product.isVariable && product.options && product.options.length > 0
    ? product.options[selectedVariant].price
    : (product.isPromo && product.promoPrice ? product.promoPrice : product.price);

  const totalPrice = basePrice + selectedAdditions.reduce((acc, a) => acc + a.price, 0);

  const handleAddSimple = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Se permitir customização ou for categoria que costuma ter sabores (pizza/sushi), abre o modal
    if (product.allowCustomization || product.category === 'pizzas' || product.category === 'sushi') {
      setShowModal(true);
    } else {
      addToCart(product, 1, product.isVariable ? selectedVariant : undefined, [], '');
    }
  };

  const handleAddCustomized = () => {
    let flavorNotes = notes;
    if (selectedFlavors.length > 0) {
      const flavorNames = selectedFlavors.map(f => f.name).join(', ');
      flavorNotes = flavorNotes ? `Sabores: ${flavorNames} | OBS: ${flavorNotes}` : `Sabores: ${flavorNames}`;
    }
    
    addToCart(product, 1, product.isVariable ? selectedVariant : undefined, selectedAdditions, flavorNotes);
    setShowModal(false);
    setSelectedAdditions([]);
    setSelectedFlavors([]);
    setNotes('');
  };

  const toggleAddition = (add: CustomizationOption) => {
    setSelectedAdditions(prev => prev.find(i => i.id === add.id) ? prev.filter(i => i.id !== add.id) : [...prev, add]);
  };

  const toggleFlavor = (flav: FlavorOption) => {
    setSelectedFlavors(prev => prev.find(i => i.id === flav.id) ? prev.filter(i => i.id !== flav.id) : [...prev, flav]);
  };

  return (
    <>
      <div className={styles.productCard} onClick={() => setShowModal(true)}>
        <div className={styles.productImageContainer}>
          <img src={product.image} alt={product.name} className={styles.productImg} />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productDesc}>{product.desc}</p>
          
          <div className={styles.productMeta}>
            {/* SELETOR DE VARIAÇÃO SE EXISTIR */}
            {product.isVariable && product.options && product.options.length > 0 ? (
              <div className={styles.variantContainer}>
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
              </div>
            ) : (
              <div className={styles.priceContainer}>
                {product.isPromo && <span className={styles.oldCardPrice}>R$ {product.price.toFixed(2).replace('.', ',')}</span>}
                <span className={styles.productPrice}>R$ {basePrice.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <button className={styles.addToCartBtn} onClick={handleAddSimple}>Add</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.customModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalProdTitle}>{product.name}</h2>
                {product.isVariable && product.options && (
                  <p className={styles.modalVariantName}>{product.options[selectedVariant].name}</p>
                )}
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className={styles.modalBodyScroll}>
              {dynamicFlavors.length > 0 && (
                <div className={styles.customizationSection}>
                  <h3>Escolha os Sabores</h3>
                  <div className={styles.additionsList}>
                    {dynamicFlavors.map(f => (
                      <div key={f.id} className={styles.additionItem} onClick={() => toggleFlavor(f)}>
                        <div className={styles.addLabel}>
                          <span className={`${styles.customCheckbox} ${selectedFlavors.find(i => i.id === f.id) ? styles.checked : ''}`}>✓</span>
                          {f.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dynamicAdditions.length > 0 && (
                <div className={styles.customizationSection}>
                  <h3>Adicionais</h3>
                  <div className={styles.additionsList}>
                    {dynamicAdditions.map(a => (
                      <div key={a.id} className={styles.additionItem} onClick={() => toggleAddition(a)}>
                        <div className={styles.addLabel}>
                          <span className={`${styles.customCheckbox} ${selectedAdditions.find(i => i.id === a.id) ? styles.checked : ''}`}>✓</span>
                          {a.name}
                        </div>
                        <span className={styles.addPrice}>+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.customizationSection}>
                <h3>Observações</h3>
                <textarea className={styles.customNotesInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Tirar cebola, maionese a parte..." />
              </div>
            </div>

            <div className={styles.modalFooterSticky}>
              <button className={styles.btnAddModal} onClick={handleAddCustomized}>
                Confirmar • R$ {totalPrice.toFixed(2).replace('.', ',')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};