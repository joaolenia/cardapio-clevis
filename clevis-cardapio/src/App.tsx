import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import FloatingCart from './components/FloatingCart';
import { CartSidebar } from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel';
import { getStoredProducts, getStoredCategories, authenticateManager } from './data/products';
import type { Product, Category } from './data/products';
import { CartProvider } from './context/CartContext';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (view === 'client') {
        const prods = await getStoredProducts();
        const cats = await getStoredCategories();
        setProducts(prods);
        setCategories(cats);
        if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id);
      }
    };
    loadData();
  }, [view]);

  const promoProducts = products.filter(p => p.isPromo && p.disponivel !== false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const isValid = await authenticateManager(username, password);
    if (isValid) {
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
      setView('admin');
    } else {
      setAuthError('Credenciais incorretas.');
    }
  };

  if (view === 'admin') return <AdminPanel onBack={() => setView('client')} />;

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
      {/* Container Fixo */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: '#121214', 
        paddingTop: '10px' 
      }}>
        <div style={{ position: 'absolute', top: '15px', right: '20px', zIndex: 10 }}>
          <button onClick={() => setShowLoginModal(true)} style={{ background: '#18191d', color: '#b1b5c3', border: '1px solid #232627', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer' }}>
            <i className="fa-solid fa-lock"></i> Admin
          </button>
        </div>

        <Header />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        {!searchQuery && (
          <div style={{ paddingBottom: '10px' }}>
            <CategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>
        )}
      </div>

      {/* Conteúdo rolável */}
      <main className="container" style={{ marginTop: '20px' }}>
        {!searchQuery && promoProducts.length > 0 && (
          <div className="promo-highlights-section" style={{ marginBottom: '35px' }}>
             <h2 style={{ fontSize: '1.4rem', color: 'var(--neon-orange)', marginBottom: '15px', fontWeight: '700' }}>Ofertas Especiais</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               {promoProducts.map(product => <div key={`promo-${product.id}`}><ProductCard product={product} /></div>)}
             </div>
          </div>
        )}

        <section className="products-section">
          <h2 className="section-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : categories.find(c => c.id === activeCategory)?.label || activeCategory}
          </h2>
          <div className="products-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      </main>

      <Footer />
      <FloatingCart onClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Modal de Login Mantido */}
       {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#18191d', border: '1px solid #232627', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '360px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f4f5f6' }}>Acesso Restrito</h3>
              <button onClick={() => { setShowLoginModal(false); setAuthError(''); }} style={{ background: 'transparent', border: 'none', color: '#777e90', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#b1b5c3', fontWeight: 600 }}>Usuario</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ background: '#141416', border: '1px solid #232627', padding: '12px', borderRadius: '8px', color: 'white' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#b1b5c3', fontWeight: 600 }}>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#141416', border: '1px solid #232627', padding: '12px', borderRadius: '8px', color: 'white' }} required />
              </div>

              {authError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{authError}</p>}

              <button type="submit" style={{ background: 'var(--neon-orange, #ff5e00)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
                Entrar no Sistema
              </button>
            </form>
          </div>
        </div>
      )}
    </CartProvider>
  );
};

export default App;