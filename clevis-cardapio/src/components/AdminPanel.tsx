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
  uploadProductImage
} from '../data/products';
import type { Product, Category, CustomizationOption, ProductOption, FlavorOption } from '../data/products';
import styles from './AdminPanel.module.css';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [additions, setAdditions] = useState<CustomizationOption[]>([]);
  const [flavors, setFlavors] = useState<FlavorOption[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'product_form' | 'category_form' | 'customization_form'>('list');

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

  // Estados do Formulário de Categorias
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');

  // Estados do Formulário de Adicionais
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCategoryLinked, setAddCategoryLinked] = useState('');

  // Estados do Formulário de Sabores
  const [flavorName, setFlavorName] = useState('');
  const [flavorCategoryLinked, setFlavorCategoryLinked] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      const prods = await getStoredProducts();
      const cats = await getStoredCategories();
      const adds = await getStoredAdditions();
      const flavs = await getStoredFlavors();
      
      setProducts(prods);
      setCategories(cats);
      setAdditions(adds);
      setFlavors(flavs);
      
      if (cats.length > 0) {
        setProdCategory(cats[0].id);
        setAddCategoryLinked(cats[0].id);
        setFlavorCategoryLinked(cats[0].id);
      }
    };
    loadAdminData();
  }, [activeTab]);

  const handleToggleStatus = async (id: number) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;

    const currentStatus = targetProduct.disponivel === undefined ? true : targetProduct.disponivel;
    const updatedProduct = { ...targetProduct, disponivel: !currentStatus };

    const success = await saveStoredProduct(updatedProduct);
    if (success) {
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
    }
  };

  const handleAddVariant = () => {
    if (!varName || !varPrice) return;
    setVariants([...variants, { name: varName, price: parseFloat(varPrice) }]);
    setVarName('');
    setVarPrice('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrl = prodImage;

    if (imageFile) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        alert('Falha ao processar e salvar a imagem.');
        setIsUploading(false);
        return;
      }
    } else if (!editingId) {
      alert('Por favor, selecione uma foto para o produto.');
      setIsUploading(false);
      return;
    }

    const productData: Product = {
      id: editingId || Date.now(),
      name: prodName,
      price: isVariable ? (variants[0]?.price || 0) : parseFloat(prodPrice),
      category: prodCategory,
      desc: prodDesc, // Sem required, pode ir vazio
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

    if (success) {
      resetProductForm();
      setActiveTab('list');
    } else {
      alert('Erro ao sincronizar dados com o Supabase.');
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingId(p.id);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdCategory(p.category);
    setProdDesc(p.desc);
    setProdImage(p.image);
    setAllowCustom(!!p.allowCustomization);
    setIsPromo(!!p.isPromo);
    setPromoPrice(p.promoPrice?.toString() || '');
    setIsVariable(!!p.isVariable);
    setVariants(p.options || []);
    setImageFile(null);
    setActiveTab('product_form');
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Excluir este item e sua foto permanentemente?')) {
      const success = await deleteStoredProduct(id);
      if (success) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
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
    
    if (success) {
      setCatName('');
      setEditingCategoryId(null);
      setActiveTab('list');
    }
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategoryId(c.id);
    setCatName(c.label);
    setActiveTab('category_form');
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('⚠️ ATENÇÃO: Apagar a categoria excluirá todos os produtos, adicionais e sabores vinculados! Continuar?')) {
      const success = await deleteStoredCategory(id);
      if (success) {
        setCategories(categories.filter(c => c.id !== id));
        setProducts(products.filter(p => p.category !== id));
        setAdditions(additions.filter(a => a.categoryLinked !== id));
        setFlavors(flavors.filter(f => f.categoryLinked !== id));
      }
    }
  };

  const handleSaveAddition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addPrice) return;
    const newAdd: CustomizationOption = {
      id: Date.now().toString(),
      name: addName,
      price: parseFloat(addPrice),
      categoryLinked: addCategoryLinked
    };
    
    const success = await saveStoredAddition(newAdd);
    if (success) {
      const updatedAdds = await getStoredAdditions();
      setAdditions(updatedAdds);
      setAddName('');
      setAddPrice('');
    }
  };

  const handleDeleteAddition = async (id: string) => {
    if (window.confirm('Excluir este adicional permanentemente?')) {
      const success = await deleteStoredAddition(id);
      if (success) {
        setAdditions(additions.filter(a => a.id !== id));
      }
    }
  };

  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flavorName.trim()) return;

    const success = await saveStoredFlavor({
      name: flavorName,
      categoryLinked: flavorCategoryLinked
    });

    if (success) {
      const updatedFlavs = await getStoredFlavors();
      setFlavors(updatedFlavs);
      setFlavorName('');
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (window.confirm('Excluir este sabor permanentemente?')) {
      const success = await deleteStoredFlavor(id);
      if (success) {
        setFlavors(flavors.filter(f => f.id !== id));
      }
    }
  };

  const resetProductForm = () => {
    setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdImage('');
    setAllowCustom(false); setIsPromo(false); setPromoPrice(''); setIsVariable(false); setVariants([]);
    setImageFile(null);
  };

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
        <div className={styles.dashboardSplit}>
          
          {/* SEÇÃO PRINCIPAL DE PRODUTOS */}
          <div className={styles.tableResponsive}>
            <div className={styles.tableHeaderSection}>
              <h3>Catálogo de Itens Ativos</h3>
              <span className={styles.counterBadge}>{products.length} itens</span>
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
                {products.map(p => (
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
                        <button className={styles.btnEdit} onClick={() => handleEditProduct(p)} title="Editar">
                          <i className="fa-solid fa-pen-to-square"></i>
                          ✎
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDeleteProduct(p.id)} title="Excluir">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                        <button className={styles.btnEdit} onClick={() => handleEditCategory(c)} title="Editar Nome">
                          <i className="fa-solid fa-pen-to-square"></i>
                          ✎
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDeleteCategory(c.id)} title="Excluir Completa">
                          <i className="fa-solid fa-trash-can"></i>
                          X
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <strong>Este produto está em promoção ativa?</strong>
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
            <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Ex: Pão brioche selado na manteiga, dois smashs bovinos de 80g, muito cheddar e barbecue caseiro..." maxLength={250}></textarea>
          </div>

          <div className={styles.formSectionTitle} style={{ marginTop: '15px' }}>
            <h3>Configurações de Regra e Customização</h3>
          </div>

          <label className={styles.switchLabel}>
            <input type="checkbox" checked={allowCustom} onChange={e => setAllowCustom(e.target.checked)} />
            <div>
              <strong>Vincular adicionais customizados?</strong>
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
                  <i className="fa-solid fa-plus"></i>
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
                <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: Queijo Extra, Bacon em Cubos" required />
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
              <button type="submit" className={styles.btnSave}><i className="fa-solid fa-plus"></i> Salvar Adicional</button>
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
                        <button className={styles.btnDeleteTableInline} onClick={() => handleDeleteAddition(a.id)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
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
                <input type="text" value={flavorName} onChange={e => setFlavorName(e.target.value)} placeholder="Ex: Frango com Catupiry, Quatro Queijos" required />
              </div>
              <div className={styles.formGroup}>
                <label>Categoria Vinculada</label>
                <select value={flavorCategoryLinked} onChange={e => setFlavorCategoryLinked(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.btnSave} style={{ background: 'var(--neon-yellow)', color: '#121214' }}>
                <i className="fa-solid fa-plus"></i> Salvar Sabor
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
                        <button className={styles.btnDeleteTableInline} onClick={() => handleDeleteFlavor(f.id)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
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
            <i className="fa-solid fa-circle-plus"></i> {editingCategoryId ? 'Atualizar Categoria' : 'Alocar Nova Categoria'}
          </button>
        </form>
      )}
    </div>
  );
};