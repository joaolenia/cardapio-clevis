import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import {FloatingCart} from './components/FloatingCart'; // Corrigido para importação padrão (Default)
import { CartSidebar } from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel';
import { getStoredProducts, getStoredCategories } from './data/products';
import type { Product, Category } from './data/products';
import { CartProvider } from './context/CartContext';

export const App: React.FC = () => {
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (view === 'client') {
        const prods = await getStoredProducts();
        const cats = await getStoredCategories();
        setProducts(prods);
        setCategories(cats);
        
        // Define a primeira categoria do banco como ativa por padrão
        if (cats.length > 0 && !activeCategory) {
          setActiveCategory(cats[0].id);
        }
      }
    };
    loadData();
  }, [view]);

  // Filtra produtos promocionais disponíveis para a seção de destaques
  const promoProducts = products.filter(p => p.isPromo && p.disponivel !== false);

  // Se o dono estiver na tela de administração, renderiza apenas o painel administrativo
  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('client')} />;
  }

  // Filtros em tempo real puxando os dados mutáveis do Supabase
  const filteredProducts = products.filter((product) => {
    if (product.disponivel === false) return false;

    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = searchQuery ? true : product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <CartProvider>
      <Header />
      <main className="container">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* AREA DE DESTAQUES PROMOCIONAIS (Fica oculta se houver busca ativa) */}
        {!searchQuery && promoProducts.length > 0 && (
          <div className="promo-highlights-section" style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--neon-orange)', marginBottom: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '18px', background: 'var(--neon-orange)', borderRadius: '4px', display: 'inline-block' }}></span>
              Ofertas Especiais
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {promoProducts.map(product => (
                <div key={`promo-${product.id}`} style={{ border: '1px solid rgba(255, 94, 0, 0.25)', borderRadius: '12px', background: 'linear-gradient(145deg, #18191d, #121214)', padding: '4px', boxShadow: '0 8px 24px rgba(255, 94, 0, 0.05)' }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        )}

        <section className="products-section">
          <h2 className="section-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : categories.find(c => c.id === activeCategory)?.label || activeCategory}
          </h2>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-results">
              <i className="fa-solid fa-face-frown"></i>
              <p>Nenhum produto em estoque nesta categoria...</p>
            </div>
          )}
        </section>

        {/* Link Secreto no rodapé para acessar o painel administrativo */}
        <footer style={{ marginTop: '50px', paddingBottom: '40px', textAlign: 'center', opacity: 0.3 }}>
          <button
            onClick={() => setView('admin')}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Acessar Sistema de Gerenciamento
          </button>
        </footer>
      </main>

      <FloatingCart onClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </CartProvider>
  );
};

export default App;