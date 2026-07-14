import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { FloatingCart } from './components/FloatingCart';
import { CartSidebar } from './components/CartSidebar';
import { PRODUCTS } from './data/products';
import { CartProvider } from './context/CartContext';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('lanches');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filtra de forma inteligente global por busca ou categoria
  const filteredProducts = PRODUCTS.filter((product) => {
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
        {!searchQuery && (
          <CategoryNav activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
        )}

        <section className="products-section">
          <h2 className="section-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>
          
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-results">
              <i className="fa-solid fa-face-frown"></i>
              <p>Nenhum produto encontrado...</p>
            </div>
          )}
        </section>
      </main>

      <FloatingCart onClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </CartProvider>
  );
};

export default App;