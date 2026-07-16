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

  const isPizza = product.category === 'pizzas';

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

  // Reseta os sabores E as bordas caso o cliente mude o tamanho da pizza
  useEffect(() => {
    if (isPizza) {
      setSelectedFlavors([]);
      setSelectedAdditions(prev => prev.filter(a => {
        const nameLower = a.name.toLowerCase();
        // Remove os especiais (sabores) e as bordas antigas para evitar divergência de tamanho
        return !nameLower.startsWith('especial') && !nameLower.startsWith('borda');
      }));
    }
  }, [selectedVariant, isPizza]);

  // Lógica de Limite de Sabores e Identificação do Tamanho Atual
  let maxFlavors = 1;
  let currentPizzaSize = '';
  
  if (isPizza && product.isVariable && product.options) {
    const variantName = product.options[selectedVariant]?.name?.toLowerCase() || '';
    if (variantName.includes('broto')) {
      maxFlavors = 2;
      currentPizzaSize = 'broto';
    } else if (variantName.includes('média') || variantName.includes('media')) {
      maxFlavors = 2;
      currentPizzaSize = 'media';
    } else if (variantName.includes('grande')) {
      maxFlavors = 3;
      currentPizzaSize = 'grande';
    } else if (variantName.includes('família') || variantName.includes('familia')) {
      maxFlavors = 4;
      currentPizzaSize = 'familia';
    }
  }

  // Preço base e preço total
  const basePrice = product.isVariable && product.options && product.options.length > 0
    ? product.options[selectedVariant].price
    : (product.isPromo && product.promoPrice ? product.promoPrice : product.price);

  const totalPrice = basePrice + selectedAdditions.reduce((acc, a) => acc + a.price, 0);

  // Contagem atual de sabores (normais + especiais)
  const currentFlavorCount = selectedFlavors.length + selectedAdditions.filter(a => a.name.toLowerCase().startsWith('especial')).length;

  // Filtros de exibição
  const pizzaSpecials = dynamicAdditions.filter(a => a.name.toLowerCase().startsWith('especial'));
  let pizzaBordas: CustomizationOption[] = [];
  let normalAdditions = dynamicAdditions;

  if (isPizza) {
    // Separa as bordas correspondentes ao tamanho atual
    pizzaBordas = dynamicAdditions.filter(a => {
      const addNameLower = a.name.toLowerCase();
      if (addNameLower.startsWith('borda')) {
        if (currentPizzaSize === 'broto' && addNameLower.includes('broto')) return true;
        if (currentPizzaSize === 'media' && (addNameLower.includes('média') || addNameLower.includes('media'))) return true;
        if (currentPizzaSize === 'grande' && addNameLower.includes('grande')) return true;
        if (currentPizzaSize === 'familia' && (addNameLower.includes('família') || addNameLower.includes('familia'))) return true;
        return false;
      }
      return false;
    });

    // Filtra os adicionais normais retirando especiais e bordas
    normalAdditions = dynamicAdditions.filter(a => {
      const n = a.name.toLowerCase();
      return !n.startsWith('especial') && !n.startsWith('borda');
    });
  }

  const handleAddSimple = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.allowCustomization || isPizza || product.category === 'sushi') {
      setShowModal(true);
    } else {
      addToCart(product, 1, product.isVariable ? selectedVariant : undefined, [], '');
    }
  };

  const handleAddCustomized = () => {
    let flavorNotes = notes;
    
    // Une sabores tradicionais e especiais para enviar para o carrinho
    let flavorNamesList = selectedFlavors.map(f => f.name);
    if (isPizza) {
      const specialFlavors = selectedAdditions.filter(a => a.name.toLowerCase().startsWith('especial')).map(a => a.name);
      flavorNamesList = [...flavorNamesList, ...specialFlavors];
    }

    if (flavorNamesList.length > 0) {
      const flavorNames = flavorNamesList.join(', ');
      flavorNotes = flavorNotes ? `Sabores: ${flavorNames} | OBS: ${flavorNotes}` : `Sabores: ${flavorNames}`;
    }
    
    addToCart(product, 1, product.isVariable ? selectedVariant : undefined, selectedAdditions, flavorNotes);
    setShowModal(false);
    setSelectedAdditions([]);
    setSelectedFlavors([]);
    setNotes('');
  };

  const toggleAddition = (add: CustomizationOption) => {
    const isSelected = !!selectedAdditions.find(i => i.id === add.id);
    const nameLower = add.name.toLowerCase();
    const isSpecial = nameLower.startsWith('especial');
    const isBorda = nameLower.startsWith('borda');
    
    // Trava de Sabores: se for pizza, for especial, não estiver selecionado e já atingiu o limite
    if (isPizza && isSpecial && !isSelected && currentFlavorCount >= maxFlavors) return;

    // Lógica Exclusiva para Borda (Limite de 1 por pizza)
    if (isPizza && isBorda) {
      if (isSelected) {
        // Se clicar nela de novo, apenas remove
        setSelectedAdditions(prev => prev.filter(i => i.id !== add.id));
      } else {
        // Se selecionar uma borda nova, desmarca qualquer outra borda e adiciona a nova
        setSelectedAdditions(prev => {
          const withoutBordas = prev.filter(i => !i.name.toLowerCase().startsWith('borda'));
          return [...withoutBordas, add];
        });
      }
      return;
    }

    // Para adicionais comuns, apenas faz o toggle normalmente
    setSelectedAdditions(prev => isSelected ? prev.filter(i => i.id !== add.id) : [...prev, add]);
  };

  const toggleFlavor = (flav: FlavorOption) => {
    const isSelected = !!selectedFlavors.find(i => i.id === flav.id);
    
    // Trava se for pizza, não estiver selecionado e já atingiu o limite
    if (isPizza && !isSelected && currentFlavorCount >= maxFlavors) return;

    setSelectedFlavors(prev => isSelected ? prev.filter(i => i.id !== flav.id) : [...prev, flav]);
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
            
            {/* CABEÇALHO */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalProdTitle}>{product.name}</h2>
                {product.isVariable && product.options && (
                  <p className={styles.modalVariantName}>{product.options[selectedVariant].name}</p>
                )}
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            {/* ÁREA ROLÁVEL DE OPÇÕES */}
            <div className={styles.optionsScrollArea}>
              
              {/* SABORES E ESPECIAIS */}
              {(dynamicFlavors.length > 0 || (isPizza && pizzaSpecials.length > 0)) && (
                <div className={styles.customizationSection}>
                  <h3>
                    Escolha os Sabores 
                    {isPizza && <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}> (Até {maxFlavors})</span>}
                  </h3>
                  <div className={styles.additionsList}>
                    
                    {/* Sabores Normais */}
                    {dynamicFlavors.map(f => {
                      const isChecked = !!selectedFlavors.find(i => i.id === f.id);
                      return (
                        <div key={f.id} className={styles.additionItem} onClick={() => toggleFlavor(f)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>{isChecked ? '✓' : ''}</span>
                            {f.name}
                          </div>
                        </div>
                      );
                    })}

                    {/* Sabores Especiais (Apenas para Pizzas) */}
                    {isPizza && pizzaSpecials.map(a => {
                      const isChecked = !!selectedAdditions.find(i => i.id === a.id);
                      return (
                        <div key={a.id} className={styles.additionItem} onClick={() => toggleAddition(a)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>{isChecked ? '✓' : ''}</span>
                            {a.name}
                          </div>
                          <span className={styles.addPrice}>+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}

              {/* BORDAS EXCLUSIVAS (SE FOR PIZZA E TIVER BORDA DO TAMANHO) */}
              {isPizza && pizzaBordas.length > 0 && (
                <div className={styles.customizationSection}>
                  <h3>Borda <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}> (Máx. 1)</span></h3>
                  <div className={styles.additionsList}>
                    {pizzaBordas.map(a => {
                      const isChecked = !!selectedAdditions.find(i => i.id === a.id);
                      return (
                        <div key={a.id} className={styles.additionItem} onClick={() => toggleAddition(a)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`} style={{ borderRadius: '50%' }}>{isChecked ? '✓' : ''}</span>
                            {a.name}
                          </div>
                          <span className={styles.addPrice}>+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADICIONAIS COMUNS (Bacon, Cheddar extra, etc) */}
              {normalAdditions.length > 0 && (
                <div className={styles.customizationSection}>
                  <h3>Adicionais Extras</h3>
                  <div className={styles.additionsList}>
                    {normalAdditions.map(a => {
                      const isChecked = !!selectedAdditions.find(i => i.id === a.id);
                      return (
                        <div key={a.id} className={styles.additionItem} onClick={() => toggleAddition(a)}>
                          <div className={styles.addLabel}>
                            <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>{isChecked ? '✓' : ''}</span>
                            {a.name}
                          </div>
                          <span className={styles.addPrice}>+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ 100% FIXO */}
            <div className={styles.modalFixedFooter}>
              <div className={styles.notesWrapper}>
                <label>Observações</label>
                <textarea 
                  className={styles.customNotesInput} 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Ex: Tirar cebola, maionese a parte..." 
                />
              </div>
              
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