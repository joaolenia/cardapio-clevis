import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { FloatingCart } from './components/FloatingCart';
import { CartSidebar } from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel'; // Importamos o novo painel
import { getStoredProducts, getStoredCategories } from './data/products';
import type { Product, Category } from './data/products';
import { CartProvider } from './context/CartContext';

export const App: React.FC = () => {
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [activeCategory, setActiveCategory] = useState('lanches');
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
      }
    };
    loadData();
  }, [view]);

  // Se o dono estiver na tela de administração, renderiza apenas o painel administrativo
  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('client')} />;
  }

  // Filtros em tempo real puxando os dados mutáveis do LocalStorage
  const filteredProducts = products.filter((product) => {
    // Só exibe no cardápio se o produto não estiver explicitamente pausado pelo admin
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
        {/* Altere essa linha no seu src/App.tsx para ficar exatamente assim: */}
        {!searchQuery && (
          <CategoryNav
            categories={categories} // Agora passa as categorias do Supabase
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

        {/* Link Secreto e discreto no rodapé para acessar o painel administrativo */}
        <footer style={{ marginTop: '50px', textAlign: 'center', opacity: 0.3 }}>
          <button
            onClick={() => setView('admin')}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ⚙️ Acessar Sistema de Gerenciamento
          </button>
        </footer>
      </main>

      <FloatingCart onClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </CartProvider>
  );
};

export default App;