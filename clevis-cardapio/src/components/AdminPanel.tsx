import React, { useState, useEffect } from 'react';
import { getStoredProducts, saveStoredProducts, getStoredCategories, saveStoredCategories } from '../data/products';
import type { Product, Category, ProductOption } from '../data/products';
import styles from './AdminPanel.module.css';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'product_form' | 'category_form'>('list');

  // Estados do Formulário de Produtos
  const [editingId, setEditingId] = useState<number | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [allowCustom, setAllowCustom] = useState(false);
  const [customType, setCustomType] = useState<'lanches' | 'pizzas'>('lanches');
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<ProductOption[]>([]);
  
  // Inputs temporários para adicionar variações/tamanhos
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState('');

  // Estado do Formulário de Categorias
  const [catName, setCatName] = useState('');

  useEffect(() => {
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
  }, [activeTab]);

  const handleToggleStatus = (id: number) => {
    const updated = products.map(p => p.id === id ? { ...p, disponible: p.disponivel === false ? true : !p.disponivel } : p);
    // Trata caso a propriedade não estivesse explicitamente definida antes
    const fixed = updated.map(p => p.id === id ? { ...p, disponivel: p.disponivel === undefined ? false : p.disponivel } : p);
    setProducts(fixed);
    saveStoredProducts(fixed);
  };

  const handleAddVariant = () => {
    if (!varName || !varPrice) return;
    setVariants([...variants, { name: varName, price: parseFloat(varPrice) }]);
    setVarName('');
    setVarPrice('');
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingId || Date.now(),
      name: prodName,
      price: isVariable ? (variants[0]?.price || 0) : parseFloat(prodPrice),
      category: prodCategory,
      desc: prodDesc,
      image: prodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      allowCustomization: allowCustom,
      customizationType: allowCustom ? customType : undefined,
      isVariable: isVariable,
      options: isVariable ? variants : undefined,
      disponivel: true
    };

    let updatedProducts;
    if (editingId) {
      updatedProducts = products.map(p => p.id === editingId ? newProduct : p);
    } else {
      updatedProducts = [...products, newProduct];
    }

    saveStoredProducts(updatedProducts);
    resetProductForm();
    setActiveTab('list');
  };

  const handleEditProduct = (p: Product) => {
    setEditingId(p.id);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdCategory(p.category);
    setProdDesc(p.desc);
    setProdImage(p.image);
    setAllowCustom(!!p.allowCustomization);
    setCustomType(p.customizationType || 'lanches');
    setIsVariable(!!p.isVariable);
    setVariants(p.options || []);
    setActiveTab('product_form');
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Tem certeza que quer deletar esse item?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveStoredProducts(updated);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const newCat: Category = {
      id: catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
      label: catName
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStoredCategories(updated);
    setCatName('');
    setActiveTab('list');
  };

  const resetProductForm = () => {
    setEditingId(null);
    setProdName('');
    setProdPrice('');
    setProdCategory(categories[0]?.id || 'lanches');
    setProdDesc('');
    setProdImage('');
    setAllowCustom(false);
    setIsVariable(false);
    setVariants([]);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <button className={styles.btnBack} onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Voltar pro Cardápio
        </button>
        <h2>Painel Admin Clevi's</h2>
      </div>

      <div className={styles.adminNav}>
        <button className={activeTab === 'list' ? styles.navActive : ''} onClick={() => setActiveTab('list')}>
          📦 Gerenciar Itens
        </button>
        <button className={activeTab === 'product_form' ? styles.navActive : ''} onClick={() => { resetProductForm(); setActiveTab('product_form'); }}>
          ➕ Novo Produto
        </button>
        <button className={activeTab === 'category_form' ? styles.navActive : ''} onClick={() => setActiveTab('category_form')}>
          📁 Nova Categoria
        </button>
      </div>

      {activeTab === 'list' && (
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço Base</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={p.disponivel === false ? styles.rowDisabled : ''}>
                  <td><img src={p.image} alt={p.name} className={styles.tableImg} /></td>
                  <td><strong>{p.name}</strong></td>
                  <td><span className={styles.badgeCategory}>{p.category}</span></td>
                  <td>R$ {p.price.toFixed(2).replace('.', ',')}</td>
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
                      <button className={styles.btnEdit} onClick={() => handleEditProduct(p)}><i className="fa-solid fa-pen"></i></button>
                      <button className={styles.btnDelete} onClick={() => handleDeleteProduct(p.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'product_form' && (
        <form className={styles.adminForm} onSubmit={handleSaveProduct}>
          <h3>{editingId ? '📝 Editar Produto' : '🍔 Cadastrar Novo Item'}</h3>
          
          <div className={styles.formGroup}>
            <label>Nome do Produto</label>
            <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Ex: X-Salada Premium" required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoria</label>
              <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}>
                {categories.map(c => <option key={catName} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {!isVariable && (
              <div className={styles.formGroup}>
                <label>Preço (R$)</label>
                <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="0,00" required={!isVariable} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>URL da Imagem</label>
            <input type="text" value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="https://linkdafoto.com/imagem.jpg" />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição / Ingredientes</label>
            <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Pão, hambúrguer, queijo..." required></textarea>
          </div>

          {/* Controle de Adicionais Customizados */}
          <div className={styles.checkboxGroup}>
            <label className={styles.switchLabel}>
              <input type="checkbox" checked={allowCustom} onChange={e => setAllowCustom(e.target.checked)} />
              <span>Permitir Adicionais Customizados neste item?</span>
            </label>
          </div>

          {allowCustom && (
            <div className={styles.formGroup}>
              <label>Tipo de Customização / Adicionais</label>
              <select value={customType} onChange={e => setCustomType(e.target.value as 'lanches' | 'pizzas')}>
                <option value="lanches">🍔 Adicionais de Lanches (Bacon, Hambúrguer...)</option>
                <option value="pizzas">🍕 Adicionais de Pizzas (Bordas, Queijo...)</option>
              </select>
            </div>
          )}

          {/* Seletor de Variações de Tamanho/Sabor */}
          <div className={styles.checkboxGroup}>
            <label className={styles.switchLabel}>
              <input type="checkbox" checked={isVariable} onChange={e => setIsVariable(e.target.checked)} />
              <span>Este produto possui variações de Tamanhos ou Sabores? (Ex: P, M, G)</span>
            </label>
          </div>

          {isVariable && (
            <div className={styles.variantSection}>
              <h4>Configurar Tamanhos / Variações</h4>
              <div className={styles.variantInputs}>
                <input type="text" value={varName} onChange={e => setVarName(e.target.value)} placeholder="Ex: Média (400g) ou Família" />
                <input type="number" step="0.01" value={varPrice} onChange={e => setVarPrice(e.target.value)} placeholder="Preço R$" />
                <button type="button" onClick={handleAddVariant}>Incluir</button>
              </div>
              <ul className={styles.variantList}>
                {variants.map((v, index) => (
                  <li key={index}>
                    <span>{v.name} - R$ {v.price.toFixed(2).replace('.', ',')}</span>
                    <button type="button" onClick={() => handleRemoveVariant(index)}><i className="fa-solid fa-xmark"></i></button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.btnSave}>Salvar Produto</button>
            <button type="button" className={styles.btnCancel} onClick={() => setActiveTab('list')}>Cancelar</button>
          </div>
        </form>
      )}

      {activeTab === 'category_form' && (
        <form className={styles.adminForm} onSubmit={handleSaveCategory}>
          <h3>📁 Nova Categoria</h3>
          <div className={styles.formGroup}>
            <label>Nome da Categoria (com Emoji se quiser)</label>
            <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: 🍣 Sushi" required />
          </div>
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.btnSave}>Criar Categoria</button>
            <button type="button" className={styles.btnCancel} onClick={() => setActiveTab('list')}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
};