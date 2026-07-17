import React, { useState, useEffect } from 'react';
import { 
  getStoredProducts, 
  saveStoredProduct, 
  deleteStoredProduct,
  getStoredCategories, 
  saveStoredCategory, 
  deleteStoredCategory,
  getStoredAdditions, 
  saveStoredAddition,
  deleteStoredAddition,
  getStoredFlavors,
  saveStoredFlavor,
  deleteStoredFlavor,
  uploadProductImage,
  getStoreConfiguration,
  saveStoreConfiguration
} from '../data/products';
import type { Product, Category, CustomizationOption, ProductOption, FlavorOption, StoreConfig } from '../data/products';
import styles from './AdminPanel.module.css';

interface AdminPanelProps {
  onBack: () => void;
}

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [additions, setAdditions] = useState<CustomizationOption[]>([]);
  const [flavors, setFlavors] = useState<FlavorOption[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'product_form' | 'category_form' | 'customization_form'>('list');

  // Configurações da Loja
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  // const [deliveryTimeInput, setDeliveryTimeInput] = useState('');

  // Estados dos Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Estados do Formulário de Produtos
  const [editingId, setEditingId] = useState<number | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [allowCustom, setAllowCustom] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [promoPrice, setPromoPrice] = useState('');
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<ProductOption[]>([]);
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState('');

  // Estados para Upload de Arquivo
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estados Categoria
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');

  // Estados Adicionais
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCategoryLinked, setAddCategoryLinked] = useState('');

  // Estados Sabores
  const [flavorName, setFlavorName] = useState('');
  const [flavorCategoryLinked, setFlavorCategoryLinked] = useState('');

  // Estado do Popup
  const [popup, setPopup] = useState<PopupState>({ isOpen: false, title: '', message: '', type: 'alert' });

  const showAlertPopup = (title: string, message: string) => setPopup({ isOpen: true, title, message, type: 'alert' });
  const showConfirmPopup = (title: string, message: string, onConfirm: () => void) => setPopup({ isOpen: true, title, message, type: 'confirm', onConfirm });
  const closePopup = () => setPopup(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const loadAdminData = async () => {
      const config = await getStoreConfiguration();
      if (config) {
        setStoreConfig(config);
        // setDeliveryTimeInput(config.entrega.toString());
      }

      const prods = await getStoredProducts();
      const cats = await getStoredCategories();
      const adds = await getStoredAdditions();
      const flavs = await getStoredFlavors();
      
      setProducts(prods);
      setCategories(cats);
      setAdditions(adds);
      setFlavors(flavs);
      
      if (cats.length > 0) {
        if (!editingId) setProdCategory(cats[0].id);
        setAddCategoryLinked(cats[0].id);
        setFlavorCategoryLinked(cats[0].id);
      }
    };
    loadAdminData();
  }, [activeTab, editingId]);

  // Controles da Loja (Abrir/Fechar e Tempo)
  const handleToggleStoreStatus = async () => {
    if (!storeConfig) return;
    const updated = { ...storeConfig, aberto: !storeConfig.aberto };
    const success = await saveStoreConfiguration(updated);
    if (success) {
      setStoreConfig(updated);
      showAlertPopup('Status Atualizado', updated.aberto ? 'Sua loja agora está ABERTA para pedidos!' : 'Sua loja agora está FECHADA para pedidos!');
    }
  };

  // const handleUpdateDeliveryTime = async () => {
  //   if (!storeConfig) return;
  //   const updated = { ...storeConfig, entrega: Number(deliveryTimeInput) };
  //   const success = await saveStoreConfiguration(updated);
  //   if (success) {
  //     setStoreConfig(updated);
  //     showAlertPopup('Tempo Atualizado', `O tempo estimado foi atualizado para ${updated.entrega} minutos.`);
  //   }
  // };

  const handleToggleStatus = async (id: number) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;

    const currentStatus = targetProduct.disponivel === undefined ? true : targetProduct.disponivel;
    const updatedProduct = { ...targetProduct, disponivel: !currentStatus };

    const success = await saveStoredProduct(updatedProduct);
    if (success) setProducts(products.map(p => p.id === id ? updatedProduct : p));
  };

  const handleAddVariant = () => {
    if (!varName || !varPrice) return;
    setVariants([...variants, { name: varName, price: parseFloat(varPrice) }]);
    setVarName(''); setVarPrice('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = prodImage;

    if (imageFile) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
      else {
        showAlertPopup('Erro no Upload', 'Falha ao processar e salvar a imagem.');
        setIsUploading(false); return;
      }
    } else if (!editingId) {
      showAlertPopup('Foto Necessária', 'Por favor, selecione uma foto para o produto.');
      setIsUploading(false); return;
    }

    const productData: Product = {
      id: editingId || Date.now(),
      name: prodName,
      price: isVariable ? (variants[0]?.price || 0) : parseFloat(prodPrice),
      category: prodCategory,
      desc: prodDesc,
      image: finalImageUrl,
      allowCustomization: allowCustom,
      isVariable: isVariable,
      options: isVariable ? variants : undefined,
      isPromo: isPromo,
      promoPrice: isPromo ? parseFloat(promoPrice) : undefined,
      disponivel: true
    };

    const success = await saveStoredProduct(productData);
    setIsUploading(false);

    if (success) { resetProductForm(); setActiveTab('list'); }
    else showAlertPopup('Erro de Sincronização', 'Erro ao sincronizar dados com o Supabase.');
  };

  const handleEditProduct = (p: Product) => {
    setEditingId(p.id); setProdName(p.name); setProdPrice(p.price.toString());
    setProdCategory(p.category); setProdDesc(p.desc); setProdImage(p.image);
    setAllowCustom(!!p.allowCustomization); setIsPromo(!!p.isPromo);
    setPromoPrice(p.promoPrice?.toString() || ''); setIsVariable(!!p.isVariable);
    setVariants(p.options || []); setImageFile(null); setActiveTab('product_form');
  };

  const handleDeleteProduct = (id: number) => {
    showConfirmPopup('Confirmar Exclusão', 'Deseja excluir este item permanentemente?', async () => {
      const success = await deleteStoredProduct(id);
      if (success) setProducts(products.filter(p => p.id !== id));
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    let success = false;
    if (editingCategoryId) {
      const updatedCat: Category = { id: editingCategoryId, label: catName };
      success = await saveStoredCategory(updatedCat);
    } else {
      const newCat: Category = {
        id: catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
        label: catName
      };
      success = await saveStoredCategory(newCat);
    }
    
    if (success) { setCatName(''); setEditingCategoryId(null); setActiveTab('list'); }
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategoryId(c.id); setCatName(c.label); setActiveTab('category_form');
  };

  const handleDeleteCategory = (id: string) => {
    showConfirmPopup('Apagar Categoria', 'Deseja excluir esta categoria permanentemente?', async () => {
      const result = await deleteStoredCategory(id);
      if (result === true) {
        setCategories(categories.filter(c => c.id !== id));
        setProducts(products.filter(p => p.category !== id));
        setAdditions(additions.filter(a => a.categoryLinked !== id));
        setFlavors(flavors.filter(f => f.id !== id));
      } else if (result && typeof result === 'object' && (result as any).code === '23503') {
        showAlertPopup('Não é possível excluir', 'Exclua os itens vinculados antes.');
      }
    });
  };

  const handleSaveAddition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addPrice) return;
    const newAdd: CustomizationOption = { id: Date.now().toString(), name: addName, price: parseFloat(addPrice), categoryLinked: addCategoryLinked };
    const success = await saveStoredAddition(newAdd);
    if (success) {
      const updatedAdds = await getStoredAdditions();
      setAdditions(updatedAdds); setAddName(''); setAddPrice('');
    }
  };

  const handleDeleteAddition = (id: string) => {
    showConfirmPopup('Excluir Adicional', 'Deseja excluir este adicional?', async () => {
      const success = await deleteStoredAddition(id);
      if (success) setAdditions(additions.filter(a => a.id !== id));
    });
  };

  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flavorName.trim()) return;
    const success = await saveStoredFlavor({ name: flavorName, categoryLinked: flavorCategoryLinked });
    if (success) {
      const updatedFlavs = await getStoredFlavors();
      setFlavors(updatedFlavs); setFlavorName('');
    }
  };

  const handleDeleteFlavor = (id: string) => {
    showConfirmPopup('Excluir Sabor', 'Deseja excluir este sabor?', async () => {
      const success = await deleteStoredFlavor(id);
      if (success) setFlavors(flavors.filter(f => f.id !== id));
    });
  };

  const resetProductForm = () => {
    setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdImage('');
    setAllowCustom(false); setIsPromo(false); setPromoPrice(''); setIsVariable(false); setVariants([]); setImageFile(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <div>
          <h2>Gestão Clevi's</h2>
          <p className={styles.headerSubtitle}>Controle de estoque, categorias e opcionais em nuvem</p>
        </div>
        <button className={styles.btnBack} onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Voltar ao Menu
        </button>
      </div>

      <div className={styles.adminNav}>
        <button className={activeTab === 'list' ? styles.navActive : ''} onClick={() => setActiveTab('list')}>
          <i className="fa-solid fa-layer-group"></i> Visão Geral
        </button>
        <button className={activeTab === 'product_form' ? styles.navActive : ''} onClick={() => { resetProductForm(); setActiveTab('product_form'); }}>
          <i className="fa-solid fa-utensils"></i> {editingId ? 'Editar Produto' : 'Adicionar Produto'}
        </button>
        <button className={activeTab === 'customization_form' ? styles.navActive : ''} onClick={() => setActiveTab('customization_form')}>
          <i className="fa-solid fa-sliders"></i> Opcionais & Sabores
        </button>
        <button className={activeTab === 'category_form' ? styles.navActive : ''} onClick={() => { setEditingCategoryId(null); setCatName(''); setActiveTab('category_form'); }}>
          <i className="fa-solid fa-folder-plus"></i> Categorias
        </button>
      </div>

      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CONFIGURAÇÕES DA LOJA (STATUS E TEMPO) */}
          {storeConfig && (
            <div className={styles.storeConfigCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#f4f5f6', fontSize: '1.05rem', fontWeight: 600 }}>Status do Delivery</h3>
                  <p style={{ margin: 0, color: '#777e90', fontSize: '0.85rem' }}>Abra ou feche sua loja para receber pedidos no site</p>
                </div>
                <button 
                  onClick={handleToggleStoreStatus}
                  className={`${styles.btnStatus} ${storeConfig.aberto ? styles.statusActive : styles.statusPaused}`}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  <i className={`fa-solid ${storeConfig.aberto ? 'fa-door-open' : 'fa-door-closed'}`}></i> {storeConfig.aberto ? 'Loja Aberta (Pausar)' : 'Loja Fechada (Abrir)'}
                </button>
              </div>
              {/* Para voltar o controle do tempo de entrega, descomente o código abaixo  */}
              {/* <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#b1b5c3', fontSize: '0.85rem', fontWeight: 600 }}>Tempo Médio de Entrega (min)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number"
                      className={styles.adminFilterInput}
                      style={{ width: '90px' }}
                      value={deliveryTimeInput}
                      onChange={(e) => setDeliveryTimeInput(e.target.value)}
                    />
                    <button 
                      className={styles.btnSave} 
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={handleUpdateDeliveryTime}
                    >
                      Salvar Tempo
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          <div className={styles.dashboardSplit}>
            {/* SEÇÃO PRINCIPAL DE PRODUTOS */}
            <div className={styles.tableResponsive}>
              <div className={styles.tableHeaderSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3>Catálogo de Itens Ativos</h3>
                  <span className={styles.counterBadge}>{filteredProducts.length} itens</span>
                </div>
                
                {/* Controles de Filtro */}
                <div className={styles.filterControls}>
                  <input 
                    type="text" 
                    placeholder="Buscar produto..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.adminFilterInput}
                  />
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={styles.adminFilterInput}
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Item</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} className={p.disponivel === false ? styles.rowDisabled : ''}>
                      <td><img src={p.image} alt={p.name} className={styles.tableImg} /></td>
                      <td>
                        <span className={styles.primaryText}>{p.name}</span>
                        <div className={styles.secondaryRow}>
                          <span className={styles.miniCategoryBadge}>{p.category}</span>
                          {p.isPromo && <span className={styles.miniPromoBadge}>OFERTA</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.priceText}>
                          R$ {(p.isPromo && p.promoPrice ? p.promoPrice : p.price).toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`${styles.btnStatus} ${p.disponivel !== false ? styles.statusActive : styles.statusPaused}`} 
                          onClick={() => handleToggleStatus(p.id)}
                        >
                          {p.disponivel !== false ? 'Disponível' : 'Indisponível'}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button className={styles.btnEdit} onClick={() => handleEditProduct(p)} title="Editar">✎</button>
                          <button className={styles.btnDelete} onClick={() => handleDeleteProduct(p.id)} title="Excluir">X</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#777e90' }}>
                        Nenhum produto encontrado na busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SEÇÃO DE CATEGORIAS */}
            <div className={styles.tableResponsive}>
              <div className={styles.tableHeaderSection}>
                <h3>Estrutura de Categorias</h3>
              </div>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Nome Interno</th>
                    <th>Identificador (Slug)</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td><span className={styles.primaryText}>{c.label}</span></td>
                      <td><span className={styles.slugCode}>/{c.id}</span></td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button className={styles.btnEdit} onClick={() => handleEditCategory(c)} title="Editar Nome">✎</button>
                          <button className={styles.btnDelete} onClick={() => handleDeleteCategory(c.id)} title="Excluir Completa">X</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'product_form' && (
        <form className={styles.adminForm} onSubmit={handleSaveProduct}>
          <div className={styles.formSectionTitle}>
            <h3>Atributos Básicos</h3>
            <p>Insira as informações comerciais principais do seu produto</p>
          </div>
          
          <div className={styles.formGroup}>
            <label>Título de Exibição do Cardápio</label>
            <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Ex: Burger Triplo Cheddar" required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoria de Alocação</label>
              <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {!isVariable && (
              <div className={styles.formGroup}>
                <label>Preço de Venda (R$)</label>
                <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="0,00" required={!isVariable} />
              </div>
            )}
          </div>

          <div className={styles.formRowBox}>
            <label className={styles.switchLabel}>
              <input type="checkbox" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
              <div>
                <strong>Este produto está em promoção activa?</strong>
                <p>O item será indexado na aba de ofertas especiais no cabeçalho</p>
              </div>
            </label>
            {isPromo && (
              <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                <label>Preço Especial de Oferta (R$)</label>
                <input type="number" step="0.01" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} placeholder="0,00" required={isPromo} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Fotografia Real do Produto (Arquivo digital)</label>
            <div className={styles.uploadAreaContainer}>
              <input type="file" accept="image/*" onChange={handleFileChange} id="fileField" className={styles.fileInputHidden} />
              <label htmlFor="fileField" className={styles.fileLabelTrigger}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
                {imageFile ? `Arquivo Selecionado: ${imageFile.name}` : 'Clique aqui para escolher ou tirar uma foto'}
              </label>
            </div>
            {editingId && !imageFile && (
              <p className={styles.imageRetentionNotice}>* Deixe vazio se deseja manter a foto atual deste item</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Descrição Complementar / Ingredientes <span className={styles.optionalText}>(Opcional)</span></label>
            <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Ex: Pão brioche selado na manteiga..." maxLength={250}></textarea>
          </div>

          <div className={styles.formSectionTitle} style={{ marginTop: '15px' }}>
            <h3>Configurações de Regra e Customização</h3>
          </div>

          <label className={styles.switchLabel}>
            <input type="checkbox" checked={allowCustom} onChange={e => setAllowCustom(e.target.checked)} />
            <div>
              <strong>Vincular adicionais e sabores customizados?</strong>
              <p>Habilita a listagem de complementos criados para esta categoria no carrinho</p>
            </div>
          </label>

          <label className={styles.switchLabel}>
            <input type="checkbox" checked={isVariable} onChange={e => setIsVariable(e.target.checked)} />
            <div>
              <strong>Este produto contém variações de tamanho ou combos de preço?</strong>
              <p>Ideal para pizzas (Média, Grande) ou porções familiares</p>
            </div>
          </label>

          {isVariable && (
            <div className={styles.variantSection}>
              <h4>Grade de Tamanhos / Preços das Variantes</h4>
              <div className={styles.variantInputs}>
                <input type="text" value={varName} onChange={e => setVarName(e.target.value)} placeholder="Ex: Pizza Grande (8 Fatias)" />
                <input type="number" step="0.01" value={varPrice} onChange={e => setVarPrice(e.target.value)} placeholder="Preço R$" />
                <button type="button" onClick={handleAddVariant} className={styles.btnPlusVariant}>
                  +
                </button>
              </div>
              <ul className={styles.variantList}>
                {variants.map((v, i) => (
                  <li key={i}>
                    <span>{v.name}</span>
                    <strong>R$ {v.price.toFixed(2).replace('.', ',')}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="submit" className={styles.btnSave} disabled={isUploading}>
            <i className="fa-solid fa-circle-check"></i> {isUploading ? 'Processando Mídia Cloud...' : 'Salvar Registro Completo'}
          </button>
        </form>
      )}

      {activeTab === 'customization_form' && (
        <div className={styles.customizationsPanelSplit}>
          
          {/* FORMULÁRIO + TABELA DE ADICIONAIS */}
          <div className={styles.customBlockCard}>
            <form className={styles.adminFormInner} onSubmit={handleSaveAddition}>
              <h3>Cadastrar Adicional / Complemento</h3>
              <div className={styles.formGroup}>
                <label>Nome do Adicional</label>
                <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: Queijo Extra..." required />
              </div>
              <div className={styles.formGroup}>
                <label>Preço do Adicional (R$)</label>
                <input type="number" step="0.01" value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="0,00" required />
              </div>
              <div className={styles.formGroup}>
                <label>Categoria Vinculada</label>
                <select value={addCategoryLinked} onChange={e => setAddCategoryLinked(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.btnSave}>Salvar Adicional</button>
            </form>

            <div className={styles.miniTableWrapper} style={{ marginTop: '20px' }}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Vínculo</th>
                    <th style={{ textAlign: 'center' }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {additions.map(a => (
                    <tr key={a.id}>
                      <td><span className={styles.primaryText}>{a.name}</span></td>
                      <td><span className={styles.priceText}>R$ {a.price.toFixed(2).replace('.', ',')}</span></td>
                      <td><span className={styles.miniCategoryBadge}>{a.categoryLinked}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <button className={styles.btnDeleteTableInline} onClick={() => handleDeleteAddition(a.id)}>X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORMULÁRIO + TABELA DE SABORES */}
          <div className={styles.customBlockCard}>
            <form className={styles.adminFormInner} onSubmit={handleSaveFlavor}>
              <h3>Cadastrar Sabores Disponíveis</h3>
              <div className={styles.formGroup}>
                <label>Nome do Sabor</label>
                <input type="text" value={flavorName} onChange={e => setFlavorName(e.target.value)} placeholder="Ex: Quatro Queijos..." required />
              </div>
              <div className={styles.formGroup}>
                <label>Categoria Vinculada</label>
                <select value={flavorCategoryLinked} onChange={e => setFlavorCategoryLinked(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.btnSave} style={{ background: 'var(--neon-yellow)', color: '#121214' }}>
                Salvar Sabor
              </button>
            </form>

            <div className={styles.miniTableWrapper} style={{ marginTop: '20px' }}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Sabor</th>
                    <th>Vínculo Categoria</th>
                    <th style={{ textAlign: 'center' }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {flavors.map(f => (
                    <tr key={f.id}>
                      <td><span className={styles.primaryText}>{f.name}</span></td>
                      <td><span className={styles.miniCategoryBadge} style={{ borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)' }}>{f.categoryLinked}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <button className={styles.btnDeleteTableInline} onClick={() => handleDeleteFlavor(f.id)}>X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'category_form' && (
        <form className={styles.adminForm} onSubmit={handleSaveCategory}>
          <div className={styles.formSectionTitle}>
            <h3>Estruturação de Nova Grade</h3>
            <p>Crie categorias para dividir o menu principal do seu estabelecimento</p>
          </div>
          <div className={styles.formGroup}>
            <label>Nome da Categoria </label>
            <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Porções Crocantes" required />
          </div>
          <button type="submit" className={styles.btnSave}>
            {editingCategoryId ? 'Atualizar Categoria' : 'Alocar Nova Categoria'}
          </button>
        </form>
      )}

      {popup.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#18191d', border: '1px solid #232627', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', fontFamily: 'sans-serif' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f4f5f6', fontSize: '1.2rem', fontWeight: 700 }}>{popup.title}</h3>
            <p style={{ color: '#b1b5c3', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0', whiteSpace: 'pre-wrap' }}>{popup.message}</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {popup.type === 'confirm' && (
                <button 
                  onClick={closePopup}
                  style={{ background: '#141416', color: '#777e90', border: '1px solid #232627', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={() => {
                  if (popup.type === 'confirm' && popup.onConfirm) {
                    popup.onConfirm();
                  }
                  closePopup();
                }}
                style={{ background: popup.type === 'confirm' ? '#ef4444' : 'var(--neon-orange, #ff5e00)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};