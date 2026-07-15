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
  deleteStoredAddition
} from '../data/products';
import type { Product, Category, CustomizationOption, ProductOption } from '../data/products';
import styles from './AdminPanel.module.css';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [additions, setAdditions] = useState<CustomizationOption[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'product_form' | 'category_form' | 'additions_form'>('list');

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

  // Estados do Formulário de Categorias
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');

  // Estados do Formulário de Adicionais
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCategoryLinked, setAddCategoryLinked] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      const prods = await getStoredProducts();
      const cats = await getStoredCategories();
      const adds = await getStoredAdditions();
      
      setProducts(prods);
      setCategories(cats);
      setAdditions(adds);
      
      if (cats.length > 0) {
        setProdCategory(cats[0].id);
        setAddCategoryLinked(cats[0].id);
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingId || Date.now(),
      name: prodName,
      price: isVariable ? (variants[0]?.price || 0) : parseFloat(prodPrice),
      category: prodCategory,
      desc: prodDesc,
      image: prodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      allowCustomization: allowCustom,
      isVariable: isVariable,
      options: isVariable ? variants : undefined,
      isPromo: isPromo,
      promoPrice: isPromo ? parseFloat(promoPrice) : undefined,
      disponivel: true
    };

    const success = await saveStoredProduct(productData);
    if (success) {
      resetProductForm();
      setActiveTab('list');
    } else {
      alert('Erro ao salvar o produto no Supabase.');
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
    setActiveTab('product_form');
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Deletar este item permanentemente do Supabase?')) {
      const success = await deleteStoredProduct(id);
      if (success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Erro ao excluir o produto.');
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
    } else {
      alert('Erro ao salvar a categoria.');
    }
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategoryId(c.id);
    setCatName(c.label);
    setActiveTab('category_form');
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmMsg = '⚠️ ATENÇÃO: Deletar esta categoria apagará permanentemente todos os produtos e adicionais vinculados a ela! Deseja continuar?';
    if (window.confirm(confirmMsg)) {
      const success = await deleteStoredCategory(id);
      if (success) {
        setCategories(categories.filter(c => c.id !== id));
        setProducts(products.filter(p => p.category !== id));
        setAdditions(additions.filter(a => a.categoryLinked !== id));
      } else {
        alert('Erro ao remover a categoria.');
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
      // Recarrega a lista local de adicionais na interface
      const updatedAdds = await getStoredAdditions();
      setAdditions(updatedAdds);
      setAddName('');
      setAddPrice('');
    } else {
      alert('Erro ao salvar o opcional.');
    }
  };

  const handleDeleteAddition = async (id: string) => {
    if (window.confirm('Excluir este adicional permanentemente?')) {
      const success = await deleteStoredAddition(id);
      if (success) {
        setAdditions(additions.filter(a => a.id !== id));
      } else {
        alert('Erro ao excluir o adicional.');
      }
    }
  };

  const resetProductForm = () => {
    setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdImage('');
    setAllowCustom(false); setIsPromo(false); setPromoPrice(''); setIsVariable(false); setVariants([]);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h2>Painel Administrativo Clevi's</h2>
        <button className={styles.btnBack} onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Sair do Painel
        </button>
      </div>

      <div className={styles.adminNav}>
        <button className={activeTab === 'list' ? styles.navActive : ''} onClick={() => setActiveTab('list')}>
          <i className="fa-solid fa-list"></i> Itens & Categorias
        </button>
        <button className={activeTab === 'product_form' ? styles.navActive : ''} onClick={() => { resetProductForm(); setActiveTab('product_form'); }}>
          <i className="fa-solid fa-plus"></i> Novo Item
        </button>
        <button className={activeTab === 'additions_form' ? styles.navActive : ''} onClick={() => setActiveTab('additions_form')}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> Adicionais / Sabores
        </button>
        <button className={activeTab === 'category_form' ? styles.navActive : ''} onClick={() => { setEditingCategoryId(null); setCatName(''); setActiveTab('category_form'); }}>
          <i className="fa-solid fa-folder-plus"></i> {editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
        </button>
      </div>

      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* TABELA DE PRODUTOS */}
          <div className={styles.tableResponsive}>
            <h3 style={{ padding: '15px 20px', margin: 0, color: 'var(--neon-orange)', fontSize: '1.2rem' }}>
              <i className="fa-solid fa-burger"></i> Gerenciar Produtos
            </h3>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className={p.disponivel === false ? styles.rowDisabled : ''}>
                    <td><img src={p.image} alt={p.name} className={styles.tableImg} /></td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.isPromo && <span className={styles.promoBadge}>PROMO</span>}
                    </td>
                    <td><span className={styles.badgeCategory}>{p.category}</span></td>
                    <td>R$ {(p.isPromo && p.promoPrice ? p.promoPrice : p.price).toFixed(2).replace('.', ',')}</td>
                    <td>
                      <button 
                        className={`${styles.btnStatus} ${p.disponivel !== false ? styles.statusActive : styles.statusPaused}`} 
                        onClick={() => handleToggleStatus(p.id)}
                      >
                        {p.disponivel !== false ? '🟢 Ativo' : '🔴 Pausado'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className={styles.btnEdit} onClick={() => handleEditProduct(p)} title="Editar Produto">
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDeleteProduct(p.id)} title="Excluir Produto">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABELA DE CATEGORIAS */}
          <div className={styles.tableResponsive}>
            <h3 style={{ padding: '15px 20px', margin: 0, color: 'var(--neon-yellow)', fontSize: '1.2rem' }}>
              <i className="fa-solid fa-folder"></i> Gerenciar Categorias
            </h3>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Nome da Categoria</th>
                  <th>Slug / Identificador</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.label}</strong></td>
                    <td><code>{c.id}</code></td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className={styles.btnEdit} onClick={() => handleEditCategory(c)} title="Editar Categoria">
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDeleteCategory(c.id)} title="Excluir Categoria (e Cascata)">
                          <i className="fa-solid fa-trash"></i>
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
          <h3>{editingId ? '📝 Editar Item' : '🍔 Cadastrar Item'}</h3>
          <div className={styles.formGroup}>
            <label>Nome do Produto</label>
            <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoria</label>
              <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {!isVariable && (
              <div className={styles.formGroup}>
                <label>Preço Padrão (R$)</label>
                <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} required={!isVariable} />
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <label className={styles.switchLabel}>
              <input type="checkbox" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
              <span>Marcar como Destaque Promocional?</span>
            </label>
            {isPromo && (
              <div className={styles.formGroup} style={{ marginTop: '5px' }}>
                <label>Preço da Oferta (R$)</label>
                <input type="number" step="0.01" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} required={isPromo} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>URL da Imagem</label>
            <input type="text" value={prodImage} onChange={e => setProdImage(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Descrição / Ingredientes</label>
            <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} required></textarea>
          </div>

          <label className={styles.switchLabel}>
            <input type="checkbox" checked={allowCustom} onChange={e => setAllowCustom(e.target.checked)} />
            <span>Habilitar adicionais customizados vinculados à categoria?</span>
          </label>

          <label className={styles.switchLabel}>
            <input type="checkbox" checked={isVariable} onChange={e => setIsVariable(e.target.checked)} />
            <span>Este item tem variações (Ex: Pizza M, Pizza G)?</span>
          </label>

          {isVariable && (
            <div className={styles.variantSection}>
              <h4>Configurar Variações / Sabores</h4>
              <div className={styles.variantInputs}>
                <input type="text" value={varName} onChange={e => setVarName(e.target.value)} placeholder="Ex: Grande (8 pedaços)" />
                <input type="number" step="0.01" value={varPrice} onChange={e => setVarPrice(e.target.value)} placeholder="Preço" />
                <button type="button" onClick={handleAddVariant}><i className="fa-solid fa-plus"></i></button>
              </div>
              <ul className={styles.variantList}>
                {variants.map((v, i) => (
                  <li key={i}>{v.name} - R$ {v.price.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          )}
          <button type="submit" className={styles.btnSave}>
            <i className="fa-solid fa-floppy-disk"></i> Confirmar e Salvar
          </button>
        </form>
      )}

      {activeTab === 'additions_form' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
          <form className={styles.adminForm} onSubmit={handleSaveAddition} style={{ flex: '1', minWidth: '280px' }}>
            <h3>✨ Cadastrar Adicional / Sabor</h3>
            <div className={styles.formGroup}>
              <label>Nome do Extra</label>
              <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: Borda Cheddar, Bacon Extra" required />
            </div>
            <div className={styles.formGroup}>
              <label>Preço Extra (R$)</label>
              <input type="number" step="0.01" value={addPrice} onChange={e => setAddPrice(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Vincular Estritamente à Categoria</label>
              <select value={addCategoryLinked} onChange={e => setAddCategoryLinked(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <button type="submit" className={styles.btnSave}><i className="fa-solid fa-plus"></i> Adicionar Opcional</button>
          </form>

          <div style={{ flex: '2', minWidth: '320px' }}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {additions.map(a => (
                  <tr key={a.id}>
                    <td>export <strong>{a.name}</strong></td>
                    <td>R$ {a.price.toFixed(2)}</td>
                    <td><span className={styles.badgeCategory}>{a.categoryLinked}</span></td>
                    <td>
                      <button className={styles.btnDelete} onClick={() => handleDeleteAddition(a.id)} title="Excluir Opcional">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'category_form' && (
        <form className={styles.adminForm} onSubmit={handleSaveCategory}>
          <h3>{editingCategoryId ? '📝 Editar Nome da Categoria' : '📁 Nova Categoria'}</h3>
          <div className={styles.formGroup}>
            <label>Nome da Categoria</label>
            <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: 🍕 Pizzas Especiais" required />
          </div>
          <button type="submit" className={styles.btnSave}>
            <i className="fa-solid fa-floppy-disk"></i> {editingCategoryId ? 'Salvar Alteração' : 'Criar Categoria'}
          </button>
        </form>
      )}
    </div>
  );
};